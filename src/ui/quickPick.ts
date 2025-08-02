import * as vscode from 'vscode';
import { QuickPickItem, TemplateQuickPickItem, OutputAction, CategoryQuickPickItem } from '../types/extension';
import { TemplateRegistry } from '../templates/templateRegistry';
import { DynamicTemplateDefinition } from '../templates/templateStorage';

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

  static async showModelSelector(currentModel?: string): Promise<string | undefined> {
    const models = [
      {
        label: 'GPT-4o-mini',
        description: 'Fast and cost-effective (Recommended)',
        detail: 'Best balance of speed, quality, and cost',
        value: 'gpt-4o-mini'
      },
      {
        label: 'GPT-4o',
        description: 'Most capable model',
        detail: 'Highest quality but more expensive',
        value: 'gpt-4o'
      },
      {
        label: 'GPT-3.5-turbo',
        description: 'Fast and affordable',
        detail: 'Good for simple enhancements',
        value: 'gpt-3.5-turbo'
      }
    ];

    const items = models.map(model => ({
      label: model.label,
      description: model.description,
      detail: model.detail,
      picked: model.value === currentModel
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select OpenAI model',
      ignoreFocusOut: true,
      matchOnDescription: true,
      matchOnDetail: true
    });

    if (selected) {
      const model = models.find(m => m.label === selected.label);
      return model?.value;
    }

    return undefined;
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