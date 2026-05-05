"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Decimal = exports.Prisma = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const globalForPrisma = global;
const getDataSourceUrl = () => {
    const url = process.env.DATABASE_URL || '';
    if (!url)
        return url;
    const separator = url.includes('?') ? '&' : '?';
    // statement_timeout: 5s, connect_timeout: 10s
    return `${url}${separator}statement_timeout=5000&connect_timeout=10000`;
};
const client = new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
        db: {
            url: getDataSourceUrl(),
        },
    },
});
// Safety Net Extension: Cap all findMany at 1000 if take is missing
exports.prisma = client.$extends({
    query: {
        $allModels: {
            async findMany({ args, query }) {
                if (args.take === undefined || args.take > 1000) {
                    args.take = 1000;
                }
                return query(args);
            },
        },
    },
});
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
var client_2 = require("@prisma/client");
Object.defineProperty(exports, "Prisma", { enumerable: true, get: function () { return client_2.Prisma; } });
exports.Decimal = client_1.Prisma.Decimal;
__exportStar(require("@prisma/client"), exports);
