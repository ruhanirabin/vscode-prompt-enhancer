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
exports.PromptHistoryService = void 0;
const vscode = __importStar(require("vscode"));
const errorHandler_1 = require("../utils/errorHandler");
class PromptHistoryService {
    constructor(context) {
        this.context = context;
        const config = vscode.workspace.getConfiguration('promptEnhancer');
        this.enabled = config.get('enableHistory', true);
        this.historyLimit = config.get('historyLimit', 50);
    }
    /**
     * Initialize the history service
     */
    async initialize() {
        if (!this.enabled) {
            errorHandler_1.ErrorHandler.logDebug('History service disabled', 'PromptHistoryService');
            return;
        }
        const history = await this.getHistory();
        errorHandler_1.ErrorHandler.logDebug(`History service initialized with ${history.length} entries`, 'PromptHistoryService');
    }
    /**
     * Add an entry to the enhancement history
     */
    async addEntry(entry) {
        if (!this.enabled) {
            return;
        }
        try {
            const history = await this.getHistory();
            const newEntry = {
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
            errorHandler_1.ErrorHandler.logDebug(`Added history entry: ${newEntry.id}`, 'PromptHistoryService');
        }
        catch (error) {
            errorHandler_1.ErrorHandler.logError(error, 'PromptHistoryService.addEntry');
        }
    }
    /**
     * Get all history entries
     */
    async getHistory() {
        if (!this.enabled) {
            return [];
        }
        try {
            const stored = this.context.globalState.get(PromptHistoryService.HISTORY_KEY, []);
            return stored;
        }
        catch (error) {
            errorHandler_1.ErrorHandler.logError(error, 'PromptHistoryService.getHistory');
            return [];
        }
    }
    /**
     * Get a specific history entry by ID
     */
    async getEntry(id) {
        const history = await this.getHistory();
        return history.find(entry => entry.id === id);
    }
    /**
     * Delete a history entry
     */
    async deleteEntry(id) {
        try {
            const history = await this.getHistory();
            const filteredHistory = history.filter(entry => entry.id !== id);
            if (filteredHistory.length === history.length) {
                return false; // Entry not found
            }
            await this.saveHistory(filteredHistory);
            errorHandler_1.ErrorHandler.logDebug(`Deleted history entry: ${id}`, 'PromptHistoryService');
            return true;
        }
        catch (error) {
            errorHandler_1.ErrorHandler.logError(error, 'PromptHistoryService.deleteEntry');
            return false;
        }
    }
    /**
     * Clear all history
     */
    async clearHistory() {
        try {
            await this.saveHistory([]);
            errorHandler_1.ErrorHandler.logDebug('History cleared', 'PromptHistoryService');
        }
        catch (error) {
            errorHandler_1.ErrorHandler.logError(error, 'PromptHistoryService.clearHistory');
        }
    }
    /**
     * Get recent entries (for quick access)
     */
    async getRecent(limit = 10) {
        const history = await this.getHistory();
        return history.slice(0, limit);
    }
    /**
     * Search history by text content
     */
    async search(query) {
        const history = await this.getHistory();
        const lowerQuery = query.toLowerCase();
        return history.filter(entry => entry.originalText.toLowerCase().includes(lowerQuery) ||
            entry.enhancedText.toLowerCase().includes(lowerQuery));
    }
    /**
     * Export history to JSON
     */
    async exportHistory() {
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
    async importHistory(jsonData) {
        try {
            const importData = JSON.parse(jsonData);
            const entries = importData.entries;
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
            errorHandler_1.ErrorHandler.logDebug(`Imported ${importedCount} history entries`, 'PromptHistoryService');
            return importedCount;
        }
        catch (error) {
            errorHandler_1.ErrorHandler.logError(error, 'PromptHistoryService.importHistory');
            throw new Error('Invalid history file format');
        }
    }
    /**
     * Update settings (called when configuration changes)
     */
    updateSettings() {
        const config = vscode.workspace.getConfiguration('promptEnhancer');
        const wasEnabled = this.enabled;
        this.enabled = config.get('enableHistory', true);
        this.historyLimit = config.get('historyLimit', 50);
        if (!this.enabled && wasEnabled) {
            errorHandler_1.ErrorHandler.logDebug('History service disabled - clearing in-memory data', 'PromptHistoryService');
        }
    }
    /**
     * Save history to storage
     */
    async saveHistory(history) {
        await this.context.globalState.update(PromptHistoryService.HISTORY_KEY, history);
    }
    /**
     * Generate unique ID for history entry
     */
    generateId() {
        return `hist_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    }
    /**
     * Check if history is enabled
     */
    isEnabled() {
        return this.enabled;
    }
    /**
     * Get history statistics
     */
    async getStatistics() {
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
exports.PromptHistoryService = PromptHistoryService;
PromptHistoryService.HISTORY_KEY = 'promptEnhancer.enhancementHistory';
//# sourceMappingURL=promptHistory.js.map