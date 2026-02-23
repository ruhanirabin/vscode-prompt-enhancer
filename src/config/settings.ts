import * as vscode from 'vscode';
import { ExtensionSettings, ApiKeyValidationResult } from '../types/extension';
import { EnhancementTemplate } from '../types/openai';

export class SettingsManager {
  private static readonly API_KEY_SECRET = 'promptEnhancer.apiKey';
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  async getApiKey(): Promise<string | undefined> {
    return await this.context.secrets.get(SettingsManager.API_KEY_SECRET);
  }

  async setApiKey(apiKey: string): Promise<void> {
    await this.context.secrets.store(SettingsManager.API_KEY_SECRET, apiKey);
  }

  async deleteApiKey(): Promise<void> {
    await this.context.secrets.delete(SettingsManager.API_KEY_SECRET);
  }

  getSettings(): ExtensionSettings {
    const config = vscode.workspace.getConfiguration('promptEnhancer');
    return {
      model: config.get('model', 'gpt-4o-mini'),
      timeout: config.get('timeout', 30000),
      defaultTemplate: config.get('defaultTemplate', 'general') as EnhancementTemplate,
      maxTokens: config.get('maxTokens', 1000),
      temperature: config.get('temperature', 0.7),
      customTemplate: config.get('customTemplate', 'Please enhance this prompt to make it more effective and detailed:'),
      debugMode: config.get('debugMode', false),
      enableHistory: config.get('enableHistory', true),
      historyLimit: config.get('historyLimit', 50)
    };
  }

  async updateApiKeyStatus(isConfigured: boolean): Promise<void> {
    const config = vscode.workspace.getConfiguration('promptEnhancer');
    const status = isConfigured ? 'configured' : 'not-configured';
    await config.update('apiKeyStatus', status, vscode.ConfigurationTarget.Global);
  }

  async getApiKeyStatus(): Promise<string> {
    const config = vscode.workspace.getConfiguration('promptEnhancer');
    return config.get('apiKeyStatus', 'not-configured');
  }

  async promptForApiKey(): Promise<string | undefined> {
    const apiKey = await vscode.window.showInputBox({
      prompt: 'Enter your OpenAI API Key',
      password: true,
      ignoreFocusOut: true,
      validateInput: (value: string) => {
        const validation = this.validateApiKey(value);
        return validation.isValid ? null : validation.error;
      }
    });

    if (apiKey) {
      await this.setApiKey(apiKey.trim());
      await this.updateApiKeyStatus(true);
    }

    return apiKey?.trim();
  }

  validateApiKey(apiKey: string | undefined): ApiKeyValidationResult {
    if (!apiKey || apiKey.trim().length === 0) {
      return {
        isValid: false,
        error: 'API Key cannot be empty'
      };
    }

    const trimmedKey = apiKey.trim();
    
    if (!trimmedKey.startsWith('sk-')) {
      return {
        isValid: false,
        error: 'Invalid API Key format. OpenAI API keys should start with "sk-"'
      };
    }

    if (trimmedKey.length < 20) {
      return {
        isValid: false,
        error: 'API Key appears to be too short'
      };
    }

    return {
      isValid: true
    };
  }

  async ensureApiKeyExists(): Promise<string | undefined> {
    let apiKey = await this.getApiKey();
    
    if (!apiKey) {
      const action = await vscode.window.showInformationMessage(
        'OpenAI API Key is required to use Prompt Enhancer',
        'Configure API Key',
        'Cancel'
      );

      if (action === 'Configure API Key') {
        apiKey = await this.promptForApiKey();
      }
    } else {
      // Update status if key exists but status is not set correctly
      const currentStatus = await this.getApiKeyStatus();
      if (currentStatus === 'not-configured') {
        await this.updateApiKeyStatus(true);
      }
    }

    return apiKey;
  }

  async updateSetting<K extends keyof ExtensionSettings>(
    key: K, 
    value: ExtensionSettings[K]
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration('promptEnhancer');
    await config.update(key, value, vscode.ConfigurationTarget.Global);
  }

  onSettingsChanged(callback: () => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('promptEnhancer')) {
        callback();
      }
    });
  }
}