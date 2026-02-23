export interface OpenAIConfig {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
    timeout: number;
}
export interface OpenAIResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
export interface EnhancementRequest {
    originalText: string;
    template: string;
    context?: string;
}
export interface EnhancementResult {
    enhancedText: string;
    tokensUsed: number;
    model: string;
    processingTime: number;
}
export interface ModelInfo {
    id: string;
    name: string;
    description: string;
    ownedBy?: string;
}
export type EnhancementTemplate = 'general' | 'technical' | 'creative' | 'comments' | 'custom';
export interface TemplateDefinition {
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
//# sourceMappingURL=openai.d.ts.map