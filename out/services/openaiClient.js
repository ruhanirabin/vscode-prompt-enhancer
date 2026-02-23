"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIClient = void 0;
const openai_1 = __importDefault(require("openai"));
const vscode = __importStar(require("vscode"));
const errorHandler_1 = require("../utils/errorHandler");
const rateLimiter_1 = require("../utils/rateLimiter");
class OpenAIClient {
    constructor(templateRegistry) {
        this.client = null;
        this.config = null;
        this.cachedModels = null;
        this.modelsCacheTimestamp = null;
        this.CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
        this.templateRegistry = templateRegistry;
        // Use conservative rate limiting by default
        this.rateLimiter = rateLimiter_1.PreconfiguredLimiters.openaiConservative;
    }
    async initialize(apiKey) {
        const settings = vscode.workspace.getConfiguration('promptEnhancer');
        this.config = {
            apiKey,
            model: settings.get('model', 'gpt-4o-mini'),
            maxTokens: settings.get('maxTokens', 1000),
            temperature: settings.get('temperature', 0.7),
            timeout: settings.get('timeout', 30000)
        };
        this.client = new openai_1.default({
            apiKey: this.config.apiKey,
            timeout: this.config.timeout
        });
        // Clear cached models when API key changes (they may be different for different keys)
        this.cachedModels = null;
        this.modelsCacheTimestamp = null;
    }
    async enhancePrompt(request) {
        if (!this.client || !this.config) {
            throw new Error('OpenAI client not initialized');
        }
        // Get template from registry
        const template = await this.templateRegistry.getTemplate(request.template);
        if (!template) {
            throw new Error(`Template '${request.template}' not found`);
        }
        let userPrompt = template.userPromptTemplate.replace('{originalText}', request.originalText);
        // Handle custom template with user-defined template from settings
        if (request.template === 'custom') {
            const customTemplate = vscode.workspace.getConfiguration('promptEnhancer').get('customTemplate', '');
            if (customTemplate) {
                userPrompt = `${customTemplate}\n\nOriginal prompt: "${request.originalText}"\n\nEnhanced prompt:`;
            }
        }
        const startTime = Date.now();
        try {
            // Check rate limit before making API call
            const rateLimitStatus = this.rateLimiter.recordRequest();
            if (!rateLimitStatus.allowed) {
                const waitSeconds = Math.ceil((rateLimitStatus.waitTime || 0) / 1000);
                throw new Error(`Rate limit exceeded. Please wait ${waitSeconds} seconds before trying again. ` +
                    `Requests remaining: ${rateLimitStatus.remaining || 0}, Reset in: ${Math.ceil((rateLimitStatus.resetIn || 0) / 1000)}s`);
            }
            errorHandler_1.ErrorHandler.logDebug(`Rate limit status: ${rateLimitStatus.remaining}/${this.rateLimiter.getStatus().limit} requests remaining`, 'OpenAIClient');
            errorHandler_1.ErrorHandler.logInfo(`Sending request to OpenAI with model: ${this.config.model}`, 'OpenAIClient');
            const response = await this.client.chat.completions.create({
                model: this.config.model,
                messages: [
                    { role: 'system', content: template.systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                max_tokens: this.config.maxTokens,
                temperature: this.config.temperature
            });
            const enhancedText = response.choices[0]?.message?.content?.trim() || '';
            if (!enhancedText) {
                throw new Error('Empty response from OpenAI API');
            }
            const result = {
                enhancedText,
                tokensUsed: response.usage?.total_tokens || 0,
                model: response.model,
                processingTime: Date.now() - startTime
            };
            errorHandler_1.ErrorHandler.logInfo(`Enhancement completed in ${result.processingTime}ms, used ${result.tokensUsed} tokens`, 'OpenAIClient');
            return result;
        }
        catch (error) {
            errorHandler_1.ErrorHandler.logError(error, 'OpenAIClient');
            throw error;
        }
    }
    async testConnection() {
        if (!this.client) {
            return false;
        }
        try {
            errorHandler_1.ErrorHandler.logInfo('Testing OpenAI connection...', 'OpenAIClient');
            await this.client.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: 'Test' }],
                max_tokens: 5
            });
            errorHandler_1.ErrorHandler.logInfo('OpenAI connection test successful', 'OpenAIClient');
            return true;
        }
        catch (error) {
            errorHandler_1.ErrorHandler.logError(error, 'OpenAIClient');
            return false;
        }
    }
    /**
     * Fetch available models from OpenAI API
     * Requires API key to be configured
     */
    async listAvailableModels(forceRefresh = false) {
        // Check if API key is configured
        if (!this.client) {
            throw new Error('OpenAI client not initialized. API key required to fetch models.');
        }
        // Return cached models if still valid
        if (!forceRefresh && this.cachedModels && this.modelsCacheTimestamp) {
            const cacheAge = Date.now() - this.modelsCacheTimestamp;
            if (cacheAge < this.CACHE_DURATION_MS) {
                errorHandler_1.ErrorHandler.logInfo(`Returning ${this.cachedModels.length} cached models`, 'OpenAIClient');
                return this.cachedModels;
            }
        }
        try {
            errorHandler_1.ErrorHandler.logInfo('Fetching available models from OpenAI...', 'OpenAIClient');
            const modelsList = await this.client.models.list();
            // Filter to text-based completion models only
            // Exclude: embeddings, image generation (DALL-E), audio, moderation, etc.
            const models = modelsList.data
                .filter(model => {
                const id = model.id.toLowerCase();
                // Exclude non-text models
                // Embeddings
                if (id.includes('embedding') || id.includes('embed')) {
                    return false;
                }
                // Image generation (DALL-E)
                if (id.includes('dall-e') || id.includes('dalle') || id.includes('image')) {
                    return false;
                }
                // Audio models
                if (id.includes('whisper') || id.includes('tts') || id.includes('speech')) {
                    return false;
                }
                // Moderation models
                if (id.includes('moderation')) {
                    return false;
                }
                // Fine-tuning job specific models (internal)
                if (id.includes('ft:') || id.includes('fine-tune')) {
                    return false;
                }
                // Deprecated or legacy models that may cause issues
                if (id.includes('ada') || id.includes('babbage') || id.includes('curie')) {
                    return false;
                }
                // Include text completion/chat models
                // GPT-4 variants
                if (id.startsWith('gpt-4')) {
                    return true;
                }
                // GPT-3.5 variants
                if (id.startsWith('gpt-3.5')) {
                    return true;
                }
                // O1 reasoning models
                if (id.startsWith('o1') || id.startsWith('o3')) {
                    return true;
                }
                // O3 and future reasoning models
                if (id.match(/^o\d/)) {
                    return true;
                }
                // GPT-4.5 and future GPT versions
                if (id.match(/^gpt-\d/)) {
                    return true;
                }
                // Any model with 'chat' or 'completion' in the name
                if (id.includes('chat') || id.includes('completion') || id.includes('instruct')) {
                    return true;
                }
                return false;
            })
                .map(model => ({
                id: model.id,
                name: this.formatModelName(model.id),
                description: this.getModelDescription(model.id),
                ownedBy: model.owned_by
            }))
                .sort((a, b) => {
                // Sort by model capability (newer/better models first)
                const aPriority = this.getModelPriority(a.id);
                const bPriority = this.getModelPriority(b.id);
                return aPriority - bPriority;
            });
            // Cache the results
            this.cachedModels = models;
            this.modelsCacheTimestamp = Date.now();
            errorHandler_1.ErrorHandler.logInfo(`Found ${models.length} available text-based models`, 'OpenAIClient');
            return models;
        }
        catch (error) {
            errorHandler_1.ErrorHandler.logError(error, 'OpenAIClient.listAvailableModels');
            // Return fallback models if API call fails
            if (this.cachedModels) {
                errorHandler_1.ErrorHandler.logInfo('Returning cached models due to API error', 'OpenAIClient');
                return this.cachedModels;
            }
            throw new Error('Failed to fetch models from OpenAI. Please check your API key and internet connection.');
        }
    }
    /**
     * Get priority value for model sorting (lower = higher priority)
     */
    getModelPriority(modelId) {
        const id = modelId.toLowerCase();
        // Latest and most capable models first
        // GPT-5 and future GPT versions (highest priority)
        if (id.includes('gpt-5')) {
            return 1;
        }
        if (id.match(/gpt-5/)) {
            return 1;
        }
        // O-series reasoning models
        if (id.includes('o3')) {
            return 2;
        }
        if (id.includes('o1-preview')) {
            return 3;
        }
        if (id.includes('o1-mini')) {
            return 4;
        }
        if (id.includes('o1')) {
            return 5;
        }
        // GPT-4 variants
        if (id.includes('gpt-4o') && id.includes('mini')) {
            return 10;
        }
        if (id.includes('gpt-4o')) {
            return 11;
        }
        if (id.includes('gpt-4-turbo')) {
            return 12;
        }
        if (id.includes('gpt-4.5')) {
            return 13;
        }
        if (id.includes('gpt-4')) {
            return 14;
        }
        // GPT-3.5 variants
        if (id.includes('gpt-3.5-turbo')) {
            return 20;
        }
        if (id.includes('gpt-3.5')) {
            return 21;
        }
        // Future GPT versions (6, 7, etc.)
        if (id.match(/gpt-[6-9]/)) {
            return 30;
        }
        // Other chat/completion models
        if (id.includes('chat')) {
            return 40;
        }
        if (id.includes('instruct')) {
            return 41;
        }
        if (id.includes('completion')) {
            return 42;
        }
        return 99; // Unknown models at the end
    }
    /**
     * Get cached models without forcing a refresh
     */
    getCachedModels() {
        return this.cachedModels;
    }
    /**
     * Clear the models cache
     */
    clearModelsCache() {
        this.cachedModels = null;
        this.modelsCacheTimestamp = null;
    }
    /**
     * Format model ID into a human-readable name
     */
    formatModelName(modelId) {
        // Remove common prefixes and format
        const name = modelId
            .replace(/^gpt-?/i, 'GPT-')
            .replace(/^o1/i, 'O1')
            .replace(/-turbo$/i, '')
            .replace(/-\d{4}$/, '') // Remove date suffixes like -20240513
            .replace(/-/g, ' ');
        // Capitalize first letter of each word
        return name.replace(/\b\w/g, c => c.toUpperCase());
    }
    /**
     * Get a description for the model based on its ID
     */
    getModelDescription(modelId) {
        const id = modelId.toLowerCase();
        if (id.includes('o1-preview')) {
            return 'Reasoning model for complex tasks (slow, high quality)';
        }
        if (id.includes('o1-mini')) {
            return 'Faster reasoning model for technical tasks';
        }
        if (id.includes('gpt-4o') && id.includes('mini')) {
            return 'Fast and cost-effective (Recommended)';
        }
        if (id.includes('gpt-4o')) {
            return 'Most capable model (highest quality)';
        }
        if (id.includes('gpt-4')) {
            return 'Advanced capabilities';
        }
        if (id.includes('gpt-3.5')) {
            return 'Fast and affordable';
        }
        return 'OpenAI language model';
    }
    updateConfig(newConfig) {
        if (this.config) {
            this.config = { ...this.config, ...newConfig };
            if (newConfig.apiKey || newConfig.timeout) {
                // Reinitialize client if API key or timeout changed
                this.client = new openai_1.default({
                    apiKey: this.config.apiKey,
                    timeout: this.config.timeout
                });
            }
        }
    }
    getConfig() {
        return this.config;
    }
    isInitialized() {
        return this.client !== null && this.config !== null;
    }
}
exports.OpenAIClient = OpenAIClient;
//# sourceMappingURL=openaiClient.js.map