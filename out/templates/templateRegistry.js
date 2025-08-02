"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateRegistry = void 0;
const templateStorage_1 = require("./templateStorage");
class TemplateRegistry {
    constructor(context) {
        this.templates = new Map();
        this.initialized = false;
        this.context = context;
    }
    /**
     * Initialize the registry by loading all templates
     */
    async initialize() {
        try {
            const templates = await templateStorage_1.TemplateStorage.loadTemplates(this.context);
            this.templates.clear();
            templates.forEach(template => {
                this.templates.set(template.id, template);
            });
            this.initialized = true;
            console.log(`Template registry initialized with ${templates.length} templates`);
        }
        catch (error) {
            console.error('Error initializing template registry:', error);
            throw error;
        }
    }
    /**
     * Ensure registry is initialized
     */
    async ensureInitialized() {
        if (!this.initialized) {
            await this.initialize();
        }
    }
    /**
     * Get a template by ID
     */
    async getTemplate(id) {
        await this.ensureInitialized();
        return this.templates.get(id);
    }
    /**
     * Get all templates
     */
    async getAllTemplates() {
        await this.ensureInitialized();
        return Array.from(this.templates.values());
    }
    /**
     * Get templates by category
     */
    async getTemplatesByCategory(category) {
        await this.ensureInitialized();
        return Array.from(this.templates.values()).filter(t => t.category === category);
    }
    /**
     * Get all built-in templates
     */
    async getBuiltInTemplates() {
        await this.ensureInitialized();
        return Array.from(this.templates.values()).filter(t => t.isBuiltIn);
    }
    /**
     * Get all user templates
     */
    async getUserTemplates() {
        await this.ensureInitialized();
        return Array.from(this.templates.values()).filter(t => !t.isBuiltIn);
    }
    /**
     * Get all unique categories
     */
    async getCategories() {
        await this.ensureInitialized();
        const categories = new Set();
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
    async addTemplate(template) {
        await this.ensureInitialized();
        try {
            await templateStorage_1.TemplateStorage.saveTemplate(this.context, template);
            this.templates.set(template.id, template);
            console.log(`Template '${template.name}' added/updated successfully`);
        }
        catch (error) {
            console.error('Error adding template:', error);
            throw error;
        }
    }
    /**
     * Delete a template
     */
    async deleteTemplate(templateId) {
        await this.ensureInitialized();
        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error(`Template with ID '${templateId}' not found`);
        }
        if (template.isBuiltIn) {
            throw new Error('Cannot delete built-in templates');
        }
        try {
            await templateStorage_1.TemplateStorage.deleteTemplate(this.context, templateId);
            this.templates.delete(templateId);
            console.log(`Template '${template.name}' deleted successfully`);
        }
        catch (error) {
            console.error('Error deleting template:', error);
            throw error;
        }
    }
    /**
     * Check if a template exists
     */
    async templateExists(templateId) {
        await this.ensureInitialized();
        return this.templates.has(templateId);
    }
    /**
     * Search templates by name or description
     */
    async searchTemplates(query) {
        await this.ensureInitialized();
        const lowerQuery = query.toLowerCase();
        return Array.from(this.templates.values()).filter(template => template.name.toLowerCase().includes(lowerQuery) ||
            template.description.toLowerCase().includes(lowerQuery) ||
            (template.category && template.category.toLowerCase().includes(lowerQuery)));
    }
    /**
     * Get template statistics
     */
    async getStatistics() {
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
    async exportUserTemplates() {
        const userTemplates = await this.getUserTemplates();
        return templateStorage_1.TemplateStorage.exportTemplates(userTemplates);
    }
    /**
     * Import templates from JSON
     */
    async importTemplates(jsonData) {
        const importedTemplates = await templateStorage_1.TemplateStorage.importTemplates(this.context, jsonData);
        // Refresh registry
        await this.initialize();
        return importedTemplates;
    }
    /**
     * Validate template data
     */
    validateTemplate(template) {
        const errors = [];
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
    createNewTemplate(name, description) {
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
    generateTemplateId(name) {
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
    async refresh() {
        await this.initialize();
    }
    /**
     * Get template for backward compatibility with old system
     */
    async getLegacyTemplate(templateKey) {
        // Map old template keys to new IDs
        const legacyMapping = {
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
exports.TemplateRegistry = TemplateRegistry;
//# sourceMappingURL=templateRegistry.js.map