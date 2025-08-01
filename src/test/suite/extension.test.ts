import * as assert from 'assert';
import * as vscode from 'vscode';
import { ENHANCEMENT_TEMPLATES } from '../../templates/enhancementTemplates';
import { TextProcessor } from '../../utils/textProcessor';
import { ErrorHandler } from '../../utils/errorHandler';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Enhancement templates are loaded correctly', () => {
    assert.ok(ENHANCEMENT_TEMPLATES.general);
    assert.ok(ENHANCEMENT_TEMPLATES.technical);
    assert.ok(ENHANCEMENT_TEMPLATES.creative);
    assert.ok(ENHANCEMENT_TEMPLATES.comments);
    assert.ok(ENHANCEMENT_TEMPLATES.custom);

    // Test template structure
    const generalTemplate = ENHANCEMENT_TEMPLATES.general;
    assert.ok(generalTemplate.name);
    assert.ok(generalTemplate.description);
    assert.ok(generalTemplate.systemPrompt);
    assert.ok(generalTemplate.userPromptTemplate);
  });

  test('Text validation works correctly', () => {
    // Mock editor for testing
    const mockEditor = {
      selection: {
        isEmpty: false
      },
      document: {
        getText: (_selection: any) => 'This is a test prompt for enhancement'
      }
    } as any;

    const validationResult = TextProcessor.validateSelection(mockEditor);
    assert.strictEqual(validationResult, null); // Should be valid
  });

  test('Text validation catches empty selection', () => {
    const mockEditor = {
      selection: {
        isEmpty: true
      }
    } as any;

    const validationResult = TextProcessor.validateSelection(mockEditor);
    assert.ok(validationResult); // Should return error message
    assert.ok(validationResult.includes('No text selected'));
  });

  test('Text validation catches too short text', () => {
    const mockEditor = {
      selection: {
        isEmpty: false
      },
      document: {
        getText: (_selection: any) => 'Hi'
      }
    } as any;

    const validationResult = TextProcessor.validateSelection(mockEditor);
    assert.ok(validationResult); // Should return error message
    assert.ok(validationResult.includes('too short'));
  });

  test('Text validation catches too long text', () => {
    const mockEditor = {
      selection: {
        isEmpty: false
      },
      document: {
        getText: (_selection: any) => 'x'.repeat(10001)
      }
    } as any;

    const validationResult = TextProcessor.validateSelection(mockEditor);
    assert.ok(validationResult); // Should return error message
    assert.ok(validationResult.includes('too long'));
  });

  test('Text sanitization works correctly', () => {
    const messyText = '  This   is\r\n\r\n\r\na   messy\t\ttext  ';
    const sanitized = TextProcessor.sanitizeText(messyText);
    
    assert.strictEqual(sanitized, 'This is\n\na messy text');
  });

  test('Text truncation works correctly', () => {
    const longText = 'This is a very long text that should be truncated';
    const truncated = TextProcessor.truncateText(longText, 20);
    
    assert.strictEqual(truncated, 'This is a very lo...');
    assert.ok(truncated.length <= 20);
  });

  test('Error parsing works correctly', () => {
    const apiKeyError = new Error('Invalid API key provided');
    const errorInfo = ErrorHandler.parseError(apiKeyError);
    
    assert.strictEqual(errorInfo.type, 'API_KEY_INVALID');
    assert.strictEqual(errorInfo.canRetry, false);
    assert.ok(errorInfo.suggestion);
  });

  test('Network error parsing works correctly', () => {
    const networkError = { code: 'ENOTFOUND', message: 'Network error' };
    const errorInfo = ErrorHandler.parseError(networkError);
    
    assert.strictEqual(errorInfo.type, 'NETWORK_ERROR');
    assert.strictEqual(errorInfo.canRetry, true);
  });

  test('Template user prompt replacement works', () => {
    const template = ENHANCEMENT_TEMPLATES.general;
    const originalText = 'Write a function';
    const userPrompt = template.userPromptTemplate.replace('{originalText}', originalText);
    
    assert.ok(userPrompt.includes(originalText));
    assert.ok(!userPrompt.includes('{originalText}'));
  });
});