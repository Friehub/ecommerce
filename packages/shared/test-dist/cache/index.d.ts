export declare const cacheService: {
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttlSeconds?: number): Promise<void>;
    delete(key: string): Promise<void>;
    wrap<T>(key: string, fn: () => Promise<T>, ttlSeconds?: number): Promise<T>;
};
