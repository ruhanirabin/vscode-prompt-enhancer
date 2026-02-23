"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreconfiguredLimiters = exports.RateLimiter = void 0;
const errorHandler_1 = require("../utils/errorHandler");
/**
 * Client-side rate limiter to prevent API rate limit errors
 * Uses sliding window algorithm
 */
class RateLimiter {
    constructor(identifier, config = { maxRequests: 60, windowMs: 60000 } // Default: 60 requests per minute
    ) {
        this.requests = [];
        this.identifier = identifier;
        this.config = config;
    }
    /**
     * Check if a request can be made
     * @returns true if request is allowed, false if rate limited
     */
    canMakeRequest() {
        this.cleanOldRequests();
        return this.requests.length < this.config.maxRequests;
    }
    /**
     * Record a request and return wait time if rate limited
     * @returns { allowed: boolean, waitTime?: number, remaining?: number }
     */
    recordRequest() {
        this.cleanOldRequests();
        if (this.requests.length >= this.config.maxRequests) {
            // Calculate wait time until oldest request expires
            const oldestRequest = this.requests[0];
            const waitTime = oldestRequest.timestamp + this.config.windowMs - Date.now();
            errorHandler_1.ErrorHandler.logDebug(`Rate limit exceeded for ${this.identifier}. Wait ${Math.ceil(waitTime / 1000)}s`, 'RateLimiter');
            return {
                allowed: false,
                waitTime: Math.max(0, waitTime),
                resetIn: Math.max(0, oldestRequest.timestamp + this.config.windowMs - Date.now())
            };
        }
        // Record this request
        this.requests.push({ timestamp: Date.now() });
        const remaining = this.config.maxRequests - this.requests.length;
        const resetIn = this.requests.length > 0
            ? this.requests[0].timestamp + this.config.windowMs - Date.now()
            : this.config.windowMs;
        errorHandler_1.ErrorHandler.logDebug(`Request recorded for ${this.identifier}. Remaining: ${remaining}/${this.config.maxRequests}`, 'RateLimiter');
        return {
            allowed: true,
            remaining,
            resetIn
        };
    }
    /**
     * Wait until a request can be made
     * @returns Promise that resolves when request is allowed
     */
    async waitForAvailability() {
        while (!this.canMakeRequest()) {
            const result = this.recordRequest();
            if (!result.allowed && result.waitTime) {
                errorHandler_1.ErrorHandler.logDebug(`Waiting ${Math.ceil(result.waitTime / 1000)}s before next request`, 'RateLimiter');
                await this.sleep(result.waitTime + 100); // Add 100ms buffer
            }
        }
    }
    /**
     * Get current rate limit status
     */
    getStatus() {
        this.cleanOldRequests();
        const resetIn = this.requests.length > 0
            ? Math.max(0, this.requests[0].timestamp + this.config.windowMs - Date.now())
            : 0;
        return {
            used: this.requests.length,
            remaining: Math.max(0, this.config.maxRequests - this.requests.length),
            limit: this.config.maxRequests,
            resetIn
        };
    }
    /**
     * Reset the rate limiter
     */
    reset() {
        this.requests = [];
        errorHandler_1.ErrorHandler.logDebug(`Rate limiter reset for ${this.identifier}`, 'RateLimiter');
    }
    /**
     * Clean up requests outside the current window
     */
    cleanOldRequests() {
        const now = Date.now();
        const windowStart = now - this.config.windowMs;
        this.requests = this.requests.filter(request => request.timestamp > windowStart);
    }
    /**
     * Sleep helper
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Update rate limit configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        errorHandler_1.ErrorHandler.logDebug(`Rate limit config updated for ${this.identifier}: ${this.config.maxRequests} req/${this.config.windowMs}ms`, 'RateLimiter');
    }
}
exports.RateLimiter = RateLimiter;
/**
 * Pre-configured rate limiters for common scenarios
 */
exports.PreconfiguredLimiters = {
    // OpenAI API default rate limits (varies by tier)
    openaiStandard: new RateLimiter('openai-standard', { maxRequests: 60, windowMs: 60000 }),
    openaiConservative: new RateLimiter('openai-conservative', { maxRequests: 30, windowMs: 60000 }),
    // More restrictive for free tier
    openaiFreeTier: new RateLimiter('openai-free', { maxRequests: 20, windowMs: 60000 }),
    // Very conservative for testing
    testing: new RateLimiter('testing', { maxRequests: 5, windowMs: 60000 })
};
//# sourceMappingURL=rateLimiter.js.map