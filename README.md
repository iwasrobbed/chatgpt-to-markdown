# ChatGPT to Markdown: Chrome Extension

A Chrome extension to export ChatGPT conversations as clean, properly formatted markdown files.

![ChatGPT to Markdown: Chrome Extension](https://github.com/user-attachments/assets/ac025535-44a6-4cef-89ad-27d9c32a0f86)

## Features

- ✅ Works locally in your browser
- ✅ No data is sent to any external servers
- ✅ Clean markdown formatting
- ✅ Proper bullet point spacing
- ✅ Table formatting
- ✅ Code block support
- ✅ HTML entity conversion
- ✅ Automatic filename with date
- ✅ Download location indicator
- ✅ Quick access to Downloads folder
- ✅ Works on both chat.openai.com and chatgpt.com
- ✅ Comprehensive test suite
- ✅ Modular, maintainable codebase

## Installation (Developer Mode)

### Option 1: Use Pre-built Extension

1. **Build the extension**

   ```bash
   bun install
   bun run build
   ```

2. **Enable Developer Mode in Chrome**

   - Open Chrome and go to `chrome://extensions/`
   - Toggle "Developer mode" in the top right corner

3. **Load the extension**
   - Click "Load unpacked"
   - Select the `dist/` folder (not the root folder)
   - The extension should now appear in your extensions list

## Usage

1. **Navigate to ChatGPT**

   - Go to `chat.openai.com` or `chatgpt.com`
   - Open any conversation

2. **Export the conversation**
   - Click the extension icon in your toolbar
   - Click "Export Conversation"
   - The markdown file will automatically download to your Downloads folder
   - The extension will show you the filename and provide a button to open your Downloads folder

## Development

### Prerequisites

- [Bun](https://bun.sh/) - Fast JavaScript runtime and package manager

### Setup

```bash
# Install dependencies
bun install

# Run tests
bun test

# Run tests in watch mode
bun test --watch

# Build the extension
bun run build

# Format code
bun run format
```

### Project Structure

```
├── src/                          # Source code (modular)
│   ├── utils/
│   │   ├── markdown-converter.js # HTML to Markdown conversion
│   │   ├── dom-extractor.js      # DOM parsing utilities
│   │   └── file-utils.js         # File handling utilities
│   ├── conversation-exporter.js  # Main export logic
│   ├── content.js               # Content script entry
│   ├── popup.js                 # Popup script entry
│   └── popup.html               # Extension popup UI
├── test/                        # Test files
│   ├── markdown-converter.test.js
│   ├── dom-extractor.test.js
│   ├── file-utils.test.js
│   └── conversation-exporter.test.js
├── scripts/
│   └── build.js                 # Build script
├── dist/                        # Built extension files
└── manifest.json               # Chrome extension manifest
```

### Building

The build process bundles the modular source code into Chrome-compatible files:

```bash
bun run build
```

This creates a `dist/` directory with:

- `content.js` - Bundled content script
- `popup.js` - Bundled popup script
- `manifest.json` - Extension manifest
- `popup.html` - Popup UI

## File Output

The extension exports files as `ChatGPT-Conversation-YYYY-MM-DD.md` with clean formatting:

```markdown
**You**: Your question here

**ChatGPT**: AI response with proper formatting including:

- Bullet points
- **Bold text**
- _Italic text_
- Code blocks
- Tables

## Headers work too
```

## Downloaded Files

Files are automatically saved to your default Downloads folder with the format:
`ChatGPT-Conversation-YYYY-MM-DD.md`

After export, the extension will:

- Show the exact filename that was created
- Provide a "Open Downloads Folder" button for quick access
- You can also access downloads via Chrome's menu (⋮) → Downloads or `Ctrl+Shift+J`

## Troubleshooting

- **"ChatGPT page required" error**: Make sure you're on a ChatGPT conversation page
- **No content exported**: Try refreshing the page and ensuring the conversation is fully loaded
- **Can't find downloaded file**: Click the "Open Downloads Folder" button or check your default Downloads location
- **Extension not working**: Check the browser console for errors and reload the extension

## Notes

- This extension only works on ChatGPT pages for security
- All processing happens locally in your browser
- No data is sent to any external servers
