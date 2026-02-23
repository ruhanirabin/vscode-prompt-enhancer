import * as vscode from 'vscode';

export enum ErrorType {
  API_KEY_MISSING = 'API_KEY_MISSING',
  API_KEY_INVALID = 'API_KEY_INVALID',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ErrorInfo {
  type: ErrorType;
  message: string;
  suggestion?: string;
  canRetry: boolean;
}

export class ErrorHandler {
  private static debugModeEnabled: boolean = false;
  private static outputChannel: vscode.OutputChannel | null = null;

  /**
   * Initialize error handler with debug mode setting
   */
  static initialize(debugMode: boolean = false): void {
    this.debugModeEnabled = debugMode;
    if (debugMode && !this.outputChannel) {
      this.outputChannel = vscode.window.createOutputChannel('Prompt Enhancer (Debug)');
    }
  }

  /**
   * Set debug mode enabled/disabled
   */
  static setDebugMode(enabled: boolean): void {
    this.debugModeEnabled = enabled;
    if (enabled && !this.outputChannel) {
      this.outputChannel = vscode.window.createOutputChannel('Prompt Enhancer (Debug)');
    }
  }

  /**
   * Check if debug mode is enabled
   */
  static isDebugMode(): boolean {
    return this.debugModeEnabled;
  }

  /**
   * Get the debug output channel
   */
  static getOutputChannel(): vscode.OutputChannel | null {
    return this.outputChannel;
  }
  static parseError(error: any): ErrorInfo {
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

  static async showError(errorInfo: ErrorInfo): Promise<string | undefined> {
    const actions: string[] = [];
    
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

  static async showWarning(message: string, ...actions: string[]): Promise<string | undefined> {
    return await vscode.window.showWarningMessage(message, ...actions);
  }

  static async showInfo(message: string, ...actions: string[]): Promise<string | undefined> {
    return await vscode.window.showInformationMessage(message, ...actions);
  }

  static logError(error: any, context?: string): void {
    const contextStr = context ? `[${context}] ` : '';
    const timestamp = new Date().toISOString();
    
    if (this.debugModeEnabled) {
      // Detailed logging in debug mode
      this.logToOutputChannel(`${timestamp} ${contextStr}ERROR:`, error);
    }
    console.error(`${contextStr}Error:`, error);
  }

  static logWarning(message: string, context?: string): void {
    const contextStr = context ? `[${context}] ` : '';
    const timestamp = new Date().toISOString();
    
    if (this.debugModeEnabled) {
      this.logToOutputChannel(`${timestamp} ${contextStr}WARNING: ${message}`);
    }
    console.warn(`${contextStr}Warning: ${message}`);
  }

  static logInfo(message: string, context?: string): void {
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
  static logDebug(message: string, context?: string): void {
    if (this.debugModeEnabled) {
      const contextStr = context ? `[${context}] ` : '';
      const timestamp = new Date().toISOString();
      this.logToOutputChannel(`${timestamp} ${contextStr}DEBUG: ${message}`);
    }
  }

  /**
   * Log structured data for debugging
   */
  static logData(data: any, label: string = 'Data'): void {
    if (this.debugModeEnabled) {
      const timestamp = new Date().toISOString();
      this.logToOutputChannel(`${timestamp} ${label}:`, JSON.stringify(data, null, 2));
    }
  }

  /**
   * Log to output channel if available
   */
  private static logToOutputChannel(...args: any[]): void {
    if (this.outputChannel) {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      this.outputChannel.appendLine(message);
    }
  }

  /**
   * Show the debug output channel
   */
  static showOutputChannel(): void {
    this.outputChannel?.show();
  }
}