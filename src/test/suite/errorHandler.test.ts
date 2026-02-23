import * as assert from 'assert';
import { ErrorHandler, ErrorType } from '../../utils/errorHandler';

suite('ErrorHandler Tests', () => {
  setup(() => {
    // Reset debug mode before each test
    ErrorHandler.setDebugMode(false);
  });

  test('Should initialize without errors', () => {
    assert.doesNotThrow(() => {
      ErrorHandler.initialize(false);
    });
  });

  test('Should enable debug mode', () => {
    ErrorHandler.setDebugMode(true);
    assert.strictEqual(ErrorHandler.isDebugMode(), true, 'Debug mode should be enabled');
  });

  test('Should disable debug mode', () => {
    ErrorHandler.setDebugMode(false);
    assert.strictEqual(ErrorHandler.isDebugMode(), false, 'Debug mode should be disabled');
  });

  test('Should parse API key missing error', () => {
    const error = { message: 'API key not found' };
    const errorInfo = ErrorHandler.parseError(error);
    
    assert.strictEqual(errorInfo.type, ErrorType.API_KEY_MISSING);
    assert.strictEqual(errorInfo.canRetry, false);
  });

  test('Should parse API key invalid error', () => {
    const error = { message: 'Unauthorized' };
    const errorInfo = ErrorHandler.parseError(error);
    
    assert.strictEqual(errorInfo.type, ErrorType.API_KEY_INVALID);
    assert.strictEqual(errorInfo.canRetry, false);
  });

  test('Should parse timeout error', () => {
    const error = { message: 'Request timeout' };
    const errorInfo = ErrorHandler.parseError(error);
    
    assert.strictEqual(errorInfo.type, ErrorType.TIMEOUT_ERROR);
    assert.strictEqual(errorInfo.canRetry, true);
  });

  test('Should parse rate limit error', () => {
    const error = { message: 'Rate limit exceeded' };
    const errorInfo = ErrorHandler.parseError(error);
    
    assert.strictEqual(errorInfo.type, ErrorType.RATE_LIMIT_EXCEEDED);
    assert.strictEqual(errorInfo.canRetry, true);
  });

  test('Should parse network error', () => {
    const error = { code: 'ENOTFOUND', message: 'Network error' };
    const errorInfo = ErrorHandler.parseError(error);
    
    assert.strictEqual(errorInfo.type, ErrorType.NETWORK_ERROR);
    assert.strictEqual(errorInfo.canRetry, true);
  });

  test('Should parse quota exceeded error', () => {
    const error = { message: 'insufficient_quota' };
    const errorInfo = ErrorHandler.parseError(error);
    
    assert.strictEqual(errorInfo.type, ErrorType.QUOTA_EXCEEDED);
    assert.strictEqual(errorInfo.canRetry, false);
  });

  test('Should handle unknown errors', () => {
    const error = { message: 'Some unknown error' };
    const errorInfo = ErrorHandler.parseError(error);
    
    assert.strictEqual(errorInfo.type, ErrorType.UNKNOWN_ERROR);
    assert.strictEqual(errorInfo.canRetry, true);
  });

  test('Should log info messages', () => {
    assert.doesNotThrow(() => {
      ErrorHandler.logInfo('Test info message', 'TestContext');
    });
  });

  test('Should log warning messages', () => {
    assert.doesNotThrow(() => {
      ErrorHandler.logWarning('Test warning message', 'TestContext');
    });
  });

  test('Should log error messages', () => {
    assert.doesNotThrow(() => {
      ErrorHandler.logError(new Error('Test error'), 'TestContext');
    });
  });

  test('Should log debug messages only when debug mode is enabled', () => {
    ErrorHandler.setDebugMode(false);
    assert.doesNotThrow(() => {
      ErrorHandler.logDebug('Test debug message', 'TestContext');
    });
  });

  test('Should log data in debug mode', () => {
    ErrorHandler.setDebugMode(true);
    const testData = { key: 'value', number: 42 };
    
    assert.doesNotThrow(() => {
      ErrorHandler.logData(testData, 'TestData');
    });
  });
});
