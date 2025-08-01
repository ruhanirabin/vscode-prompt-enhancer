import * as vscode from 'vscode';
import { LoadingProgress } from '../types/extension';
export declare class LoadingIndicator {
    private static activeProgress;
    static show<T>(title: string, task: (progress: (update: LoadingProgress) => void) => Promise<T>): Promise<T>;
    static showWithCancel<T>(title: string, task: (progress: (update: LoadingProgress) => void, token: vscode.CancellationToken) => Promise<T>): Promise<T | undefined>;
    static showStatusBar<T>(message: string, task: () => Promise<T>): Promise<T>;
    static createStatusBarItem(text: string, tooltip?: string): vscode.StatusBarItem;
    static showQuickProgress(message: string, durationMs?: number): void;
    static showModal<T>(title: string, message: string, task: () => Promise<T>): Promise<T>;
}
//# sourceMappingURL=loadingIndicator.d.ts.map