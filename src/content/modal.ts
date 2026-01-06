// Modal Component for ScamBomb Gmail Extension
// Features animated fuse loading and professional results display

import { ScanResponse, ScanError, ModalState, VERDICT_COLORS } from '../types/api';

export class ScamBombModal {
  private modal: HTMLElement | null = null;
  private fuseAnimation: HTMLElement | null = null;
  private state: ModalState = 'hidden';

  /**
   * Show loading state with fuse animation
   */
  showLoading(): void {
    this.createModal();
    this.setState('loading');
    this.startFuseAnimation();
  }

  /**
   * Show scan results
   */
  showResults(response: ScanResponse): void {
    this.createModal();
    this.setState('success');
    this.displayResults(response);
  }

  /**
   * Show error state
   */
  showError(error: ScanError): void {
    this.createModal();
    this.setState('error');
    this.displayError(error);
  }

  /**
   * Hide modal
   */
  hide(): void {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
      this.fuseAnimation = null;
    }
    this.state = 'hidden';
  }

  /**
   * Create modal structure if it doesn't exist
   */
  private createModal(): void {
    if (this.modal) return;

    this.modal = document.createElement('div');
    this.modal.id = 'scambomb-modal';
    this.modal.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-logo">
              <span class="logo-text">ScamBomb</span>
              <span class="logo-bomb">💣</span>
            </div>
            <button class="modal-close" aria-label="Close">×</button>
          </div>
          <div class="modal-body">
            <!-- Loading state -->
            <div class="loading-state" style="display: none;">
              <div class="fuse-container">
                <div class="bomb-icon">💣</div>
                <div class="fuse-wrapper">
                  <div class="fuse-spark">⚡</div>
                  <div class="fuse-burn"></div>
                </div>
              </div>
              <div class="loading-text">Scanning for scams...</div>
              <div class="loading-subtitle">AI analysis in progress</div>
            </div>

            <!-- Results state -->
            <div class="results-state" style="display: none;">
              <div class="verdict-section">
                <div class="verdict-badge">
                  <span class="verdict-text">SAFE</span>
                </div>
                <div class="threat-level">
                  <span class="threat-label">Threat Level:</span>
                  <span class="threat-value">0%</span>
                </div>
              </div>
              <div class="analysis-section">
                <div class="analysis-header">Analysis Details</div>
                <div class="analysis-content"></div>
                <button class="analysis-toggle">Show Full Analysis</button>
              </div>
            </div>

            <!-- Error state -->
            <div class="error-state" style="display: none;">
              <div class="error-icon">⚠️</div>
              <div class="error-title">Scan Failed</div>
              <div class="error-message"></div>
              <button class="retry-button">Try Again</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    const closeBtn = this.modal.querySelector('.modal-close') as HTMLElement;
    const backdrop = this.modal.querySelector('.modal-backdrop') as HTMLElement;

    closeBtn?.addEventListener('click', () => this.hide());
    backdrop?.addEventListener('click', (e) => {
      if (e.target === backdrop) this.hide();
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state !== 'hidden') {
        this.hide();
      }
    });

    document.body.appendChild(this.modal);
  }

  /**
   * Update modal state and visibility
   */
  private setState(newState: ModalState): void {
    if (!this.modal) return;

    this.state = newState;

    // Hide all states
    const loadingState = this.modal.querySelector('.loading-state') as HTMLElement;
    const resultsState = this.modal.querySelector('.results-state') as HTMLElement;
    const errorState = this.modal.querySelector('.error-state') as HTMLElement;

    [loadingState, resultsState, errorState].forEach(state => {
      if (state) state.style.display = 'none';
    });

    // Show current state
    switch (newState) {
      case 'loading':
        if (loadingState) loadingState.style.display = 'flex';
        break;
      case 'success':
        if (resultsState) resultsState.style.display = 'block';
        break;
      case 'error':
        if (errorState) errorState.style.display = 'block';
        break;
    }
  }

  /**
   * Start the fuse burning animation
   */
  private startFuseAnimation(): void {
    if (!this.modal) return;

    this.fuseAnimation = this.modal.querySelector('.fuse-burn') as HTMLElement;
    if (this.fuseAnimation) {
      // Reset animation
      this.fuseAnimation.style.width = '100%';
      this.fuseAnimation.style.animation = 'none';

      // Start animation after a brief delay
      setTimeout(() => {
        if (this.fuseAnimation) {
          this.fuseAnimation.style.animation = 'burn-down 3s linear infinite';
        }
      }, 100);
    }
  }

  /**
   * Display scan results
   */
  private displayResults(response: ScanResponse): void {
    if (!this.modal) return;

    const verdictBadge = this.modal.querySelector('.verdict-badge') as HTMLElement;
    const verdictText = this.modal.querySelector('.verdict-text') as HTMLElement;
    const threatValue = this.modal.querySelector('.threat-value') as HTMLElement;
    const analysisContent = this.modal.querySelector('.analysis-content') as HTMLElement;
    const analysisToggle = this.modal.querySelector('.analysis-toggle') as HTMLElement;

    if (verdictText && threatValue && analysisContent) {
      // Set verdict
      verdictText.textContent = response.verdict;
      verdictBadge.style.backgroundColor = VERDICT_COLORS[response.verdict];

      // Set threat level
      threatValue.textContent = response.threatLevel;

      // Set analysis content (truncated initially)
      const fullAnalysis = response.text;
      const truncatedAnalysis = fullAnalysis.length > 300
        ? fullAnalysis.substring(0, 300) + '...'
        : fullAnalysis;

      analysisContent.textContent = truncatedAnalysis;

      // Toggle full analysis
      let showingFull = false;
      analysisToggle?.addEventListener('click', () => {
        showingFull = !showingFull;
        analysisContent.textContent = showingFull ? fullAnalysis : truncatedAnalysis;
        analysisToggle.textContent = showingFull ? 'Show Less' : 'Show Full Analysis';
      });
    }
  }

  /**
   * Display error message
   */
  private displayError(error: ScanError): void {
    if (!this.modal) return;

    const errorMessage = this.modal.querySelector('.error-message') as HTMLElement;
    const retryButton = this.modal.querySelector('.retry-button') as HTMLElement;

    if (errorMessage) {
      errorMessage.textContent = error.error;
    }

    // Handle 402 upgrade prompts specially
    if (error.code === 402) {
      this.showUpgradePrompt(error);
    } else {
      // Regular error handling
      if (retryButton) {
        retryButton.textContent = 'Try Again';
        retryButton.addEventListener('click', () => {
          this.hide();
          // Trigger retry scan (handled by parent component)
        });
      }
    }
  }

  /**
   * Show special upgrade prompt for 402 errors
   */
  private showUpgradePrompt(error: ScanError): void {
    if (!this.modal) return;

    const errorState = this.modal.querySelector('.error-state') as HTMLElement;
    const errorMessage = this.modal.querySelector('.error-message') as HTMLElement;
    const retryButton = this.modal.querySelector('.retry-button') as HTMLElement;

    // Update error state content for upgrade
    if (errorMessage) {
      errorMessage.innerHTML = `
        ${error.error}<br><br>
        <strong>Ready to continue scanning?</strong>
      `;
    }

    if (retryButton) {
      retryButton.textContent = 'Upgrade Now';
      retryButton.style.background = '#ffc107';
      retryButton.style.color = '#1a365d';

      // Remove existing listeners
      const newButton = retryButton.cloneNode(true) as HTMLElement;
      retryButton.parentNode?.replaceChild(newButton, retryButton);

      // Add upgrade link
      newButton.addEventListener('click', () => {
        // Open upgrade page in new tab
        chrome.tabs.create({
          url: 'https://scambomb.com/upgrade',
          active: true
        });
        this.hide();
      });
    }

    // Add additional upgrade link in message
    if (errorMessage) {
      const upgradeLink = document.createElement('div');
      upgradeLink.innerHTML = `
        <br>
        <a href="#" class="upgrade-link" style="color: #ffc107; text-decoration: none; font-weight: 600;">
          Learn more about premium features →
        </a>
      `;

      const upgradeLinkElement = upgradeLink.querySelector('.upgrade-link') as HTMLElement;
      upgradeLinkElement?.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({
          url: 'https://scambomb.com/pricing',
          active: true
        });
        this.hide();
      });

      errorMessage.appendChild(upgradeLink);
    }
  }
}

// Export singleton instance
export const scamBombModal = new ScamBombModal();
