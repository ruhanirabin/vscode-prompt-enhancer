# VSCode Prompt Enhancer Extension - Technical Specification

## Project Configuration

### Dependencies

#### Production Dependencies
```json
{
  "openai": "^4.28.0",
  "axios": "^1.6.0"
}
```

#### Development Dependencies
```json
{
  "@types/vscode": "^1.85.0",
  "@types/node": "18.x",
  "@typescript-eslint/eslint-plugin": "^6.15.0",
  "@typescript-eslint/parser": "^6.15.0",
  "eslint": "^8.56.0",
  "typescript": "^5.3.3",
  "webpack": "^5.89.0",
  "webpack-cli": "^5.1.4",
  "ts-loader": "^9.5.1",
  "@vscode/test-electron": "^2.3.8",
  "mocha": "^10.2.0",
  "@types/mocha": "^10.0.6"
}
```

### VSCode Engine Compatibility
- Minimum VSCode version: `^1.85.0`
- Node.js version: `>=18.0.0`

## Core Components Implementation

### 1. Extension Manifest (package.json)

```json
{
  "name": "prompt-enhancer",
  "displayName": "Prompt Enhancer",
  "description": "Transform basic prompts into sophisticated, detailed prompts using OpenAI's API",
  "version": "1.0.0",
  "publisher": "your-publisher-name",
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": ["Other", "Machine Learning"],
  "keywords": ["prompt", "ai", "openai", "enhancement", "writing"],
  "activationEvents": [
    "onCommand:promptEnhancer.enhance"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "promptEnhancer.enhance",
        "title": "Enhance Prompt",
        "category": "Prompt Enhancer"
      },
      {
        "command": "promptEnhancer.configureApiKey",
        "title": "Configure API Key",
        "category": "Prompt Enhancer"
      }
    ],
    "keybindings": [
      {
        "command": "promptEnhancer.enhance",
        "key": "ctrl+shift+e",
        "mac": "cmd+shift+e",
        "when": "editorHasSelection"
      }
    ],
    "configuration": {
      "title": "Prompt Enhancer",
      "properties": {
        "promptEnhancer.model": {
          "type": "string",
          "enum": ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"],
          "default": "gpt-4o-mini",
          "description": "OpenAI model to use for prompt enhancement"
        },
        "promptEnhancer.timeout": {
          "type": "number",
          "default": 30000,
          "minimum": 5000,
          "maximum": 120000,
          "description": "API request timeout in milliseconds"
        },
        "promptEnhancer.defaultTemplate": {
          "type": "string",
          "enum": ["general", "technical", "creative", "comments", "custom"],
          "default": "general",
          "description": "Default enhancement template to use"
        },
        "promptEnhancer.maxTokens": {
          "type": "number",
          "default": 1000,
          "minimum": 100,
          "maximum": 4000,
          "description": "Maximum tokens for API response"
        },
        "promptEnhancer.temperature": {
          "type": "number",
          "default": 0.7,
          "minimum": 0,
          "maximum": 2,
          "description": "Creativity level (0 = focused, 2 = very creative)"
        }
      }
    }
  }
}
```

### 2. TypeScript Interfaces and Types

#### OpenAI API Types
```typescript
// src/types/openai.ts
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
```

#### Extension Types
```typescript
// src/types/extension.ts
export type EnhancementTemplate = 'general' | 'technical' | 'creative' | 'comments' | 'custom';

export type OutputAction = 'replace' | 'insertBelow' | 'insertAbove' | 'copyToClipboard';

export interface ExtensionSettings {
  model: string;
  timeout: number;
  defaultTemplate: EnhancementTemplate;
  maxTokens: number;
  temperature: number;
}

export interface QuickPickItem extends vscode.QuickPickItem {
  action: OutputAction;
}

export interface EnhancementContext {
  editor: vscode.TextEditor;
  selection: vscode.Selection;
  selectedText: string;
  document: vscode.TextDocument;
}
```

### 3. Enhancement Templates System

```typescript
// src/templates/enhancementTemplates.ts
export interface TemplateDefinition {
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
}

export const ENHANCEMENT_TEMPLATES: Record<EnhancementTemplate, TemplateDefinition> = {
  general: {
    name: "General Enhancement",
    description: "Improve clarity, structure, and effectiveness",
    systemPrompt: `You are an expert prompt engineer. Your task is to transform basic prompts into sophisticated, detailed, and effective prompts while preserving the original intent.

Guidelines:
- Make the prompt more specific and actionable
- Add relevant context and constraints
- Improve clarity and structure
- Maintain the original purpose and tone
- Add examples if helpful
- Ensure the enhanced prompt is self-contained`,
    userPromptTemplate: `Please enhance this prompt to make it more effective and detailed:

Original prompt: "{originalText}"

Enhanced prompt:`
  },
  
  technical: {
    name: "Technical Coding Prompts",
    description: "Optimize for code generation and technical tasks",
    systemPrompt: `You are an expert software engineer and prompt engineer. Transform basic technical prompts into comprehensive, detailed prompts that will generate better code and technical solutions.

Guidelines:
- Specify programming languages, frameworks, and versions
- Include requirements, constraints, and best practices
- Add error handling and edge case considerations
- Specify code style and documentation requirements
- Include testing requirements if applicable
- Make requirements clear and unambiguous`,
    userPromptTemplate: `Please enhance this technical prompt for better code generation:

Original prompt: "{originalText}"

Enhanced technical prompt:`
  },
  
  creative: {
    name: "Creative Writing",
    description: "Enhance for creative and narrative tasks",
    systemPrompt: `You are an expert creative writing coach and prompt engineer. Transform basic creative prompts into rich, detailed prompts that inspire better creative output.

Guidelines:
- Add sensory details and atmosphere
- Specify tone, style, and genre
- Include character development hints
- Add setting and context details
- Suggest narrative structure
- Encourage specific creative techniques`,
    userPromptTemplate: `Please enhance this creative writing prompt:

Original prompt: "{originalText}"

Enhanced creative prompt:`
  },
  
  comments: {
    name: "Code Comments",
    description: "Transform code snippets into well-documented code",
    systemPrompt: `You are an expert software engineer focused on code documentation. Transform basic code or code-related prompts into comprehensive documentation requests.

Guidelines:
- Request clear, concise comments
- Specify documentation standards
- Include function/method descriptions
- Add parameter and return value documentation
- Request examples where helpful
- Ensure maintainability focus`,
    userPromptTemplate: `Please enhance this code documentation prompt:

Original prompt: "{originalText}"

Enhanced documentation prompt:`
  },
  
  custom: {
    name: "Custom Template",
    description: "User-defined enhancement template",
    systemPrompt: `You are an expert prompt engineer. Enhance the given prompt according to the user's custom requirements while maintaining clarity and effectiveness.`,
    userPromptTemplate: `Please enhance this prompt:

Original prompt: "{originalText}"

Enhanced prompt:`
  }
};
```

### 4. OpenAI API Client Implementation

```typescript
// src/services/openaiClient.ts
import OpenAI from 'openai';
import * as vscode from 'vscode';
import { OpenAIConfig, EnhancementRequest, EnhancementResult } from '../types/openai';
import { ENHANCEMENT_TEMPLATES } from '../templates/enhancementTemplates';

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
    const userPrompt = template.userPromptTemplate.replace('{originalText}', request.originalText);

    const startTime = Date.now();

    try {
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

      return {
        enhancedText,
        tokensUsed: response.usage?.total_tokens || 0,
        model: response.model,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OpenAI API Error: ${error.message}`);
      }
      throw new Error('Unknown error occurred while calling OpenAI API');
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 5
      });
      return true;
    } catch {
      return false;
    }
  }
}
```

### 5. Settings and Security Management

```typescript
// src/config/settings.ts
import * as vscode from 'vscode';

export class SettingsManager {
  private static readonly API_KEY_SECRET = 'promptEnhancer.apiKey';
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  async getApiKey(): Promise<string | undefined> {
    return await this.context.secrets.get(SettingsManager.API_KEY_SECRET);
  }

  async setApiKey(apiKey: string): Promise<void> {
    await this.context.secrets.store(SettingsManager.API_KEY_SECRET, apiKey);
  }

  async deleteApiKey(): Promise<void> {
    await this.context.secrets.delete(SettingsManager.API_KEY_SECRET);
  }

  getSettings(): ExtensionSettings {
    const config = vscode.workspace.getConfiguration('promptEnhancer');
    return {
      model: config.get('model', 'gpt-4o-mini'),
      timeout: config.get('timeout', 30000),
      defaultTemplate: config.get('defaultTemplate', 'general'),
      maxTokens: config.get('maxTokens', 1000),
      temperature: config.get('temperature', 0.7)
    };
  }

  async promptForApiKey(): Promise<string | undefined> {
    const apiKey = await vscode.window.showInputBox({
      prompt: 'Enter your OpenAI API Key',
      password: true,
      ignoreFocusOut: true,
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'API Key cannot be empty';
        }
        if (!value.startsWith('sk-')) {
          return 'Invalid API Key format';
        }
        return null;
      }
    });

    if (apiKey) {
      await this.setApiKey(apiKey.trim());
    }

    return apiKey?.trim();
  }
}
```

### 6. Error Handling Strategy

```typescript
// src/utils/errorHandler.ts
import * as vscode from 'vscode';

export enum ErrorType {
  API_KEY_MISSING = 'API_KEY_MISSING',
  API_KEY_INVALID = 'API_KEY_INVALID',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ErrorInfo {
  type: ErrorType;
  message: string;
  suggestion?: string;
  canRetry: boolean;
}

export class ErrorHandler {
  static parseError(error: any): ErrorInfo {
    if (error.message?.includes('API key')) {
      return {
        type: ErrorType.API_KEY_INVALID,
        message: 'Invalid API key provided',
        suggestion: 'Please check your OpenAI API key in settings',
        canRetry: false
      };
    }

    if (error.message?.includes('timeout')) {
      return {
        type: ErrorType.TIMEOUT_ERROR,
        message: 'Request timed out',
        suggestion: 'Try increasing the timeout in settings or check your internet connection',
        canRetry: true
      };
    }

    if (error.message?.includes('quota')) {
      return {
        type: ErrorType.QUOTA_EXCEEDED,
        message: 'API quota exceeded',
        suggestion: 'Check your OpenAI account usage and billing',
        canRetry: false
      };
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return {
        type: ErrorType.NETWORK_ERROR,
        message: 'Network connection failed',
        suggestion: 'Check your internet connection and try again',
        canRetry: true
      };
    }

    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: error.message || 'An unknown error occurred',
      suggestion: 'Please try again or contact support if the issue persists',
      canRetry: true
    };
  }

  static async showError(errorInfo: ErrorInfo): Promise<string | undefined> {
    const actions: string[] = [];
    
    if (errorInfo.canRetry) {
      actions.push('Retry');
    }
    
    if (errorInfo.type === ErrorType.API_KEY_MISSING || errorInfo.type === ErrorType.API_KEY_INVALID) {
      actions.push('Configure API Key');
    }
    
    actions.push('Cancel');

    const message = errorInfo.suggestion 
      ? `${errorInfo.message}\n\n${errorInfo.suggestion}`
      : errorInfo.message;

    return await vscode.window.showErrorMessage(message, ...actions);
  }
}
```

## Performance and Optimization

### Memory Management
- Lazy loading of templates and configurations
- Proper disposal of resources in `deactivate()`
- Efficient text processing with minimal copying

### API Optimization
- Request debouncing for rapid successive calls
- Caching of frequently used templates
- Optimized payload sizes

### Bundle Optimization
- Webpack configuration for minimal bundle size
- Tree shaking for unused dependencies
- Source map generation for debugging

## Testing Strategy

### Unit Test Structure
```typescript
// src/test/suite/extension.test.ts
import * as assert from 'assert';
import * as vscode from 'vscode';
import { OpenAIClient } from '../../services/openaiClient';
import { ENHANCEMENT_TEMPLATES } from '../../templates/enhancementTemplates';

suite('Extension Test Suite', () => {
  test('Template loading', () => {
    assert.ok(ENHANCEMENT_TEMPLATES.general);
    assert.ok(ENHANCEMENT_TEMPLATES.technical);
    assert.ok(ENHANCEMENT_TEMPLATES.creative);
    assert.ok(ENHANCEMENT_TEMPLATES.comments);
  });

  test('OpenAI Client initialization', async () => {
    const client = new OpenAIClient();
    // Mock API key for testing
    await client.initialize('sk-test-key');
    assert.ok(client);
  });
});
```

This technical specification provides the detailed implementation roadmap for building the VSCode Prompt Enhancer extension. Each component is designed with proper TypeScript typing, error handling, and VSCode best practices in mind.