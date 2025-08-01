// Extension Activation Test Script
// This script helps diagnose extension activation issues

const vscode = require('vscode');

async function testExtensionActivation() {
    console.log('=== Extension Activation Test ===');
    
    try {
        // Check if extension is installed
        const extension = vscode.extensions.getExtension('prompt-enhancer-dev.prompt-enhancer');
        
        if (!extension) {
            console.log('❌ Extension not found in installed extensions');
            return;
        }
        
        console.log('✅ Extension found:', extension.id);
        console.log('📦 Extension path:', extension.extensionPath);
        console.log('🔄 Is active:', extension.isActive);
        
        if (!extension.isActive) {
            console.log('⏳ Attempting to activate extension...');
            try {
                await extension.activate();
                console.log('✅ Extension activated successfully');
            } catch (activationError) {
                console.log('❌ Extension activation failed:', activationError.message);
                console.log('Stack trace:', activationError.stack);
            }
        }
        
        // Test command availability
        console.log('\n=== Command Registration Test ===');
        const commands = await vscode.commands.getCommands(true);
        const promptEnhancerCommands = commands.filter(cmd => cmd.startsWith('promptEnhancer.'));
        
        console.log('Found Prompt Enhancer commands:', promptEnhancerCommands);
        
        if (promptEnhancerCommands.includes('promptEnhancer.configureApiKey')) {
            console.log('✅ configureApiKey command is registered');
        } else {
            console.log('❌ configureApiKey command is NOT registered');
        }
        
        if (promptEnhancerCommands.includes('promptEnhancer.enhance')) {
            console.log('✅ enhance command is registered');
        } else {
            console.log('❌ enhance command is NOT registered');
        }
        
    } catch (error) {
        console.log('❌ Test failed with error:', error.message);
        console.log('Stack trace:', error.stack);
    }
}

// Export for use in VS Code
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testExtensionActivation };
}

// If running in VS Code context, execute immediately
if (typeof vscode !== 'undefined') {
    testExtensionActivation();
}