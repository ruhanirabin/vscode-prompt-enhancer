"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingIndicator = void 0;
const vscode = __importStar(require("vscode"));
class LoadingIndicator {
    static async show(title, task) {
        return vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title,
            cancellable: false
        }, async (progress) => {
            LoadingIndicator.activeProgress = progress;
            const updateProgress = (update) => {
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
            }
            finally {
                LoadingIndicator.activeProgress = null;
            }
        });
    }
    static async showWithCancel(title, task) {
        return vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title,
            cancellable: true
        }, async (progress, token) => {
            LoadingIndicator.activeProgress = progress;
            const updateProgress = (update) => {
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
            }
            finally {
                LoadingIndicator.activeProgress = null;
            }
        });
    }
    static async showStatusBar(message, task) {
        return vscode.window.withProgress({
            location: vscode.ProgressLocation.Window,
            title: message
        }, async () => {
            return await task();
        });
    }
    static createStatusBarItem(text, tooltip) {
        const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        statusBarItem.text = `$(sync~spin) ${text}`;
        statusBarItem.tooltip = tooltip || text;
        statusBarItem.show();
        return statusBarItem;
    }
    static showQuickProgress(message, durationMs = 2000) {
        const statusBarItem = LoadingIndicator.createStatusBarItem(message);
        setTimeout(() => {
            statusBarItem.dispose();
        }, durationMs);
    }
    static async showModal(title, message, task) {
        return vscode.window.withProgress({
            location: vscode.ProgressLocation.SourceControl,
            title,
            cancellable: false
        }, async (progress) => {
            progress.report({ message });
            return await task();
        });
    }
}
exports.LoadingIndicator = LoadingIndicator;
LoadingIndicator.activeProgress = null;
//# sourceMappingURL=loadingIndicator.js.map