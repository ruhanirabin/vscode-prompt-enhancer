import * as vscode from 'vscode';
import { EnhancementContext, OutputAction } from '../types/extension';
import { ErrorHandler } from './errorHandler';

export class TextProcessor {
  
  static validateSelection(editor: vscode.TextEditor): string | null {
    const selection = editor.selection;
    
    if (selection.isEmpty) {
      return 'No text selected. Please select some text to enhance.';
    }

    const selectedText = editor.document.getText(selection).trim();
    
    if (selectedText.length === 0) {
      return 'Selected text is empty or contains only whitespace.';
    }

    if (selectedText.length > 10000) {
      return 'Selected text is too long. Please select less than 10,000 characters.';
    }

    if (selectedText.length < 3) {
      return 'Selected text is too short. Please select at least 3 characters.';
    }

    return null; // Valid selection
  }

  static createEnhancementContext(editor: vscode.TextEditor): EnhancementContext | null {
    const validationError = TextProcessor.validateSelection(editor);
    if (validationError) {
      ErrorHandler.showError({
        type: 'INVALID_REQUEST' as any,
        message: validationError,
        canRetry: false
      });
      return null;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection).trim();

    return {
      editor,
      selection,
      selectedText,
      document: editor.document
    };
  }

  static createClipboardContext(text: string): EnhancementContext {
    // Validate clipboard text
    const trimmedText = text.trim();
    
    if (trimmedText.length === 0) {
      throw new Error('Clipboard text is empty or contains only whitespace.');
    }

    if (trimmedText.length > 10000) {
      throw new Error('Clipboard text is too long. Please select less than 10,000 characters.');
    }

    if (trimmedText.length < 3) {
      throw new Error('Clipboard text is too short. Please select at least 3 characters.');
    }

    return {
      editor: null,
      selection: null,
      selectedText: trimmedText,
      document: null,
      isClipboardBased: true
    };
  }

  static async applyEnhancedText(
    context: EnhancementContext,
    enhancedText: string,
    action: OutputAction
  ): Promise<void> {
    const { editor, selection } = context;

    try {
      // For clipboard-based contexts, only clipboard action is available
      if (context.isClipboardBased || !editor || !selection) {
        if (action !== 'copyToClipboard') {
          // Force clipboard action for clipboard-based contexts
          await TextProcessor.copyToClipboard(enhancedText);
          vscode.window.showInformationMessage(
            'Enhanced text copied to clipboard (editor actions not available for clipboard-based enhancement)'
          );
        } else {
          await TextProcessor.copyToClipboard(enhancedText);
        }
        return;
      }

      switch (action) {
        case 'replace':
          await TextProcessor.replaceText(editor, selection, enhancedText);
          break;
        
        case 'insertBelow':
          await TextProcessor.insertBelow(editor, selection, enhancedText);
          break;
        
        case 'insertAbove':
          await TextProcessor.insertAbove(editor, selection, enhancedText);
          break;
        
        case 'copyToClipboard':
          await TextProcessor.copyToClipboard(enhancedText);
          break;
        
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      ErrorHandler.logInfo(`Applied enhanced text using action: ${action}`, 'TextProcessor');
    } catch (error) {
      ErrorHandler.logError(error, 'TextProcessor');
      throw error;
    }
  }

  private static async replaceText(
    editor: vscode.TextEditor,
    selection: vscode.Selection,
    newText: string
  ): Promise<void> {
    await editor.edit(editBuilder => {
      editBuilder.replace(selection, newText);
    });

    // Update selection to the new text
    const newSelection = new vscode.Selection(
      selection.start,
      selection.start.translate(0, newText.length)
    );
    editor.selection = newSelection;
  }

  private static async insertBelow(
    editor: vscode.TextEditor,
    selection: vscode.Selection,
    newText: string
  ): Promise<void> {
    const endLine = selection.end.line;
    const endLineText = editor.document.lineAt(endLine).text;
    const insertPosition = new vscode.Position(endLine, endLineText.length);

    await editor.edit(editBuilder => {
      editBuilder.insert(insertPosition, `\n\n${newText}`);
    });

    // Move cursor to the inserted text
    const newPosition = insertPosition.translate(2, 0);
    editor.selection = new vscode.Selection(newPosition, newPosition.translate(0, newText.length));
  }

  private static async insertAbove(
    editor: vscode.TextEditor,
    selection: vscode.Selection,
    newText: string
  ): Promise<void> {
    const startLine = selection.start.line;
    const insertPosition = new vscode.Position(startLine, 0);

    await editor.edit(editBuilder => {
      editBuilder.insert(insertPosition, `${newText}\n\n`);
    });

    // Move cursor to the inserted text
    editor.selection = new vscode.Selection(insertPosition, insertPosition.translate(0, newText.length));
  }

  private static async copyToClipboard(text: string): Promise<void> {
    await vscode.env.clipboard.writeText(text);
    vscode.window.showInformationMessage('Enhanced prompt copied to clipboard!');
  }

  static getContextInfo(context: EnhancementContext): string {
    const { document, selection } = context;
    
    if (context.isClipboardBased || !document || !selection) {
      const charCount = context.selectedText.length;
      return `Clipboard text, Characters: ${charCount}`;
    }
    
    const fileType = document.languageId;
    const lineCount = selection.end.line - selection.start.line + 1;
    const charCount = context.selectedText.length;

    return `File: ${fileType}, Lines: ${lineCount}, Characters: ${charCount}`;
  }

  static sanitizeText(text: string): string {
    // Remove excessive whitespace and normalize line endings
    return text
      .replace(/\r\n/g, '\n')  // Normalize line endings
      .replace(/\n{3,}/g, '\n\n')  // Limit consecutive newlines
      .replace(/[ \t]+/g, ' ')  // Normalize spaces and tabs
      .trim();
  }

  static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }

    return text.substring(0, maxLength - 3) + '...';
  }

  static getPreviewText(text: string, maxLength: number = 100): string {
    const sanitized = TextProcessor.sanitizeText(text);
    return TextProcessor.truncateText(sanitized, maxLength);
  }
}