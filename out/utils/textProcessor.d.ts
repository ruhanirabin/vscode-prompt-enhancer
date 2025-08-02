import * as vscode from 'vscode';
import { EnhancementContext, OutputAction } from '../types/extension';
export declare class TextProcessor {
    static validateSelection(editor: vscode.TextEditor): string | null;
    static createEnhancementContext(editor: vscode.TextEditor): EnhancementContext | null;
    static createClipboardContext(text: string): EnhancementContext;
    static applyEnhancedText(context: EnhancementContext, enhancedText: string, action: OutputAction): Promise<void>;
    private static replaceText;
    private static insertBelow;
    private static insertAbove;
    private static copyToClipboard;
    static getContextInfo(context: EnhancementContext): string;
    static sanitizeText(text: string): string;
    static truncateText(text: string, maxLength: number): string;
    static getPreviewText(text: string, maxLength?: number): string;
}
//# sourceMappingURL=textProcessor.d.ts.map