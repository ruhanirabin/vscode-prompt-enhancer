import { OpenAIConfig, EnhancementRequest, EnhancementResult } from '../types/openai';
import { TemplateRegistry } from '../templates/templateRegistry';
export declare class OpenAIClient {
    private client;
    private config;
    private templateRegistry;
    constructor(templateRegistry: TemplateRegistry);
    initialize(apiKey: string): Promise<void>;
    enhancePrompt(request: EnhancementRequest): Promise<EnhancementResult>;
    testConnection(): Promise<boolean>;
    updateConfig(newConfig: Partial<OpenAIConfig>): void;
    getConfig(): OpenAIConfig | null;
    isInitialized(): boolean;
}
//# sourceMappingURL=openaiClient.d.ts.map