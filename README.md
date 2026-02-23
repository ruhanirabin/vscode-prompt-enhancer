# Prompt Enhancer

**Version 1.0.8** | [Changelog](CHANGELOG.md) | [Technical Specs](TECHNICAL_SPECIFICATION.md)

---

Transform basic prompts into sophisticated, detailed prompts using OpenAI's API directly within Visual Studio Code. Designed for vibe coding, AI-assisted development, and prompt engineering best practices.

![Enhance with Hotkey](https://raw.githubusercontent.com/ruhanirabin/vscode-prompt-enhancer/refs/heads/main/images/image1.png)
*Initiate enhancement with a hotkey ⤴️*

![Choose Output Option](https://raw.githubusercontent.com/ruhanirabin/vscode-prompt-enhancer/refs/heads/main/images/image2.png)
*Choose how to apply the enhanced prompt ⤴️*

![Example Output](https://raw.githubusercontent.com/ruhanirabin/vscode-prompt-enhancer/refs/heads/main/images/image3.png)
*Example enhancement output ⤴️*

![Template Manager](https://raw.githubusercontent.com/ruhanirabin/vscode-prompt-enhancer/refs/heads/main/images/template-manager.png)
*Manage templates with import/export ⤴️*

![Model Selector](https://raw.githubusercontent.com/ruhanirabin/vscode-prompt-enhancer/refs/heads/main/images/image4.png)
*Select model to use ⤴️*
---

## ✨ What's New in v1.0.8

### 🎨 UI Enhancements
- **Editor Title Bar Button**: One-click enhancement from editor header
- **Command Palette Access**: All commands available via Ctrl+Shift+P
- **Save Prompt Feature**: Save enhancements to markdown files

### 📜 Prompt History
- **Enhancement Tracking**: All your enhancements with full metadata
- **Statistics Dashboard**: View usage, tokens, and performance
- **Export/Import**: Backup and restore your history
- **VSCode Sync**: History syncs with your VSCode profile

### 🔍 Dynamic Model Discovery
- **Auto-Discovery**: Fetch latest OpenAI models automatically
- **Smart Filtering**: Text models only (no embeddings/images)
- **Priority Sorting**: Best models first (GPT-5, O-series, GPT-4)
- **Custom Model ID**: Enter any model ID manually

### 🛡️ Rate Limiting
- **Client-Side Protection**: Prevent API rate limit errors
- **Real-time Status**: See remaining requests
- **Auto-Throttling**: Wait automatically when needed

### 🐛 Debug Mode
- **Detailed Logging**: Timestamped, categorized logs
- **Output Channel**: Dedicated debug panel
- **Toggle Command**: Quick enable/disable

---

## 🚀 Features

### **Universal One-Click Enhancement**
- Select any text anywhere in VSCode (editor, terminal, webviews)
- Press `Ctrl+Shift+Alt+/` or click the title bar button
- Command Palette access for all commands
- Works universally across all VSCode contexts

### **Dynamic Model Selection**
- **Auto-Discovery**: Fetches available models from OpenAI API
- **24-Hour Cache**: Fast loading with periodic refresh
- **Smart Filtering**: Excludes embeddings, image, audio models
- **Model Priority**: GPT-5 → O-series → GPT-4 → GPT-3.5
- **Custom Entry**: Manually enter any model ID

### **Advanced Template Management**
- **Built-in Templates**: 5 professionally crafted templates
  - **General Enhancement**: Improve clarity and structure
  - **Technical Coding**: Optimize for code generation
  - **Creative Writing**: Enhance narrative tasks
  - **Code Comments**: Generate documentation
  - **Custom Template**: Your own instructions
- **Template Manager**: Create, edit, import/export (`Ctrl+Shift+Alt+T`)
- **Dynamic Loading**: Templates persist with version control

### **Prompt History**
- **Full Tracking**: Original + enhanced text with metadata
- **Statistics**: Total, today, weekly, tokens, avg time
- **Search**: Find past enhancements by content
- **Export**: JSON backup of all history
- **Individual Actions**: View, copy, delete entries
- **Profile Sync**: Syncs with VSCode settings sync

### **Save Prompt to File**
- **Multiple Formats**:
  - Original text only
  - Enhanced text only
  - Both side-by-side (markdown)
- **Auto-Naming**: Timestamp-based filenames
- **Configurable Path**: Set default save directory
- **Metadata Included**: Model, template, timestamp
- **Quick Actions**: Open file or show in Explorer

### **Flexible Output Options**
- **Replace**: Replace selected text
- **Insert Below**: Add below selection
- **Insert Above**: Add above selection
- **Copy to Clipboard**: Copy for use elsewhere

### **Secure & Configurable**
- **Encrypted Storage**: API keys in VSCode SecretStorage
- **Dynamic Models**: Auto-fetch from OpenAI
- **Adjustable Settings**: Timeout, tokens, temperature
- **Debug Mode**: Detailed logging for troubleshooting
- **Rate Limiting**: Client-side protection

---

## 📖 Quick Start

### 1. Install the Extension

[Install from Marketplace](vscode:extension/ruhanirabin.prompt-enhancer-ex)

Or install locally:
```bash
# Download the .vsix file
code --install-extension prompt-enhancer-ex-1.0.8.vsix
```

### 2. Configure Your API Key

```
1. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
2. Run "Prompt Enhancer: Configure API Key"
3. Enter your OpenAI API key
```

Get your API key from: https://platform.openai.com/api-keys

### 3. Start Enhancing

**Method 1: Keyboard Shortcut**
```
1. Select text (or leave unselected for full editor)
2. Press Ctrl+Shift+Alt+/ (Cmd+Shift+Alt+/ on Mac)
3. Choose template
4. Select output action
```

**Method 2: Title Bar Button**
```
1. Click the spark icon in editor title bar
2. Choose template
3. Select output action
```

**Method 3: Command Palette**
```
1. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
2. Type "Prompt Enhancer: Enhance"
3. Choose template
4. Select output action
```

**Change Model**
```
1. Press Ctrl+Shift+P
2. Type "Prompt Enhancer: Select Model"
   Or press Ctrl+Shift+Alt+M (Cmd+Shift+Alt+M on Mac)
3. View full dynamic model list from OpenAI
4. Select desired model
```

---

## 🎯 Usage Examples

### Example 1: Technical Coding Prompt

**Before:**
```
Write a function to sort an array
```

**After (Technical Template):**
```typescript
/**
 * Sorts an array of numbers in ascending order
 * @param {number[]} arr - The array to sort
 * @returns {number[]} A new sorted array
 * @throws {TypeError} If input is not an array of numbers
 */
function sortArray(arr: number[]): number[] {
  if (!Array.isArray(arr)) {
    throw new TypeError('Input must be an array');
  }
  
  if (!arr.every(n => typeof n === 'number')) {
    throw new TypeError('All elements must be numbers');
  }
  
  return [...arr].sort((a, b) => a - b);
}

// Example usage:
// sortArray([3, 1, 4, 1, 5]) // returns [1, 1, 3, 4, 5]
```

### Example 2: Creative Writing

**Before:**
```
A story about a robot
```

**After (Creative Template):**
```
Write a compelling short story about a sentient robot discovering emotions.

**Setting:** Near-future dystopian city with neon-lit streets
**Protagonist:** Unit-7, a maintenance robot
**Themes:** Consciousness, humanity, emotion vs logic
**Tone:** Thoughtful, introspective, with wonder and fear
**Length:** 1,500-2,000 words

**Requirements:**
- Vivid sensory descriptions
- Character development through dialogue
- Build tension through internal conflict
- Meaningful conclusion about consciousness
```

### Example 3: Save Enhanced Prompt

After enhancing, use **Command Palette** or the **Save Prompt** command:

1. Press `Ctrl+Shift+P`
2. Type "Prompt Enhancer: Save Prompt"
3. Choose save option:
   - Original text
   - Enhanced text
   - Both (markdown format)

2. File saved to workspace (or configured directory):
   ```
   prompt-write-a-sort-function-1708712345.md
   ```

3. Quick actions:
   - Open File
   - Show in Explorer

---

## ⌨️ Commands & Shortcuts

| Command | Shortcut | Description |
|---------|----------|-------------|
| **Enhance Prompt** | `Ctrl+Shift+Alt+/` | Enhance selected text (or editor) |
| **Enhance Entire Editor** | - | Always use full document |
| **Select OpenAI Model** | `Ctrl+Shift+Alt+M` | View and select from dynamic model list |
| **Configure API Key** | `Ctrl+Shift+Alt+P` | Set OpenAI API key |
| **Manage Templates** | `Ctrl+Shift+Alt+T` | Template management |
| **View History** | `Ctrl+Shift+Alt+H` | View enhancement history |
| **Toggle Debug Mode** | `Ctrl+Shift+Alt+D` | Enable/disable debug logs |
| **Save Prompt** | - | Save to markdown file |
| **Clear History** | - | Clear all history |

### UI Access Points

1. **Editor Title Bar**: Click spark icon
2. **Command Palette**: All commands available (`Ctrl+Shift+P`)
3. **Keyboard Shortcuts**: See Commands table below

---

## ⚙️ Configuration

### Settings

Access via `File > Preferences > Settings` → search "Prompt Enhancer"

| Setting | Default | Description |
|---------|---------|-------------|
| `promptEnhancer.model` | `gpt-4o-mini` | Default model (dynamic list) |
| `promptEnhancer.timeout` | `30000` | Request timeout (ms) |
| `promptEnhancer.defaultTemplate` | `general` | Default template |
| `promptEnhancer.maxTokens` | `1000` | Max response tokens (100-4000) |
| `promptEnhancer.temperature` | `0.7` | Creativity (0.0-2.0) |
| `promptEnhancer.customTemplate` | `""` | Custom template text |
| `promptEnhancer.debugMode` | `false` | Enable debug logging |
| `promptEnhancer.enableHistory` | `true` | Enable history tracking |
| `promptEnhancer.historyLimit` | `50` | Max history entries (10-500) |
| `promptEnhancer.savePromptDirectory` | `""` | Default save path |

### Model Comparison

| Model | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| **GPT-4o-mini** | ⚡⚡⚡ | ⭐⭐⭐ | 💰 | Daily use, cost-effective |
| **GPT-4o** | ⚡⚡ | ⭐⭐⭐⭐⭐ | 💰💰💰 | Complex tasks, best quality |
| **GPT-3.5-turbo** | ⚡⚡⚡ | ⭐⭐ | 💰 | Simple prompts, fastest |
| **O1 Preview** | ⚡ | ⭐⭐⭐⭐⭐ | 💰💰💰💰 | Reasoning, complex logic |
| **O1 Mini** | ⚡⚡ | ⭐⭐⭐⭐ | 💰💰💰 | Technical reasoning |

*Dynamic model discovery shows all available models automatically.*

---

## 🔧 Troubleshooting

### Common Issues

**❌ "No text selected" error**
- Select text or use "Enhance Entire Editor" command
- Editor title button works with full document

**❌ "Invalid API key" error**
- Verify API key is correct (starts with `sk-`)
- Check API key has available credits
- Re-enter via Command Palette

**❌ "Request timeout" error**
- Increase timeout in settings
- Check internet connection
- Try a different model

**❌ "Rate limit exceeded" error**
- Wait for the shown countdown
- Client-side limiter prevents this now
- Check OpenAI account tier limits

**❌ "No models returned" error**
- Check API key validity
- Verify internet connection
- Use "Custom Model ID" as fallback

**❌ History not showing**
- Ensure `enableHistory` is true
- Check if history was cleared
- Verify VSCode sync if using multiple devices

### Debug Mode

Enable for detailed troubleshooting:

1. Press `Ctrl+Shift+Alt+D` to toggle
2. View logs: `View > Output > Prompt Enhancer (Debug)`
3. Logs include timestamps, categories, and data

---

## 📦 Installation Options

### From Marketplace (Recommended)
[Install from VSCode Marketplace](vscode:extension/ruhanirabin.prompt-enhancer-ex)

### Manual Installation
```bash
# Download .vsix from releases
code --install-extension prompt-enhancer-ex-1.0.8.vsix
```

### Build from Source
```bash
git clone https://github.com/ruhanirabin/vscode-prompt-enhancer.git
cd vscode-prompt-enhancer
npm install
npm run package
code --install-extension prompt-enhancer-ex-1.0.8.vsix
```

---

## 🛠️ Development

### Prerequisites
- Node.js 18.x or higher
- VSCode 1.85.0 or higher
- OpenAI API key

### Setup
```bash
npm install
npm run watch    # Development mode
npm run compile  # One-time build
npm run lint     # Code quality check
npm test         # Run tests
```

### Testing
```bash
# Unit tests
npm test

# Run extension
F5 in VSCode

# Package for distribution
npm run package
```

See [TECHNICAL_SPECIFICATION.md](TECHNICAL_SPECIFICATION.md) for full details.

---

## 🔒 Privacy & Security

- **API Keys**: Encrypted via VSCode SecretStorage
- **Data**: Only selected text sent to OpenAI
- **History**: Stored locally, syncs via VSCode (if enabled)
- **No Telemetry**: No user data collection
- **HTTPS Only**: All communication encrypted
- **Open Source**: Full code transparency

---

## 📚 Additional Resources

- [CHANGELOG](CHANGELOG.md) - Version history
- [TECHNICAL_SPECIFICATION.md](TECHNICAL_SPECIFICATION.md) - Build & dev guide
- [GitHub Issues](https://github.com/ruhanirabin/vscode-prompt-enhancer/issues) - Report bugs
- [Discussions](https://github.com/ruhanirabin/vscode-prompt-enhancer/discussions) - Community

---

## 🤝 Contributing

Contributions welcome! See our [Contributing Guide](CONTRIBUTING.md):

1. Fork the repository
2. Create feature branch
3. Make changes
4. Run `npm run lint` and `npm test`
5. Submit pull request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/ruhanirabin/vscode-prompt-enhancer/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/ruhanirabin/vscode-prompt-enhancer/discussions)
- 📖 **Docs**: [Wiki](https://github.com/ruhanirabin/vscode-prompt-enhancer/wiki)
- ⭐ **Rate**: Leave a review on the Marketplace

---

**Made with ❤️ for the VSCode community**

*Transform your prompts, enhance your productivity!* 🚀

---

## 📊 Version History

| Version | Date | Key Features |
|---------|------|--------------|
| 1.0.8 | 2026-02-23 | UI buttons, history, save prompt, rate limiting, debug mode, dynamic models |
| 1.0.7 | 2025-08-02 | Template manager, dynamic templates |
| 1.0.6 | 2025-08-01 | Clipboard handling improvements |
| 1.0.0 | 2025-08-01 | Initial release |

See [CHANGELOG.md](CHANGELOG.md) for full history.
