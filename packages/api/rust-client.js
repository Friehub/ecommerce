"use strict";
/**
 * RustInfrastructureClient
 * Unified client for interacting with high-performance Rust services.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RustClient = void 0;
const SERVICES = {
    SEARCH: process.env.SEARCH_SERVICE_URL || 'http://localhost:3001',
    INVENTORY: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3002',
    AUCTION: process.env.AUCTION_SERVICE_URL || 'http://localhost:3003', // gRPC bridge or direct
    FRAUD: process.env.FRAUD_SERVICE_URL || 'http://localhost:3004',
    RECOMMENDATIONS: process.env.RECOMMENDATIONS_SERVICE_URL || 'http://localhost:3005',
    IMAGE_PROCESSOR: process.env.IMAGE_PROCESSOR_SERVICE_URL || 'http://localhost:3006',
};
class RustClient {
    static async request(baseUrl, path, options = {}) {
        const url = `${baseUrl}${path}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Rust Service Error (${url}): ${response.status} - ${error}`);
        }
        return response.json();
    }
    // Search Service
    static search = {
        query: (params) => {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined)
                    searchParams.append(key, value.toString());
            });
            return this.request(SERVICES.SEARCH, `/search?${searchParams.toString()}`);
        },
        upsert: (doc) => this.request(SERVICES.SEARCH, '/upsert', {
            method: 'POST',
            body: JSON.stringify(doc),
        }),
        health: () => this.request(SERVICES.SEARCH, '/health'),
    };
    // Inventory Service
    static inventory = {
        reserve: (sku, quantity, userId) => this.request(SERVICES.INVENTORY, '/reserve', {
            method: 'POST',
            body: JSON.stringify({ sku, quantity, user_id: userId }),
        }),
        confirm: (sku, reservationId) => this.request(SERVICES.INVENTORY, '/confirm', {
            method: 'POST',
            body: JSON.stringify({ sku, reservation_id: reservationId }),
        }),
    };
    // Fraud Service
    static fraud = {
        check: (data) => this.request(SERVICES.FRAUD, '/check', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    };
    // Recommendations Service
    static recommendations = {
        forProduct: (id) => this.request(SERVICES.RECOMMENDATIONS, `/product/${id}`),
        forUser: (id) => this.request(SERVICES.RECOMMENDATIONS, `/user/${id}`),
    };
    // Image Processor
    static imageProcessor = {
        processUrl: (url, options = {}) => {
            const params = new URLSearchParams(options).toString();
            return `${SERVICES.IMAGE_PROCESSOR}/process?${params}`;
        }
    };
}
exports.RustClient = RustClient;
