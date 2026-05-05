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
    async getSellerBalance(sellerId, status, client = db_1.prisma) {
        const aggregation = await client.sellerLedgerEntry.aggregate({
            where: {
                sellerId,
                ...(status ? { status } : {})
            },
            _sum: {
                amount: true
            }
        });
        return aggregation._sum.amount || new db_1.Decimal(0);
    },
    async releaseMatureEscrow() {
        const now = new Date();
        // B05: Use atomic updateMany with inline dispute filtering
        const result = await db_1.prisma.sellerLedgerEntry.updateMany({
            where: {
                status: db_1.LedgerStatus.PENDING,
                availableAt: { lte: now },
                orderLine: {
                    package: { orderId: { not: undefined } },
                    disputes: {
                        none: { status: { in: ['OPEN', 'UNDER_REVIEW'] } }
                    }
                }
            },
            data: {
                status: db_1.LedgerStatus.AVAILABLE
            }
        });
        return { count: result.count };
    },
    async releaseEscrowByOrder(orderId) {
        const now = new Date();
        // B05: Atomic update for specific order
        const result = await db_1.prisma.sellerLedgerEntry.updateMany({
            where: {
                orderLine: {
                    package: { orderId },
                    disputes: {
                        none: { status: { in: ['OPEN', 'UNDER_REVIEW'] } }
                    }
                }
            },
            data: {
                status: db_1.LedgerStatus.AVAILABLE
            }
        });
        return { count: result.count };
    },
    async withdrawFunds(sellerId, amount, statementId) {
        const decimalAmount = new db_1.Decimal(amount);
        return await db_1.prisma.$transaction(async (tx) => {
            // B06: Debit first, then verify (prevents TOCTOU)
            // 1. Create Ledger Entry for the withdrawal (Debit)
            await tx.sellerLedgerEntry.create({
                data: {
                    sellerId,
                    type: db_1.LedgerEntryType.WITHDRAWAL,
                    amount: decimalAmount.negated(),
                    status: db_1.LedgerStatus.AVAILABLE
                }
            });
            // 2. Recompute balance — if now negative, roll back
            const availableBalance = await this.getSellerBalance(sellerId, db_1.LedgerStatus.AVAILABLE, tx);
            if (availableBalance.lessThan(0)) {
                throw new Error('INSUFFICIENT_FUNDS');
            }
            // 3. Create Payout record
            const payout = await tx.payout.create({
                data: {
                    sellerId,
                    statementId: statementId || null,
                    amount: decimalAmount,
                    status: 'PENDING'
                }
            });
            return { payout };
        });
    },
    async recordPenalty(sellerId, amount, reason) {
        return await db_1.prisma.sellerLedgerEntry.create({
            data: {
                sellerId,
                type: db_1.LedgerEntryType.PENALTY,
                amount: new db_1.Decimal(amount).negated(),
                status: db_1.LedgerStatus.AVAILABLE // Penalties usually hit the available balance immediately
            }
        });
    },
    async generateStatement(sellerId, periodStart, periodEnd) {
        const existing = await db_1.prisma.sellerStatement.findFirst({
            where: {
                sellerId,
                periodStart,
                periodEnd
            }
        });
        if (existing) {
            console.log(`Statement already exists for seller ${sellerId} from ${periodStart} to ${periodEnd}. Returning existing statement.`);
            return existing;
        }
        const entries = await db_1.prisma.sellerLedgerEntry.findMany({
            where: {
                sellerId,
                createdAt: {
                    gte: periodStart,
                    lte: periodEnd
                }
            }
        });
        const gross = entries
            .filter(e => e.type === db_1.LedgerEntryType.SALE)
            .reduce((acc, e) => acc.add(e.amount), new db_1.Decimal(0));
        const commission = entries
            .filter(e => e.type === db_1.LedgerEntryType.COMMISSION)
            .reduce((acc, e) => acc.add(e.amount), new db_1.Decimal(0));
        const adSpend = entries
            .filter(e => e.type === db_1.LedgerEntryType.AD_SPEND)
            .reduce((acc, e) => acc.add(e.amount), new db_1.Decimal(0));
        const penalties = entries
            .filter(e => e.type === db_1.LedgerEntryType.PENALTY)
            .reduce((acc, e) => acc.add(e.amount), new db_1.Decimal(0));
        const net = entries.reduce((acc, e) => acc.add(e.amount), new db_1.Decimal(0));
        return await db_1.prisma.sellerStatement.create({
            data: {
                sellerId,
                periodStart,
                periodEnd,
                gross,
                commission,
                adSpend,
                penalties,
                net,
                status: 'OPEN'
            }
        });
    }
};
