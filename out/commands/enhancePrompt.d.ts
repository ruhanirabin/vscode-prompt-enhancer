import { OpenAIClient } from '../services/openaiClient';
import { SettingsManager } from '../config/settings';
import { TemplateRegistry } from '../templates/templateRegistry';
export declare class EnhancePromptCommand {
    private openaiClient;
    private settingsManager;
    private templateRegistry;
    constructor(openaiClient: OpenAIClient, settingsManager: SettingsManager, templateRegistry: TemplateRegistry);
    execute(): Promise<void>;
    private enhancePromptWithRetry;
    private showSettingsQuickPick;
}
//# sourceMappingURL=enhancePrompt.d.ts.map