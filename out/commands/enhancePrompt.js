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
exports.EnhancePromptCommand = void 0;
const vscode = __importStar(require("vscode"));
const textProcessor_1 = require("../utils/textProcessor");
const quickPick_1 = require("../ui/quickPick");
const loadingIndicator_1 = require("../ui/loadingIndicator");
const errorHandler_1 = require("../utils/errorHandler");
class EnhancePromptCommand {
    constructor(openaiClient, settingsManager, templateRegistry, promptHistoryService) {
        this.openaiClient = openaiClient;
        this.settingsManager = settingsManager;
        this.templateRegistry = templateRegistry;
        this.promptHistoryService = promptHistoryService;
    }
    /**
     * Execute the enhancement command
     * @param useFullEditorText If true, use entire editor text instead of selection
     */
    async execute(useFullEditorText = false) {
        try {
            let textToEnhance = '';
            let context = null;
            // Try to get text from active editor first
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                // If useFullEditorText is true, use entire document
                if (useFullEditorText) {
                    textToEnhance = editor.document.getText();
                    context = textProcessor_1.TextProcessor.createFullEditorContext(editor);
                }
                // Otherwise use selection if available
                else if (!editor.selection.isEmpty) {
                    context = textProcessor_1.TextProcessor.createEnhancementContext(editor);
                    if (context) {
                        textToEnhance = context.selectedText;
                    }
                }
            }
            // If no text from editor, use clipboard approach
            if (!textToEnhance) {
                try {
                    // Execute copy command to get selected text into clipboard
                    await vscode.commands.executeCommand('editor.action.clipboardCopyAction');
                    // Small delay to ensure clipboard is populated
                    await new Promise(resolve => setTimeout(resolve, 150));
                    // Read from clipboard
                    const clipboardText = await vscode.env.clipboard.readText();
                    if (!clipboardText || clipboardText.trim().length === 0) {
                        vscode.window.showWarningMessage('No text selected. Please select text first, then try again.', 'Learn More').then(action => {
                            if (action === 'Learn More') {
                                vscode.window.showInformationMessage('How to use: 1) Select any text in any editor/webview/terminal, 2) Press Ctrl+Shift+E (Cmd+Shift+E on Mac)');
                            }
                        });
                        return;
                    }
                    textToEnhance = clipboardText;
                    // Create a clipboard-based context
                    try {
                        context = textProcessor_1.TextProcessor.createClipboardContext(textToEnhance);
                    }
                    catch (validationError) {
                        vscode.window.showWarningMessage(validationError.message || 'Invalid clipboard text. Please select valid text and try again.', 'Learn More').then(action => {
                            if (action === 'Learn More') {
                                vscode.window.showInformationMessage('Text requirements: 3-10,000 characters, non-empty content');
                            }
                        });
                        return;
                    }
                }
                catch (copyError) {
                    vscode.window.showErrorMessage('Failed to copy text. Please select text manually and try again.');
                    return;
                }
            }
            if (!context) {
                vscode.window.showErrorMessage('Unable to get text for enhancement. Please select text and try again.');
                return;
            }
            // Ensure API key exists
            const apiKey = await this.settingsManager.ensureApiKeyExists();
            if (!apiKey) {
                return; // User cancelled API key setup
            }
            // Initialize OpenAI client if needed
            if (!this.openaiClient.isInitialized()) {
                await this.openaiClient.initialize(apiKey);
            }
            // Show template selector
            const settings = this.settingsManager.getSettings();
            const selectedTemplate = await quickPick_1.QuickPickManager.showTemplateSelector(this.templateRegistry, settings.defaultTemplate);
            if (!selectedTemplate) {
                return; // User cancelled template selection
            }
            // Enhance the prompt
            const result = await this.enhancePromptWithRetry(context, selectedTemplate);
            if (!result) {
                return; // Enhancement failed or was cancelled
            }
            const enhancedText = typeof result === 'string' ? result : result.enhancedText;
            const resultData = typeof result === 'string' ? null : result;
            // Record to history if enabled
            if (resultData && this.promptHistoryService.isEnabled()) {
                await this.promptHistoryService.addEntry({
                    originalText: context.selectedText,
                    enhancedText: enhancedText,
                    model: resultData.model,
                    template: selectedTemplate,
                    tokensUsed: resultData.tokensUsed,
                    processingTime: resultData.processingTime
                });
            }
            // Show output action selector based on context type
            const outputAction = context.isClipboardBased
                ? await quickPick_1.QuickPickManager.showClipboardOutputActionSelector()
                : await quickPick_1.QuickPickManager.showOutputActionSelector();
            if (!outputAction) {
                return; // User cancelled output action selection
            }
            // Apply the enhanced text
            await textProcessor_1.TextProcessor.applyEnhancedText(context, enhancedText, outputAction);
            // Show success message
            const contextInfo = textProcessor_1.TextProcessor.getContextInfo(context);
            const previewText = textProcessor_1.TextProcessor.getPreviewText(enhancedText, 50);
            vscode.window.showInformationMessage(`Prompt enhanced successfully! ${contextInfo} - "${previewText}"`);
        }
        catch (error) {
            errorHandler_1.ErrorHandler.logError(error, 'EnhancePromptCommand');
            const errorInfo = errorHandler_1.ErrorHandler.parseError(error);
            await errorHandler_1.ErrorHandler.showError(errorInfo);
        }
    }
    async enhancePromptWithRetry(context, template, maxRetries = 3) {
        let attempt = 0;
        while (attempt < maxRetries) {
            try {
                const result = await loadingIndicator_1.LoadingIndicator.show('Enhancing Prompt', async (progress) => {
                    progress({ message: 'Connecting to OpenAI...' });
                    const request = {
                        originalText: context.selectedText,
                        template,
                        context: textProcessor_1.TextProcessor.getContextInfo(context)
                    };
                    progress({ message: 'Processing your prompt...', increment: 30 });
                    const result = await this.openaiClient.enhancePrompt(request);
                    progress({ message: 'Enhancement complete!', increment: 70 });
                    return result;
                });
                return result;
            }
            catch (error) {
                attempt++;
                errorHandler_1.ErrorHandler.logError(error, `EnhancePromptCommand (attempt ${attempt})`);
                const errorInfo = errorHandler_1.ErrorHandler.parseError(error);
                // Don't retry for certain error types
                if (!errorInfo.canRetry || attempt >= maxRetries) {
                    const action = await errorHandler_1.ErrorHandler.showError(errorInfo);
                    if (action === 'Configure API Key') {
                        const newApiKey = await this.settingsManager.promptForApiKey();
                        if (newApiKey) {
                            await this.openaiClient.initialize(newApiKey);
                            // Reset attempt counter for new API key
                            attempt = 0;
                            continue;
                        }
                    }
                    return null;
                }
                // Show retry dialog
                const retryAction = await quickPick_1.QuickPickManager.showRetryOptions();
                switch (retryAction) {
                    case 'Retry':
                        continue; // Try again
                    case 'Change':
                        await this.showSettingsQuickPick();
                        continue; // Try again with new settings
                    case 'Configure':
                        const newApiKey = await this.settingsManager.promptForApiKey();
                        if (newApiKey) {
                            await this.openaiClient.initialize(newApiKey);
                            attempt = 0; // Reset attempts
                            continue;
                        }
                        return null;
                    default:
                        return null; // Cancel
                }
            }
        }
        return null;
    }
    async showSettingsQuickPick() {
        const items = [
            {
                label: '$(gear) Change Model',
                description: 'Switch between GPT models'
            },
            {
                label: '$(clock) Adjust Timeout',
                description: 'Modify request timeout settings'
            },
            {
                label: '$(symbol-parameter) Temperature',
                description: 'Adjust creativity level'
            },
            {
                label: '$(symbol-numeric) Max Tokens',
                description: 'Change maximum response length'
            }
        ];
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'What would you like to change?',
            ignoreFocusOut: true
        });
        if (!selected) {
            return;
        }
        const settings = this.settingsManager.getSettings();
        switch (selected.label.split(' ')[1]) {
            case 'Model':
                const newModel = await quickPick_1.QuickPickManager.showModelSelector(this.openaiClient, this.settingsManager, settings.model);
                if (newModel) {
                    await this.settingsManager.updateSetting('model', newModel);
                    this.openaiClient.updateConfig({ model: newModel });
                }
                break;
            case 'Timeout':
                const timeoutInput = await vscode.window.showInputBox({
                    prompt: 'Enter timeout in seconds (5-120)',
                    value: (settings.timeout / 1000).toString(),
                    validateInput: (value) => {
                        const num = parseInt(value);
                        if (isNaN(num) || num < 5 || num > 120) {
                            return 'Please enter a number between 5 and 120';
                        }
                        return null;
                    }
                });
                if (timeoutInput) {
                    const newTimeout = parseInt(timeoutInput) * 1000;
                    await this.settingsManager.updateSetting('timeout', newTimeout);
                    this.openaiClient.updateConfig({ timeout: newTimeout });
                }
                break;
            case 'Temperature':
                const tempInput = await vscode.window.showInputBox({
                    prompt: 'Enter temperature (0.0-2.0, higher = more creative)',
                    value: settings.temperature.toString(),
                    validateInput: (value) => {
                        const num = parseFloat(value);
                        if (isNaN(num) || num < 0 || num > 2) {
                            return 'Please enter a number between 0.0 and 2.0';
                        }
                        return null;
                    }
                });
                if (tempInput) {
                    const newTemp = parseFloat(tempInput);
                    await this.settingsManager.updateSetting('temperature', newTemp);
                    this.openaiClient.updateConfig({ temperature: newTemp });
                }
                break;
            case 'Tokens':
                const tokensInput = await vscode.window.showInputBox({
                    prompt: 'Enter max tokens (100-4000)',
                    value: settings.maxTokens.toString(),
                    validateInput: (value) => {
                        const num = parseInt(value);
                        if (isNaN(num) || num < 100 || num > 4000) {
                            return 'Please enter a number between 100 and 4000';
                        }
                        return null;
                    }
                });
                if (tokensInput) {
                    const newTokens = parseInt(tokensInput);
                    await this.settingsManager.updateSetting('maxTokens', newTokens);
                    this.openaiClient.updateConfig({ maxTokens: newTokens });
                }
                break;
        }
    }
}
exports.EnhancePromptCommand = EnhancePromptCommand;
//# sourceMappingURL=enhancePrompt.js.map