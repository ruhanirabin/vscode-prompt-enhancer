import * as vscode from 'vscode';
import { ErrorHandler } from '../utils/errorHandler';

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

export class PromptHistoryService {
  private static readonly HISTORY_KEY = 'promptEnhancer.enhancementHistory';
  private context: vscode.ExtensionContext;
  private historyLimit: number;
  private enabled: boolean;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    const config = vscode.workspace.getConfiguration('promptEnhancer');
    this.enabled = config.get('enableHistory', true);
    this.historyLimit = config.get('historyLimit', 50);
  }

  /**
   * Initialize the history service
   */
  async initialize(): Promise<void> {
    if (!this.enabled) {
      ErrorHandler.logDebug('History service disabled', 'PromptHistoryService');
      return;
    }

    const history = await this.getHistory();
    ErrorHandler.logDebug(`History service initialized with ${history.length} entries`, 'PromptHistoryService');
  }

  /**
   * Add an entry to the enhancement history
   */
  async addEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      const history = await this.getHistory();
      
      const newEntry: HistoryEntry = {
        ...entry,
        id: this.generateId(),
        timestamp: Date.now()
      };

      // Add to beginning of array (most recent first)
      history.unshift(newEntry);

      // Trim to limit
      while (history.length > this.historyLimit) {
        history.pop();
      }

      await this.saveHistory(history);
      ErrorHandler.logDebug(`Added history entry: ${newEntry.id}`, 'PromptHistoryService');
    } catch (error) {
      ErrorHandler.logError(error, 'PromptHistoryService.addEntry');
    }
  }

  /**
   * Get all history entries
   */
  async getHistory(): Promise<HistoryEntry[]> {
    if (!this.enabled) {
      return [];
    }

    try {
      const stored = this.context.globalState.get<HistoryEntry[]>(PromptHistoryService.HISTORY_KEY, []);
      return stored;
    } catch (error) {
      ErrorHandler.logError(error, 'PromptHistoryService.getHistory');
      return [];
    }
  }

  /**
   * Get a specific history entry by ID
   */
  async getEntry(id: string): Promise<HistoryEntry | undefined> {
    const history = await this.getHistory();
    return history.find(entry => entry.id === id);
  }

  /**
   * Delete a history entry
   */
  async deleteEntry(id: string): Promise<boolean> {
    try {
      const history = await this.getHistory();
      const filteredHistory = history.filter(entry => entry.id !== id);
      
      if (filteredHistory.length === history.length) {
        return false; // Entry not found
      }

      await this.saveHistory(filteredHistory);
      ErrorHandler.logDebug(`Deleted history entry: ${id}`, 'PromptHistoryService');
      return true;
    } catch (error) {
      ErrorHandler.logError(error, 'PromptHistoryService.deleteEntry');
      return false;
    }
  }

  /**
   * Clear all history
   */
  async clearHistory(): Promise<void> {
    try {
      await this.saveHistory([]);
      ErrorHandler.logDebug('History cleared', 'PromptHistoryService');
    } catch (error) {
      ErrorHandler.logError(error, 'PromptHistoryService.clearHistory');
    }
  }

  /**
   * Get recent entries (for quick access)
   */
  async getRecent(limit: number = 10): Promise<HistoryEntry[]> {
    const history = await this.getHistory();
    return history.slice(0, limit);
  }

  /**
   * Search history by text content
   */
  async search(query: string): Promise<HistoryEntry[]> {
    const history = await this.getHistory();
    const lowerQuery = query.toLowerCase();

    return history.filter(entry =>
      entry.originalText.toLowerCase().includes(lowerQuery) ||
      entry.enhancedText.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Export history to JSON
   */
  async exportHistory(): Promise<string> {
    const history = await this.getHistory();
    return JSON.stringify({
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      count: history.length,
      entries: history
    }, null, 2);
  }

  /**
   * Import history from JSON
   */
  async importHistory(jsonData: string): Promise<number> {
    try {
      const importData = JSON.parse(jsonData);
      const entries = importData.entries as HistoryEntry[];

      if (!Array.isArray(entries)) {
        throw new Error('Invalid history format');
      }

      // Merge with existing history (avoid duplicates by ID)
      const existingHistory = await this.getHistory();
      const existingIds = new Set(existingHistory.map(e => e.id));
      
      let importedCount = 0;
      for (const entry of entries) {
        if (!existingIds.has(entry.id)) {
          existingHistory.push(entry);
          importedCount++;
        }
      }

      // Sort by timestamp (most recent first) and trim
      existingHistory.sort((a, b) => b.timestamp - a.timestamp);
      while (existingHistory.length > this.historyLimit) {
        existingHistory.pop();
      }

      await this.saveHistory(existingHistory);
      ErrorHandler.logDebug(`Imported ${importedCount} history entries`, 'PromptHistoryService');
      
      return importedCount;
    } catch (error) {
      ErrorHandler.logError(error, 'PromptHistoryService.importHistory');
      throw new Error('Invalid history file format');
    }
  }

  /**
   * Update settings (called when configuration changes)
   */
  updateSettings(): void {
    const config = vscode.workspace.getConfiguration('promptEnhancer');
    const wasEnabled = this.enabled;
    this.enabled = config.get('enableHistory', true);
    this.historyLimit = config.get('historyLimit', 50);

    if (!this.enabled && wasEnabled) {
      ErrorHandler.logDebug('History service disabled - clearing in-memory data', 'PromptHistoryService');
    }
  }

  /**
   * Save history to storage
   */
  private async saveHistory(history: HistoryEntry[]): Promise<void> {
    await this.context.globalState.update(PromptHistoryService.HISTORY_KEY, history);
  }

  /**
   * Generate unique ID for history entry
   */
  private generateId(): string {
    return `hist_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Check if history is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get history statistics
   */
  async getStatistics(): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    totalTokens: number;
    avgProcessingTime: number;
  }> {
    const history = await this.getHistory();
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;

    const today = history.filter(e => now - e.timestamp < oneDay).length;
    const thisWeek = history.filter(e => now - e.timestamp < oneWeek).length;
    const totalTokens = history.reduce((sum, e) => sum + e.tokensUsed, 0);
    const avgProcessingTime = history.length > 0
      ? history.reduce((sum, e) => sum + e.processingTime, 0) / history.length
      : 0;

    return {
      total: history.length,
      today,
      thisWeek,
      totalTokens,
      avgProcessingTime
    };
  }
}
