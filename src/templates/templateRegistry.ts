import * as vscode from 'vscode';
import { DynamicTemplateDefinition, TemplateStorage } from './templateStorage';

export class TemplateRegistry {
  private templates: Map<string, DynamicTemplateDefinition> = new Map();
  private context: vscode.ExtensionContext;
  private initialized: boolean = false;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  /**
   * Initialize the registry by loading all templates
   */
  async initialize(): Promise<void> {
    try {
      const templates = await TemplateStorage.loadTemplates(this.context);
      this.templates.clear();
      
      templates.forEach(template => {
        this.templates.set(template.id, template);
      });
      
      this.initialized = true;
      console.log(`Template registry initialized with ${templates.length} templates`);
    } catch (error) {
      console.error('Error initializing template registry:', error);
      throw error;
    }
  }

  /**
   * Ensure registry is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Get a template by ID
   */
  async getTemplate(id: string): Promise<DynamicTemplateDefinition | undefined> {
    await this.ensureInitialized();
    return this.templates.get(id);
  }

  /**
   * Get all templates
   */
  async getAllTemplates(): Promise<DynamicTemplateDefinition[]> {
    await this.ensureInitialized();
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: string): Promise<DynamicTemplateDefinition[]> {
    await this.ensureInitialized();
    return Array.from(this.templates.values()).filter(t => t.category === category);
  }

  /**
   * Get all built-in templates
   */
  async getBuiltInTemplates(): Promise<DynamicTemplateDefinition[]> {
    await this.ensureInitialized();
    return Array.from(this.templates.values()).filter(t => t.isBuiltIn);
  }

  /**
   * Get all user templates
   */
  async getUserTemplates(): Promise<DynamicTemplateDefinition[]> {
    await this.ensureInitialized();
    return Array.from(this.templates.values()).filter(t => !t.isBuiltIn);
  }

  /**
   * Get all unique categories
   */
  async getCategories(): Promise<string[]> {
    await this.ensureInitialized();
    const categories = new Set<string>();
    
    this.templates.forEach(template => {
      if (template.category) {
        categories.add(template.category);
      }
    });
    
    return Array.from(categories).sort();
  }

  /**
   * Add or update a template
   */
  async addTemplate(template: DynamicTemplateDefinition): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await TemplateStorage.saveTemplate(this.context, template);
      this.templates.set(template.id, template);
      console.log(`Template '${template.name}' added/updated successfully`);
    } catch (error) {
      console.error('Error adding template:', error);
      throw error;
    }
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    await this.ensureInitialized();
    
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template with ID '${templateId}' not found`);
    }

    if (template.isBuiltIn) {
      throw new Error('Cannot delete built-in templates');
    }

    try {
      await TemplateStorage.deleteTemplate(this.context, templateId);
      this.templates.delete(templateId);
      console.log(`Template '${template.name}' deleted successfully`);
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }

  /**
   * Check if a template exists
   */
  async templateExists(templateId: string): Promise<boolean> {
    await this.ensureInitialized();
    return this.templates.has(templateId);
  }

  /**
   * Search templates by name or description
   */
  async searchTemplates(query: string): Promise<DynamicTemplateDefinition[]> {
    await this.ensureInitialized();
    const lowerQuery = query.toLowerCase();
    
    return Array.from(this.templates.values()).filter(template => 
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      (template.category && template.category.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get template statistics
   */
  async getStatistics(): Promise<{
    total: number;
    builtIn: number;
    user: number;
    categories: number;
  }> {
    await this.ensureInitialized();
    
    const templates = Array.from(this.templates.values());
    const categories = await this.getCategories();
    
    return {
      total: templates.length,
      builtIn: templates.filter(t => t.isBuiltIn).length,
      user: templates.filter(t => !t.isBuiltIn).length,
      categories: categories.length
    };
  }

  /**
   * Export user templates
   */
  async exportUserTemplates(): Promise<string> {
    const userTemplates = await this.getUserTemplates();
    return TemplateStorage.exportTemplates(userTemplates);
  }

  /**
   * Import templates from JSON
   */
  async importTemplates(jsonData: string): Promise<DynamicTemplateDefinition[]> {
    const importedTemplates = await TemplateStorage.importTemplates(this.context, jsonData);
    
    // Refresh registry
    await this.initialize();
    
    return importedTemplates;
  }

  /**
   * Validate template data
   */
  validateTemplate(template: Partial<DynamicTemplateDefinition>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!template.name || template.name.trim().length === 0) {
      errors.push('Template name is required');
    }

    if (!template.description || template.description.trim().length === 0) {
      errors.push('Template description is required');
    }

    if (!template.systemPrompt || template.systemPrompt.trim().length === 0) {
      errors.push('System prompt is required');
    }

    if (!template.userPromptTemplate || template.userPromptTemplate.trim().length === 0) {
      errors.push('User prompt template is required');
    }

    if (template.userPromptTemplate && !template.userPromptTemplate.includes('{originalText}')) {
      errors.push('User prompt template must include {originalText} placeholder');
    }

    if (template.name && template.name.length > 100) {
      errors.push('Template name must be 100 characters or less');
    }

    if (template.description && template.description.length > 200) {
      errors.push('Template description must be 200 characters or less');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create a new template with default values
   */
  createNewTemplate(name: string, description: string): DynamicTemplateDefinition {
    const now = new Date();
    const id = this.generateTemplateId(name);

    return {
      id,
      name: name.trim(),
      description: description.trim(),
      systemPrompt: 'You are an expert prompt engineer. Enhance the given prompt to make it more effective and detailed.',
      userPromptTemplate: `Please enhance this prompt:

Original prompt: "{originalText}"

Enhanced prompt:`,
      category: 'custom',
      isBuiltIn: false,
      version: '1.0.0',
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Generate a unique template ID
   */
  private generateTemplateId(name: string): string {
    const base = name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
    
    const timestamp = Date.now().toString(36);
    return `${base}-${timestamp}`;
  }

  /**
   * Refresh the registry (reload from storage)
   */
  async refresh(): Promise<void> {
    await this.initialize();
  }

  /**
   * Get template for backward compatibility with old system
   */
  async getLegacyTemplate(templateKey: string): Promise<DynamicTemplateDefinition | undefined> {
    // Map old template keys to new IDs
    const legacyMapping: Record<string, string> = {
      'general': 'general',
      'technical': 'technical',
      'creative': 'creative',
      'comments': 'comments',
      'custom': 'custom'
    };

    const mappedId = legacyMapping[templateKey] || templateKey;
    return this.getTemplate(mappedId);
  }
}