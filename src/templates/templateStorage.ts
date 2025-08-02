import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface DynamicTemplateDefinition {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  category?: string;
  isBuiltIn: boolean;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TemplateStorage {
  private static readonly STORAGE_KEY = 'promptEnhancer.customTemplates';
  private static readonly BUILT_IN_TEMPLATES_DIR = 'templates/built-in';

  /**
   * Load all templates (built-in + user custom)
   */
  static async loadTemplates(context: vscode.ExtensionContext): Promise<DynamicTemplateDefinition[]> {
    const builtInTemplates = await this.loadBuiltInTemplates(context);
    const userTemplates = await this.loadUserTemplates(context);
    return [...builtInTemplates, ...userTemplates];
  }

  /**
   * Load built-in templates from JSON files
   */
  private static async loadBuiltInTemplates(context: vscode.ExtensionContext): Promise<DynamicTemplateDefinition[]> {
    const templates: DynamicTemplateDefinition[] = [];
    const templatesDir = path.join(context.extensionPath, this.BUILT_IN_TEMPLATES_DIR);

    try {
      if (fs.existsSync(templatesDir)) {
        const files = fs.readdirSync(templatesDir).filter(file => file.endsWith('.json'));
        
        for (const file of files) {
          try {
            const filePath = path.join(templatesDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const template = JSON.parse(content) as DynamicTemplateDefinition;
            
            // Ensure built-in flag and dates
            template.isBuiltIn = true;
            template.createdAt = new Date(template.createdAt || Date.now());
            template.updatedAt = new Date(template.updatedAt || Date.now());
            
            templates.push(template);
          } catch (error) {
            console.error(`Error loading built-in template ${file}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error loading built-in templates:', error);
    }

    // Fallback to hardcoded templates if no files found
    if (templates.length === 0) {
      return this.getHardcodedTemplates();
    }

    return templates;
  }

  /**
   * Load user custom templates from VSCode storage
   */
  private static async loadUserTemplates(context: vscode.ExtensionContext): Promise<DynamicTemplateDefinition[]> {
    try {
      const stored = context.globalState.get<DynamicTemplateDefinition[]>(this.STORAGE_KEY, []);
      return stored.map(template => ({
        ...template,
        createdAt: new Date(template.createdAt),
        updatedAt: new Date(template.updatedAt)
      }));
    } catch (error) {
      console.error('Error loading user templates:', error);
      return [];
    }
  }

  /**
   * Save a user template
   */
  static async saveTemplate(context: vscode.ExtensionContext, template: DynamicTemplateDefinition): Promise<void> {
    if (template.isBuiltIn) {
      throw new Error('Cannot modify built-in templates');
    }

    try {
      const userTemplates = await this.loadUserTemplates(context);
      const existingIndex = userTemplates.findIndex(t => t.id === template.id);
      
      template.updatedAt = new Date();
      
      if (existingIndex >= 0) {
        userTemplates[existingIndex] = template;
      } else {
        template.createdAt = new Date();
        userTemplates.push(template);
      }

      await context.globalState.update(this.STORAGE_KEY, userTemplates);
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  }

  /**
   * Delete a user template
   */
  static async deleteTemplate(context: vscode.ExtensionContext, templateId: string): Promise<void> {
    try {
      const userTemplates = await this.loadUserTemplates(context);
      const template = userTemplates.find(t => t.id === templateId);
      
      if (template?.isBuiltIn) {
        throw new Error('Cannot delete built-in templates');
      }

      const filteredTemplates = userTemplates.filter(t => t.id !== templateId);
      await context.globalState.update(this.STORAGE_KEY, filteredTemplates);
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }

  /**
   * Export templates to JSON file
   */
  static async exportTemplates(templates: DynamicTemplateDefinition[]): Promise<string> {
    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      templates: templates.filter(t => !t.isBuiltIn) // Only export user templates
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import templates from JSON data
   */
  static async importTemplates(context: vscode.ExtensionContext, jsonData: string): Promise<DynamicTemplateDefinition[]> {
    try {
      const importData = JSON.parse(jsonData);
      const templates = importData.templates as DynamicTemplateDefinition[];
      
      const validTemplates: DynamicTemplateDefinition[] = [];
      
      for (const template of templates) {
        if (this.validateTemplate(template)) {
          // Ensure it's marked as user template
          template.isBuiltIn = false;
          template.createdAt = new Date();
          template.updatedAt = new Date();
          
          // Generate unique ID if needed
          if (!template.id || await this.templateExists(context, template.id)) {
            template.id = this.generateUniqueId(template.name);
          }
          
          await this.saveTemplate(context, template);
          validTemplates.push(template);
        }
      }
      
      return validTemplates;
    } catch (error) {
      console.error('Error importing templates:', error);
      throw new Error('Invalid template file format');
    }
  }

  /**
   * Check if template exists
   */
  private static async templateExists(context: vscode.ExtensionContext, templateId: string): Promise<boolean> {
    const allTemplates = await this.loadTemplates(context);
    return allTemplates.some(t => t.id === templateId);
  }

  /**
   * Generate unique template ID
   */
  private static generateUniqueId(name: string): string {
    const base = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = Date.now().toString(36);
    return `${base}-${timestamp}`;
  }

  /**
   * Validate template structure
   */
  private static validateTemplate(template: any): template is DynamicTemplateDefinition {
    return (
      typeof template === 'object' &&
      typeof template.name === 'string' &&
      typeof template.description === 'string' &&
      typeof template.systemPrompt === 'string' &&
      typeof template.userPromptTemplate === 'string' &&
      template.name.trim().length > 0 &&
      template.systemPrompt.trim().length > 0 &&
      template.userPromptTemplate.trim().length > 0
    );
  }

  /**
   * Fallback hardcoded templates (for backward compatibility)
   */
  private static getHardcodedTemplates(): DynamicTemplateDefinition[] {
    const now = new Date();
    
    return [
      {
        id: 'general',
        name: 'General Enhancement',
        description: 'Improve clarity, structure, and effectiveness',
        systemPrompt: `You are an expert prompt engineer. Your task is to transform basic prompts into sophisticated, detailed, and effective prompts while preserving the original intent.

Guidelines:
- Make the prompt more specific and actionable
- Add relevant context and constraints
- Improve clarity and structure
- Maintain the original purpose and tone
- Add examples if helpful
- Ensure the enhanced prompt is self-contained`,
        userPromptTemplate: `Please enhance this prompt to make it more effective and detailed:

Original prompt: "{originalText}"

Enhanced prompt:`,
        category: 'general',
        isBuiltIn: true,
        version: '1.0.0',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'technical',
        name: 'Technical Coding Prompts',
        description: 'Optimize for code generation and technical tasks',
        systemPrompt: `You are an expert software engineer and prompt engineer. Transform basic technical prompts into comprehensive, detailed prompts that will generate better code and technical solutions.

Guidelines:
- Specify programming languages, frameworks, and versions
- Include requirements, constraints, and best practices
- Add error handling and edge case considerations
- Specify code style and documentation requirements
- Include testing requirements if applicable
- Make requirements clear and unambiguous`,
        userPromptTemplate: `Please enhance this technical prompt for better code generation:

Original prompt: "{originalText}"

Enhanced technical prompt:`,
        category: 'technical',
        isBuiltIn: true,
        version: '1.0.0',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'creative',
        name: 'Creative Writing',
        description: 'Enhance for creative and narrative tasks',
        systemPrompt: `You are an expert creative writing coach and prompt engineer. Transform basic creative prompts into rich, detailed prompts that inspire better creative output.

Guidelines:
- Add sensory details and atmosphere
- Specify tone, style, and genre
- Include character development hints
- Add setting and context details
- Suggest narrative structure
- Encourage specific creative techniques`,
        userPromptTemplate: `Please enhance this creative writing prompt:

Original prompt: "{originalText}"

Enhanced creative prompt:`,
        category: 'creative',
        isBuiltIn: true,
        version: '1.0.0',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'comments',
        name: 'Code Comments',
        description: 'Transform code snippets into well-documented code',
        systemPrompt: `You are an expert software engineer focused on code documentation. Transform basic code or code-related prompts into comprehensive documentation requests.

Guidelines:
- Request clear, concise comments
- Specify documentation standards
- Include function/method descriptions
- Add parameter and return value documentation
- Request examples where helpful
- Ensure maintainability focus`,
        userPromptTemplate: `Please enhance this code documentation prompt:

Original prompt: "{originalText}"

Enhanced documentation prompt:`,
        category: 'documentation',
        isBuiltIn: true,
        version: '1.0.0',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'custom',
        name: 'Custom Template',
        description: 'User-defined enhancement template',
        systemPrompt: `You are an expert prompt engineer. Enhance the given prompt according to the user's custom requirements while maintaining clarity and effectiveness.`,
        userPromptTemplate: `Please enhance this prompt:

Original prompt: "{originalText}"

Enhanced prompt:`,
        category: 'custom',
        isBuiltIn: true,
        version: '1.0.0',
        createdAt: now,
        updatedAt: now
      }
    ];
  }
}