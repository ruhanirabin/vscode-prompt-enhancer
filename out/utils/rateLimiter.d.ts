export interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}
export interface RequestRecord {
    timestamp: number;
}
/**
 * Client-side rate limiter to prevent API rate limit errors
 * Uses sliding window algorithm
 */
export declare class RateLimiter {
    private requests;
    private config;
    private identifier;
    constructor(identifier: string, config?: RateLimitConfig);
    /**
     * Check if a request can be made
     * @returns true if request is allowed, false if rate limited
     */
    canMakeRequest(): boolean;
    /**
     * Record a request and return wait time if rate limited
     * @returns { allowed: boolean, waitTime?: number, remaining?: number }
     */
    recordRequest(): {
        allowed: boolean;
        waitTime?: number;
        remaining?: number;
        resetIn?: number;
    };
    /**
     * Wait until a request can be made
     * @returns Promise that resolves when request is allowed
     */
    waitForAvailability(): Promise<void>;
    /**
     * Get current rate limit status
     */
    getStatus(): {
        used: number;
        remaining: number;
        limit: number;
        resetIn: number;
    };
    /**
     * Reset the rate limiter
     */
    reset(): void;
    /**
     * Clean up requests outside the current window
     */
    private cleanOldRequests;
    /**
     * Sleep helper
     */
    private sleep;
    /**
     * Update rate limit configuration
     */
    updateConfig(config: Partial<RateLimitConfig>): void;
}
/**
 * Pre-configured rate limiters for common scenarios
 */
export declare const PreconfiguredLimiters: {
    openaiStandard: RateLimiter;
    openaiConservative: RateLimiter;
    openaiFreeTier: RateLimiter;
    testing: RateLimiter;
};
//# sourceMappingURL=rateLimiter.d.ts.map