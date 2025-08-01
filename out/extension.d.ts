import * as vscode from 'vscode';
import { OpenAIClient } from './services/openaiClient';
import { SettingsManager } from './config/settings';
import { EnhancePromptCommand } from './commands/enhancePrompt';
declare let openaiClient: OpenAIClient;
declare let settingsManager: SettingsManager;
declare let enhancePromptCommand: EnhancePromptCommand;
export declare function activate(context: vscode.ExtensionContext): void;
export declare function deactivate(): void;
export { openaiClient, settingsManager, enhancePromptCommand };
//# sourceMappingURL=extension.d.ts.map