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
class OpenAIClient {
    constructor(templateRegistry) {
        this.client = null;
        this.config = null;
        this.templateRegistry = templateRegistry;
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