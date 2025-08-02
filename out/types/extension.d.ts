import * as vscode from 'vscode';
import { EnhancementTemplate } from './openai';
export type OutputAction = 'replace' | 'insertBelow' | 'insertAbove' | 'copyToClipboard';
export interface ExtensionSettings {
    model: string;
    timeout: number;
    defaultTemplate: EnhancementTemplate;
    maxTokens: number;
    temperature: number;
    customTemplate: string;
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
    template: EnhancementTemplate;
}
export interface LoadingProgress {
    message: string;
    increment?: number;
}
export interface ApiKeyValidationResult {
    isValid: boolean;
    error?: string;
}
//# sourceMappingURL=extension.d.ts.map