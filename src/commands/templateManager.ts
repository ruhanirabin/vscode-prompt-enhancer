import * as vscode from 'vscode';
import { TemplateRegistry } from '../templates/templateRegistry';
import { DynamicTemplateDefinition } from '../templates/templateStorage';
import { QuickPickManager } from '../ui/quickPick';
import { TemplateFormData } from '../types/extension';
import { ErrorHandler } from '../utils/errorHandler';

export class TemplateManagerCommand {
  private templateRegistry: TemplateRegistry;

  constructor(templateRegistry: TemplateRegistry) {
    this.templateRegistry = templateRegistry;
  }

  async execute(): Promise<void> {
    try {
      const result = await QuickPickManager.showTemplateManager(this.templateRegistry);
      
      if (!result) {
        return; // User cancelled
      }

      switch (result.action) {
        case 'create':
          await this.createTemplate();
          break;
        case 'edit':
          if (result.templateId) {
            await this.editTemplate(result.templateId);
          }
          break;
        case 'view':
          if (result.templateId) {
            await this.viewTemplate(result.templateId);
          }
          break;
        case 'import':
          await this.importTemplates();
          break;
        case 'export':
          await this.exportTemplates();
          break;
        default:
          vscode.window.showErrorMessage(`Unknown action: ${result.action}`);
      }
    } catch (error) {
      ErrorHandler.logError(error, 'TemplateManagerCommand');
      const errorInfo = ErrorHandler.parseError(error);
      await ErrorHandler.showError(errorInfo);
    }
  }

  private async createTemplate(): Promise<void> {
    const formData = await this.showTemplateForm();
    if (!formData) {
      return; // User cancelled
    }

    const template = this.templateRegistry.createNewTemplate(formData.name, formData.description);
    template.systemPrompt = formData.systemPrompt;
    template.userPromptTemplate = formData.userPromptTemplate;
    if (formData.category) {
      template.category = formData.category;
    }

    const validation = this.templateRegistry.validateTemplate(template);
    if (!validation.isValid) {
      vscode.window.showErrorMessage(`Template validation failed: ${validation.errors.join(', ')}`);
      return;
    }

    await this.templateRegistry.addTemplate(template);
    vscode.window.showInformationMessage(`Template "${template.name}" created successfully!`);
  }

  private async editTemplate(templateId: string): Promise<void> {
    const template = await this.templateRegistry.getTemplate(templateId);
    if (!template) {
      vscode.window.showErrorMessage(`Template not found: ${templateId}`);
      return;
    }

    if (template.isBuiltIn) {
      vscode.window.showErrorMessage('Built-in templates cannot be edited. You can duplicate them instead.');
      return;
    }

    const action = await QuickPickManager.showTemplateActions(template);
    if (!action) {
      return;
    }

    switch (action) {
      case 'edit':
        await this.showEditTemplateForm(template);
        break;
      case 'duplicate':
        await this.duplicateTemplate(template);
        break;
      case 'delete':
        await this.deleteTemplate(template);
        break;
      case 'export':
        await this.exportSingleTemplate(template);
        break;
      case 'view':
        await this.viewTemplate(templateId);
        break;
    }
  }

  private async viewTemplate(templateId: string): Promise<void> {
    const template = await this.templateRegistry.getTemplate(templateId);
    if (!template) {
      vscode.window.showErrorMessage(`Template not found: ${templateId}`);
      return;
    }

    const details = `**${template.name}**

**Description:** ${template.description}

**Category:** ${template.category || 'None'}

**Type:** ${template.isBuiltIn ? 'Built-in' : 'Custom'}

**Version:** ${template.version}

**Created:** ${template.createdAt.toLocaleDateString()}

**Updated:** ${template.updatedAt.toLocaleDateString()}

**System Prompt:**
\`\`\`
${template.systemPrompt}
\`\`\`

**User Prompt Template:**
\`\`\`
${template.userPromptTemplate}
\`\`\``;

    const doc = await vscode.workspace.openTextDocument({
      content: details,
      language: 'markdown'
    });

    await vscode.window.showTextDocument(doc, { preview: true });
  }

  private async showTemplateForm(existingTemplate?: DynamicTemplateDefinition): Promise<TemplateFormData | undefined> {
    const name = await vscode.window.showInputBox({
      prompt: 'Enter template name',
      value: existingTemplate?.name || '',
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Template name is required';
        }
        if (value.length > 100) {
          return 'Template name must be 100 characters or less';
        }
        return null;
      }
    });

    if (!name) {
      return undefined;
    }

    const description = await vscode.window.showInputBox({
      prompt: 'Enter template description',
      value: existingTemplate?.description || '',
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Template description is required';
        }
        if (value.length > 200) {
          return 'Template description must be 200 characters or less';
        }
        return null;
      }
    });

    if (!description) {
      return undefined;
    }

    const category = await QuickPickManager.showCategorySelector(this.templateRegistry, existingTemplate?.category);
    if (category === undefined) {
      return undefined;
    }

    const systemPrompt = await this.showMultilineInput(
      'System Prompt',
      'Enter the system prompt that defines the AI\'s role and guidelines',
      existingTemplate?.systemPrompt || 'You are an expert prompt engineer. Enhance the given prompt to make it more effective and detailed.'
    );

    if (!systemPrompt) {
      return undefined;
    }

    const userPromptTemplate = await this.showMultilineInput(
      'User Prompt Template',
      'Enter the user prompt template. Use {originalText} as placeholder for the original text.',
      existingTemplate?.userPromptTemplate || 'Please enhance this prompt:\n\nOriginal prompt: "{originalText}"\n\nEnhanced prompt:'
    );

    if (!userPromptTemplate) {
      return undefined;
    }

    if (!userPromptTemplate.includes('{originalText}')) {
      vscode.window.showErrorMessage('User prompt template must include {originalText} placeholder');
      return undefined;
    }

    return {
      name: name.trim(),
      description: description.trim(),
      systemPrompt: systemPrompt.trim(),
      userPromptTemplate: userPromptTemplate.trim(),
      category: category
    };
  }

  private async showEditTemplateForm(template: DynamicTemplateDefinition): Promise<void> {
    const formData = await this.showTemplateForm(template);
    if (!formData) {
      return; // User cancelled
    }

    const updatedTemplate: DynamicTemplateDefinition = {
      ...template,
      name: formData.name,
      description: formData.description,
      systemPrompt: formData.systemPrompt,
      userPromptTemplate: formData.userPromptTemplate,
      updatedAt: new Date()
    };
    
    if (formData.category) {
      updatedTemplate.category = formData.category;
    }

    const validation = this.templateRegistry.validateTemplate(updatedTemplate);
    if (!validation.isValid) {
      vscode.window.showErrorMessage(`Template validation failed: ${validation.errors.join(', ')}`);
      return;
    }

    await this.templateRegistry.addTemplate(updatedTemplate);
    vscode.window.showInformationMessage(`Template "${updatedTemplate.name}" updated successfully!`);
  }

  private async duplicateTemplate(template: DynamicTemplateDefinition): Promise<void> {
    const newName = await vscode.window.showInputBox({
      prompt: 'Enter name for the duplicated template',
      value: `${template.name} (Copy)`,
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Template name is required';
        }
        return null;
      }
    });

    if (!newName) {
      return;
    }

    const duplicatedTemplate = this.templateRegistry.createNewTemplate(newName, template.description);
    duplicatedTemplate.systemPrompt = template.systemPrompt;
    duplicatedTemplate.userPromptTemplate = template.userPromptTemplate;
    if (template.category) {
      duplicatedTemplate.category = template.category;
    }

    await this.templateRegistry.addTemplate(duplicatedTemplate);
    vscode.window.showInformationMessage(`Template "${duplicatedTemplate.name}" created successfully!`);
  }

  private async deleteTemplate(template: DynamicTemplateDefinition): Promise<void> {
    const confirmed = await QuickPickManager.confirmTemplateDelete(template.name);
    if (!confirmed) {
      return;
    }

    await this.templateRegistry.deleteTemplate(template.id);
    vscode.window.showInformationMessage(`Template "${template.name}" deleted successfully!`);
  }

  private async importTemplates(): Promise<void> {
    const fileUri = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      filters: {
        'JSON Files': ['json']
      },
      openLabel: 'Import Templates'
    });

    if (!fileUri || fileUri.length === 0) {
      return;
    }

    try {
      const fileContent = await vscode.workspace.fs.readFile(fileUri[0]);
      const jsonData = Buffer.from(fileContent).toString('utf8');
      
      const importedTemplates = await this.templateRegistry.importTemplates(jsonData);
      
      vscode.window.showInformationMessage(
        `Successfully imported ${importedTemplates.length} template(s): ${importedTemplates.map(t => t.name).join(', ')}`
      );
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to import templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async exportTemplates(): Promise<void> {
    const jsonData = await this.templateRegistry.exportUserTemplates();
    
    const fileUri = await vscode.window.showSaveDialog({
      filters: {
        'JSON Files': ['json']
      },
      defaultUri: vscode.Uri.file('prompt-enhancer-templates.json')
    });

    if (!fileUri) {
      return;
    }

    try {
      await vscode.workspace.fs.writeFile(fileUri, Buffer.from(jsonData, 'utf8'));
      vscode.window.showInformationMessage(`Templates exported successfully to ${fileUri.fsPath}`);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to export templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async exportSingleTemplate(template: DynamicTemplateDefinition): Promise<void> {
    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      templates: [template]
    };

    const jsonData = JSON.stringify(exportData, null, 2);
    
    const fileUri = await vscode.window.showSaveDialog({
      filters: {
        'JSON Files': ['json']
      },
      defaultUri: vscode.Uri.file(`${template.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-template.json`)
    });

    if (!fileUri) {
      return;
    }

    try {
      await vscode.workspace.fs.writeFile(fileUri, Buffer.from(jsonData, 'utf8'));
      vscode.window.showInformationMessage(`Template "${template.name}" exported successfully to ${fileUri.fsPath}`);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to export template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async showMultilineInput(_title: string, prompt: string, defaultValue: string = ''): Promise<string | undefined> {
    const doc = await vscode.workspace.openTextDocument({
      content: defaultValue,
      language: 'plaintext'
    });

    const editor = await vscode.window.showTextDocument(doc, { preview: true });

    const result = await vscode.window.showInputBox({
      prompt: `${prompt}\n\nEdit the content in the opened editor, then enter 'done' here to continue, or 'cancel' to abort.`,
      placeHolder: 'Type "done" to continue or "cancel" to abort'
    });

    const content = editor.document.getText().trim();
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');

    if (result?.toLowerCase() === 'done') {
      return content;
    }

    return undefined;
  }
}