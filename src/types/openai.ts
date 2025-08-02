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
  template: string; // Changed from EnhancementTemplate to string for dynamic templates
  context?: string;
}

export interface EnhancementResult {
  enhancedText: string;
  tokensUsed: number;
  model: string;
  processingTime: number;
}

// Keep for backward compatibility
export type EnhancementTemplate = 'general' | 'technical' | 'creative' | 'comments' | 'custom';

// New interface for dynamic template definitions (re-export from templateStorage)
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