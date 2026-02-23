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
exports.templateManagerCommand = exports.templateRegistry = exports.enhancePromptCommand = exports.settingsManager = exports.openaiClient = void 0;
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const openaiClient_1 = require("./services/openaiClient");
const settings_1 = require("./config/settings");
const enhancePrompt_1 = require("./commands/enhancePrompt");
const templateManager_1 = require("./commands/templateManager");
const templateRegistry_1 = require("./templates/templateRegistry");
const errorHandler_1 = require("./utils/errorHandler");
let openaiClient;
let settingsManager;
let enhancePromptCommand;
let templateManagerCommand;
let templateRegistry;
async function activate(context) {
    errorHandler_1.ErrorHandler.logInfo('Prompt Enhancer extension is being activated', 'Extension');
    try {
        // Initialize template registry first
        exports.templateRegistry = templateRegistry = new templateRegistry_1.TemplateRegistry(context);
        await templateRegistry.initialize();
        // Initialize core services with template registry
        exports.openaiClient = openaiClient = new openaiClient_1.OpenAIClient(templateRegistry);
        exports.settingsManager = settingsManager = new settings_1.SettingsManager(context);
        exports.enhancePromptCommand = enhancePromptCommand = new enhancePrompt_1.EnhancePromptCommand(openaiClient, settingsManager, templateRegistry);
        exports.templateManagerCommand = templateManagerCommand = new templateManager_1.TemplateManagerCommand(templateRegistry);
        // Initialize API key status asynchronously
        initializeApiKeyStatus();
        // Register main enhancement command
        const enhanceCommand = vscode.commands.registerCommand('promptEnhancer.enhance', async () => {
            try {
                await enhancePromptCommand.execute();
            }
            catch (error) {
                errorHandler_1.ErrorHandler.logError(error, 'Extension.enhanceCommand');
                const errorInfo = errorHandler_1.ErrorHandler.parseError(error);
                await errorHandler_1.ErrorHandler.showError(errorInfo);
            }
        });
        // Register API key configuration command
        const configureApiKeyCommand = vscode.commands.registerCommand('promptEnhancer.configureApiKey', async () => {
            try {
                const apiKey = await settingsManager.promptForApiKey();
                if (apiKey) {
                    await openaiClient.initialize(apiKey);
                    vscode.window.showInformationMessage('OpenAI API key configured successfully!');
                }
            }
            catch (error) {
                errorHandler_1.ErrorHandler.logError(error, 'Extension.configureApiKeyCommand');
                vscode.window.showErrorMessage('Failed to configure API key. Please try again.');
            }
        });
        // Register template management command
        const manageTemplatesCommand = vscode.commands.registerCommand('promptEnhancer.manageTemplates', async () => {
            try {
                await templateManagerCommand.execute();
            }
            catch (error) {
                errorHandler_1.ErrorHandler.logError(error, 'Extension.manageTemplatesCommand');
                const errorInfo = errorHandler_1.ErrorHandler.parseError(error);
                await errorHandler_1.ErrorHandler.showError(errorInfo);
            }
        });
        // Register settings change listener
        const settingsChangeListener = settingsManager.onSettingsChanged(() => {
            errorHandler_1.ErrorHandler.logInfo('Settings changed, updating OpenAI client configuration', 'Extension');
            if (openaiClient.isInitialized()) {
                const settings = settingsManager.getSettings();
                openaiClient.updateConfig({
                    model: settings.model,
                    maxTokens: settings.maxTokens,
                    temperature: settings.temperature,
                    timeout: settings.timeout
                });
            }
        });
        // Add all disposables to context
        context.subscriptions.push(enhanceCommand, configureApiKeyCommand, manageTemplatesCommand, settingsChangeListener);
        // Show welcome message on first activation
        const isFirstActivation = context.globalState.get('promptEnhancer.firstActivation', true);
        if (isFirstActivation) {
            showWelcomeMessage(context);
            context.globalState.update('promptEnhancer.firstActivation', false);
        }
        errorHandler_1.ErrorHandler.logInfo('Prompt Enhancer extension activated successfully', 'Extension');
    }
    catch (error) {
        errorHandler_1.ErrorHandler.logError(error, 'Extension.activate');
        vscode.window.showErrorMessage('Failed to activate Prompt Enhancer extension. Please check the logs.');
    }
}
async function initializeApiKeyStatus() {
    try {
        const existingApiKey = await settingsManager.getApiKey();
        await settingsManager.updateApiKeyStatus(!!existingApiKey);
    }
    catch (error) {
        errorHandler_1.ErrorHandler.logError(error, 'Extension.initializeApiKeyStatus');
    }
}
function deactivate() {
    errorHandler_1.ErrorHandler.logInfo('Prompt Enhancer extension is being deactivated', 'Extension');
    // Clean up resources
    if (openaiClient) {
        // OpenAI client doesn't need explicit cleanup
    }
    if (settingsManager) {
        // Settings manager doesn't need explicit cleanup
    }
    errorHandler_1.ErrorHandler.logInfo('Prompt Enhancer extension deactivated', 'Extension');
}
async function showWelcomeMessage(_context) {
    const action = await vscode.window.showInformationMessage('Welcome to Prompt Enhancer! Transform your basic prompts into sophisticated, detailed prompts using OpenAI\'s API.', 'Configure API Key', 'Learn More', 'Dismiss');
    switch (action) {
        case 'Configure API Key':
            await vscode.commands.executeCommand('promptEnhancer.configureApiKey');
            break;
        case 'Learn More':
            await showQuickStart();
            break;
    }
}
async function showQuickStart() {
    const quickStartItems = [
        {
            label: '$(key) Step 1: Configure API Key',
            description: 'Set up your OpenAI API key',
            detail: 'Required to use the enhancement features'
        },
        {
            label: '$(selection) Step 2: Select Text',
            description: 'Select any text in your editor',
            detail: 'Works with any file type: code, markdown, plain text'
        },
        {
            label: '$(keyboard) Step 3: Use Shortcut',
            description: 'Press Ctrl+Shift+Alt+/ (Cmd+Shift+Alt+/ on Mac)',
            detail: 'Works anywhere - automatically copies selected text and enhances it'
        },
        {
            label: '$(template) Step 4: Choose Template',
            description: 'Select enhancement style',
            detail: 'Built-in templates or your custom templates'
        },
        {
            label: '$(output) Step 5: Apply Result',
            description: 'Choose how to use the enhanced prompt',
            detail: 'Replace, Insert Above/Below, or Copy to Clipboard'
        }
    ];
    const selected = await vscode.window.showQuickPick(quickStartItems, {
        placeHolder: 'Quick Start Guide - How to use Prompt Enhancer',
        ignoreFocusOut: true,
        matchOnDescription: true,
        matchOnDetail: true
    });
    if (selected?.label.includes('Step 1')) {
        await vscode.commands.executeCommand('promptEnhancer.configureApiKey');
    }
}
//# sourceMappingURL=extension.js.map