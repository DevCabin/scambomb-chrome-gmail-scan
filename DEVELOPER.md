# Developer Guide: ScamBomb Gmail Chrome Extension

This guide explains the technical setup and architecture of the ScamBomb Gmail Chrome Extension in simple terms, designed for developers with basic to junior-level experience.

## What This Extension Does

Imagine you're in Gmail reading an email that looks suspicious. Instead of copying the email text, going to another website, and pasting it there, this extension adds a button right in Gmail that does all the work for you. One click scans the email using AI and shows you if it's safe or dangerous.

## Project Structure

```
scambomb-chrome-gmail-scan/
├── src/                          # Source code
│   ├── manifest.json            # Extension configuration
│   ├── content/                 # Code that runs on Gmail pages
│   │   ├── inject.ts           # Main Gmail integration script
│   │   └── styles.css          # Styling for injected elements
│   └── background/              # Code that runs in background
│       └── service_worker.ts    # API communication
├── package.json                 # Project dependencies
├── tsconfig.json               # TypeScript settings
├── vite.config.ts              # Build tool configuration
└── README.md                   # Main documentation
```

## How Chrome Extensions Work

Chrome extensions are like mini websites that can interact with web pages. This extension has three main parts:

### 1. Manifest File (`manifest.json`)
This is like the extension's ID card. It tells Chrome:
- What the extension is called
- What permissions it needs
- Which files to load where

### 2. Content Scripts
These are JavaScript files that run on specific websites (in our case, Gmail). They can:
- Read the page content
- Add buttons or other UI elements
- Send messages to the background script

### 3. Background Service Worker
This is like a behind-the-scenes worker that:
- Makes API calls to our server
- Stores temporary data
- Coordinates between different parts of the extension

## Setting Up Your Development Environment

### Step 1: Install Tools
You'll need Node.js (version 18 or higher). You can download it from [nodejs.org](https://nodejs.org/).

### Step 2: Get the Code
```bash
# Clone the project
git clone https://github.com/DevCabin/scambomb-chrome-gmail-scan.git

# Go into the project folder
cd scambomb-chrome-gmail-scan

# Install dependencies (this downloads the tools we need)
npm install
```

### Step 3: Build the Extension
```bash
# For development (auto-rebuilds when you change files)
npm run dev

# For production (creates final version)
npm run build
```

### Step 4: Load in Chrome
1. Open Chrome
2. Type `chrome://extensions/` in the address bar
3. Turn on "Developer mode" (switch in top right)
4. Click "Load unpacked"
5. Select the `dist` folder that was created by the build

## Understanding the Code

### Gmail Detection (`src/content/inject.ts`)

This script watches Gmail for changes. When you open an email, it automatically adds our scan button.

**Key Concepts:**
- **MutationObserver**: Like a security camera that watches for changes on the page
- **DOM**: The structure of the web page (buttons, text, etc.)
- **Event Listeners**: Code that waits for user actions (like button clicks)

```typescript
// This watches the entire Gmail page for changes
this.observer = new MutationObserver((mutations) => {
  // When something changes, check if we're looking at an email
  this.checkForEmailView();
});
```

### API Communication (`src/background/service_worker.ts`)

When you click the scan button, this code sends the email data to our server and gets back the analysis.

**Key Concepts:**
- **Messages**: How different parts of the extension talk to each other
- **Fetch API**: How we make HTTP requests (like sending data to a server)
- **Promises**: A way to handle operations that take time (like waiting for server responses)

### TypeScript

We use TypeScript instead of regular JavaScript because it helps catch mistakes before you run the code. It's like having a spell checker for your code.

## Common Tasks

### Adding a New Feature

1. **Plan what you want to do** - Write it down in simple terms
2. **Find where the code should go** - Content script for Gmail changes, background for API calls
3. **Write the code** - Start small, test often
4. **Test in Gmail** - Make sure it works
5. **Update documentation** - Tell others what you changed

### Testing Your Changes

1. Make your code changes
2. Run `npm run build`
3. Go to `chrome://extensions/`
4. Click the refresh button on your extension
5. Test in Gmail

### Debugging

- **Console Logs**: Add `console.log('debug message')` to see what's happening
- **Chrome DevTools**: Press F12 in Gmail to see errors
- **Extension DevTools**: Click on your extension in `chrome://extensions/` and open its dev tools

## Gmail Integration Challenges

Gmail's interface can change, so our code needs to be flexible:

### Finding Elements
Instead of looking for specific element IDs (which can change), we look for patterns:
- Elements with certain classes
- Elements with certain roles
- Text content patterns

### Handling Updates
- Gmail updates their interface sometimes
- Our selectors might break
- We need to test after Gmail updates

## Security Considerations

### Never Store Email Content
- Email text is sensitive
- We send it to the server but don't keep it locally
- No console.log of email content in production

### HTTPS Only
- All communication must be encrypted
- Only talk to `https://scambomb.com`
- No plain HTTP requests

### Minimal Permissions
- Only ask for what we absolutely need
- `activeTab` - to interact with the current tab
- Host permissions for our server

## API Integration

Our server expects this format:
```javascript
{
  "sender": "who sent the email",
  "body": "the email text",
  "context": "where this came from"
}
```

It returns:
```javascript
{
  "text": "full explanation",
  "verdict": "SAFE, UNSAFE, or UNKNOWN",
  "threatLevel": "percentage"
}
```

## Error Handling

Things can go wrong:
- Network connection fails
- Server is down
- User has no internet
- Gmail interface changes

Always plan for these cases and show helpful messages to users.

## Learning Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [JavaScript MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Gmail API](https://developers.google.com/gmail/api) (for advanced features)

## Getting Help

- Check the README.md for setup instructions
- Look at existing code for examples
- Ask questions in GitHub issues
- Test everything thoroughly before committing

Remember: Start small, test often, and don't be afraid to ask for help!
