# Prompt Enhancer

## This is an initial version, please report bugs. This will be improved going forward.

Transform basic prompts into sophisticated, detailed prompts using OpenAI's API directly within Visual Studio Code. Originally, designed to help coders to convert their simple prompt into a technical prompt, for vibe coding. But, also added other options. 

![image1](https://raw.githubusercontent.com/ruhanirabin/vscode-prompt-enhancer/refs/heads/main/images/image1.png)
Initiate the process using a hotkey ⤴️

![image2](https://raw.githubusercontent.com/ruhanirabin/vscode-prompt-enhancer/refs/heads/main/images/image2.png)
Choose the option to insert ⤴️

![image3](https://raw.githubusercontent.com/ruhanirabin/vscode-prompt-enhancer/refs/heads/main/images/image3.png)
Example output ⤴️

## Features

### 🚀 **Universal One-Click Enhancement**
- Select any text anywhere in VSCode (editor, terminal, webviews, etc.)
- Press `Ctrl+Shift+Alt+/` (or `Cmd+Shift+Alt+/` on Mac)
- Extension automatically copies selected text and enhances it
- Works universally across all VSCode contexts

### 🎯 **Multiple Enhancement Templates**
- **General Enhancement**: Improve clarity, structure, and effectiveness
- **Technical Coding**: Optimize for code generation and technical tasks
- **Creative Writing**: Enhance for creative and narrative tasks
- **Code Comments**: Transform code snippets into well-documented code
- **Custom Template**: Use your own enhancement instructions

### 🔧 **Flexible Output Options**
- **Replace**: Replace selected text with enhanced version
- **Insert Below**: Add enhanced prompt below selection
- **Insert Above**: Add enhanced prompt above selection
- **Copy to Clipboard**: Copy enhanced prompt for use elsewhere

### 🔒 **Secure & Configurable**
- Encrypted API key storage using VSCode's SecretStorage
- Configurable OpenAI models (GPT-4o-mini, GPT-4o, GPT-3.5-turbo)
- Adjustable timeout, creativity, and token limits
- Works across all file types (text, markdown, code files)

## Quick Start

### 1. Install the Extension
Install from the VSCode Marketplace or package the extension locally.

### 2. Configure Your API Key
```
1. Use Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Run ">Prompt Enhancer: Configure API Key"
3. Enter your OpenAI API key
```

### 3. Start Enhancing
```
1. Select any text anywhere in VSCode (editor, terminal, webviews, etc.)
2. Press Ctrl+Shift+Alt+/ (Cmd+Shift+Alt+/ on Mac)
3. Choose an enhancement template
4. Enhanced text is automatically copied to clipboard (or choose other output options for editor text)
```

## Installation
([Click to Install](vscode:extension/ruhanirabin.prompt-enhancer-ex))

### Prerequisites
- Visual Studio Code 1.85.0 or higher
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## Usage Examples

### Example 1: Basic Prompt Enhancement
**Before:**
```
Write a function to sort an array
```

**After (Technical Template):**
```
Create a TypeScript function that sorts an array of numbers in ascending order. The function should:

- Accept an array of numbers as input parameter
- Return a new sorted array without modifying the original
- Handle edge cases like empty arrays and single-element arrays
- Include proper TypeScript type annotations
- Add JSDoc comments explaining the function's purpose and parameters
- Use an efficient sorting algorithm
- Include error handling for invalid inputs

Example usage and expected output should be provided in the comments.
```

### Example 2: Creative Writing Enhancement
**Before:**
```
A story about a robot
```

**After (Creative Template):**
```
Write a compelling short story about a sentient robot discovering emotions for the first time. The narrative should:

- Set in a near-future dystopian city with neon-lit streets and towering megastructures
- Feature a maintenance robot named Unit-7 who begins experiencing unexplained sensations
- Explore themes of consciousness, humanity, and what it means to feel
- Use vivid sensory descriptions to contrast the cold mechanical world with warm emotional experiences
- Include dialogue that reveals character development and internal conflict
- Build tension through the robot's struggle to understand and hide these new feelings
- Conclude with a meaningful revelation about the nature of consciousness
- Target length: 1,500-2,000 words
- Tone: Thoughtful and introspective with moments of wonder and fear
```

## Configuration

### Settings
Access settings via `File > Preferences > Settings` and search for "Prompt Enhancer":

| Setting | Default | Description |
|---------|---------|-------------|
| `promptEnhancer.model` | `gpt-4o-mini` | OpenAI model to use |
| `promptEnhancer.timeout` | `30000` | Request timeout (ms) |
| `promptEnhancer.defaultTemplate` | `general` | Default enhancement template |
| `promptEnhancer.maxTokens` | `1000` | Maximum response tokens |
| `promptEnhancer.temperature` | `0.7` | Creativity level (0-2) |
| `promptEnhancer.customTemplate` | `""` | Custom enhancement instructions |

### Model Comparison

| Model | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| GPT-4o-mini | ⚡⚡⚡ | ⭐⭐⭐ | 💰 | General use, cost-effective |
| GPT-4o | ⚡⚡ | ⭐⭐⭐⭐⭐ | 💰💰💰 | Complex prompts, highest quality |
| GPT-3.5-turbo | ⚡⚡⚡ | ⭐⭐ | 💰 | Simple enhancements, fastest |

## Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| `Prompt Enhancer: Enhance Prompt` | `Ctrl+Shift+Alt+/` | Enhance selected text (works anywhere) |
| `Prompt Enhancer: Configure API Key` | `Ctrl+Shift+Alt+P` | Set up OpenAI API key |

## Troubleshooting

### Common Issues

**❌ "No text selected" error**
- Solution: Select some text before using the enhancement command

**❌ "Invalid API key" error**
- Solution: Verify your OpenAI API key is correct and has sufficient credits

**❌ "Request timeout" error**
- Solution: Increase timeout in settings or check internet connection

**❌ "Rate limit exceeded" error**
- Solution: Wait a moment before trying again, or upgrade your OpenAI plan

### Getting Help
1. Check the [troubleshooting guide](https://github.com/your-repo/prompt-enhancer/wiki/Troubleshooting)
2. Search [existing issues](https://github.com/your-repo/prompt-enhancer/issues)
3. Create a [new issue](https://github.com/your-repo/prompt-enhancer/issues/new) with details

## Contributing

We welcome contributions! To contribute:

### Development Setup
1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## Privacy & Security

- **API Keys**: Stored securely using VSCode's encrypted SecretStorage
- **Data**: Only selected text is sent to OpenAI's API
- **Logging**: No sensitive information is logged
- **Network**: All communication uses HTTPS

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG](CHANGELOG.md)

## Support

- 🐛 Issues: [GitHub Issues](https://github.com/ruhanirabin/vscode-prompt-enhancer/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/ruhanirabin/vscode-prompt-enhancer/discussions)
- 📖 Wiki: [Documentation](https://github.com/ruhanirabin/vscode-prompt-enhancer/wiki)

---

**Made with ❤️ for the VSCode community**

Transform your prompts, enhance your productivity! 🚀