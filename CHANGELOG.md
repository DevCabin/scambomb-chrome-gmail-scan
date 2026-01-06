# Changelog

All notable changes to the ScamBomb Gmail Chrome Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-01-XX

### Added
- Initial Chrome extension skeleton with Manifest V3
- Gmail content script that detects email views and injects scan button
- Background service worker for API communication
- TypeScript configuration and Vite build setup
- Basic project structure and documentation
- Polished "Scan with ScamBomb" button with final positioning and styling

### Technical Details
- Content script uses MutationObserver for Gmail DOM changes
- Button positioned as fixed overlay (top: 120px, right: 120px) to avoid Gmail layout conflicts
- Yellow alert styling (#ffc107) with black text for high visibility
- Extension permissions limited to activeTab and ScamBomb domains
- HTTPS-only API communication
- No local storage of email content
- Cookie-based authentication support

### Known Limitations
- Button shows placeholder alert only (M2 will add real functionality)
- No email extraction or API integration yet
- No error handling or loading states
- No modal UI for results display
