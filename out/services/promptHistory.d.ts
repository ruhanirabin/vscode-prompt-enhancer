import * as vscode from 'vscode';
export interface HistoryEntry {
    id: string;
    timestamp: number;
    originalText: string;
    enhancedText: string;
    model: string;
    template: string;
    tokensUsed: number;
    processingTime: number;
}
export declare class PromptHistoryService {
    private static readonly HISTORY_KEY;
    private context;
    private historyLimit;
    private enabled;
    constructor(context: vscode.ExtensionContext);
    /**
     * Initialize the history service
     */
    initialize(): Promise<void>;
    /**
     * Add an entry to the enhancement history
     */
    addEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): Promise<void>;
    /**
     * Get all history entries
     */
    getHistory(): Promise<HistoryEntry[]>;
    /**
     * Get a specific history entry by ID
     */
    getEntry(id: string): Promise<HistoryEntry | undefined>;
    /**
     * Delete a history entry
     */
    deleteEntry(id: string): Promise<boolean>;
    /**
     * Clear all history
     */
    clearHistory(): Promise<void>;
    /**
     * Get recent entries (for quick access)
     */
    getRecent(limit?: number): Promise<HistoryEntry[]>;
    /**
     * Search history by text content
     */
    search(query: string): Promise<HistoryEntry[]>;
    /**
     * Export history to JSON
     */
    exportHistory(): Promise<string>;
    /**
     * Import history from JSON
     */
    importHistory(jsonData: string): Promise<number>;
    /**
     * Update settings (called when configuration changes)
     */
    updateSettings(): void;
    /**
     * Save history to storage
     */
    private saveHistory;
    /**
     * Generate unique ID for history entry
     */
    private generateId;
    /**
     * Check if history is enabled
     */
    isEnabled(): boolean;
    /**
     * Get history statistics
     */
    getStatistics(): Promise<{
        total: number;
        today: number;
        thisWeek: number;
        totalTokens: number;
        avgProcessingTime: number;
    }>;
}
//# sourceMappingURL=promptHistory.d.ts.map