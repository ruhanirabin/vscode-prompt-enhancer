import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ErrorHandler } from '../utils/errorHandler';

export interface SavedPrompt {
  id: string;
  timestamp: number;
  originalText: string;
  enhancedText: string;
  model: string;
  template: string;
  filePath: string;
}

export class SavePromptService {
  private static readonly SAVED_PROMPTS_KEY = 'promptEnhancer.savedPrompts';
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  /**
   * Save a prompt to a file
   */
  async savePrompt(
    originalText: string,
    enhancedText: string,
    model: string,
    template: string,
    filename?: string
  ): Promise<string | null> {
    try {
      // Get save directory from settings or use workspace root
      const config = vscode.workspace.getConfiguration('promptEnhancer');
      const saveDir = config.get('savePromptDirectory', '');
      
      let directory: string;
      if (saveDir && path.isAbsolute(saveDir)) {
        directory = saveDir;
      } else if (saveDir && vscode.workspace.workspaceFolders) {
        directory = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, saveDir);
      } else if (vscode.workspace.workspaceFolders) {
        directory = vscode.workspace.workspaceFolders[0].uri.fsPath;
      } else {
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

      ErrorHandler.logInfo(`Prompt saved to: ${filePath}`, 'SavePromptService');
      return filePath;
    } catch (error) {
      ErrorHandler.logError(error, 'SavePromptService.savePrompt');
      throw new Error('Failed to save prompt to file');
    }
  }

  /**
   * Create markdown content for saved prompt
   */
  private createMarkdownContent(
    originalText: string,
    enhancedText: string,
    model: string,
    template: string
  ): string {
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
  private generateFilename(text: string): string {
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
  private async recordSavedPrompt(savedPrompt: SavedPrompt): Promise<void> {
    try {
      const savedPrompts = this.context.globalState.get<SavedPrompt[]>(
        SavePromptService.SAVED_PROMPTS_KEY,
        []
      );
      
      savedPrompts.unshift(savedPrompt);
      
      // Keep last 100 saved prompts
      while (savedPrompts.length > 100) {
        savedPrompts.pop();
      }
      
      await this.context.globalState.update(
        SavePromptService.SAVED_PROMPTS_KEY,
        savedPrompts
      );
    } catch (error) {
      ErrorHandler.logError(error, 'SavePromptService.recordSavedPrompt');
    }
  }

  /**
   * Get list of saved prompts
   */
  async getSavedPrompts(): Promise<SavedPrompt[]> {
    try {
      return this.context.globalState.get<SavedPrompt[]>(
        SavePromptService.SAVED_PROMPTS_KEY,
        []
      );
    } catch (error) {
      ErrorHandler.logError(error, 'SavePromptService.getSavedPrompts');
      return [];
    }
  }

  /**
   * Delete a saved prompt record
   */
  async deleteSavedPrompt(id: string): Promise<boolean> {
    try {
      const savedPrompts = await this.getSavedPrompts();
      const filtered = savedPrompts.filter(p => p.id !== id);
      
      if (filtered.length === savedPrompts.length) {
        return false; // Not found
      }
      
      await this.context.globalState.update(
        SavePromptService.SAVED_PROMPTS_KEY,
        filtered
      );
      
      return true;
    } catch (error) {
      ErrorHandler.logError(error, 'SavePromptService.deleteSavedPrompt');
      return false;
    }
  }

  /**
   * Open a saved prompt file
   */
  async openSavedPrompt(filePath: string): Promise<void> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
      }
      
      const uri = vscode.Uri.file(filePath);
      await vscode.window.showTextDocument(uri);
    } catch (error) {
      ErrorHandler.logError(error, 'SavePromptService.openSavedPrompt');
      throw new Error('Failed to open saved prompt');
    }
  }

  /**
   * Delete the actual file
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      ErrorHandler.logError(error, 'SavePromptService.deleteFile');
      return false;
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `saved_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
  }
}
