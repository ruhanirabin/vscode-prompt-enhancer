import { EnhancementTemplate } from '../types/openai';
export interface TemplateDefinition {
    name: string;
    description: string;
    systemPrompt: string;
    userPromptTemplate: string;
}
export declare const ENHANCEMENT_TEMPLATES: Record<EnhancementTemplate, TemplateDefinition>;
export declare function getTemplateByName(template: EnhancementTemplate): TemplateDefinition;
export declare function getAllTemplates(): TemplateDefinition[];
//# sourceMappingURL=enhancementTemplates.d.ts.map