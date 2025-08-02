import * as vscode from 'vscode';
import { DynamicTemplateDefinition } from './templateStorage';
export declare class TemplateRegistry {
    private templates;
    private context;
    private initialized;
    constructor(context: vscode.ExtensionContext);
    /**
     * Initialize the registry by loading all templates
     */
    initialize(): Promise<void>;
    /**
     * Ensure registry is initialized
     */
    private ensureInitialized;
    /**
     * Get a template by ID
     */
    getTemplate(id: string): Promise<DynamicTemplateDefinition | undefined>;
    /**
     * Get all templates
     */
    getAllTemplates(): Promise<DynamicTemplateDefinition[]>;
    /**
     * Get templates by category
     */
    getTemplatesByCategory(category: string): Promise<DynamicTemplateDefinition[]>;
    /**
     * Get all built-in templates
     */
    getBuiltInTemplates(): Promise<DynamicTemplateDefinition[]>;
    /**
     * Get all user templates
     */
    getUserTemplates(): Promise<DynamicTemplateDefinition[]>;
    /**
     * Get all unique categories
     */
    getCategories(): Promise<string[]>;
    /**
     * Add or update a template
     */
    addTemplate(template: DynamicTemplateDefinition): Promise<void>;
    /**
     * Delete a template
     */
    deleteTemplate(templateId: string): Promise<void>;
    /**
     * Check if a template exists
     */
    templateExists(templateId: string): Promise<boolean>;
    /**
     * Search templates by name or description
     */
    searchTemplates(query: string): Promise<DynamicTemplateDefinition[]>;
    /**
     * Get template statistics
     */
    getStatistics(): Promise<{
        total: number;
        builtIn: number;
        user: number;
        categories: number;
    }>;
    /**
     * Export user templates
     */
    exportUserTemplates(): Promise<string>;
    /**
     * Import templates from JSON
     */
    importTemplates(jsonData: string): Promise<DynamicTemplateDefinition[]>;
    /**
     * Validate template data
     */
    validateTemplate(template: Partial<DynamicTemplateDefinition>): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Create a new template with default values
     */
    createNewTemplate(name: string, description: string): DynamicTemplateDefinition;
    /**
     * Generate a unique template ID
     */
    private generateTemplateId;
    /**
     * Refresh the registry (reload from storage)
     */
    refresh(): Promise<void>;
    /**
     * Get template for backward compatibility with old system
     */
    getLegacyTemplate(templateKey: string): Promise<DynamicTemplateDefinition | undefined>;
}
//# sourceMappingURL=templateRegistry.d.ts.map