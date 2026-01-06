# ScamBomb Gmail Chrome Extension

A Chrome extension that integrates ScamBomb's AI-powered email scanning directly into Gmail, allowing users to check suspicious emails with a single click without leaving their inbox.

## Purpose

This extension reduces user behavior change by providing seamless integration with Gmail web (mail.google.com). Users can scan emails for scams using ScamBomb's advanced AI analysis without copying/pasting content or visiting external websites.

## Features

- **One-Click Scanning**: Injects a "Scan with ScamBomb" button directly into Gmail's email view
- **AI-Powered Analysis**: Uses ScamBomb's proprietary AI to detect scams, phishing, and suspicious content
- **Seamless Integration**: No need to leave Gmail or copy email content
- **Security-First**: HTTPS-only communications, no local data storage of email content
- **Usage Tracking**: Integrates with ScamBomb's authentication and billing system

## Target Platforms

- Chrome and Chromium-based browsers
- Gmail web application (mail.google.com)
- Desktop browsers only (mobile Gmail web not supported)

## Architecture Overview

### Components

1. **Content Script** (`src/content/inject.ts`)
   - Injects UI elements into Gmail DOM
   - Detects when emails are opened using MutationObserver
   - Extracts email data (sender, subject, body) for analysis
   - Displays scan results in a modal overlay

2. **Background Service Worker** (`src/background/service_worker.ts`)
   - Handles API communications with ScamBomb backend
   - Manages authentication via cookies
   - Processes scan requests and responses

3. **UI Components**
   - Modal dialog for displaying analysis results
   - Loading states and error handling
   - Upgrade prompts for usage limits

### Data Flow

```
User clicks "Scan" → Content script extracts data → Background worker API call → ScamBomb analysis → Results displayed
```

## API Integration

### Analyze Endpoint
```
POST https://scambomb.com/api/analyze
```

**Request Body:**
```json
{
  "sender": "example@domain.com",
  "body": "Email content here...",
  "context": "Gmail extension scan; subject: Email Subject"
}
```

**Response:**
```json
{
  "text": "Full AI analysis explanation...",
  "verdict": "SAFE | UNSAFE | UNKNOWN",
  "threatLevel": "75%"
}
```

**Rate Limiting:**
- Free users: 5 scans
- Returns HTTP 402 with `{"error": "Free limit reached"}` when exceeded
- Premium users: Unlimited (server-enforced)

## Installation & Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/DevCabin/scambomb-chrome-gmail-scan.git
cd scambomb-chrome-gmail-scan

# Install dependencies
npm install

# Development build
npm run dev

# Production build
npm run build
```

### Loading in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from your build

### Testing
- Open Gmail in a new tab
- Open any email
- Look for the red "Scan with ScamBomb" button near the email toolbar
- Click to test (currently shows placeholder alert)

## Development Milestones

- **M1: Skeleton** ✅ - Basic extension structure, Gmail injection, and polished button UI
- **M2: Extraction & UI** - Email data extraction and result modal
- **M3: API Integration** - Backend API calls and result display
- **M4: Limits & Upgrade** - Handle usage limits and upgrade flows
- **M5: Hardening** - Error handling and production polish

## Security & Privacy

- **No Data Persistence**: Email content is never stored locally
- **HTTPS Only**: All network requests use TLS encryption
- **Minimal Permissions**: Limited to activeTab and host permissions for ScamBomb domains
- **Cookie-Based Auth**: Leverages existing ScamBomb session cookies
- **No Logging**: Email content is not logged to console or external services

## Browser Permissions

```json
{
  "permissions": ["activeTab", "storage"],
  "host_permissions": ["https://scambomb.com/*", "https://localhost:3000/*"]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly in Gmail
5. Submit a pull request

## Support

For issues or questions:
- Open a GitHub issue
- Contact the development team

## License

Copyright 2026 DevCabin. All rights reserved.
