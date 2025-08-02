import { TemplateRegistry } from '../templates/templateRegistry';
export declare class TemplateManagerCommand {
    private templateRegistry;
    constructor(templateRegistry: TemplateRegistry);
    execute(): Promise<void>;
    private createTemplate;
    private editTemplate;
    private viewTemplate;
    private showTemplateForm;
    private showEditTemplateForm;
    private duplicateTemplate;
    private deleteTemplate;
    private importTemplates;
    private exportTemplates;
    private exportSingleTemplate;
    private showMultilineInput;
}
//# sourceMappingURL=templateManager.d.ts.map