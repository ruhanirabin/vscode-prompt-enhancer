import * as vscode from 'vscode';
import { ExtensionSettings, ApiKeyValidationResult } from '../types/extension';
export declare class SettingsManager {
    private static readonly API_KEY_SECRET;
    private context;
    constructor(context: vscode.ExtensionContext);
    getApiKey(): Promise<string | undefined>;
    setApiKey(apiKey: string): Promise<void>;
    deleteApiKey(): Promise<void>;
    getSettings(): ExtensionSettings;
    updateApiKeyStatus(isConfigured: boolean): Promise<void>;
    getApiKeyStatus(): Promise<string>;
    promptForApiKey(): Promise<string | undefined>;
    validateApiKey(apiKey: string | undefined): ApiKeyValidationResult;
    ensureApiKeyExists(): Promise<string | undefined>;
    updateSetting<K extends keyof ExtensionSettings>(key: K, value: ExtensionSettings[K]): Promise<void>;
    onSettingsChanged(callback: () => void): vscode.Disposable;
}
//# sourceMappingURL=settings.d.ts.map