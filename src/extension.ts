import * as vscode from 'vscode';
import { OpenAIClient } from './services/openaiClient';
import { SettingsManager } from './config/settings';
import { EnhancePromptCommand } from './commands/enhancePrompt';
import { ErrorHandler } from './utils/errorHandler';

let openaiClient: OpenAIClient;
let settingsManager: SettingsManager;
let enhancePromptCommand: EnhancePromptCommand;

export function activate(context: vscode.ExtensionContext) {
  ErrorHandler.logInfo('Prompt Enhancer extension is being activated', 'Extension');

  try {
    // Initialize core services
    openaiClient = new OpenAIClient();
    settingsManager = new SettingsManager(context);
    enhancePromptCommand = new EnhancePromptCommand(openaiClient, settingsManager);

    // Initialize API key status asynchronously
    initializeApiKeyStatus();

    // Register main enhancement command
    const enhanceCommand = vscode.commands.registerCommand(
      'promptEnhancer.enhance',
      async () => {
        try {
          await enhancePromptCommand.execute();
        } catch (error) {
          ErrorHandler.logError(error, 'Extension.enhanceCommand');
          const errorInfo = ErrorHandler.parseError(error);
          await ErrorHandler.showError(errorInfo);
        }
      }
    );

    // Register API key configuration command
    const configureApiKeyCommand = vscode.commands.registerCommand(
      'promptEnhancer.configureApiKey',
      async () => {
        try {
          const apiKey = await settingsManager.promptForApiKey();
          if (apiKey) {
            await openaiClient.initialize(apiKey);
            vscode.window.showInformationMessage('OpenAI API key configured successfully!');
          }
        } catch (error) {
          ErrorHandler.logError(error, 'Extension.configureApiKeyCommand');
          vscode.window.showErrorMessage('Failed to configure API key. Please try again.');
        }
      }
    );

    // Register settings change listener
    const settingsChangeListener = settingsManager.onSettingsChanged(() => {
      ErrorHandler.logInfo('Settings changed, updating OpenAI client configuration', 'Extension');
      
      if (openaiClient.isInitialized()) {
        const settings = settingsManager.getSettings();
        openaiClient.updateConfig({
          model: settings.model as any,
          maxTokens: settings.maxTokens,
          temperature: settings.temperature,
          timeout: settings.timeout
        });
      }
    });

    // Add all disposables to context
    context.subscriptions.push(
      enhanceCommand,
      configureApiKeyCommand,
      settingsChangeListener
    );

    // Show welcome message on first activation
    const isFirstActivation = context.globalState.get('promptEnhancer.firstActivation', true);
    if (isFirstActivation) {
      showWelcomeMessage(context);
      context.globalState.update('promptEnhancer.firstActivation', false);
    }

    ErrorHandler.logInfo('Prompt Enhancer extension activated successfully', 'Extension');

  } catch (error) {
    ErrorHandler.logError(error, 'Extension.activate');
    vscode.window.showErrorMessage('Failed to activate Prompt Enhancer extension. Please check the logs.');
  }
}

async function initializeApiKeyStatus() {
  try {
    const existingApiKey = await settingsManager.getApiKey();
    await settingsManager.updateApiKeyStatus(!!existingApiKey);
  } catch (error) {
    ErrorHandler.logError(error, 'Extension.initializeApiKeyStatus');
  }
}

export function deactivate() {
  ErrorHandler.logInfo('Prompt Enhancer extension is being deactivated', 'Extension');
  
  // Clean up resources
  if (openaiClient) {
    // OpenAI client doesn't need explicit cleanup
  }
  
  if (settingsManager) {
    // Settings manager doesn't need explicit cleanup
  }

  ErrorHandler.logInfo('Prompt Enhancer extension deactivated', 'Extension');
}

async function showWelcomeMessage(_context: vscode.ExtensionContext) {
  const action = await vscode.window.showInformationMessage(
    'Welcome to Prompt Enhancer! Transform your basic prompts into sophisticated, detailed prompts using OpenAI\'s API.',
    'Configure API Key',
    'Learn More',
    'Dismiss'
  );

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
      detail: 'General, Technical, Creative, Comments, or Custom'
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

// Export for testing
export { openaiClient, settingsManager, enhancePromptCommand };