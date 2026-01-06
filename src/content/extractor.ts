// Email Data Extraction for Gmail
// Handles the complex task of extracting sender, subject, and body from Gmail's DOM

import { EmailData } from '../types/api';

export class GmailExtractor {
  /**
   * Extract email data from the current Gmail message view
   * Uses multiple strategies since Gmail's DOM can vary
   */
  static extractEmailData(): EmailData | null {
    try {
      const sender = this.extractSender();
      const subject = this.extractSubject();
      const body = this.extractBody();

      if (!sender || !subject || !body) {
        // Could not extract complete email data - no logging in production
        return null;
      }

      // Limit body to reasonable size for API
      const truncatedBody = this.sanitizeBody(body);

      return {
        sender,
        subject,
        body: truncatedBody,
        context: `Gmail extension scan; subject: ${subject.substring(0, 50)}${subject.length > 50 ? '...' : ''}`
      };
    } catch (error) {
      // Email extraction failed - no logging in production
      return null;
    }
  }

  /**
   * Extract sender information using multiple selector strategies
   */
  private static extractSender(): string | null {
    // Strategy 1: Look for sender in message header
    const senderSelectors = [
      // Standard Gmail selectors
      '[data-message-id] [data-legacy-last-message-id] .gD', // From field
      '[data-message-id] .gD', // Email address
      '[data-legacy-last-message-id] .gD', // Legacy selector
      // Alternative selectors
      '.gb_sender_name', // Sometimes used
      '.message_sender', // Fallback
      // Look for email in header area
      '.adn .gD', // Different Gmail layout
      '.h7 .gD' // Another variation
    ];

    for (const selector of senderSelectors) {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        const email = element.getAttribute('email') || element.textContent?.trim();
        if (email && this.isValidEmail(email)) {
          return email;
        }
      }
    }

    // Strategy 2: Look for any email-like text in header area
    const headerArea = document.querySelector('[data-message-id]') ||
                      document.querySelector('[data-legacy-last-message-id]') ||
                      document.querySelector('.h7, .adn');

    if (headerArea) {
      const text = headerArea.textContent || '';
      const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        return emailMatch[1];
      }
    }

    return null;
  }

  /**
   * Extract subject line using multiple strategies
   */
  private static extractSubject(): string | null {
    // Strategy 1: Standard subject selectors
    const subjectSelectors = [
      '[data-message-id] .hP', // Subject line
      '[data-legacy-last-message-id] .hP', // Legacy subject
      '.message_subject', // Alternative
      '.subject_line', // Fallback
      // Look in header area
      '.h7 .hP', // Different layout
      '.adn .hP' // Another variation
    ];

    for (const selector of subjectSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent) {
        const subject = element.textContent.trim();
        if (subject.length > 0) {
          return subject;
        }
      }
    }

    // Strategy 2: Look for subject in page title or meta
    const title = document.title;
    if (title && title.includes(' - ') && !title.includes('Gmail')) {
      // Gmail often puts subject in title like "Subject - user@gmail.com - Gmail"
      const parts = title.split(' - ');
      if (parts.length >= 2 && !parts[parts.length - 1].includes('Gmail')) {
        return parts[0].trim();
      }
    }

    return null;
  }

  /**
   * Extract email body content using multiple strategies
   */
  private static extractBody(): string | null {
    // Strategy 1: Look for message body content
    const bodySelectors = [
      // Standard Gmail message body
      '[data-message-id] .a3s', // Main message body
      '[data-message-id] .message-body', // Alternative
      '[data-legacy-last-message-id] .a3s', // Legacy body
      // Different Gmail layouts
      '.h7 .a3s', // Split pane layout
      '.adn .a3s', // Another layout
      // Plain text fallbacks
      '[data-message-id] .ii', // Inner message
      '.message_content', // Generic content
      // Last resort - any large text block
      '[data-message-id] div[style*="font-family"]', // Styled content
      '[data-message-id] div[style*="font-size"]' // Font-sized content
    ];

    for (const selector of bodySelectors) {
      const elements = Array.from(document.querySelectorAll(selector));
      for (const element of elements) {
        const text = this.extractTextFromElement(element as HTMLElement);
        if (text && text.length > 10) { // Minimum content length
          return text;
        }
      }
    }

    // Strategy 2: Look for any substantial text content in message area
    const messageArea = document.querySelector('[data-message-id]') ||
                       document.querySelector('[data-legacy-last-message-id]');

    if (messageArea) {
      const text = this.extractTextFromElement(messageArea as HTMLElement);
      if (text && text.length > 20) {
        return text;
      }
    }

    return null;
  }

  /**
   * Extract readable text from an element, handling different content types
   */
  private static extractTextFromElement(element: HTMLElement): string | null {
    if (!element) return null;

    // Try different extraction methods
    let text = '';

    // Method 1: Direct text content (best for plain text emails)
    if (element.textContent) {
      text = element.textContent.trim();
    }

    // Method 2: If text is too short, look for inner HTML content
    if (text.length < 20 && element.innerHTML) {
      // Strip HTML tags but preserve line breaks
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = element.innerHTML;
      text = tempDiv.textContent || tempDiv.innerText || '';
    }

    // Clean up the text
    text = text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control chars
      .trim();

    return text.length > 0 ? text : null;
  }

  /**
   * Sanitize and truncate email body for API submission
   */
  private static sanitizeBody(body: string): string {
    // Limit to reasonable size for API (20k chars should be plenty)
    const MAX_LENGTH = 20000;

    if (body.length <= MAX_LENGTH) {
      return body;
    }

    // Truncate but try to end at a word boundary
    let truncated = body.substring(0, MAX_LENGTH);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > MAX_LENGTH * 0.8) { // Only break word if we're far from the limit
      truncated = truncated.substring(0, lastSpace);
    }

    return truncated + '...';
  }

  /**
   * Basic email validation
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }
}
