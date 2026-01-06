// Background service worker for ScamBomb Gmail extension
// Handles API calls and messaging with content scripts

import { ScanRequest, ScanResponse, ScanError, EmailData } from '../types/api';

const API_BASE_URL = 'https://scambomb.com';
const API_ENDPOINT = `${API_BASE_URL}/api/analyze`;

chrome.runtime.onInstalled.addListener(() => {
  console.log('ScamBomb Gmail extension installed');
});

/**
 * Handle messages from content scripts
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scanEmail' && request.emailData) {
    handleScanRequest(request.emailData, sendResponse);
    return true; // Keep message channel open for async response
  }
  return false;
});

/**
 * Process email scan request
 */
async function handleScanRequest(emailData: EmailData, sendResponse: (response: any) => void): Promise<void> {
  try {
    // Prepare scan request
    const scanRequest: ScanRequest = {
      sender: emailData.sender,
      body: emailData.body,
      context: emailData.context
    };

    // Call ScamBomb API
    const result = await callScamBombAPI(scanRequest);

    if (result.error) {
      sendResponse({ error: result.error });
    } else {
      sendResponse({ result: result.response });
    }

  } catch (error) {
    console.error('ScamBomb: Scan request failed:', error);
    sendResponse({
      error: {
        error: 'Failed to process scan request. Please try again.',
        code: 500
      }
    });
  }
}

/**
 * Call ScamBomb API with email data
 */
async function callScamBombAPI(scanRequest: ScanRequest): Promise<{ response?: ScanResponse; error?: ScanError }> {
  try {
    // Get session cookies for authentication
    const cookies = await getSessionCookies();

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
        // Add any additional headers if needed
      },
      body: JSON.stringify(scanRequest),
      // Add timeout
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 402) {
        // Payment required - user needs to upgrade
        return {
          error: {
            error: 'Free scan limit reached. Please upgrade to continue scanning emails.',
            code: 402
          }
        };
      }

      if (response.status === 401) {
        return {
          error: {
            error: 'Authentication required. Please log in to ScamBomb first.',
            code: 401
          }
        };
      }

      return {
        error: {
          error: `API error: ${response.status} ${response.statusText}`,
          code: response.status
        }
      };
    }

    // Parse successful response
    const data: ScanResponse = await response.json();

    // Validate response structure
    if (!data.verdict || !data.text) {
      return {
        error: {
          error: 'Invalid response from scan service.',
          code: 500
        }
      };
    }

    return { response: data };

  } catch (error) {
    console.error('ScamBomb: API call failed:', error);

    // Handle specific error types
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        error: {
          error: 'Network connection failed. Please check your internet connection.',
          code: 0
        }
      };
    }

    if (error instanceof DOMException && error.name === 'TimeoutError') {
      return {
        error: {
          error: 'Request timed out. Please try again.',
          code: 408
        }
      };
    }

    return {
      error: {
        error: 'An unexpected error occurred. Please try again.',
        code: 500
      }
    };
  }
}

/**
 * Get session cookies for API authentication
 */
async function getSessionCookies(): Promise<string> {
  try {
    // Get all cookies from scambomb.com
    const cookies = await chrome.cookies.getAll({ domain: 'scambomb.com' });

    // Format as cookie header string
    const cookieString = cookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');

    return cookieString;

  } catch (error) {
    console.warn('ScamBomb: Could not get session cookies:', error);
    return '';
  }
}
