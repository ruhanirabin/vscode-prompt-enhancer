/**
 * Enhanced Validation Logger for VSCode Extension Debugging
 * Provides detailed logging to identify root causes of command registration failures
 */

class ExtensionValidationLogger {
    constructor() {
        this.logLevel = 'DEBUG';
        this.logs = [];
        this.startTime = Date.now();
    }

    log(level, message, context = '', data = null) {
        const timestamp = new Date().toISOString();
        const elapsed = Date.now() - this.startTime;
        
        const logEntry = {
            timestamp,
            elapsed: `${elapsed}ms`,
            level,
            context,
            message,
            data
        };
        
        this.logs.push(logEntry);
        
        const prefix = `[${elapsed}ms] [${level}] ${context ? `[${context}] ` : ''}`;
        
        switch (level) {
            case 'ERROR':
                console.error(`❌ ${prefix}${message}`, data || '');
                break;
            case 'WARN':
                console.warn(`⚠️ ${prefix}${message}`, data || '');
                break;
            case 'INFO':
                console.info(`ℹ️ ${prefix}${message}`, data || '');
                break;
            case 'DEBUG':
                console.log(`🔍 ${prefix}${message}`, data || '');
                break;
            case 'SUCCESS':
                console.log(`✅ ${prefix}${message}`, data || '');
                break;
        }
    }

    error(message, context = '', data = null) {
        this.log('ERROR', message, context, data);
    }

    warn(message, context = '', data = null) {
        this.log('WARN', message, context, data);
    }

    info(message, context = '', data = null) {
        this.log('INFO', message, context, data);
    }

    debug(message, context = '', data = null) {
        this.log('DEBUG', message, context, data);
    }

    success(message, context = '', data = null) {
        this.log('SUCCESS', message, context, data);
    }

    async validateExtensionState() {
        this.info('Starting comprehensive extension validation', 'VALIDATOR');
        
        try {
            await this.validateVSCodeEnvironment();
            await this.validateExtensionInstallation();
            await this.validateExtensionActivation();
            await this.validateCommandRegistration();
            await this.validateConfiguration();
            await this.validateDependencies();
            
            this.generateValidationReport();
            
        } catch (error) {
            this.error('Validation failed with critical error', 'VALIDATOR', error);
        }
    }

    async validateVSCodeEnvironment() {
        this.info('Validating VSCode environment', 'ENV');
        
        try {
            // Check if we're in VSCode context
            if (typeof vscode === 'undefined') {
                this.error('VSCode API not available - not running in VSCode context', 'ENV');
                return false;
            }
            
            this.success('VSCode API available', 'ENV');
            
            // Check VSCode version
            const version = vscode.version;
            this.info(`VSCode version: ${version}`, 'ENV');
            
            // Check if version meets requirements (1.85.0+)
            const [major, minor] = version.split('.').map(Number);
            const requiredMajor = 1, requiredMinor = 85;
            
            if (major > requiredMajor || (major === requiredMajor && minor >= requiredMinor)) {
                this.success('VSCode version meets requirements', 'ENV');
            } else {
                this.error(`VSCode version ${version} is below required 1.85.0`, 'ENV');
            }
            
            return true;
            
        } catch (error) {
            this.error('Failed to validate VSCode environment', 'ENV', error);
            return false;
        }
    }

    async validateExtensionInstallation() {
        this.info('Validating extension installation', 'INSTALL');
        
        try {
            const extensionId = 'prompt-enhancer-dev.prompt-enhancer';
            const extension = vscode.extensions.getExtension(extensionId);
            
            if (!extension) {
                this.error(`Extension ${extensionId} not found in installed extensions`, 'INSTALL');
                
                // List all installed extensions for debugging
                const allExtensions = vscode.extensions.all.map(ext => ext.id);
                this.debug('All installed extensions', 'INSTALL', allExtensions);
                
                return false;
            }
            
            this.success(`Extension found: ${extension.id}`, 'INSTALL');
            this.info(`Extension path: ${extension.extensionPath}`, 'INSTALL');
            this.info(`Extension version: ${extension.packageJSON.version}`, 'INSTALL');
            this.info(`Extension active: ${extension.isActive}`, 'INSTALL');
            
            // Validate package.json
            const packageJson = extension.packageJSON;
            if (!packageJson) {
                this.error('Extension package.json not accessible', 'INSTALL');
                return false;
            }
            
            this.success('Extension package.json accessible', 'INSTALL');
            
            // Check command contributions
            const commands = packageJson.contributes?.commands || [];
            const configureCommand = commands.find(cmd => cmd.command === 'promptEnhancer.configureApiKey');
            
            if (configureCommand) {
                this.success('Configure API Key command found in manifest', 'INSTALL', configureCommand);
            } else {
                this.error('Configure API Key command NOT found in manifest', 'INSTALL');
                this.debug('Available commands in manifest', 'INSTALL', commands);
            }
            
            return true;
            
        } catch (error) {
            this.error('Failed to validate extension installation', 'INSTALL', error);
            return false;
        }
    }

    async validateExtensionActivation() {
        this.info('Validating extension activation', 'ACTIVATION');
        
        try {
            const extensionId = 'prompt-enhancer-dev.prompt-enhancer';
            const extension = vscode.extensions.getExtension(extensionId);
            
            if (!extension) {
                this.error('Cannot validate activation - extension not found', 'ACTIVATION');
                return false;
            }
            
            if (extension.isActive) {
                this.success('Extension is already active', 'ACTIVATION');
                return true;
            }
            
            this.info('Extension not active, attempting activation', 'ACTIVATION');
            
            try {
                await extension.activate();
                this.success('Extension activated successfully', 'ACTIVATION');
                return true;
            } catch (activationError) {
                this.error('Extension activation failed', 'ACTIVATION', activationError);
                return false;
            }
            
        } catch (error) {
            this.error('Failed to validate extension activation', 'ACTIVATION', error);
            return false;
        }
    }

    async validateCommandRegistration() {
        this.info('Validating command registration', 'COMMANDS');
        
        try {
            const allCommands = await vscode.commands.getCommands();
            const promptCommands = allCommands.filter(cmd => cmd.includes('promptEnhancer'));
            
            this.info(`Found ${promptCommands.length} Prompt Enhancer commands`, 'COMMANDS');
            this.debug('Prompt Enhancer commands', 'COMMANDS', promptCommands);
            
            const expectedCommands = [
                'promptEnhancer.configureApiKey',
                'promptEnhancer.enhance'
            ];
            
            const missingCommands = [];
            
            for (const expectedCmd of expectedCommands) {
                if (promptCommands.includes(expectedCmd)) {
                    this.success(`Command registered: ${expectedCmd}`, 'COMMANDS');
                } else {
                    this.error(`Command NOT registered: ${expectedCmd}`, 'COMMANDS');
                    missingCommands.push(expectedCmd);
                }
            }
            
            if (missingCommands.length === 0) {
                this.success('All expected commands are registered', 'COMMANDS');
                return true;
            } else {
                this.error(`${missingCommands.length} commands missing`, 'COMMANDS', missingCommands);
                return false;
            }
            
        } catch (error) {
            this.error('Failed to validate command registration', 'COMMANDS', error);
            return false;
        }
    }

    async validateConfiguration() {
        this.info('Validating extension configuration', 'CONFIG');
        
        try {
            const config = vscode.workspace.getConfiguration('promptEnhancer');
            
            if (!config) {
                this.error('Extension configuration not accessible', 'CONFIG');
                return false;
            }
            
            this.success('Extension configuration accessible', 'CONFIG');
            
            // Check expected configuration properties
            const expectedSettings = [
                'model',
                'timeout',
                'defaultTemplate',
                'maxTokens',
                'temperature',
                'apiKeyStatus'
            ];
            
            const missingSettings = [];
            
            for (const setting of expectedSettings) {
                const value = config.get(setting);
                if (value !== undefined) {
                    this.success(`Setting available: ${setting} = ${value}`, 'CONFIG');
                } else {
                    this.warn(`Setting missing or undefined: ${setting}`, 'CONFIG');
                    missingSettings.push(setting);
                }
            }
            
            if (missingSettings.length === 0) {
                this.success('All expected settings are available', 'CONFIG');
            } else {
                this.warn(`${missingSettings.length} settings missing`, 'CONFIG', missingSettings);
            }
            
            return true;
            
        } catch (error) {
            this.error('Failed to validate configuration', 'CONFIG', error);
            return false;
        }
    }

    async validateDependencies() {
        this.info('Validating extension dependencies', 'DEPS');
        
        try {
            const extensionId = 'prompt-enhancer-dev.prompt-enhancer';
            const extension = vscode.extensions.getExtension(extensionId);
            
            if (!extension) {
                this.error('Cannot validate dependencies - extension not found', 'DEPS');
                return false;
            }
            
            const packageJson = extension.packageJSON;
            const dependencies = packageJson.dependencies || {};
            const devDependencies = packageJson.devDependencies || {};
            
            this.info(`Production dependencies: ${Object.keys(dependencies).length}`, 'DEPS');
            this.info(`Development dependencies: ${Object.keys(devDependencies).length}`, 'DEPS');
            
            // Check critical dependencies
            const criticalDeps = ['openai', 'axios'];
            const missingDeps = [];
            
            for (const dep of criticalDeps) {
                if (dependencies[dep]) {
                    this.success(`Critical dependency available: ${dep} v${dependencies[dep]}`, 'DEPS');
                } else {
                    this.error(`Critical dependency missing: ${dep}`, 'DEPS');
                    missingDeps.push(dep);
                }
            }
            
            if (missingDeps.length === 0) {
                this.success('All critical dependencies are available', 'DEPS');
            } else {
                this.error(`${missingDeps.length} critical dependencies missing`, 'DEPS', missingDeps);
            }
            
            return missingDeps.length === 0;
            
        } catch (error) {
            this.error('Failed to validate dependencies', 'DEPS', error);
            return false;
        }
    }

    async testCommandExecution() {
        this.info('Testing command execution', 'TEST');
        
        try {
            // Test if command can be executed
            const result = await vscode.commands.executeCommand('promptEnhancer.configureApiKey');
            this.success('Command executed successfully', 'TEST', result);
            return true;
        } catch (error) {
            this.error('Command execution failed', 'TEST', error);
            return false;
        }
    }

    generateValidationReport() {
        this.info('Generating validation report', 'REPORT');
        
        const errors = this.logs.filter(log => log.level === 'ERROR');
        const warnings = this.logs.filter(log => log.level === 'WARN');
        const successes = this.logs.filter(log => log.level === 'SUCCESS');
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 VALIDATION REPORT');
        console.log('='.repeat(60));
        
        console.log(`✅ Successes: ${successes.length}`);
        console.log(`⚠️ Warnings: ${warnings.length}`);
        console.log(`❌ Errors: ${errors.length}`);
        
        if (errors.length > 0) {
            console.log('\n❌ CRITICAL ISSUES:');
            errors.forEach((error, i) => {
                console.log(`${i + 1}. [${error.context}] ${error.message}`);
            });
        }
        
        if (warnings.length > 0) {
            console.log('\n⚠️ WARNINGS:');
            warnings.forEach((warning, i) => {
                console.log(`${i + 1}. [${warning.context}] ${warning.message}`);
            });
        }
        
        console.log('\n🎯 RECOMMENDATIONS:');
        
        if (errors.some(e => e.context === 'INSTALL')) {
            console.log('• Reinstall the extension using: code --install-extension prompt-enhancer-1.0.0.vsix --force');
        }
        
        if (errors.some(e => e.context === 'ACTIVATION')) {
            console.log('• Check extension activation logs in Developer Console');
            console.log('• Try reloading VSCode window');
        }
        
        if (errors.some(e => e.context === 'COMMANDS')) {
            console.log('• Extension may have failed to register commands during activation');
            console.log('• Check for compilation errors in out/extension.js');
        }
        
        if (errors.some(e => e.context === 'DEPS')) {
            console.log('• Run npm install in extension directory');
            console.log('• Recompile extension with npm run compile');
        }
        
        console.log('\n' + '='.repeat(60));
    }

    exportLogs() {
        return {
            summary: {
                totalLogs: this.logs.length,
                errors: this.logs.filter(log => log.level === 'ERROR').length,
                warnings: this.logs.filter(log => log.level === 'WARN').length,
                successes: this.logs.filter(log => log.level === 'SUCCESS').length
            },
            logs: this.logs
        };
    }
}

// Usage instructions for VSCode Developer Console:
console.log(`
🔍 VALIDATION LOGGER USAGE:

1. Copy this entire script
2. Open VSCode Developer Console (Help → Toggle Developer Tools)
3. Paste and run the script
4. Execute validation:

   const logger = new ExtensionValidationLogger();
   logger.validateExtensionState();

5. For specific tests:
   
   logger.testCommandExecution();
   logger.exportLogs(); // Get detailed log data

6. The logger will provide detailed output showing exactly where the issue is occurring.
`);

// Auto-run if in VSCode context
if (typeof vscode !== 'undefined') {
    const logger = new ExtensionValidationLogger();
    logger.validateExtensionState();
} else {
    console.log('⚠️ Not in VSCode context - copy this script to VSCode Developer Console to run validation');
}