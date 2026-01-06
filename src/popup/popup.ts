// Popup script for ScamBomb extension
// Handles disable options and account links

class ScamBombPopup {
  private disableUntil: number = 0;

  constructor() {
    this.init();
  }

  private async init() {
    await this.loadDisableState();
    this.setupEventListeners();
    this.updateUI();
  }

  private async loadDisableState() {
    const result = await chrome.storage.local.get(['scambomb_disabled_until']);
    this.disableUntil = result.scambomb_disabled_until || 0;
  }

  private setupEventListeners() {
    // Disable buttons
    document.getElementById('disable-1h')?.addEventListener('click', () => this.disableFor(1 * 60 * 60 * 1000)); // 1 hour
    document.getElementById('disable-1d')?.addEventListener('click', () => this.disableFor(24 * 60 * 60 * 1000)); // 1 day
    document.getElementById('disable-1w')?.addEventListener('click', () => this.disableFor(7 * 24 * 60 * 60 * 1000)); // 1 week

    // Update UI every minute to reflect current state
    setInterval(() => this.updateUI(), 60000);
  }

  private async disableFor(durationMs: number) {
    this.disableUntil = Date.now() + durationMs;
    await chrome.storage.local.set({ 'scambomb_disabled_until': this.disableUntil });

    // Notify content scripts to update button visibility
    const tabs = await chrome.tabs.query({ url: 'https://mail.google.com/*' });
    for (const tab of tabs) {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'updateVisibility',
          disabled: this.isDisabled()
        }).catch(() => {
          // Content script might not be loaded yet, ignore
        });
      }
    }

    this.updateUI();
    window.close(); // Close popup after action
  }

  private isDisabled(): boolean {
    return Date.now() < this.disableUntil;
  }

  private updateUI() {
    const disabled = this.isDisabled();
    const buttons = document.querySelectorAll('.disable');

    buttons.forEach(button => {
      const element = button as HTMLElement;
      if (disabled) {
        element.textContent = `Disabled until ${new Date(this.disableUntil).toLocaleString()}`;
        element.style.background = '#ffebee';
        element.style.color = '#d32f2f';
      } else {
        // Reset to original state
        if (element.id === 'disable-1h') element.textContent = 'Disable for 1 hour';
        if (element.id === 'disable-1d') element.textContent = 'Disable for 1 day';
        if (element.id === 'disable-1w') element.textContent = 'Disable for 1 week';

        element.style.background = '#f5f5f5';
        element.style.color = '#666';
      }
    });
  }
}

// Initialize popup
new ScamBombPopup();
