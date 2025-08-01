// OpenAI API Types
export interface OpenAIConfig {
  apiKey: string;
  model: 'gpt-4o-mini' | 'gpt-4o' | 'gpt-3.5-turbo';
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
  template: EnhancementTemplate;
  context?: string;
}

export interface EnhancementResult {
  enhancedText: string;
  tokensUsed: number;
  model: string;
  processingTime: number;
}

export type EnhancementTemplate = 'general' | 'technical' | 'creative' | 'comments' | 'custom';