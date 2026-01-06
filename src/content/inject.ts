// Content script for Gmail integration
// Detects when an email is open and injects the ScamBomb scan button

class GmailScanner {
  private observer: MutationObserver | null = null;
  private buttonInjected = false;

  init() {
    this.startObserving();
  }

  private startObserving() {
    // Observe DOM changes to detect when email is opened
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          this.checkForEmailView();
        }
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Initial check
    this.checkForEmailView();
  }

  private checkForEmailView() {
    // Look for Gmail's message view indicators
    // This is a simplified selector - in production, use more robust detection
    const messageView = document.querySelector('[role="main"] [data-message-id]') ||
                       document.querySelector('.h7, .adn, .ads'); // Gmail message containers

    if (messageView && !this.buttonInjected) {
      this.injectScanButton(messageView as HTMLElement);
      this.buttonInjected = true;
    } else if (!messageView && this.buttonInjected) {
      this.removeScanButton();
      this.buttonInjected = false;
    }
  }

  private injectScanButton(container: HTMLElement) {
    // Create scan button
    const button = document.createElement('button');
    button.id = 'scambomb-scan-button';
    button.textContent = 'Scan with ScamBomb';
    button.style.cssText = `
      background: #ffc107;
      color: #1a365d;
      border: none;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      position: fixed;
      top: 180px;
      right: 120px;
      z-index: 10000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      transition: all 0.2s;
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Insert as fixed overlay in top-right corner, below Gmail header
    document.body.appendChild(button);

    // Add hover effect
    button.addEventListener('mouseenter', () => {
      button.style.background = '#e6b800';
      button.style.transform = 'translateY(-1px)';
      button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.background = '#ffc107';
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    });

    // Add click handler (placeholder for now)
    button.addEventListener('click', () => {
      alert('ScamBomb scan initiated! (Placeholder)');
    });
  }

  private removeScanButton() {
    const button = document.getElementById('scambomb-scan-button');
    if (button) {
      button.remove();
    }
    this.buttonInjected = false;
  }

  public updateButtonVisibility() {
    const button = document.getElementById('scambomb-scan-button') as HTMLElement;
    if (button) {
      chrome.storage.local.get(['scambomb_disabled_until'], (result) => {
        const disabledUntil = result.scambomb_disabled_until || 0;
        const isDisabled = Date.now() < disabledUntil;

        if (isDisabled) {
          button.style.display = 'none';
        } else {
          button.style.display = 'inline-flex';
        }
      });
    }
  }

  private destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.removeScanButton();
  }
}

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateVisibility') {
    const scanner = new GmailScanner();
    scanner.updateButtonVisibility();
  }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const scanner = new GmailScanner();
    scanner.init();
  });
} else {
  const scanner = new GmailScanner();
  scanner.init();
}
