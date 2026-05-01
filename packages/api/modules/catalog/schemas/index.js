"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categorySchema = exports.productSchema = exports.productVariantSchema = void 0;
const zod_1 = require("zod");
exports.productVariantSchema = zod_1.z.object({
    sku: zod_1.z.string().min(1),
    price: zod_1.z.number().positive(),
    comparePrice: zod_1.z.number().positive().optional(),
    attributes: zod_1.z.record(zod_1.z.any()),
    weightGrams: zod_1.z.number().int().positive().optional(),
    stock: zod_1.z.number().int().min(0).optional().default(0),
});
exports.productSchema = zod_1.z.object({
    title: zod_1.z.string().min(3),
    description: zod_1.z.string().min(10),
    brandId: zod_1.z.string(),
    categoryId: zod_1.z.string(),
    images: zod_1.z.array(zod_1.z.string()).optional(),
    variants: zod_1.z.array(exports.productVariantSchema).min(1),
});
exports.categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1),
    parentId: zod_1.z.string().optional(),
    commissionRate: zod_1.z.number().min(0).max(100),
    attributeSchema: zod_1.z.record(zod_1.z.any()).optional(),
});
