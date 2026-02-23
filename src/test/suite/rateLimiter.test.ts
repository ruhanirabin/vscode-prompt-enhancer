import * as assert from 'assert';
import { RateLimiter, PreconfiguredLimiters } from '../../utils/rateLimiter';

suite('RateLimiter Tests', () => {
  test('Should allow requests within limit', () => {
    const limiter = new RateLimiter('test', { maxRequests: 5, windowMs: 60000 });
    
    for (let i = 0; i < 5; i++) {
      const result = limiter.recordRequest();
      assert.strictEqual(result.allowed, true, `Request ${i + 1} should be allowed`);
    }
  });

  test('Should block requests exceeding limit', () => {
    const limiter = new RateLimiter('test', { maxRequests: 3, windowMs: 60000 });
    
    // Make 3 requests (should all pass)
    for (let i = 0; i < 3; i++) {
      limiter.recordRequest();
    }
    
    // 4th request should be blocked
    const result = limiter.recordRequest();
    assert.strictEqual(result.allowed, false, '4th request should be blocked');
    assert.strictEqual(result.waitTime !== undefined, true, 'Should have wait time');
  });

  test('Should calculate remaining requests correctly', () => {
    const limiter = new RateLimiter('test', { maxRequests: 10, windowMs: 60000 });
    
    limiter.recordRequest();
    limiter.recordRequest();
    limiter.recordRequest();
    
    const status = limiter.getStatus();
    assert.strictEqual(status.used, 3, 'Should have used 3 requests');
    assert.strictEqual(status.remaining, 7, 'Should have 7 remaining');
    assert.strictEqual(status.limit, 10, 'Limit should be 10');
  });

  test('Should reset correctly', () => {
    const limiter = new RateLimiter('test', { maxRequests: 5, windowMs: 60000 });
    
    // Make some requests
    for (let i = 0; i < 3; i++) {
      limiter.recordRequest();
    }
    
    // Reset
    limiter.reset();
    
    const status = limiter.getStatus();
    assert.strictEqual(status.used, 0, 'Should have 0 used after reset');
    assert.strictEqual(status.remaining, 5, 'Should have full limit after reset');
  });

  test('Should clean old requests after window expires', (done) => {
    const limiter = new RateLimiter('test', { maxRequests: 2, windowMs: 100 });
    
    // Make 2 requests
    limiter.recordRequest();
    limiter.recordRequest();
    
    // Should be at limit
    let result = limiter.recordRequest();
    assert.strictEqual(result.allowed, false, 'Should be at limit');
    
    // Wait for window to expire
    setTimeout(() => {
      result = limiter.recordRequest();
      assert.strictEqual(result.allowed, true, 'Should be allowed after window expires');
      done();
    }, 150);
  });

  test('Preconfigured limiters should exist', () => {
    assert.ok(PreconfiguredLimiters.openaiStandard, 'openaiStandard should exist');
    assert.ok(PreconfiguredLimiters.openaiConservative, 'openaiConservative should exist');
    assert.ok(PreconfiguredLimiters.openaiFreeTier, 'openaiFreeTier should exist');
    assert.ok(PreconfiguredLimiters.testing, 'testing should exist');
  });

  test('Should update configuration correctly', () => {
    const limiter = new RateLimiter('test', { maxRequests: 5, windowMs: 60000 });
    
    limiter.updateConfig({ maxRequests: 10 });
    
    const status = limiter.getStatus();
    assert.strictEqual(status.limit, 10, 'Limit should be updated to 10');
  });
});
