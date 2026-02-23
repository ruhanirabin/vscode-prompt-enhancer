import { OpenAIClient } from '../services/openaiClient';
import { SettingsManager } from '../config/settings';
import { TemplateRegistry } from '../templates/templateRegistry';
import { PromptHistoryService } from '../services/promptHistory';
export declare class EnhancePromptCommand {
    private openaiClient;
    private settingsManager;
    private templateRegistry;
    private promptHistoryService;
    constructor(openaiClient: OpenAIClient, settingsManager: SettingsManager, templateRegistry: TemplateRegistry, promptHistoryService: PromptHistoryService);
    /**
     * Execute the enhancement command
     * @param useFullEditorText If true, use entire editor text instead of selection
     */
    execute(useFullEditorText?: boolean): Promise<void>;
    private enhancePromptWithRetry;
    private showSettingsQuickPick;
}
//# sourceMappingURL=enhancePrompt.d.ts.map