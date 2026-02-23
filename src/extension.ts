import * as vscode from 'vscode';
import * as path from 'path';
import { OpenAIClient } from './services/openaiClient';
import { SettingsManager } from './config/settings';
import { EnhancePromptCommand } from './commands/enhancePrompt';
import { TemplateManagerCommand } from './commands/templateManager';
import { TemplateRegistry } from './templates/templateRegistry';
import { ErrorHandler } from './utils/errorHandler';
import { PromptHistoryService } from './services/promptHistory';
import { SavePromptService } from './services/savePromptService';
import { QuickPickManager } from './ui/quickPick';

let openaiClient: OpenAIClient;
let settingsManager: SettingsManager;
let enhancePromptCommand: EnhancePromptCommand;
let templateManagerCommand: TemplateManagerCommand;
let templateRegistry: TemplateRegistry;
let promptHistoryService: PromptHistoryService;
let savePromptService: SavePromptService;

export async function activate(context: vscode.ExtensionContext) {
  ErrorHandler.logInfo('Prompt Enhancer extension is being activated', 'Extension');

  try {
    // Get settings and initialize debug mode
    const config = vscode.workspace.getConfiguration('promptEnhancer');
    const debugMode = config.get('debugMode', false);
    ErrorHandler.initialize(debugMode);

    if (debugMode) {
      ErrorHandler.logInfo('Debug mode enabled', 'Extension');
    }

    // Initialize template registry first
    templateRegistry = new TemplateRegistry(context);
    await templateRegistry.initialize();

    // Initialize core services with template registry
    openaiClient = new OpenAIClient(templateRegistry);
    settingsManager = new SettingsManager(context);
    promptHistoryService = new PromptHistoryService(context);
    savePromptService = new SavePromptService(context);
    await promptHistoryService.initialize();
    
    enhancePromptCommand = new EnhancePromptCommand(
      openaiClient,
      settingsManager,
      templateRegistry,
      promptHistoryService
    );
    templateManagerCommand = new TemplateManagerCommand(templateRegistry);

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

    // Register template management command
    const manageTemplatesCommand = vscode.commands.registerCommand(
      'promptEnhancer.manageTemplates',
      async () => {
        try {
          await templateManagerCommand.execute();
        } catch (error) {
          ErrorHandler.logError(error, 'Extension.manageTemplatesCommand');
          const errorInfo = ErrorHandler.parseError(error);
          await ErrorHandler.showError(errorInfo);
        }
      }
    );

    // Register settings change listener
    const settingsChangeListener = settingsManager.onSettingsChanged(() => {
      ErrorHandler.logInfo('Settings changed, updating OpenAI client configuration', 'Extension');

      const settings = settingsManager.getSettings();
      
      // Update debug mode
      ErrorHandler.setDebugMode(settings.debugMode);
      
      // Update history service settings
      promptHistoryService.updateSettings();

      if (openaiClient.isInitialized()) {
        openaiClient.updateConfig({
          model: settings.model as any,
          maxTokens: settings.maxTokens,
          temperature: settings.temperature,
          timeout: settings.timeout
        });
      }
    });

    // Register view history command
    const viewHistoryCommand = vscode.commands.registerCommand(
      'promptEnhancer.viewHistory',
      async () => {
        try {
          await showPromptHistory(context);
        } catch (error) {
          ErrorHandler.logError(error, 'Extension.viewHistoryCommand');
          vscode.window.showErrorMessage('Failed to view enhancement history');
        }
      }
    );

    // Register toggle debug mode command
    const toggleDebugModeCommand = vscode.commands.registerCommand(
      'promptEnhancer.toggleDebugMode',
      () => {
        const config = vscode.workspace.getConfiguration('promptEnhancer');
        const currentMode = config.get('debugMode', false);
        config.update('debugMode', !currentMode, vscode.ConfigurationTarget.Global);
        ErrorHandler.setDebugMode(!currentMode);
        vscode.window.showInformationMessage(`Debug mode ${!currentMode ? 'enabled' : 'disabled'}`);
        if (!currentMode) {
          ErrorHandler.showOutputChannel();
        }
      }
    );

    // Register clear history command
    const clearHistoryCommand = vscode.commands.registerCommand(
      'promptEnhancer.clearHistory',
      async () => {
        const confirm = await vscode.window.showWarningMessage(
          'Are you sure you want to clear all enhancement history?',
          { modal: true },
          'Clear',
          'Cancel'
        );
        
        if (confirm === 'Clear') {
          await promptHistoryService.clearHistory();
          vscode.window.showInformationMessage('Enhancement history cleared');
        }
      }
    );

    // Register select model command
    const selectModelCommand = vscode.commands.registerCommand(
      'promptEnhancer.selectModel',
      async () => {
        try {
          const settings = settingsManager.getSettings();
          const newModel = await QuickPickManager.showModelSelector(
            openaiClient,
            settingsManager,
            settings.model
          );
          
          if (newModel) {
            await settingsManager.updateSetting('model', newModel);
            vscode.window.showInformationMessage(`Model changed to: ${newModel}`);
          }
        } catch (error) {
          ErrorHandler.logError(error, 'Extension.selectModelCommand');
          vscode.window.showErrorMessage('Failed to change model');
        }
      }
    );

    // Register save prompt command
    const savePromptCommand = vscode.commands.registerCommand(
      'promptEnhancer.savePrompt',
      async () => {
        try {
          await handleSavePrompt(context, savePromptService);
        } catch (error) {
          ErrorHandler.logError(error, 'Extension.savePromptCommand');
          vscode.window.showErrorMessage('Failed to save prompt');
        }
      }
    );

    // Register enhance from editor command (uses full editor text)
    const enhanceFromEditorCommand = vscode.commands.registerCommand(
      'promptEnhancer.enhanceFromEditor',
      async () => {
        try {
          await enhancePromptCommand.execute(true); // true = use full editor text
        } catch (error) {
          ErrorHandler.logError(error, 'Extension.enhanceFromEditorCommand');
          const errorInfo = ErrorHandler.parseError(error);
          await ErrorHandler.showError(errorInfo);
        }
      }
    );

    // Add all disposables to context
    context.subscriptions.push(
      enhanceCommand,
      configureApiKeyCommand,
      manageTemplatesCommand,
      viewHistoryCommand,
      toggleDebugModeCommand,
      clearHistoryCommand,
      selectModelCommand,
      savePromptCommand,
      enhanceFromEditorCommand,
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

async function showPromptHistory(_context: vscode.ExtensionContext) {
  const stats = await promptHistoryService.getStatistics();
  const history = await promptHistoryService.getRecent(50);

  if (history.length === 0) {
    vscode.window.showInformationMessage(
      'No enhancement history yet. Your enhanced prompts will appear here.'
    );
    return;
  }

  const items = history.map(entry => ({
    label: `$(history) ${entry.template}`,
    description: new Date(entry.timestamp).toLocaleString(),
    detail: `${entry.model} • ${entry.tokensUsed} tokens • ${Math.round(entry.processingTime)}ms`,
    entry
  })) as (vscode.QuickPickItem & { entry?: any; action?: string })[];

  // Add action items at the top
  items.unshift(
    {
      label: '$(info) View Statistics',
      description: `Total: ${stats.total} • Today: ${stats.today} • This Week: ${stats.thisWeek}`,
      detail: 'View enhancement statistics',
      action: 'stats'
    },
    {
      label: '$(export) Export History',
      description: 'Export history to JSON file',
      detail: 'Save your enhancement history',
      action: 'export'
    },
    {
      label: '',
      description: '',
      kind: vscode.QuickPickItemKind.Separator
    }
  );

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: `Enhancement History (${stats.total} entries)`,
    ignoreFocusOut: true,
    matchOnDescription: true,
    matchOnDetail: true
  });

  if (!selected) {
    return;
  }

  // Handle action items
  if ('action' in selected) {
    if (selected.action === 'stats') {
      const statsMessage = `Enhancement Statistics:\n\n` +
        `Total Enhancements: ${stats.total}\n` +
        `Today: ${stats.today}\n` +
        `This Week: ${stats.thisWeek}\n` +
        `Total Tokens Used: ${stats.totalTokens}\n` +
        `Avg Processing Time: ${Math.round(stats.avgProcessingTime)}ms`;
      
      vscode.window.showInformationMessage(statsMessage);
      return;
    }
    
    if (selected.action === 'export') {
      const jsonContent = await promptHistoryService.exportHistory();
      const doc = await vscode.workspace.openTextDocument({
        content: jsonContent,
        language: 'json'
      });
      await vscode.window.showTextDocument(doc);
      return;
    }
  }

  // Show entry details
  const entryItem = selected as vscode.QuickPickItem & { entry?: any };
  if (entryItem.entry) {
    const entry = entryItem.entry;
    const actions = ['View Details', 'Copy Enhanced', 'Delete', 'Cancel'];
    
    const action = await vscode.window.showQuickPick(actions, {
      placeHolder: `Actions for enhancement from ${new Date(entry.timestamp).toLocaleString()}`
    });

    switch (action) {
      case 'View Details':
        const detailDoc = await vscode.workspace.openTextDocument({
          content: `=== Enhancement Details ===\n\n` +
            `Timestamp: ${new Date(entry.timestamp).toLocaleString()}\n` +
            `Model: ${entry.model}\n` +
            `Template: ${entry.template}\n` +
            `Tokens: ${entry.tokensUsed}\n` +
            `Processing Time: ${Math.round(entry.processingTime)}ms\n\n` +
            `=== Original Prompt ===\n\n${entry.originalText}\n\n` +
            `=== Enhanced Prompt ===\n\n${entry.enhancedText}`,
          language: 'markdown'
        });
        await vscode.window.showTextDocument(detailDoc);
        break;

      case 'Copy Enhanced':
        await vscode.env.clipboard.writeText(entry.enhancedText);
        vscode.window.showInformationMessage('Enhanced prompt copied to clipboard');
        break;

      case 'Delete':
        const confirm = await vscode.window.showWarningMessage(
          'Delete this enhancement from history?',
          'Delete',
          'Cancel'
        );
        if (confirm === 'Delete') {
          await promptHistoryService.deleteEntry(entry.id);
          vscode.window.showInformationMessage('Enhancement deleted from history');
        }
        break;
    }
  }
}

async function handleSavePrompt(
  _context: vscode.ExtensionContext,
  savePromptService: SavePromptService
): Promise<void> {
  // Get text from selection or entire editor
  const editor = vscode.window.activeTextEditor;
  let textToSave = '';
  
  if (editor && !editor.selection.isEmpty) {
    textToSave = editor.document.getText(editor.selection);
  } else if (editor) {
    textToSave = editor.document.getText();
  }
  
  if (!textToSave || textToSave.trim().length === 0) {
    vscode.window.showWarningMessage('No text available to save');
    return;
  }
  
  // Check if this is an enhanced prompt (from history) or original
  const recentHistory = await promptHistoryService.getRecent(1);
  const lastEnhancement = recentHistory.length > 0 ? recentHistory[0] : null;
  
  // Ask user what to save
  const saveOptions = [
    {
      label: '$(symbol-text) Save Original Text',
      description: 'Save the selected/original prompt text',
      type: 'original'
    },
    {
      label: '$(spark) Save Enhanced Text',
      description: lastEnhancement 
        ? 'Save the last enhanced prompt' 
        : 'No enhanced text available',
      type: 'enhanced',
      enabled: !!lastEnhancement
    },
    {
      label: '$(file-code) Save Both (Side by Side)',
      description: 'Save both original and enhanced in markdown format',
      type: 'both',
      enabled: !!lastEnhancement
    }
  ];
  
  const selectedOption = await vscode.window.showQuickPick(
    saveOptions.filter(o => o.enabled !== false),
    {
      placeHolder: 'What would you like to save?',
      ignoreFocusOut: true
    }
  );
  
  if (!selectedOption) {
    return;
  }
  
  let contentToSave = '';
  let enhancedText = '';
  let model = '';
  let template = '';
  
  if (selectedOption.type === 'original') {
    contentToSave = textToSave;
    enhancedText = '';
    model = 'N/A';
    template = 'N/A';
  } else if (lastEnhancement) {
    contentToSave = selectedOption.type === 'enhanced' 
      ? lastEnhancement.enhancedText 
      : textToSave;
    enhancedText = selectedOption.type === 'both' ? lastEnhancement.enhancedText : '';
    model = lastEnhancement.model;
    template = lastEnhancement.template;
  }
  
  // Save the prompt
  const filePath = await savePromptService.savePrompt(
    contentToSave,
    enhancedText,
    model,
    template
  );
  
  if (filePath) {
    const action = await vscode.window.showInformationMessage(
      `Prompt saved to: ${path.basename(filePath)}`,
      'Open File',
      'Show in Explorer',
      'Dismiss'
    );
    
    if (action === 'Open File') {
      await savePromptService.openSavedPrompt(filePath);
    } else if (action === 'Show in Explorer') {
      await vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(filePath));
    }
  }
}

// Export for testing
export { openaiClient, settingsManager, enhancePromptCommand, templateRegistry, templateManagerCommand };