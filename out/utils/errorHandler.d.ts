import * as vscode from 'vscode';
export declare enum ErrorType {
    API_KEY_MISSING = "API_KEY_MISSING",
    API_KEY_INVALID = "API_KEY_INVALID",
    NETWORK_ERROR = "NETWORK_ERROR",
    TIMEOUT_ERROR = "TIMEOUT_ERROR",
    QUOTA_EXCEEDED = "QUOTA_EXCEEDED",
    INVALID_REQUEST = "INVALID_REQUEST",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
}
export interface ErrorInfo {
    type: ErrorType;
    message: string;
    suggestion?: string;
    canRetry: boolean;
}
export declare class ErrorHandler {
    private static debugModeEnabled;
    private static outputChannel;
    /**
     * Initialize error handler with debug mode setting
     */
    static initialize(debugMode?: boolean): void;
    /**
     * Set debug mode enabled/disabled
     */
    static setDebugMode(enabled: boolean): void;
    /**
     * Check if debug mode is enabled
     */
    static isDebugMode(): boolean;
    /**
     * Get the debug output channel
     */
    static getOutputChannel(): vscode.OutputChannel | null;
    static parseError(error: any): ErrorInfo;
    static showError(errorInfo: ErrorInfo): Promise<string | undefined>;
    static showWarning(message: string, ...actions: string[]): Promise<string | undefined>;
    static showInfo(message: string, ...actions: string[]): Promise<string | undefined>;
    static logError(error: any, context?: string): void;
    static logWarning(message: string, context?: string): void;
    static logInfo(message: string, context?: string): void;
    /**
     * Log debug-specific information (only shown when debug mode is enabled)
     */
    static logDebug(message: string, context?: string): void;
    /**
     * Log structured data for debugging
     */
    static logData(data: any, label?: string): void;
    /**
     * Log to output channel if available
     */
    private static logToOutputChannel;
    /**
     * Show the debug output channel
     */
    static showOutputChannel(): void;
}
//# sourceMappingURL=errorHandler.d.ts.map