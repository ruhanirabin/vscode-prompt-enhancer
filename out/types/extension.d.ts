import * as vscode from 'vscode';
export type OutputAction = 'replace' | 'insertBelow' | 'insertAbove' | 'copyToClipboard';
export interface ExtensionSettings {
    model: string;
    timeout: number;
    defaultTemplate: string;
    maxTokens: number;
    temperature: number;
    customTemplate: string;
    debugMode: boolean;
    enableHistory: boolean;
    historyLimit: number;
}
export interface QuickPickItem extends vscode.QuickPickItem {
    action: OutputAction;
}
export interface EnhancementContext {
    editor: vscode.TextEditor | null;
    selection: vscode.Selection | null;
    selectedText: string;
    document: vscode.TextDocument | null;
    isClipboardBased?: boolean;
}
export interface TemplateQuickPickItem extends vscode.QuickPickItem {
    template: string;
    category?: string | undefined;
}
export interface LoadingProgress {
    message: string;
    increment?: number;
}
export interface ApiKeyValidationResult {
    isValid: boolean;
    error?: string;
}
export interface TemplateManagerQuickPickItem extends vscode.QuickPickItem {
    templateId: string;
    isBuiltIn: boolean;
    action?: 'edit' | 'delete' | 'duplicate' | 'export';
}
export interface CategoryQuickPickItem extends vscode.QuickPickItem {
    category: string;
}
export interface TemplateFormData {
    name: string;
    description: string;
    systemPrompt: string;
    userPromptTemplate: string;
    category?: string | undefined;
}
//# sourceMappingURL=extension.d.ts.map