import OpenAI from 'openai';
import * as vscode from 'vscode';
import { OpenAIConfig, EnhancementRequest, EnhancementResult } from '../types/openai';
import { ENHANCEMENT_TEMPLATES } from '../templates/enhancementTemplates';
import { ErrorHandler } from '../utils/errorHandler';

export class OpenAIClient {
  private client: OpenAI | null = null;
  private config: OpenAIConfig | null = null;

  async initialize(apiKey: string): Promise<void> {
    const settings = vscode.workspace.getConfiguration('promptEnhancer');
    
    this.config = {
      apiKey,
      model: settings.get('model', 'gpt-4o-mini') as any,
      maxTokens: settings.get('maxTokens', 1000),
      temperature: settings.get('temperature', 0.7),
      timeout: settings.get('timeout', 30000)
    };

    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      timeout: this.config.timeout
    });
  }

  async enhancePrompt(request: EnhancementRequest): Promise<EnhancementResult> {
    if (!this.client || !this.config) {
      throw new Error('OpenAI client not initialized');
    }

    const template = ENHANCEMENT_TEMPLATES[request.template];
    let userPrompt = template.userPromptTemplate.replace('{originalText}', request.originalText);
    
    // Handle custom template
    if (request.template === 'custom') {
      const customTemplate = vscode.workspace.getConfiguration('promptEnhancer').get('customTemplate', '');
      if (customTemplate) {
        userPrompt = `${customTemplate}\n\nOriginal prompt: "${request.originalText}"\n\nEnhanced prompt:`;
      }
    }

    const startTime = Date.now();

    try {
      ErrorHandler.logInfo(`Sending request to OpenAI with model: ${this.config.model}`, 'OpenAIClient');
      
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

      const result: EnhancementResult = {
        enhancedText,
        tokensUsed: response.usage?.total_tokens || 0,
        model: response.model,
        processingTime: Date.now() - startTime
      };

      ErrorHandler.logInfo(`Enhancement completed in ${result.processingTime}ms, used ${result.tokensUsed} tokens`, 'OpenAIClient');
      
      return result;
    } catch (error) {
      ErrorHandler.logError(error, 'OpenAIClient');
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      ErrorHandler.logInfo('Testing OpenAI connection...', 'OpenAIClient');
      
      await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 5
      });
      
      ErrorHandler.logInfo('OpenAI connection test successful', 'OpenAIClient');
      return true;
    } catch (error) {
      ErrorHandler.logError(error, 'OpenAIClient');
      return false;
    }
  }

  updateConfig(newConfig: Partial<OpenAIConfig>): void {
    if (this.config) {
      this.config = { ...this.config, ...newConfig };
      
      if (newConfig.apiKey || newConfig.timeout) {
        // Reinitialize client if API key or timeout changed
        this.client = new OpenAI({
          apiKey: this.config.apiKey,
          timeout: this.config.timeout
        });
      }
    }
  }

  getConfig(): OpenAIConfig | null {
    return this.config;
  }

  isInitialized(): boolean {
    return this.client !== null && this.config !== null;
  }
}