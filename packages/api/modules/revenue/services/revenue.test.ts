import { describe, it, expect, vi } from 'vitest';
import { revenueService } from './revenue-service';
import { prisma, Decimal } from '@ecom/db';

// Mock Prisma
vi.mock('@ecom/db', () => ({
  prisma: {
    orderPackage: {
      findUnique: vi.fn(),
    },
  },
  Decimal: class {
    val: number;
    constructor(v: any) { this.val = Number(v); }
    mul(v: any) { return new (this.constructor as any)(this.val * (v.val ?? Number(v))); }
    div(v: any) { return new (this.constructor as any)(this.val / (v.val ?? Number(v))); }
    add(v: any) { return new (this.constructor as any)(this.val + (v.val ?? Number(v))); }
    sub(v: any) { return new (this.constructor as any)(this.val - (v.val ?? Number(v))); }
    toNumber() { return this.val; }
  }
}));

describe('revenueService', () => {
  describe('calculateCommission', () => {
    it('should correctly calculate commission for a package', async () => {
      const mockPackage = {
        id: 'pkg_1',
        lines: [
          {
            unitPrice: new Decimal(1000),
            quantity: 2,
            variant: {
              product: {
                category: { commissionRate: 10 }
              }
            }
          }
        ]
      };

      (prisma.orderPackage.findUnique as any).mockResolvedValue(mockPackage);

      const result = await revenueService.calculateCommission('pkg_1');

      expect(result.totalRevenue.toNumber()).toBe(2000);
      expect(result.totalCommission.toNumber()).toBe(200);
      expect(result.sellerNet.toNumber()).toBe(1800);
    });

    it('should use default 10% rate if commissionRate is missing', async () => {
      const mockPackage = {
        id: 'pkg_2',
        lines: [
          {
            unitPrice: new Decimal(1000),
            quantity: 1,
            variant: {
              product: {
                category: { commissionRate: null }
              }
            }
          }
        ]
      };

      (prisma.orderPackage.findUnique as any).mockResolvedValue(mockPackage);

      const result = await revenueService.calculateCommission('pkg_2');

      expect(result.totalCommission.toNumber()).toBe(100);
    });
  });
});
