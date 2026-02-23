import * as vscode from 'vscode';
import { QuickPickItem, TemplateQuickPickItem, OutputAction, CategoryQuickPickItem } from '../types/extension';
import { TemplateRegistry } from '../templates/templateRegistry';
import { DynamicTemplateDefinition } from '../templates/templateStorage';
import { OpenAIClient } from '../services/openaiClient';
import { SettingsManager } from '../config/settings';
import { ModelInfo } from '../types/openai';

export class QuickPickManager {
  
  static async showTemplateSelector(templateRegistry: TemplateRegistry, defaultTemplate?: string): Promise<string | undefined> {
    const templates = await templateRegistry.getAllTemplates();
    const categories = await templateRegistry.getCategories();

    // Group templates by category if there are multiple categories
    let items: TemplateQuickPickItem[] = [];

    if (categories.length > 1) {
      // Create category separators and group templates
      const groupedTemplates = new Map<string, DynamicTemplateDefinition[]>();
      
      templates.forEach(template => {
        const category = template.category || 'Other';
        if (!groupedTemplates.has(category)) {
          groupedTemplates.set(category, []);
        }
        groupedTemplates.get(category)!.push(template);
      });

      // Add templates with category separators
      for (const [category, categoryTemplates] of groupedTemplates) {
        // Add category separator
        items.push({
          label: `$(folder) ${category.charAt(0).toUpperCase() + category.slice(1)}`,
          description: '',
          template: '',
          kind: vscode.QuickPickItemKind.Separator
        } as TemplateQuickPickItem);

        // Add templates in this category
        categoryTemplates.forEach(template => {
          items.push({
            label: `  ${template.name}`,
            description: template.description,
            detail: template.isBuiltIn ? 'Built-in' : 'Custom',
            template: template.id,
            category: template.category,
            picked: template.id === defaultTemplate
          });
        });
      }
    } else {
      // Simple list without categories
      items = templates.map(template => ({
        label: template.name,
        description: template.description,
        detail: template.isBuiltIn ? 'Built-in' : 'Custom',
        template: template.id,
        category: template.category,
        picked: template.id === defaultTemplate
      }));
    }

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select enhancement template',
      ignoreFocusOut: true,
      matchOnDescription: true,
      matchOnDetail: true
    });

    return selected?.template || undefined;
  }

  static async showOutputActionSelector(): Promise<OutputAction | undefined> {
    const items: QuickPickItem[] = [
      {
        label: '$(replace) Replace Selected Text',
        description: 'Replace the selected text with the enhanced prompt',
        action: 'replace'
      },
      {
        label: '$(add) Insert Below',
        description: 'Insert the enhanced prompt below the selected text',
        action: 'insertBelow'
      },
      {
        label: '$(add) Insert Above',
        description: 'Insert the enhanced prompt above the selected text',
        action: 'insertAbove'
      },
      {
        label: '$(clippy) Copy to Clipboard',
        description: 'Copy the enhanced prompt to clipboard',
        action: 'copyToClipboard'
      }
    ];

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'What would you like to do with the enhanced prompt?',
      ignoreFocusOut: true,
      matchOnDescription: true
    });

    return selected?.action;
  }

  static async showClipboardOutputActionSelector(): Promise<OutputAction | undefined> {
    const items: QuickPickItem[] = [
      {
        label: '$(clippy) Copy to Clipboard',
        description: 'Copy the enhanced prompt to clipboard (recommended for clipboard-based enhancement)',
        action: 'copyToClipboard'
      }
    ];

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Enhanced text will be copied to clipboard',
      ignoreFocusOut: true,
      matchOnDescription: true
    });

    return selected?.action || 'copyToClipboard'; // Default to clipboard for clipboard-based contexts
  }

  static async showModelSelector(
    openaiClient: OpenAIClient,
    settingsManager: SettingsManager,
    currentModel?: string
  ): Promise<string | undefined> {
    try {
      // Check if API key exists
      const apiKey = await settingsManager.getApiKey();
      
      if (!apiKey) {
        // No API key - prompt user to configure
        const action = await vscode.window.showInformationMessage(
          'OpenAI API Key is required to fetch available models',
          'Configure API Key',
          'Use Default Model'
        );
        
        if (action === 'Configure API Key') {
          const newApiKey = await settingsManager.promptForApiKey();
          if (newApiKey) {
            await openaiClient.initialize(newApiKey);
            // Continue to fetch models
          } else {
            return undefined; // User cancelled
          }
        } else if (action === 'Use Default Model') {
          // Return default model without fetching
          return currentModel || 'gpt-4o-mini';
        } else {
          return undefined; // User cancelled
        }
      }
      
      // Initialize client if needed
      if (!openaiClient.isInitialized()) {
        await openaiClient.initialize(apiKey!);
      }

      // Fetch models with loading indicator
      let models: ModelInfo[] = [];

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Fetching available models...',
          cancellable: false
        },
        async () => {
          models = await openaiClient.listAvailableModels();
        }
      );

      if (!models || models.length === 0) {
        // Fallback to default models if none returned
        vscode.window.showWarningMessage('No models returned from API. Using default models.');
        return currentModel || 'gpt-4o-mini';
      }

      // Build quick pick items from dynamic models
      interface ModelQuickPickItem extends vscode.QuickPickItem {
        modelId: string;
      }

      const items: (ModelQuickPickItem | vscode.QuickPickItem)[] = models.map(model => ({
        label: `$(symbol-method) ${model.name}`,
        description: model.description,
        detail: model.ownedBy ? `ID: ${model.id} • Owner: ${model.ownedBy}` : `ID: ${model.id}`,
        modelId: model.id,
        picked: model.id === currentModel
      }));

      // Add separator and fallback options
      items.push(
        {
          label: '',
          description: '',
          kind: vscode.QuickPickItemKind.Separator
        } as vscode.QuickPickItem,
        {
          label: '$(refresh) Refresh Models',
          description: 'Fetch latest models from OpenAI',
          modelId: '__refresh__'
        } as ModelQuickPickItem,
        {
          label: '$(gear) Use Custom Model ID',
          description: 'Enter a specific model ID manually',
          modelId: '__custom__'
        } as ModelQuickPickItem
      );

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: `Select OpenAI model (${models.length} available)`,
        ignoreFocusOut: true,
        matchOnDescription: true,
        matchOnDetail: true
      });

      if (!selected) {
        return undefined;
      }

      // Handle special actions
      if ((selected as ModelQuickPickItem).modelId === '__refresh__') {
        // Refresh models
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Refreshing models...',
            cancellable: false
          },
          async () => {
            models = await openaiClient.listAvailableModels(true);
          }
        );
        // Recursively call to show updated list
        return QuickPickManager.showModelSelector(openaiClient, settingsManager, currentModel);
      }

      if ((selected as ModelQuickPickItem).modelId === '__custom__') {
        // Allow manual model ID entry
        const customModelId = await vscode.window.showInputBox({
          prompt: 'Enter OpenAI model ID',
          placeHolder: 'e.g., gpt-4o-mini, gpt-4, gpt-3.5-turbo',
          value: currentModel || '',
          validateInput: (value) => {
            if (!value || value.trim().length === 0) {
              return 'Model ID cannot be empty';
            }
            return null;
          }
        });
        return customModelId?.trim();
      }

      return (selected as ModelQuickPickItem).modelId;
      
    } catch (error) {
      console.error('Error in showModelSelector:', error);
      
      // Show error with option to use default
      const action = await vscode.window.showErrorMessage(
        'Failed to fetch models from OpenAI. Please check your API key and connection.',
        'Use Default Model',
        'Configure API Key',
        'Cancel'
      );
      
      if (action === 'Use Default Model') {
        return currentModel || 'gpt-4o-mini';
      } else if (action === 'Configure API Key') {
        const newApiKey = await settingsManager.promptForApiKey();
        if (newApiKey) {
          await openaiClient.initialize(newApiKey);
          // Retry
          return QuickPickManager.showModelSelector(openaiClient, settingsManager, currentModel);
        }
      }
      
      return undefined;
    }
  }

  static async showRetryOptions(): Promise<string | undefined> {
    const items = [
      {
        label: '$(sync) Retry',
        description: 'Try the request again'
      },
      {
        label: '$(gear) Change Settings',
        description: 'Modify timeout, model, or other settings'
      },
      {
        label: '$(key) Configure API Key',
        description: 'Update your OpenAI API key'
      },
      {
        label: '$(x) Cancel',
        description: 'Cancel the operation'
      }
    ];

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'What would you like to do?',
      ignoreFocusOut: true
    });

    return selected?.label.split(' ')[1]; // Extract the action (Retry, Change, Configure, Cancel)
  }

  static async confirmAction(message: string, confirmText: string = 'Yes', cancelText: string = 'No'): Promise<boolean> {
    const result = await vscode.window.showQuickPick([confirmText, cancelText], {
      placeHolder: message,
      ignoreFocusOut: true
    });

    return result === confirmText;
  }

  // Template Management Methods
  static async showTemplateManager(templateRegistry: TemplateRegistry): Promise<{ action: string; templateId?: string } | undefined> {
    const templates = await templateRegistry.getAllTemplates();
    const stats = await templateRegistry.getStatistics();

    const items: vscode.QuickPickItem[] = [
      {
        label: '$(add) Create New Template',
        description: 'Create a new custom template'
      },
      {
        label: '$(import) Import Templates',
        description: 'Import templates from JSON file'
      },
      {
        label: '$(export) Export User Templates',
        description: `Export ${stats.user} custom templates`
      },
      {
        label: '',
        description: '',
        kind: vscode.QuickPickItemKind.Separator
      }
    ];

    // Add existing templates
    templates.forEach(template => {
      items.push({
        label: `${template.isBuiltIn ? '$(lock)' : '$(edit)'} ${template.name}`,
        description: template.description,
        detail: `${template.category || 'No category'} • ${template.isBuiltIn ? 'Built-in' : 'Custom'}`
      });
    });

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: `Manage Templates (${stats.total} total, ${stats.user} custom)`,
      ignoreFocusOut: true,
      matchOnDescription: true,
      matchOnDetail: true
    });

    if (selected) {
      const label = selected.label;
      if (label.includes('Create New Template')) {
        return { action: 'create' };
      } else if (label.includes('Import Templates')) {
        return { action: 'import' };
      } else if (label.includes('Export User Templates')) {
        return { action: 'export' };
      } else {
        // Find the template by name
        const templateName = label.replace(/^\$\([^)]+\)\s+/, '');
        const template = templates.find(t => t.name === templateName);
        if (template) {
          return {
            action: template.isBuiltIn ? 'view' : 'edit',
            templateId: template.id
          };
        }
        return { action: 'view' };
      }
    }

    return undefined;
  }

  static async showTemplateActions(template: DynamicTemplateDefinition): Promise<string | undefined> {
    const items = [];

    if (!template.isBuiltIn) {
      items.push(
        {
          label: '$(edit) Edit Template',
          description: 'Modify this template'
        },
        {
          label: '$(copy) Duplicate Template',
          description: 'Create a copy of this template'
        },
        {
          label: '$(trash) Delete Template',
          description: 'Remove this template permanently'
        }
      );
    }

    items.push(
      {
        label: '$(export) Export Template',
        description: 'Export this template to JSON'
      },
      {
        label: '$(eye) View Details',
        description: 'Show template configuration'
      }
    );

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: `Actions for "${template.name}"`,
      ignoreFocusOut: true
    });

    return selected?.label.split(' ')[1]?.toLowerCase(); // Extract action (Edit, Duplicate, Delete, etc.)
  }

  static async showCategorySelector(templateRegistry: TemplateRegistry, currentCategory?: string): Promise<string | undefined> {
    const categories = await templateRegistry.getCategories();
    
    const items: CategoryQuickPickItem[] = [
      {
        label: '$(add) Create New Category',
        description: 'Enter a new category name',
        category: '__new__'
      },
      {
        label: '',
        description: '',
        category: '',
        kind: vscode.QuickPickItemKind.Separator
      } as CategoryQuickPickItem
    ];

    // Add existing categories
    categories.forEach(category => {
      items.push({
        label: category.charAt(0).toUpperCase() + category.slice(1),
        description: `Existing category`,
        category: category,
        picked: category === currentCategory
      });
    });

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select or create a category',
      ignoreFocusOut: true
    });

    if (selected?.category === '__new__') {
      const newCategory = await vscode.window.showInputBox({
        prompt: 'Enter new category name',
        placeHolder: 'e.g., business, academic, creative',
        validateInput: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Category name cannot be empty';
          }
          if (categories.includes(value.toLowerCase())) {
            return 'Category already exists';
          }
          return null;
        }
      });
      return newCategory?.toLowerCase();
    }

    return selected?.category;
  }

  static async confirmTemplateDelete(templateName: string): Promise<boolean> {
    const result = await vscode.window.showWarningMessage(
      `Are you sure you want to delete the template "${templateName}"?`,
      { modal: true },
      'Delete',
      'Cancel'
    );

    return result === 'Delete';
  }
}