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
    constructor(openaiClient, settingsManager) {
        this.openaiClient = openaiClient;
        this.settingsManager = settingsManager;
    }
    async execute() {
        try {
            // Get active editor
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor found. Please open a file and select some text.');
                return;
            }
            // Create enhancement context
            const context = textProcessor_1.TextProcessor.createEnhancementContext(editor);
            if (!context) {
                return; // Error already shown in createEnhancementContext
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
            const selectedTemplate = await quickPick_1.QuickPickManager.showTemplateSelector(settings.defaultTemplate);
            if (!selectedTemplate) {
                return; // User cancelled template selection
            }
            // Enhance the prompt
            const enhancedText = await this.enhancePromptWithRetry(context, selectedTemplate);
            if (!enhancedText) {
                return; // Enhancement failed or was cancelled
            }
            // Show output action selector
            const outputAction = await quickPick_1.QuickPickManager.showOutputActionSelector();
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
                const enhancedText = await loadingIndicator_1.LoadingIndicator.show('Enhancing Prompt', async (progress) => {
                    progress({ message: 'Connecting to OpenAI...' });
                    const request = {
                        originalText: context.selectedText,
                        template,
                        context: textProcessor_1.TextProcessor.getContextInfo(context)
                    };
                    progress({ message: 'Processing your prompt...', increment: 30 });
                    const result = await this.openaiClient.enhancePrompt(request);
                    progress({ message: 'Enhancement complete!', increment: 70 });
                    return result.enhancedText;
                });
                return enhancedText;
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
                const newModel = await quickPick_1.QuickPickManager.showModelSelector(settings.model);
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