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
exports.TextProcessor = void 0;
const vscode = __importStar(require("vscode"));
const errorHandler_1 = require("./errorHandler");
class TextProcessor {
    static validateSelection(editor) {
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
    static createEnhancementContext(editor) {
        const validationError = TextProcessor.validateSelection(editor);
        if (validationError) {
            errorHandler_1.ErrorHandler.showError({
                type: 'INVALID_REQUEST',
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
    /**
     * Create context using entire editor document text
     */
    static createFullEditorContext(editor) {
        const fullText = editor.document.getText();
        const trimmedText = fullText.trim();
        if (trimmedText.length === 0) {
            errorHandler_1.ErrorHandler.showError({
                type: 'INVALID_REQUEST',
                message: 'Editor is empty. Please enter some text to enhance.',
                canRetry: false
            });
            return null;
        }
        if (trimmedText.length > 10000) {
            errorHandler_1.ErrorHandler.showError({
                type: 'INVALID_REQUEST',
                message: 'Editor content is too long. Please select less than 10,000 characters.',
                canRetry: false
            });
            return null;
        }
        // Create a selection that covers the entire document for consistency
        const fullSelection = new vscode.Selection(new vscode.Position(0, 0), editor.document.positionAt(fullText.length));
        return {
            editor,
            selection: fullSelection,
            selectedText: trimmedText,
            document: editor.document,
            isClipboardBased: false
        };
    }
    static createClipboardContext(text) {
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
    static async applyEnhancedText(context, enhancedText, action) {
        const { editor, selection } = context;
        try {
            // For clipboard-based contexts, only clipboard action is available
            if (context.isClipboardBased || !editor || !selection) {
                if (action !== 'copyToClipboard') {
                    // Force clipboard action for clipboard-based contexts
                    await TextProcessor.copyToClipboard(enhancedText);
                    vscode.window.showInformationMessage('Enhanced text copied to clipboard (editor actions not available for clipboard-based enhancement)');
                }
                else {
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
            errorHandler_1.ErrorHandler.logInfo(`Applied enhanced text using action: ${action}`, 'TextProcessor');
        }
        catch (error) {
            errorHandler_1.ErrorHandler.logError(error, 'TextProcessor');
            throw error;
        }
    }
    static async replaceText(editor, selection, newText) {
        await editor.edit(editBuilder => {
            editBuilder.replace(selection, newText);
        });
        // Update selection to the new text
        const newSelection = new vscode.Selection(selection.start, selection.start.translate(0, newText.length));
        editor.selection = newSelection;
    }
    static async insertBelow(editor, selection, newText) {
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
    static async insertAbove(editor, selection, newText) {
        const startLine = selection.start.line;
        const insertPosition = new vscode.Position(startLine, 0);
        await editor.edit(editBuilder => {
            editBuilder.insert(insertPosition, `${newText}\n\n`);
        });
        // Move cursor to the inserted text
        editor.selection = new vscode.Selection(insertPosition, insertPosition.translate(0, newText.length));
    }
    static async copyToClipboard(text) {
        await vscode.env.clipboard.writeText(text);
        vscode.window.showInformationMessage('Enhanced prompt copied to clipboard!');
    }
    static getContextInfo(context) {
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
    static sanitizeText(text) {
        // Remove excessive whitespace and normalize line endings
        return text
            .replace(/\r\n/g, '\n') // Normalize line endings
            .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
            .replace(/[ \t]+/g, ' ') // Normalize spaces and tabs
            .trim();
    }
    static truncateText(text, maxLength) {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength - 3) + '...';
    }
    static getPreviewText(text, maxLength = 100) {
        const sanitized = TextProcessor.sanitizeText(text);
        return TextProcessor.truncateText(sanitized, maxLength);
    }
}
exports.TextProcessor = TextProcessor;
//# sourceMappingURL=textProcessor.js.map