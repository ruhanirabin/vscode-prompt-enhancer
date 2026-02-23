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
exports.SavePromptService = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const errorHandler_1 = require("../utils/errorHandler");
class SavePromptService {
    constructor(context) {
        this.context = context;
    }
    /**
     * Save a prompt to a file
     */
    async savePrompt(originalText, enhancedText, model, template, filename) {
        try {
            // Get save directory from settings or use workspace root
            const config = vscode.workspace.getConfiguration('promptEnhancer');
            const saveDir = config.get('savePromptDirectory', '');
            let directory;
            if (saveDir && path.isAbsolute(saveDir)) {
                directory = saveDir;
            }
            else if (saveDir && vscode.workspace.workspaceFolders) {
                directory = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, saveDir);
            }
            else if (vscode.workspace.workspaceFolders) {
                directory = vscode.workspace.workspaceFolders[0].uri.fsPath;
            }
            else {
                // No workspace - prompt user for location
                const selectedUri = await vscode.window.showSaveDialog({
                    defaultUri: vscode.Uri.file(`prompt-${Date.now()}.md`),
                    filters: {
                        'Markdown': ['md'],
                        'Text': ['txt']
                    }
                });
                if (!selectedUri) {
                    return null; // User cancelled
                }
                directory = path.dirname(selectedUri.fsPath);
            }
            // Ensure directory exists
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
            }
            // Generate filename if not provided
            const safeFilename = filename || this.generateFilename(originalText);
            const filePath = path.join(directory, safeFilename);
            // Create markdown content
            const markdownContent = this.createMarkdownContent(originalText, enhancedText, model, template);
            // Write to file
            fs.writeFileSync(filePath, markdownContent, 'utf8');
            // Record in saved prompts list
            await this.recordSavedPrompt({
                id: this.generateId(),
                timestamp: Date.now(),
                originalText,
                enhancedText,
                model,
                template,
                filePath
            });
            errorHandler_1.ErrorHandler.logInfo(`Prompt saved to: ${filePath}`, 'SavePromptService');
            return filePath;
        }
        catch (error) {
            errorHandler_1.ErrorHandler.logError(error, 'SavePromptService.savePrompt');
            throw new Error('Failed to save prompt to file');
        }
    }
    /**
     * Create markdown content for saved prompt
     */
    createMarkdownContent(originalText, enhancedText, model, template) {
        const timestamp = new Date().toISOString();
        return `# Enhanced Prompt

**Generated:** ${timestamp}  
**Model:** ${model}  
**Template:** ${template}

---

## Original Prompt

\`\`\`
${originalText}
\`\`\`

---

## Enhanced Prompt

\`\`\`
${enhancedText}
\`\`\`

---

*Saved by Prompt Enhancer Extension*
`;
    }
    /**
     * Generate a safe filename from prompt text
     */
    generateFilename(text) {
        const timestamp = Date.now();
        // Use first 50 chars of text, sanitized
        const safeText = text
            .substring(0, 50)
            .replace(/[^a-zA-Z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .toLowerCase();
        return `prompt-${safeText}-${timestamp}.md`;
    }
    /**
     * Record a saved prompt in the registry
     */
    async recordSavedPrompt(savedPrompt) {
        try {
            const savedPrompts = this.context.globalState.get(SavePromptService.SAVED_PROMPTS_KEY, []);
            savedPrompts.unshift(savedPrompt);
            // Keep last 100 saved prompts
            while (savedPrompts.length > 100) {
                savedPrompts.pop();
            }
            await this.context.globalState.update(SavePromptService.SAVED_PROMPTS_KEY, savedPrompts);
        }
        catch (error) {
            errorHandler_1.ErrorHandler.logError(error, 'SavePromptService.recordSavedPrompt');
        }
    }
    /**
     * Get list of saved prompts
     */
    async getSavedPrompts() {
        try {
            return this.context.globalState.get(SavePromptService.SAVED_PROMPTS_KEY, []);
        }
        catch (error) {
            errorHandler_1.ErrorHandler.logError(error, 'SavePromptService.getSavedPrompts');
            return [];
        }
    }
    /**
     * Delete a saved prompt record
     */
    async deleteSavedPrompt(id) {
        try {
            const savedPrompts = await this.getSavedPrompts();
            const filtered = savedPrompts.filter(p => p.id !== id);
            if (filtered.length === savedPrompts.length) {
                return false; // Not found
            }
            await this.context.globalState.update(SavePromptService.SAVED_PROMPTS_KEY, filtered);
            return true;
        }
        catch (error) {
            errorHandler_1.ErrorHandler.logError(error, 'SavePromptService.deleteSavedPrompt');
            return false;
        }
    }
    /**
     * Open a saved prompt file
     */
    async openSavedPrompt(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error('File not found');
            }
            const uri = vscode.Uri.file(filePath);
            await vscode.window.showTextDocument(uri);
        }
        catch (error) {
            errorHandler_1.ErrorHandler.logError(error, 'SavePromptService.openSavedPrompt');
            throw new Error('Failed to open saved prompt');
        }
    }
    /**
     * Delete the actual file
     */
    async deleteFile(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                return true;
            }
            return false;
        }
        catch (error) {
            errorHandler_1.ErrorHandler.logError(error, 'SavePromptService.deleteFile');
            return false;
        }
    }
    /**
     * Generate unique ID
     */
    generateId() {
        return `saved_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    }
}
exports.SavePromptService = SavePromptService;
SavePromptService.SAVED_PROMPTS_KEY = 'promptEnhancer.savedPrompts';
//# sourceMappingURL=savePromptService.js.map