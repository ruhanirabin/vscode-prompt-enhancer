import { OpenAIConfig, EnhancementRequest, EnhancementResult, ModelInfo } from '../types/openai';
import { TemplateRegistry } from '../templates/templateRegistry';
export declare class OpenAIClient {
    private client;
    private config;
    private templateRegistry;
    private cachedModels;
    private modelsCacheTimestamp;
    private readonly CACHE_DURATION_MS;
    constructor(templateRegistry: TemplateRegistry);
    initialize(apiKey: string): Promise<void>;
    enhancePrompt(request: EnhancementRequest): Promise<EnhancementResult>;
    testConnection(): Promise<boolean>;
    /**
     * Fetch available models from OpenAI API
     * Requires API key to be configured
     */
    listAvailableModels(forceRefresh?: boolean): Promise<ModelInfo[]>;
    /**
     * Get priority value for model sorting (lower = higher priority)
     */
    private getModelPriority;
    /**
     * Get cached models without forcing a refresh
     */
    getCachedModels(): ModelInfo[] | null;
    /**
     * Clear the models cache
     */
    clearModelsCache(): void;
    /**
     * Format model ID into a human-readable name
     */
    private formatModelName;
    /**
     * Get a description for the model based on its ID
     */
    private getModelDescription;
    updateConfig(newConfig: Partial<OpenAIConfig>): void;
    getConfig(): OpenAIConfig | null;
    isInitialized(): boolean;
}
//# sourceMappingURL=openaiClient.d.ts.map