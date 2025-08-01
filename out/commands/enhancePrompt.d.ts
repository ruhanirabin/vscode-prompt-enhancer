import { OpenAIClient } from '../services/openaiClient';
import { SettingsManager } from '../config/settings';
export declare class EnhancePromptCommand {
    private openaiClient;
    private settingsManager;
    constructor(openaiClient: OpenAIClient, settingsManager: SettingsManager);
    execute(): Promise<void>;
    private enhancePromptWithRetry;
    private showSettingsQuickPick;
}
//# sourceMappingURL=enhancePrompt.d.ts.map