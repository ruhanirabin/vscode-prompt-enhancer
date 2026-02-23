"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const errorHandler_1 = require("../../utils/errorHandler");
suite('ErrorHandler Tests', () => {
    setup(() => {
        // Reset debug mode before each test
        errorHandler_1.ErrorHandler.setDebugMode(false);
    });
    test('Should initialize without errors', () => {
        assert.doesNotThrow(() => {
            errorHandler_1.ErrorHandler.initialize(false);
        });
    });
    test('Should enable debug mode', () => {
        errorHandler_1.ErrorHandler.setDebugMode(true);
        assert.strictEqual(errorHandler_1.ErrorHandler.isDebugMode(), true, 'Debug mode should be enabled');
    });
    test('Should disable debug mode', () => {
        errorHandler_1.ErrorHandler.setDebugMode(false);
        assert.strictEqual(errorHandler_1.ErrorHandler.isDebugMode(), false, 'Debug mode should be disabled');
    });
    test('Should parse API key missing error', () => {
        const error = { message: 'API key not found' };
        const errorInfo = errorHandler_1.ErrorHandler.parseError(error);
        assert.strictEqual(errorInfo.type, errorHandler_1.ErrorType.API_KEY_MISSING);
        assert.strictEqual(errorInfo.canRetry, false);
    });
    test('Should parse API key invalid error', () => {
        const error = { message: 'Unauthorized' };
        const errorInfo = errorHandler_1.ErrorHandler.parseError(error);
        assert.strictEqual(errorInfo.type, errorHandler_1.ErrorType.API_KEY_INVALID);
        assert.strictEqual(errorInfo.canRetry, false);
    });
    test('Should parse timeout error', () => {
        const error = { message: 'Request timeout' };
        const errorInfo = errorHandler_1.ErrorHandler.parseError(error);
        assert.strictEqual(errorInfo.type, errorHandler_1.ErrorType.TIMEOUT_ERROR);
        assert.strictEqual(errorInfo.canRetry, true);
    });
    test('Should parse rate limit error', () => {
        const error = { message: 'Rate limit exceeded' };
        const errorInfo = errorHandler_1.ErrorHandler.parseError(error);
        assert.strictEqual(errorInfo.type, errorHandler_1.ErrorType.RATE_LIMIT_EXCEEDED);
        assert.strictEqual(errorInfo.canRetry, true);
    });
    test('Should parse network error', () => {
        const error = { code: 'ENOTFOUND', message: 'Network error' };
        const errorInfo = errorHandler_1.ErrorHandler.parseError(error);
        assert.strictEqual(errorInfo.type, errorHandler_1.ErrorType.NETWORK_ERROR);
        assert.strictEqual(errorInfo.canRetry, true);
    });
    test('Should parse quota exceeded error', () => {
        const error = { message: 'insufficient_quota' };
        const errorInfo = errorHandler_1.ErrorHandler.parseError(error);
        assert.strictEqual(errorInfo.type, errorHandler_1.ErrorType.QUOTA_EXCEEDED);
        assert.strictEqual(errorInfo.canRetry, false);
    });
    test('Should handle unknown errors', () => {
        const error = { message: 'Some unknown error' };
        const errorInfo = errorHandler_1.ErrorHandler.parseError(error);
        assert.strictEqual(errorInfo.type, errorHandler_1.ErrorType.UNKNOWN_ERROR);
        assert.strictEqual(errorInfo.canRetry, true);
    });
    test('Should log info messages', () => {
        assert.doesNotThrow(() => {
            errorHandler_1.ErrorHandler.logInfo('Test info message', 'TestContext');
        });
    });
    test('Should log warning messages', () => {
        assert.doesNotThrow(() => {
            errorHandler_1.ErrorHandler.logWarning('Test warning message', 'TestContext');
        });
    });
    test('Should log error messages', () => {
        assert.doesNotThrow(() => {
            errorHandler_1.ErrorHandler.logError(new Error('Test error'), 'TestContext');
        });
    });
    test('Should log debug messages only when debug mode is enabled', () => {
        errorHandler_1.ErrorHandler.setDebugMode(false);
        assert.doesNotThrow(() => {
            errorHandler_1.ErrorHandler.logDebug('Test debug message', 'TestContext');
        });
    });
    test('Should log data in debug mode', () => {
        errorHandler_1.ErrorHandler.setDebugMode(true);
        const testData = { key: 'value', number: 42 };
        assert.doesNotThrow(() => {
            errorHandler_1.ErrorHandler.logData(testData, 'TestData');
        });
    });
});
//# sourceMappingURL=errorHandler.test.js.map