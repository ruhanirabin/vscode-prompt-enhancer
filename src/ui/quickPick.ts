import * as vscode from 'vscode';
import { QuickPickItem, TemplateQuickPickItem, OutputAction } from '../types/extension';
import { EnhancementTemplate } from '../types/openai';
import { ENHANCEMENT_TEMPLATES } from '../templates/enhancementTemplates';

export class QuickPickManager {
  
  static async showTemplateSelector(defaultTemplate?: EnhancementTemplate): Promise<EnhancementTemplate | undefined> {
    const items: TemplateQuickPickItem[] = Object.entries(ENHANCEMENT_TEMPLATES).map(([key, template]) => ({
      label: template.name,
      description: template.description,
      template: key as EnhancementTemplate,
      picked: key === defaultTemplate
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select enhancement template',
      ignoreFocusOut: true,
      matchOnDescription: true
    });

    return selected?.template;
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
}