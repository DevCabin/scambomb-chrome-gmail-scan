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
    // Create scan button with icon
    const button = document.createElement('button');
    button.id = 'scambomb-scan-button';
    button.textContent = 'Scan with ScamBomb';
    button.style.cssText = `
      background: #ffc107;
      color: #000;
      border: none;
      padding: 10px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      position: absolute;
      top: 30px;
      right: 10px;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: background-color 0.2s;
    `;

    // Position as overlay on the message container
    button.style.position = 'absolute';
    button.style.top = '30px';
    button.style.right = '10px';

    // Make container position relative for absolute positioning
    if (container.style.position !== 'relative' && container.style.position !== 'absolute') {
      container.style.position = 'relative';
    }

    container.appendChild(button);

    // Add hover effect
    button.addEventListener('mouseenter', () => {
      button.style.background = '#ffb300';
    });
    button.addEventListener('mouseleave', () => {
      button.style.background = '#ffc107';
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

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.removeScanButton();
  }
}

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
