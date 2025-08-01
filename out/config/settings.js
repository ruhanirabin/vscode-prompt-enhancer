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
exports.SettingsManager = void 0;
const vscode = __importStar(require("vscode"));
class SettingsManager {
    constructor(context) {
        this.context = context;
    }
    async getApiKey() {
        return await this.context.secrets.get(SettingsManager.API_KEY_SECRET);
    }
    async setApiKey(apiKey) {
        await this.context.secrets.store(SettingsManager.API_KEY_SECRET, apiKey);
    }
    async deleteApiKey() {
        await this.context.secrets.delete(SettingsManager.API_KEY_SECRET);
    }
    getSettings() {
        const config = vscode.workspace.getConfiguration('promptEnhancer');
        return {
            model: config.get('model', 'gpt-4o-mini'),
            timeout: config.get('timeout', 30000),
            defaultTemplate: config.get('defaultTemplate', 'general'),
            maxTokens: config.get('maxTokens', 1000),
            temperature: config.get('temperature', 0.7),
            customTemplate: config.get('customTemplate', 'Please enhance this prompt to make it more effective and detailed:')
        };
    }
    async updateApiKeyStatus(isConfigured) {
        const config = vscode.workspace.getConfiguration('promptEnhancer');
        const status = isConfigured ? 'configured' : 'not-configured';
        await config.update('apiKeyStatus', status, vscode.ConfigurationTarget.Global);
    }
    async getApiKeyStatus() {
        const config = vscode.workspace.getConfiguration('promptEnhancer');
        return config.get('apiKeyStatus', 'not-configured');
    }
    async promptForApiKey() {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your OpenAI API Key',
            password: true,
            ignoreFocusOut: true,
            validateInput: (value) => {
                const validation = this.validateApiKey(value);
                return validation.isValid ? null : validation.error;
            }
        });
        if (apiKey) {
            await this.setApiKey(apiKey.trim());
            await this.updateApiKeyStatus(true);
        }
        return apiKey?.trim();
    }
    validateApiKey(apiKey) {
        if (!apiKey || apiKey.trim().length === 0) {
            return {
                isValid: false,
                error: 'API Key cannot be empty'
            };
        }
        const trimmedKey = apiKey.trim();
        if (!trimmedKey.startsWith('sk-')) {
            return {
                isValid: false,
                error: 'Invalid API Key format. OpenAI API keys should start with "sk-"'
            };
        }
        if (trimmedKey.length < 20) {
            return {
                isValid: false,
                error: 'API Key appears to be too short'
            };
        }
        return {
            isValid: true
        };
    }
    async ensureApiKeyExists() {
        let apiKey = await this.getApiKey();
        if (!apiKey) {
            const action = await vscode.window.showInformationMessage('OpenAI API Key is required to use Prompt Enhancer', 'Configure API Key', 'Cancel');
            if (action === 'Configure API Key') {
                apiKey = await this.promptForApiKey();
            }
        }
        else {
            // Update status if key exists but status is not set correctly
            const currentStatus = await this.getApiKeyStatus();
            if (currentStatus === 'not-configured') {
                await this.updateApiKeyStatus(true);
            }
        }
        return apiKey;
    }
    async updateSetting(key, value) {
        const config = vscode.workspace.getConfiguration('promptEnhancer');
        await config.update(key, value, vscode.ConfigurationTarget.Global);
    }
    onSettingsChanged(callback) {
        return vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration('promptEnhancer')) {
                callback();
            }
        });
    }
}
exports.SettingsManager = SettingsManager;
SettingsManager.API_KEY_SECRET = 'promptEnhancer.apiKey';
//# sourceMappingURL=settings.js.map