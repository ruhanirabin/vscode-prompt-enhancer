// VSCode Extension Diagnostic Script
// Run this in VSCode Developer Console to diagnose extension issues

console.log("=== VSCode Prompt Enhancer Extension Diagnostic ===");

// 1. Check if extension is installed
console.log("\n1. Checking extension installation...");
try {
    const extensions = vscode.extensions.all;
    const promptEnhancer = extensions.find(ext => 
        ext.id.includes('prompt-enhancer') || 
        ext.packageJSON?.name === 'prompt-enhancer'
    );
    
    if (promptEnhancer) {
        console.log("✅ Extension found:", promptEnhancer.id);
        console.log("   - Version:", promptEnhancer.packageJSON?.version);
        console.log("   - Active:", promptEnhancer.isActive);
        console.log("   - Publisher:", promptEnhancer.packageJSON?.publisher);
        console.log("   - Display Name:", promptEnhancer.packageJSON?.displayName);
    } else {
        console.log("❌ Extension not found in installed extensions");
        console.log("   Available extensions with 'prompt' in name:");
        extensions.filter(ext => ext.id.toLowerCase().includes('prompt'))
                 .forEach(ext => console.log("   -", ext.id));
    }
} catch (error) {
    console.log("❌ Error checking extensions:", error.message);
}

// 2. Check available commands
console.log("\n2. Checking available commands...");
try {
    vscode.commands.getCommands(true).then(commands => {
        const promptCommands = commands.filter(cmd => cmd.includes('promptEnhancer'));
        if (promptCommands.length > 0) {
            console.log("✅ Found Prompt Enhancer commands:");
            promptCommands.forEach(cmd => console.log("   -", cmd));
        } else {
            console.log("❌ No Prompt Enhancer commands found");
            console.log("   Total commands available:", commands.length);
            
            // Show similar commands
            const similarCommands = commands.filter(cmd => 
                cmd.toLowerCase().includes('prompt') || 
                cmd.toLowerCase().includes('enhance')
            );
            if (similarCommands.length > 0) {
                console.log("   Similar commands found:");
                similarCommands.slice(0, 5).forEach(cmd => console.log("   -", cmd));
            }
        }
    });
} catch (error) {
    console.log("❌ Error checking commands:", error.message);
}

// 3. Check configuration
console.log("\n3. Checking configuration...");
try {
    const config = vscode.workspace.getConfiguration('promptEnhancer');
    const configKeys = [
        'model', 'timeout', 'defaultTemplate', 
        'maxTokens', 'temperature', 'customTemplate', 'apiKeyStatus'
    ];
    
    let hasConfig = false;
    configKeys.forEach(key => {
        const value = config.get(key);
        if (value !== undefined) {
            console.log(`✅ ${key}:`, value);
            hasConfig = true;
        }
    });
    
    if (!hasConfig) {
        console.log("❌ No Prompt Enhancer configuration found");
    }
} catch (error) {
    console.log("❌ Error checking configuration:", error.message);
}

// 4. Try to activate extension manually
console.log("\n4. Attempting manual activation...");
try {
    const extensions = vscode.extensions.all;
    const promptEnhancer = extensions.find(ext => 
        ext.id.includes('prompt-enhancer') || 
        ext.packageJSON?.name === 'prompt-enhancer'
    );
    
    if (promptEnhancer && !promptEnhancer.isActive) {
        console.log("Attempting to activate extension...");
        promptEnhancer.activate().then(() => {
            console.log("✅ Extension activated successfully");
            
            // Recheck commands after activation
            setTimeout(() => {
                vscode.commands.getCommands(true).then(commands => {
                    const promptCommands = commands.filter(cmd => cmd.includes('promptEnhancer'));
                    console.log("Commands after activation:", promptCommands);
                });
            }, 1000);
        }).catch(error => {
            console.log("❌ Failed to activate extension:", error.message);
        });
    } else if (promptEnhancer && promptEnhancer.isActive) {
        console.log("✅ Extension is already active");
    } else {
        console.log("❌ Extension not found for activation");
    }
} catch (error) {
    console.log("❌ Error during manual activation:", error.message);
}

// 5. Check extension host logs
console.log("\n5. Extension host information...");
try {
    console.log("VSCode version:", vscode.version);
    console.log("Extension host kind:", vscode.env.appHost);
    console.log("UI kind:", vscode.env.uiKind);
} catch (error) {
    console.log("❌ Error getting extension host info:", error.message);
}

// 6. Test command execution
console.log("\n6. Testing command execution...");
setTimeout(() => {
    try {
        vscode.commands.executeCommand('promptEnhancer.configureApiKey')
            .then(() => {
                console.log("✅ Configure API Key command executed successfully");
            })
            .catch(error => {
                console.log("❌ Failed to execute Configure API Key command:", error.message);
            });
    } catch (error) {
        console.log("❌ Error testing command execution:", error.message);
    }
}, 2000);

console.log("\n=== Diagnostic Complete ===");
console.log("Please check the output above for any issues.");
console.log("If extension is not found or not active, try:");
console.log("1. Restart VSCode");
console.log("2. Reload window (Ctrl+Shift+P -> 'Developer: Reload Window')");
console.log("3. Reinstall the extension");