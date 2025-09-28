import { RateLimitData } from './rate-limit.js';
export declare const cache: {
    rateLimit: {
        set(key: string, value: RateLimitData): undefined;
        get(key: string): RateLimitData | undefined;
        peek: (key: string) => RateLimitData | undefined;
        has: (key: string) => boolean;
        keys(): IterableIterator<string>;
        values(): IterableIterator<RateLimitData>;
        entries(): IterableIterator<[string, RateLimitData]>;
        forEach: (callback: (value: RateLimitData, key: string) => unknown) => undefined;
        delete(key: string): boolean;
        evict: (number: number) => undefined;
        clear(): undefined;
        resize: (newMax: number) => undefined;
        readonly max: number;
        readonly size: number;
        readonly available: number;
    };
};
