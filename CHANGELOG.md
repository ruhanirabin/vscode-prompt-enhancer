# Changelog

All notable changes to the "Prompt Enhancer" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.8] - 2026-02-23

### Fixed (v1.0.8 Patch)
- **Toolbar Icon**: Updated to use 24px icon (`images/pex-icon-24px-01.png`) for crisp display
- **Editor Title Button**: Icon button now appears in editor title bar for quick access

### Known Issues
- **Context Menu**: Right-click context menu temporarily disabled due to VSCode compatibility issues. Use toolbar button or keyboard shortcuts instead.

### Added
- **Dynamic Model Fetching**: Fetch available models directly from OpenAI API with 24-hour caching
- **Model Auto-Discovery**: Automatically discover new OpenAI models without extension updates
- **Smart Model Filtering**: Filter to text-based completion models only (excludes embeddings, image, audio, moderation)
- **Model Priority Sorting**: Models sorted by capability (GPT-5 first, then O-series, GPT-4, GPT-3.5)
- **Custom Model ID Entry**: Manual model ID input option for advanced users
- **Refresh Models Option**: Force-refresh model list from QuickPick interface
- **API Key Prompt on Demand**: Prompt users for API key when selecting models if not configured
- **Loading Indicators**: Progress notifications during model fetching

#### Prompt History (NEW)
- **Enhancement History**: Track all your prompt enhancements with full details
- **History Viewer**: Access via `Ctrl+Shift+Alt+H` or Command Palette
- **Statistics Dashboard**: View total enhancements, today's count, weekly usage, token consumption
- **Export History**: Export your enhancement history to JSON for backup or analysis
- **Search & Filter**: Find past enhancements by content
- **Individual Actions**: View details, copy enhanced text, or delete entries
- **VSCode Profile Sync**: History syncs with VSCode profile if sync is enabled
- **Configurable Limit**: Keep 10-500 history entries (default: 50)

#### Debug Mode (NEW)
- **Debug Logging**: Enable detailed logging for troubleshooting
- **Output Channel**: Dedicated "Prompt Enhancer (Debug)" output panel
- **Toggle Command**: `Ctrl+Shift+Alt+D` or Command Palette to toggle
- **Structured Logging**: Timestamped, categorized log entries
- **Data Inspection**: Log structured data for deep debugging

#### Rate Limiting (NEW)
- **Client-Side Rate Limiting**: Prevent API rate limit errors before they occur
- **Conservative Default**: 30 requests/minute (adjustable in code)
- **Pre-configured Profiles**: Standard, Conservative, Free Tier, Testing
- **Real-time Status**: See remaining requests and reset time
- **Automatic Throttling**: Wait automatically when limit reached
- **Error Prevention**: Clear error messages with wait time estimates

### Changed
- **OpenAIClient**: Added `listAvailableModels()` with intelligent caching and filtering
- **QuickPickManager**: Updated `showModelSelector()` to fetch dynamic models with API key handling
- **Model Type**: Changed from hardcoded enum to dynamic string for flexibility
- **Model Filter**: Now includes all text-based models (GPT-5, GPT-4.x, GPT-3.5, O1, O3, future models)
- **Excluded Models**: Embeddings, DALL-E, Whisper, TTS, moderation, and legacy models (Ada, Babbage, Curie)
- **Version**: Bumped to 1.0.8

### Improved
- **User Experience**: Users see latest OpenAI models automatically
- **Future-Proof**: Supports GPT-5, O3, and future model releases without code changes
- **Error Handling**: Graceful fallback to cached models or defaults on API errors
- **Documentation**: Added comprehensive technical specification with build instructions
- **Testing**: Added unit tests for core utilities (RateLimiter, ErrorHandler)

### Fixed
- **TypeScript Strict Mode**: Fixed exactOptionalPropertyTypes compliance in QuickPick
- **Model Selection**: Proper typing for QuickPick items with separators

### Technical Details
- **Cache Duration**: 24 hours (configurable via `CACHE_DURATION_MS`)
- **Cache Invalidation**: Automatic on API key change
- **API Endpoint**: `GET /v1/models` (OpenAI API)
- **Filtering Logic**: Pattern-based exclusion of non-text models
- **History Storage**: VSCode GlobalState (syncs with profile)
- **Debug Output**: Dedicated OutputChannel in VSCode

### Model Priority Order
1. GPT-5 (highest priority)
2. O3 reasoning models
3. O1-preview
4. O1-mini
5. O1
6. GPT-4o-mini
7. GPT-4o
8. GPT-4-turbo
9. GPT-4.5
10. GPT-4
11. GPT-3.5-turbo
12. Future GPT versions (6, 7, etc.)
13. Other chat/instruct models

### New Commands
| Command | Shortcut | Description |
|---------|----------|-------------|
| `View Enhancement History` | `Ctrl+Shift+Alt+H` | View and manage your enhancement history |
| `Toggle Debug Mode` | `Ctrl+Shift+Alt+D` | Enable/disable debug logging |
| `Clear Enhancement History` | - | Clear all stored enhancement history |

### New Settings
| Setting | Default | Description |
|---------|---------|-------------|
| `promptEnhancer.debugMode` | `false` | Enable debug mode for detailed logging |
| `promptEnhancer.enableHistory` | `true` | Enable prompt enhancement history tracking |
| `promptEnhancer.historyLimit` | `50` | Maximum history entries to keep (10-500) |

### UI Improvements (Editor Integration)

#### Editor Title Bar Button
- **Spark Icon Button**: Appears in editor title bar for quick access
- **One-Click Enhancement**: Click to enhance without keyboard shortcuts
- **Context-Aware**: Uses selection if available, entire editor text if not
- **Always Visible**: Shows in any editor with text content

#### Save Prompt Feature
- **Multiple Save Options**:
  - Save Original Text - Save selected/original prompt
  - Save Enhanced Text - Save last enhanced prompt
  - Save Both (Side by Side) - Save both in markdown format
- **Markdown Format**: Beautiful formatted output with metadata
- **Configurable Directory**: Set default save location in settings
- **File Naming**: Auto-generated names with timestamp
- **Quick Actions**: Open file or show in Explorer after saving
- **Metadata Included**: Model, template, timestamp in saved file

### New Commands
| Command | Shortcut | Description |
|---------|----------|-------------|
| `Enhance Prompt` | `Ctrl+Shift+Alt+/` | Enhance selected text (or editor text) |
| `Enhance Entire Editor Text` | - | Always use full editor document |
| `View Enhancement History` | `Ctrl+Shift+Alt+H` | View and manage your enhancement history |
| `Toggle Debug Mode` | `Ctrl+Shift+Alt+D` | Enable/disable debug logging |
| `Save Prompt to File` | - | Save prompt to markdown file |
| `Clear Enhancement History` | - | Clear all stored enhancement history |

### New Settings
| Setting | Default | Description |
|---------|---------|-------------|
| `promptEnhancer.debugMode` | `false` | Enable debug mode for detailed logging |
| `promptEnhancer.enableHistory` | `true` | Enable prompt enhancement history tracking |
| `promptEnhancer.historyLimit` | `50` | Maximum history entries to keep (10-500) |
| `promptEnhancer.savePromptDirectory` | `""` | Default directory to save prompts (empty = workspace root) |

### New Files
- `src/services/promptHistory.ts` - History management service
- `src/services/savePromptService.ts` - Save prompt to file service
- `src/utils/rateLimiter.ts` - Client-side rate limiting
- `src/utils/textProcessor.ts` - Updated with `createFullEditorContext()`
- `src/test/suite/rateLimiter.test.ts` - Rate limiter unit tests
- `src/test/suite/errorHandler.test.ts` - Error handler unit tests
- `TECHNICAL_SPECIFICATION.md` - Comprehensive technical documentation

### Dependencies
No new external dependencies added. All features implemented using existing packages.

### Migration Notes
- **Existing Users**: History will start fresh after update (no previous data to import)
- **API Keys**: No changes required, existing keys continue to work
- **Settings**: New settings added with sensible defaults (no action needed)
- **Templates**: All existing templates remain unchanged

### Known Limitations
- History does not import from previous versions (feature introduced in 1.0.8)
- Rate limiting is client-side only; server-side limits still apply
- Debug mode logs to VSCode Output panel only (not to file)
- Save Prompt requires workspace folder or manual file selection
- Editor title button only appears when editor has focus

### Planned for Next Release
- Cloud backup for history (beyond VSCode sync)
- Custom rate limit configuration via settings UI
- History search from Command Palette
- Bulk history operations (delete multiple, filter by date)
- Export to Markdown/PDF formats
- Saved prompts gallery view
- Quick templates from saved prompts

## [1.0.7] - 2025-08-02

### Added
- Enhanced quick pick interface with comprehensive model selection and configuration options
- Template management system with built-in template support (general, technical, creative, comments, custom)
- Template registry for dynamic template loading and management
- Template storage system for persistent template configuration
- Support for multiple AI providers with provider-specific model lists
- Configuration persistence for user preferences
- Enhanced prompt handling capabilities with improved user experience

### Changed
- Upgraded UI components with advanced quick pick interface
- Improved template system architecture with modular design
- Enhanced OpenAI client with extended model support
- Updated extension types to support new template and configuration features
- Refined command handling for better template management
- Updated package.json with template management command and keybinding

### Fixed
- Improved error handling in template operations
- Enhanced configuration validation and persistence
- Better user feedback for template selection and management

### Assets
- Updated extension icons with improved visual design
- Added new icon variants for better marketplace presentation

## [1.0.6] - 2025-08-02

### Added
- Added createClipboardContext method to validate and create context from clipboard text
- Added specific action for clipboard output in QuickPickManager
- Enhanced user feedback for clipboard operations and requirements

### Changed
- Updated applyEnhancedText to handle clipboard-based contexts, ensuring only clipboard actions are available
- Modified enhancePrompt command to first attempt to get text from the active editor, falling back to clipboard if necessary
- Adjusted keybindings to allow usage in various contexts (editor, webview, terminal)
- Updated README to improve clipboard handling documentation

### Fixed
- Improved error handling for clipboard text validation
- Enhanced clipboard handling in text processing

## [1.0.3] - 2025-08-01

### Fixed
- Updated README to clarify initial version and remove development section
- Improved documentation clarity

## [1.0.2] - 2025-08-01

### Fixed
- Fixed image paths in README documentation
- Restored LICENSE.md file
- Corrected license file references

## [1.0.1] - 2025-08-01

### Changed
- Refactored code structure for improved readability and maintainability
- Updated project documentation
- Added extension icon and promotional images

### Fixed
- Updated keybindings from Ctrl+Shift+E to Ctrl+Shift+Alt+/ for prompt enhancement
- Updated keybindings for API key configuration to Ctrl+Shift+Alt+P
- Removed deprecated test files and diagnostic scripts
- Updated @vscode/vsce dependency to version 3.6.0

## [1.0.0] - 2025-08-01

### Added
- Initial release of Prompt Enhancer extension
- Core prompt enhancement functionality using OpenAI's API
- Five enhancement templates:
  - General Enhancement for improving clarity and structure
  - Technical Coding for code generation and technical tasks
  - Creative Writing for narrative and creative tasks
  - Code Comments for documentation requests
  - Custom Template for user-defined enhancement styles
- Secure API key storage using VSCode's SecretStorage
- Multiple output options:
  - Replace selected text
  - Insert enhanced prompt below selection
  - Insert enhanced prompt above selection
  - Copy enhanced prompt to clipboard
- Configurable settings:
  - OpenAI model selection (GPT-4o-mini, GPT-4o, GPT-3.5-turbo)
  - Request timeout configuration
  - Maximum tokens and temperature settings
  - Default template selection
- Keyboard shortcut support (Ctrl+Shift+Alt+/ / Cmd+Shift+Alt+/)
- Loading indicators during API calls
- Comprehensive error handling with user-friendly messages
- Retry mechanisms for failed requests
- Cross-platform compatibility (Windows, macOS, Linux)
- Support for all file types (text, markdown, code files)
- Welcome message and quick start guide for new users
- Extensive logging and debugging capabilities

### Security
- Encrypted API key storage
- HTTPS-only communication with OpenAI
- No sensitive information logging
- Input validation and sanitization

### Performance
- Efficient text processing
- Optimized API request handling
- Minimal memory footprint
- Fast response times with GPT-4o-mini

### Developer Experience
- Full TypeScript implementation
- Comprehensive test suite
- Detailed documentation
- Clean, modular architecture
- ESLint configuration
- Webpack bundling for optimal performance

### Planned Features
- Batch processing for multiple selections
- Custom template editor with syntax highlighting
- Prompt history and favorites
- Integration with popular AI services beyond OpenAI
- Advanced text preprocessing options
- Collaborative prompt sharing
- Performance analytics and usage statistics
- Dark/light theme support for UI components
- Keyboard shortcuts customization
- Export/import settings functionality

### Known Issues
- None currently reported

## Development Notes

### Performance Benchmarks
- **Average Enhancement Time**: 2-5 seconds (depending on model and text length)
- **Memory Usage**: <10MB during operation
- **Bundle Size**: <500KB compressed
- **Startup Time**: <100ms extension activation

### Security Measures
- API keys encrypted at rest using VSCode's secure storage
- All network communication over HTTPS
- Input validation prevents malicious content
- No telemetry or user data collection
- Minimal required permissions

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:
- Code style and standards
- Testing requirements
- Pull request process
- Issue reporting guidelines

## Support

For support, please:
1. Check the [README](README.md) for usage instructions
2. Review the [Setup Guide](SETUP.md) for installation help
3. Search [existing issues](https://github.com/ruhanirabin/vscode-prompt-enhancer/issues)
4. Create a [new issue](https://github.com/ruhanirabin/vscode-prompt-enhancer/issues/new) if needed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Thank you for using Prompt Enhancer!** 🚀

Your feedback and contributions help make this extension better for everyone.