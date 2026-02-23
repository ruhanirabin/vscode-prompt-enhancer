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
exports.ErrorHandler = exports.ErrorType = void 0;
const vscode = __importStar(require("vscode"));
var ErrorType;
(function (ErrorType) {
    ErrorType["API_KEY_MISSING"] = "API_KEY_MISSING";
    ErrorType["API_KEY_INVALID"] = "API_KEY_INVALID";
    ErrorType["NETWORK_ERROR"] = "NETWORK_ERROR";
    ErrorType["TIMEOUT_ERROR"] = "TIMEOUT_ERROR";
    ErrorType["QUOTA_EXCEEDED"] = "QUOTA_EXCEEDED";
    ErrorType["INVALID_REQUEST"] = "INVALID_REQUEST";
    ErrorType["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    ErrorType["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
})(ErrorType || (exports.ErrorType = ErrorType = {}));
class ErrorHandler {
    /**
     * Initialize error handler with debug mode setting
     */
    static initialize(debugMode = false) {
        this.debugModeEnabled = debugMode;
        if (debugMode && !this.outputChannel) {
            this.outputChannel = vscode.window.createOutputChannel('Prompt Enhancer (Debug)');
        }
    }
    /**
     * Set debug mode enabled/disabled
     */
    static setDebugMode(enabled) {
        this.debugModeEnabled = enabled;
        if (enabled && !this.outputChannel) {
            this.outputChannel = vscode.window.createOutputChannel('Prompt Enhancer (Debug)');
        }
    }
    /**
     * Check if debug mode is enabled
     */
    static isDebugMode() {
        return this.debugModeEnabled;
    }
    /**
     * Get the debug output channel
     */
    static getOutputChannel() {
        return this.outputChannel;
    }
    static parseError(error) {
        const errorMessage = error?.message || error?.toString() || 'Unknown error';
        // API Key related errors
        if (errorMessage.includes('API key') || errorMessage.includes('Unauthorized')) {
            return {
                type: ErrorType.API_KEY_INVALID,
                message: 'Invalid or missing API key',
                suggestion: 'Please check your OpenAI API key in settings',
                canRetry: false
            };
        }
        // Timeout errors
        if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
            return {
                type: ErrorType.TIMEOUT_ERROR,
                message: 'Request timed out',
                suggestion: 'Try increasing the timeout in settings or check your internet connection',
                canRetry: true
            };
        }
        // Quota/billing errors
        if (errorMessage.includes('quota') || errorMessage.includes('billing') || errorMessage.includes('insufficient_quota')) {
            return {
                type: ErrorType.QUOTA_EXCEEDED,
                message: 'API quota exceeded or billing issue',
                suggestion: 'Check your OpenAI account usage and billing settings',
                canRetry: false
            };
        }
        // Rate limit errors
        if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
            return {
                type: ErrorType.RATE_LIMIT_EXCEEDED,
                message: 'Rate limit exceeded',
                suggestion: 'Please wait a moment before trying again',
                canRetry: true
            };
        }
        // Network errors
        if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED' || errorMessage.includes('network')) {
            return {
                type: ErrorType.NETWORK_ERROR,
                message: 'Network connection failed',
                suggestion: 'Check your internet connection and try again',
                canRetry: true
            };
        }
        // Invalid request errors
        if (errorMessage.includes('invalid_request') || errorMessage.includes('bad request')) {
            return {
                type: ErrorType.INVALID_REQUEST,
                message: 'Invalid request parameters',
                suggestion: 'Please check your settings and try again',
                canRetry: false
            };
        }
        // Default unknown error
        return {
            type: ErrorType.UNKNOWN_ERROR,
            message: errorMessage,
            suggestion: 'Please try again or contact support if the issue persists',
            canRetry: true
        };
    }
    static async showError(errorInfo) {
        const actions = [];
        if (errorInfo.canRetry) {
            actions.push('Retry');
        }
        if (errorInfo.type === ErrorType.API_KEY_MISSING || errorInfo.type === ErrorType.API_KEY_INVALID) {
            actions.push('Configure API Key');
        }
        actions.push('Cancel');
        const message = errorInfo.suggestion
            ? `${errorInfo.message}\n\n${errorInfo.suggestion}`
            : errorInfo.message;
        return await vscode.window.showErrorMessage(message, ...actions);
    }
    static async showWarning(message, ...actions) {
        return await vscode.window.showWarningMessage(message, ...actions);
    }
    static async showInfo(message, ...actions) {
        return await vscode.window.showInformationMessage(message, ...actions);
    }
    static logError(error, context) {
        const contextStr = context ? `[${context}] ` : '';
        const timestamp = new Date().toISOString();
        if (this.debugModeEnabled) {
            // Detailed logging in debug mode
            this.logToOutputChannel(`${timestamp} ${contextStr}ERROR:`, error);
        }
        console.error(`${contextStr}Error:`, error);
    }
    static logWarning(message, context) {
        const contextStr = context ? `[${context}] ` : '';
        const timestamp = new Date().toISOString();
        if (this.debugModeEnabled) {
            this.logToOutputChannel(`${timestamp} ${contextStr}WARNING: ${message}`);
        }
        console.warn(`${contextStr}Warning: ${message}`);
    }
    static logInfo(message, context) {
        const contextStr = context ? `[${context}] ` : '';
        const timestamp = new Date().toISOString();
        if (this.debugModeEnabled) {
            this.logToOutputChannel(`${timestamp} ${contextStr}INFO: ${message}`);
        }
        console.log(`${contextStr}Info: ${message}`);
    }
    /**
     * Log debug-specific information (only shown when debug mode is enabled)
     */
    static logDebug(message, context) {
        if (this.debugModeEnabled) {
            const contextStr = context ? `[${context}] ` : '';
            const timestamp = new Date().toISOString();
            this.logToOutputChannel(`${timestamp} ${contextStr}DEBUG: ${message}`);
        }
    }
    /**
     * Log structured data for debugging
     */
    static logData(data, label = 'Data') {
        if (this.debugModeEnabled) {
            const timestamp = new Date().toISOString();
            this.logToOutputChannel(`${timestamp} ${label}:`, JSON.stringify(data, null, 2));
        }
    }
    /**
     * Log to output channel if available
     */
    static logToOutputChannel(...args) {
        if (this.outputChannel) {
            const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
            this.outputChannel.appendLine(message);
        }
    }
    /**
     * Show the debug output channel
     */
    static showOutputChannel() {
        this.outputChannel?.show();
    }
}
exports.ErrorHandler = ErrorHandler;
ErrorHandler.debugModeEnabled = false;
ErrorHandler.outputChannel = null;
//# sourceMappingURL=errorHandler.js.map