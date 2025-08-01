import { OutputAction } from '../types/extension';
import { EnhancementTemplate } from '../types/openai';
export declare class QuickPickManager {
    static showTemplateSelector(defaultTemplate?: EnhancementTemplate): Promise<EnhancementTemplate | undefined>;
    static showOutputActionSelector(): Promise<OutputAction | undefined>;
    static showModelSelector(currentModel?: string): Promise<string | undefined>;
    static showRetryOptions(): Promise<string | undefined>;
    static confirmAction(message: string, confirmText?: string, cancelText?: string): Promise<boolean>;
}
//# sourceMappingURL=quickPick.d.ts.map