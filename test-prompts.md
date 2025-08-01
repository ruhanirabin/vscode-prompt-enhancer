# Test Prompts for Prompt Enhancer Extension

This file contains various test prompts to demonstrate the Prompt Enhancer extension functionality.

## Basic Prompts to Test

### General Enhancement Test
Write a blog post about artificial intelligence

### Technical Coding Test
Create a function to sort an array

### Creative Writing Test
Write a story about a robot

### Code Comments Test
```javascript
function calculateTotal(items) {
    let sum = 0;
    for (let item of items) {
        sum += item.price;
    }
    return sum;
}
```

### Short Prompt Test
Help me code

### Medium Prompt Test
I need to build a web application that allows users to upload images, resize them automatically, and store them in a database. The application should have user authentication and be built with modern web technologies.

## How to Test the Extension

1. **Install the Extension**: The extension should now be installed in your VSCode
2. **Select Text**: Highlight any of the prompts above
3. **Trigger Enhancement**: Press `Ctrl+Shift+E` (or `Cmd+Shift+E` on Mac)
4. **Configure API Key**: If prompted, enter your OpenAI API key
5. **Choose Template**: Select an enhancement template
6. **Apply Result**: Choose how to apply the enhanced prompt

## Expected Behavior

- ✅ Extension activates when text is selected
- ✅ Keyboard shortcut works (Ctrl+Shift+E)
- ✅ Template selection appears
- ✅ Loading indicator shows during API call
- ✅ Enhanced prompt is generated
- ✅ Output options are presented
- ✅ Text is applied according to user choice

## Test Different File Types

Try the extension with:
- ✅ Markdown files (.md) - like this file
- ✅ Plain text files (.txt)
- ✅ JavaScript files (.js)
- ✅ Python files (.py)
- ✅ Any other text-based files

## Settings to Test

Access VSCode Settings (Ctrl+,) and search for "Prompt Enhancer" to test:
- Model selection (GPT-4o-mini, GPT-4o, GPT-3.5-turbo)
- Timeout adjustment
- Temperature settings
- Max tokens configuration
- Default template selection

## Commands to Test

Open Command Palette (Ctrl+Shift+P) and try:
- "Prompt Enhancer: Enhance Prompt"
- "Prompt Enhancer: Configure API Key"

---

**Ready to test!** Select any prompt above and press Ctrl+Shift+E to see the magic happen! 🚀