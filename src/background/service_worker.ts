// Background service worker for ScamBomb Gmail extension
// Handles API calls and messaging with content scripts

chrome.runtime.onInstalled.addListener(() => {
  console.log('ScamBomb Gmail extension installed');
});

// Placeholder for future message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle messages from content script
  if (request.action === 'scanEmail') {
    // Placeholder response
    sendResponse({ success: true, message: 'Scan initiated (placeholder)' });
  }
  return true; // Keep message channel open for async response
});
