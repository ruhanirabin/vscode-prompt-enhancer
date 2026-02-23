import * as vscode from 'vscode';
import { OpenAIClient } from '../services/openaiClient';
import { SettingsManager } from '../config/settings';
import { TemplateRegistry } from '../templates/templateRegistry';
import { TextProcessor } from '../utils/textProcessor';
import { QuickPickManager } from '../ui/quickPick';
import { LoadingIndicator } from '../ui/loadingIndicator';
import { ErrorHandler } from '../utils/errorHandler';
import { EnhancementRequest } from '../types/openai';
import { EnhancementContext } from '../types/extension';

export class EnhancePromptCommand {
  private openaiClient: OpenAIClient;
  private settingsManager: SettingsManager;
  private templateRegistry: TemplateRegistry;

  constructor(openaiClient: OpenAIClient, settingsManager: SettingsManager, templateRegistry: TemplateRegistry) {
    this.openaiClient = openaiClient;
    this.settingsManager = settingsManager;
    this.templateRegistry = templateRegistry;
  }

  async execute(): Promise<void> {
    try {
      let textToEnhance = '';
      let context: EnhancementContext | null = null;

      // Try to get text from active editor first (for better context)
      const editor = vscode.window.activeTextEditor;
      if (editor && !editor.selection.isEmpty) {
        context = TextProcessor.createEnhancementContext(editor);
        if (context) {
          textToEnhance = context.selectedText;
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
            vscode.window.showWarningMessage(
              'No text selected. Please select text first, then try again.',
              'Learn More'
            ).then(action => {
              if (action === 'Learn More') {
                vscode.window.showInformationMessage(
                  'How to use: 1) Select any text in any editor/webview/terminal, 2) Press Ctrl+Shift+E (Cmd+Shift+E on Mac)'
                );
              }
            });
            return;
          }
          
          textToEnhance = clipboardText;
          
          // Create a clipboard-based context
          try {
            context = TextProcessor.createClipboardContext(textToEnhance);
          } catch (validationError: any) {
            vscode.window.showWarningMessage(
              validationError.message || 'Invalid clipboard text. Please select valid text and try again.',
              'Learn More'
            ).then(action => {
              if (action === 'Learn More') {
                vscode.window.showInformationMessage(
                  'Text requirements: 3-10,000 characters, non-empty content'
                );
              }
            });
            return;
          }
          
        } catch (copyError) {
          vscode.window.showErrorMessage(
            'Failed to copy text. Please select text manually and try again.'
          );
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
      const selectedTemplate = await QuickPickManager.showTemplateSelector(this.templateRegistry, settings.defaultTemplate);
      if (!selectedTemplate) {
        return; // User cancelled template selection
      }

      // Enhance the prompt
      const enhancedText = await this.enhancePromptWithRetry(context, selectedTemplate);
      if (!enhancedText) {
        return; // Enhancement failed or was cancelled
      }

      // Show output action selector based on context type
      const outputAction = context.isClipboardBased
        ? await QuickPickManager.showClipboardOutputActionSelector()
        : await QuickPickManager.showOutputActionSelector();
      
      if (!outputAction) {
        return; // User cancelled output action selection
      }

      // Apply the enhanced text
      await TextProcessor.applyEnhancedText(context, enhancedText, outputAction);

      // Show success message
      const contextInfo = TextProcessor.getContextInfo(context);
      const previewText = TextProcessor.getPreviewText(enhancedText, 50);
      vscode.window.showInformationMessage(
        `Prompt enhanced successfully! ${contextInfo} - "${previewText}"`
      );

    } catch (error) {
      ErrorHandler.logError(error, 'EnhancePromptCommand');
      const errorInfo = ErrorHandler.parseError(error);
      await ErrorHandler.showError(errorInfo);
    }
  }

  private async enhancePromptWithRetry(
    context: EnhancementContext,
    template: any,
    maxRetries: number = 3
  ): Promise<string | null> {
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const enhancedText = await LoadingIndicator.show(
          'Enhancing Prompt',
          async (progress) => {
            progress({ message: 'Connecting to OpenAI...' });

            const request: EnhancementRequest = {
              originalText: context.selectedText,
              template,
              context: TextProcessor.getContextInfo(context)
            };

            progress({ message: 'Processing your prompt...', increment: 30 });

            const result = await this.openaiClient.enhancePrompt(request);

            progress({ message: 'Enhancement complete!', increment: 70 });

            return result.enhancedText;
          }
        );

        return enhancedText;

      } catch (error) {
        attempt++;
        ErrorHandler.logError(error, `EnhancePromptCommand (attempt ${attempt})`);

        const errorInfo = ErrorHandler.parseError(error);

        // Don't retry for certain error types
        if (!errorInfo.canRetry || attempt >= maxRetries) {
          const action = await ErrorHandler.showError(errorInfo);
          
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
        const retryAction = await QuickPickManager.showRetryOptions();
        
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

  private async showSettingsQuickPick(): Promise<void> {
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
        const newModel = await QuickPickManager.showModelSelector(
          this.openaiClient,
          this.settingsManager,
          settings.model
        );
        if (newModel) {
          await this.settingsManager.updateSetting('model', newModel);
          this.openaiClient.updateConfig({ model: newModel as any });
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