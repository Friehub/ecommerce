"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ledgerService = void 0;
const db_1 = require("@ecom/db");
exports.ledgerService = {
    async recordSale(orderLineId) {
        const line = await db_1.prisma.orderLine.findUnique({
            where: { id: orderLineId },
            include: {
                variant: { include: { product: { include: { category: true } } } },
                package: { select: { sellerId: true } }
            }
        });
        if (!line)
            throw new Error('ORDER_LINE_NOT_FOUND');
        const sellerId = line.package.sellerId;
        const grossAmount = line.unitPrice.mul(line.quantity);
        const commissionRate = line.variant.product.category.commissionRate || new db_1.Decimal(10); // Default 10%
        const commissionAmount = grossAmount.mul(commissionRate).div(100);
        return await db_1.prisma.$transaction(async (tx) => {
            // 1. Record Gross Sale (PENDING)
            const saleEntry = await tx.sellerLedgerEntry.create({
                data: {
                    sellerId,
                    orderLineId,
                    type: db_1.LedgerEntryType.SALE,
                    amount: grossAmount,
                    status: db_1.LedgerStatus.PENDING
                }
            });
            // 2. Record Platform Commission (PENDING)
            const commissionEntry = await tx.sellerLedgerEntry.create({
                data: {
                    sellerId,
                    orderLineId,
                    type: db_1.LedgerEntryType.COMMISSION,
                    amount: commissionAmount.negated(),
                    status: db_1.LedgerStatus.PENDING
                }
            });
            return { saleEntry, commissionEntry };
        });
    },
    async scheduleEscrowRelease(orderId) {
        const lines = await db_1.prisma.orderLine.findMany({
            where: { package: { orderId } }
        });
        const releaseDate = new Date();
        releaseDate.setDate(releaseDate.getDate() + 7); // 7 day return window
        await db_1.prisma.sellerLedgerEntry.updateMany({
            where: {
                orderLineId: { in: lines.map(l => l.id) },
                status: db_1.LedgerStatus.PENDING
            },
            data: {
                availableAt: releaseDate
            }
        });
    },
    async releaseMatureEscrow() {
        const now = new Date();
        return await db_1.prisma.sellerLedgerEntry.updateMany({
            where: {
                status: db_1.LedgerStatus.PENDING,
                availableAt: { lte: now }
            },
            data: {
                status: db_1.LedgerStatus.AVAILABLE
            }
        });
    },
    async recordPenalty(sellerId, amount, reason) {
        return await db_1.prisma.sellerLedgerEntry.create({
            data: {
                sellerId,
                type: db_1.LedgerEntryType.PENALTY,
                amount: new db_1.Decimal(amount).negated()
            }
        });
    },
    async getSellerBalance(sellerId) {
        const entries = await db_1.prisma.sellerLedgerEntry.findMany({
            where: { sellerId }
        });
        return entries.reduce((acc, entry) => acc.add(entry.amount), new db_1.Decimal(0));
    }
};
