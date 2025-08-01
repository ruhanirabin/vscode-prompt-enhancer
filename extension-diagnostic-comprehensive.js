/**
 * Comprehensive VSCode Extension Diagnostic Script
 * Diagnoses "command 'promptEnhancer.configureApiKey' not found" error
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class ExtensionDiagnostic {
    constructor() {
        this.extensionId = 'prompt-enhancer-dev.prompt-enhancer';
        this.extensionName = 'prompt-enhancer';
        this.version = '1.0.0';
        this.results = {
            installation: {},
            compilation: {},
            manifest: {},
            commands: {},
            activation: {},
            dependencies: {}
        };
    }

    async runFullDiagnostic() {
        console.log('🔍 Starting Comprehensive Extension Diagnostic...\n');
        
        try {
            await this.checkInstallation();
            await this.checkCompilation();
            await this.checkManifest();
            await this.checkCommands();
            await this.checkActivation();
            await this.checkDependencies();
            
            this.generateReport();
            this.provideSolutions();
            
        } catch (error) {
            console.error('❌ Diagnostic failed:', error.message);
        }
    }

    async checkInstallation() {
        console.log('📦 Checking Extension Installation...');
        
        const extensionPaths = this.getExtensionPaths();
        let installed = false;
        let installPath = null;

        for (const basePath of extensionPaths) {
            const fullPath = path.join(basePath, `${this.extensionId}-${this.version}`);
            if (fs.existsSync(fullPath)) {
                installed = true;
                installPath = fullPath;
                break;
            }
        }

        this.results.installation = {
            isInstalled: installed,
            installPath: installPath,
            expectedPaths: extensionPaths
        };

        if (installed) {
            console.log('✅ Extension found at:', installPath);
            
            // Check key files
            const keyFiles = ['package.json', 'out/extension.js', 'README.md'];
            const missingFiles = [];
            
            for (const file of keyFiles) {
                const filePath = path.join(installPath, file);
                if (!fs.existsSync(filePath)) {
                    missingFiles.push(file);
                }
            }
            
            this.results.installation.missingFiles = missingFiles;
            
            if (missingFiles.length > 0) {
                console.log('⚠️  Missing files:', missingFiles.join(', '));
            } else {
                console.log('✅ All key files present');
            }
        } else {
            console.log('❌ Extension not found in any expected location');
        }
        
        console.log('');
    }

    async checkCompilation() {
        console.log('🔨 Checking Compilation Status...');
        
        if (!this.results.installation.isInstalled) {
            console.log('⏭️  Skipping - extension not installed\n');
            return;
        }

        const installPath = this.results.installation.installPath;
        const outDir = path.join(installPath, 'out');
        const mainFile = path.join(outDir, 'extension.js');
        const srcDir = path.join(installPath, 'src');
        
        this.results.compilation = {
            outDirExists: fs.existsSync(outDir),
            mainFileExists: fs.existsSync(mainFile),
            srcDirExists: fs.existsSync(srcDir),
            compiledFiles: []
        };

        if (fs.existsSync(outDir)) {
            try {
                const files = fs.readdirSync(outDir, { recursive: true });
                this.results.compilation.compiledFiles = files.filter(f => f.endsWith('.js'));
                console.log('✅ Output directory exists with', this.results.compilation.compiledFiles.length, 'JS files');
            } catch (error) {
                console.log('⚠️  Could not read output directory:', error.message);
            }
        } else {
            console.log('❌ Output directory missing - extension not compiled');
        }

        if (fs.existsSync(mainFile)) {
            try {
                const stats = fs.statSync(mainFile);
                const content = fs.readFileSync(mainFile, 'utf8');
                
                this.results.compilation.mainFileSize = stats.size;
                this.results.compilation.hasActivateFunction = content.includes('function activate');
                this.results.compilation.hasCommandRegistration = content.includes('registerCommand');
                
                console.log('✅ Main extension file exists (', stats.size, 'bytes)');
                console.log('✅ Contains activate function:', this.results.compilation.hasActivateFunction);
                console.log('✅ Contains command registration:', this.results.compilation.hasCommandRegistration);
            } catch (error) {
                console.log('⚠️  Could not analyze main file:', error.message);
            }
        } else {
            console.log('❌ Main extension file (out/extension.js) missing');
        }
        
        console.log('');
    }

    async checkManifest() {
        console.log('📋 Checking Package Manifest...');
        
        if (!this.results.installation.isInstalled) {
            console.log('⏭️  Skipping - extension not installed\n');
            return;
        }

        const packagePath = path.join(this.results.installation.installPath, 'package.json');
        
        try {
            const packageContent = fs.readFileSync(packagePath, 'utf8');
            const packageJson = JSON.parse(packageContent);
            
            this.results.manifest = {
                isValid: true,
                name: packageJson.name,
                version: packageJson.version,
                main: packageJson.main,
                activationEvents: packageJson.activationEvents || [],
                commands: packageJson.contributes?.commands || [],
                hasConfigureCommand: false
            };

            // Check for the specific command
            const configureCommand = this.results.manifest.commands.find(
                cmd => cmd.command === 'promptEnhancer.configureApiKey'
            );
            
            this.results.manifest.hasConfigureCommand = !!configureCommand;
            
            console.log('✅ Package.json is valid');
            console.log('✅ Extension name:', packageJson.name);
            console.log('✅ Version:', packageJson.version);
            console.log('✅ Main entry:', packageJson.main);
            console.log('✅ Activation events:', this.results.manifest.activationEvents.length);
            console.log('✅ Commands defined:', this.results.manifest.commands.length);
            console.log('✅ Configure command present:', this.results.manifest.hasConfigureCommand);
            
            if (!this.results.manifest.hasConfigureCommand) {
                console.log('❌ CRITICAL: promptEnhancer.configureApiKey command not found in manifest!');
            }
            
        } catch (error) {
            console.log('❌ Failed to read/parse package.json:', error.message);
            this.results.manifest = { isValid: false, error: error.message };
        }
        
        console.log('');
    }

    async checkCommands() {
        console.log('⚡ Checking Command Registration...');
        
        if (!this.results.compilation.mainFileExists) {
            console.log('⏭️  Skipping - main file not available\n');
            return;
        }

        try {
            const mainFile = path.join(this.results.installation.installPath, 'out', 'extension.js');
            const content = fs.readFileSync(mainFile, 'utf8');
            
            this.results.commands = {
                hasRegisterCommand: content.includes('registerCommand'),
                hasConfigureApiKeyRegistration: content.includes('promptEnhancer.configureApiKey'),
                hasEnhanceRegistration: content.includes('promptEnhancer.enhance'),
                registrationPattern: /registerCommand\s*\(\s*['"`]([^'"`]+)['"`]/g
            };

            const matches = [...content.matchAll(this.results.commands.registrationPattern)];
            this.results.commands.registeredCommands = matches.map(m => m[1]);
            
            console.log('✅ Command registration code present:', this.results.commands.hasRegisterCommand);
            console.log('✅ Configure API Key registration:', this.results.commands.hasConfigureApiKeyRegistration);
            console.log('✅ Enhance registration:', this.results.commands.hasEnhanceRegistration);
            console.log('✅ Found registered commands:', this.results.commands.registeredCommands.join(', '));
            
        } catch (error) {
            console.log('⚠️  Could not analyze command registration:', error.message);
            this.results.commands = { error: error.message };
        }
        
        console.log('');
    }

    async checkActivation() {
        console.log('🚀 Checking Activation Logic...');
        
        if (!this.results.compilation.mainFileExists) {
            console.log('⏭️  Skipping - main file not available\n');
            return;
        }

        try {
            const mainFile = path.join(this.results.installation.installPath, 'out', 'extension.js');
            const content = fs.readFileSync(mainFile, 'utf8');
            
            this.results.activation = {
                hasActivateFunction: content.includes('function activate') || content.includes('activate('),
                hasDeactivateFunction: content.includes('function deactivate') || content.includes('deactivate('),
                hasErrorHandling: content.includes('try') && content.includes('catch'),
                hasContextSubscriptions: content.includes('context.subscriptions'),
                hasAsyncActivation: content.includes('async') && content.includes('activate')
            };
            
            console.log('✅ Activate function present:', this.results.activation.hasActivateFunction);
            console.log('✅ Deactivate function present:', this.results.activation.hasDeactivateFunction);
            console.log('✅ Error handling present:', this.results.activation.hasErrorHandling);
            console.log('✅ Context subscriptions used:', this.results.activation.hasContextSubscriptions);
            console.log('✅ Async activation:', this.results.activation.hasAsyncActivation);
            
        } catch (error) {
            console.log('⚠️  Could not analyze activation logic:', error.message);
            this.results.activation = { error: error.message };
        }
        
        console.log('');
    }

    async checkDependencies() {
        console.log('📚 Checking Dependencies...');
        
        if (!this.results.installation.isInstalled) {
            console.log('⏭️  Skipping - extension not installed\n');
            return;
        }

        const nodeModulesPath = path.join(this.results.installation.installPath, 'node_modules');
        const packageLockPath = path.join(this.results.installation.installPath, 'package-lock.json');
        
        this.results.dependencies = {
            nodeModulesExists: fs.existsSync(nodeModulesPath),
            packageLockExists: fs.existsSync(packageLockPath),
            criticalDependencies: ['vscode', 'openai', 'axios']
        };

        if (this.results.dependencies.nodeModulesExists) {
            console.log('✅ node_modules directory exists');
            
            // Check critical dependencies
            const missingDeps = [];
            for (const dep of this.results.dependencies.criticalDependencies) {
                const depPath = path.join(nodeModulesPath, dep);
                if (!fs.existsSync(depPath)) {
                    missingDeps.push(dep);
                }
            }
            
            this.results.dependencies.missingDependencies = missingDeps;
            
            if (missingDeps.length > 0) {
                console.log('❌ Missing critical dependencies:', missingDeps.join(', '));
            } else {
                console.log('✅ All critical dependencies present');
            }
        } else {
            console.log('❌ node_modules directory missing - dependencies not installed');
        }
        
        console.log('');
    }

    getExtensionPaths() {
        const homeDir = os.homedir();
        const platform = os.platform();
        
        const paths = [];
        
        if (platform === 'win32') {
            paths.push(path.join(homeDir, '.vscode', 'extensions'));
            paths.push(path.join(process.env.APPDATA || '', 'Code', 'User', 'extensions'));
        } else if (platform === 'darwin') {
            paths.push(path.join(homeDir, '.vscode', 'extensions'));
            paths.push(path.join(homeDir, 'Library', 'Application Support', 'Code', 'User', 'extensions'));
        } else {
            paths.push(path.join(homeDir, '.vscode', 'extensions'));
            paths.push(path.join(homeDir, '.config', 'Code', 'User', 'extensions'));
        }
        
        return paths.filter(p => fs.existsSync(path.dirname(p)));
    }

    generateReport() {
        console.log('📊 DIAGNOSTIC REPORT');
        console.log('='.repeat(50));
        
        const issues = [];
        const warnings = [];
        
        // Analyze results
        if (!this.results.installation.isInstalled) {
            issues.push('Extension not installed in expected locations');
        }
        
        if (this.results.installation.missingFiles?.length > 0) {
            issues.push(`Missing files: ${this.results.installation.missingFiles.join(', ')}`);
        }
        
        if (!this.results.compilation.outDirExists) {
            issues.push('Extension not compiled - missing out/ directory');
        }
        
        if (!this.results.compilation.mainFileExists) {
            issues.push('Main extension file missing (out/extension.js)');
        }
        
        if (!this.results.manifest.isValid) {
            issues.push('Invalid or missing package.json');
        }
        
        if (!this.results.manifest.hasConfigureCommand) {
            issues.push('promptEnhancer.configureApiKey command not defined in manifest');
        }
        
        if (!this.results.commands.hasConfigureApiKeyRegistration) {
            warnings.push('Configure API Key command registration not found in code');
        }
        
        if (!this.results.activation.hasActivateFunction) {
            issues.push('Activate function not found');
        }
        
        if (!this.results.dependencies.nodeModulesExists) {
            warnings.push('Dependencies not installed');
        }
        
        if (this.results.dependencies.missingDependencies?.length > 0) {
            warnings.push(`Missing dependencies: ${this.results.dependencies.missingDependencies.join(', ')}`);
        }
        
        // Display results
        if (issues.length === 0 && warnings.length === 0) {
            console.log('✅ No critical issues found - extension should be working');
        } else {
            if (issues.length > 0) {
                console.log('\n❌ CRITICAL ISSUES:');
                issues.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));
            }
            
            if (warnings.length > 0) {
                console.log('\n⚠️  WARNINGS:');
                warnings.forEach((warning, i) => console.log(`${i + 1}. ${warning}`));
            }
        }
        
        console.log('\n');
    }

    provideSolutions() {
        console.log('🛠️  RECOMMENDED SOLUTIONS');
        console.log('='.repeat(50));
        
        if (!this.results.installation.isInstalled) {
            console.log('\n1. REINSTALL EXTENSION:');
            console.log('   code --install-extension prompt-enhancer-1.0.0.vsix --force');
        }
        
        if (!this.results.compilation.outDirExists || !this.results.compilation.mainFileExists) {
            console.log('\n2. RECOMPILE EXTENSION:');
            console.log('   cd path/to/extension');
            console.log('   npm install');
            console.log('   npm run compile');
        }
        
        if (!this.results.manifest.hasConfigureCommand) {
            console.log('\n3. FIX PACKAGE.JSON:');
            console.log('   Verify contributes.commands section includes promptEnhancer.configureApiKey');
        }
        
        if (!this.results.dependencies.nodeModulesExists) {
            console.log('\n4. INSTALL DEPENDENCIES:');
            console.log('   cd path/to/extension');
            console.log('   npm install');
        }
        
        console.log('\n5. GENERAL FIXES:');
        console.log('   - Restart VSCode');
        console.log('   - Reload Window (Ctrl+Shift+P → "Developer: Reload Window")');
        console.log('   - Clear extension cache');
        console.log('   - Check VSCode version compatibility (requires 1.85.0+)');
        
        console.log('\n6. MANUAL COMMAND EXECUTION:');
        console.log('   Open Developer Console and run:');
        console.log('   vscode.commands.executeCommand("promptEnhancer.configureApiKey")');
        
        console.log('\n');
    }
}

// Run diagnostic
const diagnostic = new ExtensionDiagnostic();
diagnostic.runFullDiagnostic().catch(console.error);