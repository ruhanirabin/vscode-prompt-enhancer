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
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const vscode = __importStar(require("vscode"));
const enhancementTemplates_1 = require("../../templates/enhancementTemplates");
const textProcessor_1 = require("../../utils/textProcessor");
const errorHandler_1 = require("../../utils/errorHandler");
suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');
    test('Enhancement templates are loaded correctly', () => {
        assert.ok(enhancementTemplates_1.ENHANCEMENT_TEMPLATES.general);
        assert.ok(enhancementTemplates_1.ENHANCEMENT_TEMPLATES.technical);
        assert.ok(enhancementTemplates_1.ENHANCEMENT_TEMPLATES.creative);
        assert.ok(enhancementTemplates_1.ENHANCEMENT_TEMPLATES.comments);
        assert.ok(enhancementTemplates_1.ENHANCEMENT_TEMPLATES.custom);
        // Test template structure
        const generalTemplate = enhancementTemplates_1.ENHANCEMENT_TEMPLATES.general;
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
                getText: (_selection) => 'This is a test prompt for enhancement'
            }
        };
        const validationResult = textProcessor_1.TextProcessor.validateSelection(mockEditor);
        assert.strictEqual(validationResult, null); // Should be valid
    });
    test('Text validation catches empty selection', () => {
        const mockEditor = {
            selection: {
                isEmpty: true
            }
        };
        const validationResult = textProcessor_1.TextProcessor.validateSelection(mockEditor);
        assert.ok(validationResult); // Should return error message
        assert.ok(validationResult.includes('No text selected'));
    });
    test('Text validation catches too short text', () => {
        const mockEditor = {
            selection: {
                isEmpty: false
            },
            document: {
                getText: (_selection) => 'Hi'
            }
        };
        const validationResult = textProcessor_1.TextProcessor.validateSelection(mockEditor);
        assert.ok(validationResult); // Should return error message
        assert.ok(validationResult.includes('too short'));
    });
    test('Text validation catches too long text', () => {
        const mockEditor = {
            selection: {
                isEmpty: false
            },
            document: {
                getText: (_selection) => 'x'.repeat(10001)
            }
        };
        const validationResult = textProcessor_1.TextProcessor.validateSelection(mockEditor);
        assert.ok(validationResult); // Should return error message
        assert.ok(validationResult.includes('too long'));
    });
    test('Text sanitization works correctly', () => {
        const messyText = '  This   is\r\n\r\n\r\na   messy\t\ttext  ';
        const sanitized = textProcessor_1.TextProcessor.sanitizeText(messyText);
        assert.strictEqual(sanitized, 'This is\n\na messy text');
    });
    test('Text truncation works correctly', () => {
        const longText = 'This is a very long text that should be truncated';
        const truncated = textProcessor_1.TextProcessor.truncateText(longText, 20);
        assert.strictEqual(truncated, 'This is a very lo...');
        assert.ok(truncated.length <= 20);
    });
    test('Error parsing works correctly', () => {
        const apiKeyError = new Error('Invalid API key provided');
        const errorInfo = errorHandler_1.ErrorHandler.parseError(apiKeyError);
        assert.strictEqual(errorInfo.type, 'API_KEY_INVALID');
        assert.strictEqual(errorInfo.canRetry, false);
        assert.ok(errorInfo.suggestion);
    });
    test('Network error parsing works correctly', () => {
        const networkError = { code: 'ENOTFOUND', message: 'Network error' };
        const errorInfo = errorHandler_1.ErrorHandler.parseError(networkError);
        assert.strictEqual(errorInfo.type, 'NETWORK_ERROR');
        assert.strictEqual(errorInfo.canRetry, true);
    });
    test('Template user prompt replacement works', () => {
        const template = enhancementTemplates_1.ENHANCEMENT_TEMPLATES.general;
        const originalText = 'Write a function';
        const userPrompt = template.userPromptTemplate.replace('{originalText}', originalText);
        assert.ok(userPrompt.includes(originalText));
        assert.ok(!userPrompt.includes('{originalText}'));
    });
});
//# sourceMappingURL=extension.test.js.map