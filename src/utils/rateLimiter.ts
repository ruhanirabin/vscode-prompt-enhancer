import { ErrorHandler } from '../utils/errorHandler';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Time window in milliseconds
}

export interface RequestRecord {
  timestamp: number;
}

/**
 * Client-side rate limiter to prevent API rate limit errors
 * Uses sliding window algorithm
 */
export class RateLimiter {
  private requests: RequestRecord[] = [];
  private config: RateLimitConfig;
  private identifier: string;

  constructor(
    identifier: string,
    config: RateLimitConfig = { maxRequests: 60, windowMs: 60000 } // Default: 60 requests per minute
  ) {
    this.identifier = identifier;
    this.config = config;
  }

  /**
   * Check if a request can be made
   * @returns true if request is allowed, false if rate limited
   */
  canMakeRequest(): boolean {
    this.cleanOldRequests();
    return this.requests.length < this.config.maxRequests;
  }

  /**
   * Record a request and return wait time if rate limited
   * @returns { allowed: boolean, waitTime?: number, remaining?: number }
   */
  recordRequest(): {
    allowed: boolean;
    waitTime?: number;
    remaining?: number;
    resetIn?: number;
  } {
    this.cleanOldRequests();

    if (this.requests.length >= this.config.maxRequests) {
      // Calculate wait time until oldest request expires
      const oldestRequest = this.requests[0];
      const waitTime = oldestRequest.timestamp + this.config.windowMs - Date.now();
      
      ErrorHandler.logDebug(
        `Rate limit exceeded for ${this.identifier}. Wait ${Math.ceil(waitTime / 1000)}s`,
        'RateLimiter'
      );

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

    ErrorHandler.logDebug(
      `Request recorded for ${this.identifier}. Remaining: ${remaining}/${this.config.maxRequests}`,
      'RateLimiter'
    );

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
  async waitForAvailability(): Promise<void> {
    while (!this.canMakeRequest()) {
      const result = this.recordRequest();
      if (!result.allowed && result.waitTime) {
        ErrorHandler.logDebug(
          `Waiting ${Math.ceil(result.waitTime / 1000)}s before next request`,
          'RateLimiter'
        );
        await this.sleep(result.waitTime + 100); // Add 100ms buffer
      }
    }
  }

  /**
   * Get current rate limit status
   */
  getStatus(): {
    used: number;
    remaining: number;
    limit: number;
    resetIn: number;
  } {
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
  reset(): void {
    this.requests = [];
    ErrorHandler.logDebug(`Rate limiter reset for ${this.identifier}`, 'RateLimiter');
  }

  /**
   * Clean up requests outside the current window
   */
  private cleanOldRequests(): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    this.requests = this.requests.filter(request => request.timestamp > windowStart);
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update rate limit configuration
   */
  updateConfig(config: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...config };
    ErrorHandler.logDebug(
      `Rate limit config updated for ${this.identifier}: ${this.config.maxRequests} req/${this.config.windowMs}ms`,
      'RateLimiter'
    );
  }
}

/**
 * Pre-configured rate limiters for common scenarios
 */
export const PreconfiguredLimiters = {
  // OpenAI API default rate limits (varies by tier)
  openaiStandard: new RateLimiter('openai-standard', { maxRequests: 60, windowMs: 60000 }),
  openaiConservative: new RateLimiter('openai-conservative', { maxRequests: 30, windowMs: 60000 }),
  
  // More restrictive for free tier
  openaiFreeTier: new RateLimiter('openai-free', { maxRequests: 20, windowMs: 60000 }),
  
  // Very conservative for testing
  testing: new RateLimiter('testing', { maxRequests: 5, windowMs: 60000 })
};
