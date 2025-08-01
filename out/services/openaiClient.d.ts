import { OpenAIConfig, EnhancementRequest, EnhancementResult } from '../types/openai';
export declare class OpenAIClient {
    private client;
    private config;
    initialize(apiKey: string): Promise<void>;
    enhancePrompt(request: EnhancementRequest): Promise<EnhancementResult>;
    testConnection(): Promise<boolean>;
    updateConfig(newConfig: Partial<OpenAIConfig>): void;
    getConfig(): OpenAIConfig | null;
    isInitialized(): boolean;
}
//# sourceMappingURL=openaiClient.d.ts.map