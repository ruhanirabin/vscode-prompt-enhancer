# Prompt Enhancer - Setup & Installation Guide

This guide will help you set up the Prompt Enhancer extension for development and usage.

## Prerequisites

- **Node.js**: Version 18.x or higher
- **Visual Studio Code**: Version 1.85.0 or higher
- **OpenAI API Key**: [Get one here](https://platform.openai.com/api-keys)

## Installation Options

### Option 1: Install from Marketplace (Recommended)
1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Prompt Enhancer"
4. Click Install

### Option 2: Install from VSIX Package
1. Download the `.vsix` file from releases
2. Open VSCode
3. Open Command Palette (Ctrl+Shift+P)
4. Run "Extensions: Install from VSIX..."
5. Select the downloaded `.vsix` file

### Option 3: Build from Source
```bash
# Clone the repository
git clone <repository-url>
cd prompt-enhancer

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Package the extension
npm run package

# Install the packaged extension
code --install-extension prompt-enhancer-1.0.0.vsix
```

## Development Setup

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd prompt-enhancer
npm install
```

### 2. Development Commands
```bash
# Compile TypeScript
npm run compile

# Watch for changes (recommended during development)
npm run watch

# Run linting
npm run lint

# Run tests
npm test

# Package extension
npm run package
```

### 3. Debug the Extension
1. Open the project in VSCode
2. Press `F5` to launch Extension Development Host
3. Test your changes in the new VSCode window

## Configuration

### 1. Set Up OpenAI API Key
After installation, you need to configure your OpenAI API key:

**Method 1: Using Command Palette**
1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Run "Prompt Enhancer: Configure API Key"
3. Enter your OpenAI API key
4. The key will be stored securely using VSCode's encrypted storage

**Method 2: First-time Setup**
1. Select any text in a file
2. Press `Ctrl+Shift+E` (`Cmd+Shift+E` on Mac)
3. You'll be prompted to configure your API key

### 2. Adjust Settings (Optional)
Open VSCode Settings (`Ctrl+,`) and search for "Prompt Enhancer":

```json
{
  "promptEnhancer.model": "gpt-4o-mini",
  "promptEnhancer.timeout": 30000,
  "promptEnhancer.defaultTemplate": "general",
  "promptEnhancer.maxTokens": 1000,
  "promptEnhancer.temperature": 0.7,
  "promptEnhancer.customTemplate": "Please enhance this prompt:"
}
```

## Usage

### Basic Usage
1. **Select Text**: Highlight any text in your editor
2. **Trigger Enhancement**: Press `Ctrl+Shift+E` (`Cmd+Shift+E` on Mac)
3. **Choose Template**: Select an enhancement style
4. **Apply Result**: Choose how to use the enhanced prompt

### Enhancement Templates

| Template | Best For | Example Use Case |
|----------|----------|------------------|
| **General** | Any prompt | "Write a blog post" → Detailed blog post requirements |
| **Technical** | Code-related tasks | "Create a function" → Specific coding requirements |
| **Creative** | Writing tasks | "Write a story" → Rich narrative guidelines |
| **Comments** | Code documentation | "Document this code" → Comprehensive documentation request |
| **Custom** | Specific needs | Uses your custom template |

### Output Options

| Option | Description | When to Use |
|--------|-------------|-------------|
| **Replace** | Replaces selected text | When you want to improve the original |
| **Insert Below** | Adds enhanced version below | When you want to keep both versions |
| **Insert Above** | Adds enhanced version above | When you want enhanced version first |
| **Copy to Clipboard** | Copies to clipboard | When you want to use elsewhere |

## Troubleshooting

### Common Issues

**🔧 Extension not activating**
```bash
# Check VSCode version
code --version

# Reinstall extension
code --uninstall-extension prompt-enhancer
code --install-extension prompt-enhancer-1.0.0.vsix
```

**🔧 TypeScript compilation errors during development**
```bash
# Clean and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run compile
```

**🔧 API key not working**
1. Verify your API key at [OpenAI Platform](https://platform.openai.com/api-keys)
2. Check your account has sufficient credits
3. Reconfigure the API key: Command Palette → "Prompt Enhancer: Configure API Key"

**🔧 Network/timeout errors**
1. Check your internet connection
2. Increase timeout in settings: `"promptEnhancer.timeout": 60000`
3. Try a different OpenAI model

**🔧 "No text selected" error**
- Make sure you have text selected before pressing the shortcut
- The selection must contain at least 3 characters

### Debug Mode
Enable debug logging by adding to your VSCode settings:
```json
{
  "promptEnhancer.debug": true
}
```

Then check the Output panel (View → Output → Prompt Enhancer) for detailed logs.

## Development Workflow

### Project Structure
```
prompt-enhancer/
├── src/                     # Source code
│   ├── extension.ts         # Main entry point
│   ├── commands/           # Command handlers
│   ├── services/           # API clients
│   ├── config/             # Settings management
│   ├── templates/          # Enhancement templates
│   ├── ui/                 # User interface components
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   └── test/               # Test files
├── package.json            # Extension manifest
├── tsconfig.json           # TypeScript configuration
├── webpack.config.js       # Build configuration
└── README.md              # Documentation
```

### Making Changes
1. **Edit Source Code**: Make changes in the `src/` directory
2. **Compile**: Run `npm run compile` or `npm run watch`
3. **Test**: Press `F5` to launch Extension Development Host
4. **Debug**: Use VSCode's debugger with breakpoints
5. **Package**: Run `npm run package` when ready

### Testing
```bash
# Run all tests
npm test

# Run specific test file
npm test -- --grep "TextProcessor"

# Run tests with coverage
npm run test:coverage
```

### Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## Performance Tips

### For Users
- Use GPT-4o-mini for faster responses and lower costs
- Keep selected text under 1000 characters for best performance
- Adjust timeout based on your internet connection

### For Developers
- Use `npm run watch` during development for automatic compilation
- Enable source maps for better debugging experience
- Use the Extension Development Host for testing changes

## Security Notes

- API keys are stored using VSCode's encrypted SecretStorage
- Only selected text is sent to OpenAI's API
- No sensitive information is logged
- All network communication uses HTTPS

## Support

- 📖 **Documentation**: Check the README.md and wiki
- 🐛 **Issues**: Report bugs on GitHub Issues
- 💬 **Discussions**: Join GitHub Discussions for questions
- 📧 **Email**: Contact support@prompt-enhancer.dev

---

**Happy enhancing! 🚀**