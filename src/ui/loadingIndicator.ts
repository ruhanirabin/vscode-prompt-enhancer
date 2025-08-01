import * as vscode from 'vscode';
import { LoadingProgress } from '../types/extension';

export class LoadingIndicator {
  private static activeProgress: vscode.Progress<{ message?: string; increment?: number }> | null = null;

  static async show<T>(
    title: string,
    task: (progress: (update: LoadingProgress) => void) => Promise<T>
  ): Promise<T> {
    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title,
        cancellable: false
      },
      async (progress) => {
        LoadingIndicator.activeProgress = progress;
        
        const updateProgress = (update: LoadingProgress) => {
          if (LoadingIndicator.activeProgress) {
            LoadingIndicator.activeProgress.report({
              message: update.message,
              ...(update.increment !== undefined && { increment: update.increment })
            });
          }
        };

        try {
          const result = await task(updateProgress);
          return result;
        } finally {
          LoadingIndicator.activeProgress = null;
        }
      }
    );
  }

  static async showWithCancel<T>(
    title: string,
    task: (
      progress: (update: LoadingProgress) => void,
      token: vscode.CancellationToken
    ) => Promise<T>
  ): Promise<T | undefined> {
    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title,
        cancellable: true
      },
      async (progress, token) => {
        LoadingIndicator.activeProgress = progress;
        
        const updateProgress = (update: LoadingProgress) => {
          if (LoadingIndicator.activeProgress) {
            LoadingIndicator.activeProgress.report({
              message: update.message,
              ...(update.increment !== undefined && { increment: update.increment })
            });
          }
        };

        try {
          if (token.isCancellationRequested) {
            return undefined;
          }

          const result = await task(updateProgress, token);
          return result;
        } finally {
          LoadingIndicator.activeProgress = null;
        }
      }
    );
  }

  static async showStatusBar<T>(
    message: string,
    task: () => Promise<T>
  ): Promise<T> {
    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Window,
        title: message
      },
      async () => {
        return await task();
      }
    );
  }

  static createStatusBarItem(text: string, tooltip?: string): vscode.StatusBarItem {
    const statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    
    statusBarItem.text = `$(sync~spin) ${text}`;
    statusBarItem.tooltip = tooltip || text;
    statusBarItem.show();
    
    return statusBarItem;
  }

  static showQuickProgress(message: string, durationMs: number = 2000): void {
    const statusBarItem = LoadingIndicator.createStatusBarItem(message);
    
    setTimeout(() => {
      statusBarItem.dispose();
    }, durationMs);
  }

  static async showModal<T>(
    title: string,
    message: string,
    task: () => Promise<T>
  ): Promise<T> {
    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.SourceControl,
        title,
        cancellable: false
      },
      async (progress) => {
        progress.report({ message });
        return await task();
      }
    );
  }
}