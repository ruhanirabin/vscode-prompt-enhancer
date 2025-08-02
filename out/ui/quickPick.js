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
exports.QuickPickManager = void 0;
const vscode = __importStar(require("vscode"));
const enhancementTemplates_1 = require("../templates/enhancementTemplates");
class QuickPickManager {
    static async showTemplateSelector(defaultTemplate) {
        const items = Object.entries(enhancementTemplates_1.ENHANCEMENT_TEMPLATES).map(([key, template]) => ({
            label: template.name,
            description: template.description,
            template: key,
            picked: key === defaultTemplate
        }));
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select enhancement template',
            ignoreFocusOut: true,
            matchOnDescription: true
        });
        return selected?.template;
    }
    static async showOutputActionSelector() {
        const items = [
            {
                label: '$(replace) Replace Selected Text',
                description: 'Replace the selected text with the enhanced prompt',
                action: 'replace'
            },
            {
                label: '$(add) Insert Below',
                description: 'Insert the enhanced prompt below the selected text',
                action: 'insertBelow'
            },
            {
                label: '$(add) Insert Above',
                description: 'Insert the enhanced prompt above the selected text',
                action: 'insertAbove'
            },
            {
                label: '$(clippy) Copy to Clipboard',
                description: 'Copy the enhanced prompt to clipboard',
                action: 'copyToClipboard'
            }
        ];
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'What would you like to do with the enhanced prompt?',
            ignoreFocusOut: true,
            matchOnDescription: true
        });
        return selected?.action;
    }
    static async showClipboardOutputActionSelector() {
        const items = [
            {
                label: '$(clippy) Copy to Clipboard',
                description: 'Copy the enhanced prompt to clipboard (recommended for clipboard-based enhancement)',
                action: 'copyToClipboard'
            }
        ];
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Enhanced text will be copied to clipboard',
            ignoreFocusOut: true,
            matchOnDescription: true
        });
        return selected?.action || 'copyToClipboard'; // Default to clipboard for clipboard-based contexts
    }
    static async showModelSelector(currentModel) {
        const models = [
            {
                label: 'GPT-4o-mini',
                description: 'Fast and cost-effective (Recommended)',
                detail: 'Best balance of speed, quality, and cost',
                value: 'gpt-4o-mini'
            },
            {
                label: 'GPT-4o',
                description: 'Most capable model',
                detail: 'Highest quality but more expensive',
                value: 'gpt-4o'
            },
            {
                label: 'GPT-3.5-turbo',
                description: 'Fast and affordable',
                detail: 'Good for simple enhancements',
                value: 'gpt-3.5-turbo'
            }
        ];
        const items = models.map(model => ({
            label: model.label,
            description: model.description,
            detail: model.detail,
            picked: model.value === currentModel
        }));
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select OpenAI model',
            ignoreFocusOut: true,
            matchOnDescription: true,
            matchOnDetail: true
        });
        if (selected) {
            const model = models.find(m => m.label === selected.label);
            return model?.value;
        }
        return undefined;
    }
    static async showRetryOptions() {
        const items = [
            {
                label: '$(sync) Retry',
                description: 'Try the request again'
            },
            {
                label: '$(gear) Change Settings',
                description: 'Modify timeout, model, or other settings'
            },
            {
                label: '$(key) Configure API Key',
                description: 'Update your OpenAI API key'
            },
            {
                label: '$(x) Cancel',
                description: 'Cancel the operation'
            }
        ];
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'What would you like to do?',
            ignoreFocusOut: true
        });
        return selected?.label.split(' ')[1]; // Extract the action (Retry, Change, Configure, Cancel)
    }
    static async confirmAction(message, confirmText = 'Yes', cancelText = 'No') {
        const result = await vscode.window.showQuickPick([confirmText, cancelText], {
            placeHolder: message,
            ignoreFocusOut: true
        });
        return result === confirmText;
    }
}
exports.QuickPickManager = QuickPickManager;
//# sourceMappingURL=quickPick.js.map