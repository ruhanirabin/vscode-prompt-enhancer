import * as vscode from 'vscode';
import { OpenAIClient } from './services/openaiClient';
import { SettingsManager } from './config/settings';
import { EnhancePromptCommand } from './commands/enhancePrompt';
import { TemplateManagerCommand } from './commands/templateManager';
import { TemplateRegistry } from './templates/templateRegistry';
declare let openaiClient: OpenAIClient;
declare let settingsManager: SettingsManager;
declare let enhancePromptCommand: EnhancePromptCommand;
declare let templateManagerCommand: TemplateManagerCommand;
declare let templateRegistry: TemplateRegistry;
export declare function activate(context: vscode.ExtensionContext): Promise<void>;
export declare function deactivate(): void;
export { openaiClient, settingsManager, enhancePromptCommand, templateRegistry, templateManagerCommand };
//# sourceMappingURL=extension.d.ts.map