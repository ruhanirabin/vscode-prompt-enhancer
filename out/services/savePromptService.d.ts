import * as vscode from 'vscode';
export interface SavedPrompt {
    id: string;
    timestamp: number;
    originalText: string;
    enhancedText: string;
    model: string;
    template: string;
    filePath: string;
}
export declare class SavePromptService {
    private static readonly SAVED_PROMPTS_KEY;
    private context;
    constructor(context: vscode.ExtensionContext);
    /**
     * Save a prompt to a file
     */
    savePrompt(originalText: string, enhancedText: string, model: string, template: string, filename?: string): Promise<string | null>;
    /**
     * Create markdown content for saved prompt
     */
    private createMarkdownContent;
    /**
     * Generate a safe filename from prompt text
     */
    private generateFilename;
    /**
     * Record a saved prompt in the registry
     */
    private recordSavedPrompt;
    /**
     * Get list of saved prompts
     */
    getSavedPrompts(): Promise<SavedPrompt[]>;
    /**
     * Delete a saved prompt record
     */
    deleteSavedPrompt(id: string): Promise<boolean>;
    /**
     * Open a saved prompt file
     */
    openSavedPrompt(filePath: string): Promise<void>;
    /**
     * Delete the actual file
     */
    deleteFile(filePath: string): Promise<boolean>;
    /**
     * Generate unique ID
     */
    private generateId;
}
//# sourceMappingURL=savePromptService.d.ts.map