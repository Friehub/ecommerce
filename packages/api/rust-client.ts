/**
 * RustInfrastructureClient
 * Unified client for interacting with high-performance Rust services.
 */

import { config } from './config.js';

const SERVICES = {
    SEARCH: process.env.SEARCH_SERVICE_URL || 'http://localhost:3001',
    INVENTORY: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3002',
    AUCTION: process.env.AUCTION_SERVICE_URL || 'http://localhost:3003', // gRPC bridge or direct
    FRAUD: process.env.FRAUD_SERVICE_URL || 'http://localhost:3004',
    RECOMMENDATIONS: process.env.RECOMMENDATIONS_SERVICE_URL || 'http://localhost:3005',
    IMAGE_PROCESSOR: process.env.IMAGE_PROCESSOR_SERVICE_URL || 'http://localhost:3006',
};

export class RustClient {
    private static async request<T>(baseUrl: string, path: string, options: RequestInit = {}): Promise<T> {
        const url = `${baseUrl}${path}`;
        
        // E05: Implement a hard timeout for all inter-service calls
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    // E04: Add internal auth header to all requests
                    'X-Internal-Token': config.INTERNAL_API_TOKEN,
                    ...options.headers,
                },
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Rust Service Error (${url}): ${response.status} - ${error}`);
            }

            return response.json() as Promise<T>;
        } catch (error: any) {
            if (error.name === 'AbortError') {
                throw new Error(`Rust Service Timeout (${url}): Request took longer than 5 seconds`);
            }
            throw error;
        } finally {
            clearTimeout(timeout);
        }
    }

    // Search Service
    static search = {
        query: (params: { q: string, limit?: number, offset?: number, category_id?: string, brand?: string, min_price?: number, max_price?: number, sort_by?: string, seller_id?: string }) => {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) searchParams.append(key, value.toString());
            });
            return this.request<any>(SERVICES.SEARCH, `/search?${searchParams.toString()}`);
        },
        upsert: (doc: any) => this.request(SERVICES.SEARCH, '/upsert', {
            method: 'POST',
            body: JSON.stringify(doc),
        }),
        autocomplete: (query: string) => this.request<any[]>(SERVICES.SEARCH, `/autocomplete?q=${encodeURIComponent(query)}`),
        health: () => this.request(SERVICES.SEARCH, '/health'),
    };

    // Inventory Service
    static inventory = {
        reserve: (sku: string, quantity: number, userId: string) => 
            this.request<any>(SERVICES.INVENTORY, '/reserve', {
                method: 'POST',
                body: JSON.stringify({ sku, quantity, user_id: userId }),
            }),
        confirm: (sku: string, reservationId: string) =>
            this.request<any>(SERVICES.INVENTORY, '/confirm', {
                method: 'POST',
                body: JSON.stringify({ sku, reservation_id: reservationId }),
            }),
        sync: (levels: { sku: string, quantity: number }[]) =>
            this.request<any>(SERVICES.INVENTORY, '/sync', {
                method: 'POST',
                body: JSON.stringify({ levels }),
            }),
    };

    // Fraud Service
    static fraud = {
        check: (data: any) =>
            this.request<any>(SERVICES.FRAUD, '/check', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
    };

    // Recommendations Service
    static recommendations = {
        forProduct: (id: string) => this.request<any[]>(SERVICES.RECOMMENDATIONS, `/product/${id}`),
        forUser: (id: string) => this.request<any[]>(SERVICES.RECOMMENDATIONS, `/user/${id}`),
    };

    // Image Processor
    static imageProcessor = {
        processUrl: (url: string, options: { w?: number, h?: number } = {}) => {
            const params = new URLSearchParams(options as any).toString();
            return `${SERVICES.IMAGE_PROCESSOR}/process?${params}`;
        }
    };

    // Auction Service
    static auction = {
        bid: (query: string, availableAds: any[]) =>
            this.request<any>(SERVICES.AUCTION, '/auction', {
                method: 'POST',
                body: JSON.stringify({ query, candidates: availableAds }),
            }),
    };

    // Analysis Service (Mostly Stub for now)
    static analysis = {
        sentiment: (text: string) => this.request<any>(SERVICES.FRAUD, '/analysis/sentiment', { // Reusing fraud port as placeholder
            method: 'POST',
            body: JSON.stringify({ text }),
        }).catch(() => ({ 
            score: text.length > 50 ? 0.8 : 0.5, 
            label: 'POSITIVE', 
            keywords: ['placeholder', 'demo'] 
        })),
    };
}
