import * as vscode from 'vscode';
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
export declare class TemplateStorage {
    private static readonly STORAGE_KEY;
    private static readonly BUILT_IN_TEMPLATES_DIR;
    /**
     * Load all templates (built-in + user custom)
     */
    static loadTemplates(context: vscode.ExtensionContext): Promise<DynamicTemplateDefinition[]>;
    /**
     * Load built-in templates from JSON files
     */
    private static loadBuiltInTemplates;
    /**
     * Load user custom templates from VSCode storage
     */
    private static loadUserTemplates;
    /**
     * Save a user template
     */
    static saveTemplate(context: vscode.ExtensionContext, template: DynamicTemplateDefinition): Promise<void>;
    /**
     * Delete a user template
     */
    static deleteTemplate(context: vscode.ExtensionContext, templateId: string): Promise<void>;
    /**
     * Export templates to JSON file
     */
    static exportTemplates(templates: DynamicTemplateDefinition[]): Promise<string>;
    /**
     * Import templates from JSON data
     */
    static importTemplates(context: vscode.ExtensionContext, jsonData: string): Promise<DynamicTemplateDefinition[]>;
    /**
     * Check if template exists
     */
    private static templateExists;
    /**
     * Generate unique template ID
     */
    private static generateUniqueId;
    /**
     * Validate template structure
     */
    private static validateTemplate;
    /**
     * Fallback hardcoded templates (for backward compatibility)
     */
    private static getHardcodedTemplates;
}
//# sourceMappingURL=templateStorage.d.ts.map