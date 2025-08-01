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
    static parseError(error: any): ErrorInfo;
    static showError(errorInfo: ErrorInfo): Promise<string | undefined>;
    static showWarning(message: string, ...actions: string[]): Promise<string | undefined>;
    static showInfo(message: string, ...actions: string[]): Promise<string | undefined>;
    static logError(error: any, context?: string): void;
    static logWarning(message: string, context?: string): void;
    static logInfo(message: string, context?: string): void;
}
//# sourceMappingURL=errorHandler.d.ts.map