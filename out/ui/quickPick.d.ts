import { OutputAction } from '../types/extension';
import { TemplateRegistry } from '../templates/templateRegistry';
import { DynamicTemplateDefinition } from '../templates/templateStorage';
export declare class QuickPickManager {
    static showTemplateSelector(templateRegistry: TemplateRegistry, defaultTemplate?: string): Promise<string | undefined>;
    static showOutputActionSelector(): Promise<OutputAction | undefined>;
    static showClipboardOutputActionSelector(): Promise<OutputAction | undefined>;
    static showModelSelector(currentModel?: string): Promise<string | undefined>;
    static showRetryOptions(): Promise<string | undefined>;
    static confirmAction(message: string, confirmText?: string, cancelText?: string): Promise<boolean>;
    static showTemplateManager(templateRegistry: TemplateRegistry): Promise<{
        action: string;
        templateId?: string;
    } | undefined>;
    static showTemplateActions(template: DynamicTemplateDefinition): Promise<string | undefined>;
    static showCategorySelector(templateRegistry: TemplateRegistry, currentCategory?: string): Promise<string | undefined>;
    static confirmTemplateDelete(templateName: string): Promise<boolean>;
}
//# sourceMappingURL=quickPick.d.ts.map