export type RateLimitData = {
    count: number;
    timestamp: number;
    blocked: boolean;
    resetAt?: number;
};
export declare const RATE_LIMIT: {
    MAX_REQUESTS: number;
    WINDOW_MS: number;
    BLOCK_DURATION_MS: number;
};
export declare const checkRateLimit: (request: Request) => {
    available: boolean;
    remaining: number;
    resetAt?: number;
};
