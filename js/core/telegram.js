// Telegram Integration Module for CX Odyssey
class TelegramManager {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.user = null;
        this.isInitialized = false;
        this.initData = null;
        this.startParam = null;
        this.referrerId = null;
    }

    async initialize() {
        try {
            if (!this.tg) {
                console.warn('Telegram WebApp not available - running in web mode');
                return { isWebMode: true };
            }

            // Configure Telegram WebApp
            this.tg.ready();
            this.tg.expand();
            this.tg.enableClosingConfirmation();
            this.tg.disableVerticalSwipes();
            
            // Get user data and init parameters
            this.user = this.tg.initDataUnsafe?.user;
            this.initData = this.tg.initData;
            this.startParam = this.tg.initDataUnsafe?.start_param;

            // Extract referrer ID from start parameter
            if (this.startParam) {
                // Format: ref_123456789 or just 123456789
                const match = this.startParam.match(/(?:ref_)?(\d+)/);
                if (match) {
                    this.referrerId = match[1];
                    console.log('Referrer detected:', this.referrerId);
                }
            }

            if (!this.user) {
                console.warn('No Telegram user data available');
                return { isWebMode: true };
            }

            // Apply Telegram theme
            this.applyTelegramTheme();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Configure main and back buttons
            this.setupButtons();

            this.isInitialized = true;
            
            console.log('Telegram WebApp initialized:', this.user);
            return {
                user: this.user,
                referrerId: this.referrerId,
                isWebMode: false
            };

        } catch (error) {
            console.error('Telegram WebApp initialization failed:', error);
            return { isWebMode: true, error: error.message };
        }
    }

    applyTelegramTheme() {
        if (!this.tg.themeParams) return;

        const theme = this.tg.themeParams;
        const root = document.documentElement;

        // Apply Telegram theme colors if available
        if (theme.bg_color) root.style.setProperty('--tg-bg-color', theme.bg_color);
        if (theme.text_color) root.style.setProperty('--tg-text-color', theme.text_color);
        if (theme.hint_color) root.style.setProperty('--tg-hint-color', theme.hint_color);
        if (theme.link_color) root.style.setProperty('--tg-link-color', theme.link_color);
        if (theme.button_color) root.style.setProperty('--tg-button-color', theme.button_color);
        if (theme.button_text_color) root.style.setProperty('--tg-button-text-color', theme.button_text_color);
    }

    setupEventListeners() {
        if (!this.tg) return;

        // Main button clicked
        this.tg.onEvent('mainButtonClicked', () => {
            this.shareGame();
        });

        // Back button clicked
        this.tg.onEvent('backButtonClicked', () => {
            if (window.gameManager) {
                window.gameManager.showScreen('galaxyScreen');
                this.tg.BackButton.hide();
            }
        });

        // Theme changed
        this.tg.onEvent('themeChanged', () => {
            this.applyTelegramTheme();
        });

        // Viewport changed
        this.tg.onEvent('viewportChanged', (data) => {
            console.log('Viewport changed:', data);
        });

        // Settings button clicked
        this.tg.onEvent('settingsButtonClicked', () => {
            if (window.gameManager) {
                window.gameManager.showScreen('settingsScreen');
            }
        });
    }

    setupButtons() {
        if (!this.tg) return;

        // Configure main button for sharing
        this.tg.MainButton.setText('🚀 Share Game');
        this.tg.MainButton.color = '#FFD700';
        this.tg.MainButton.textColor = '#000000';
        this.tg.MainButton.show();

        // Back button is hidden by default
        this.tg.BackButton.hide();
    }

    // Show back button when not on main screen
    showBackButton() {
        if (this.tg && this.tg.BackButton) {
            this.tg.BackButton.show();
        }
    }

    hideBackButton() {
        if (this.tg && this.tg.BackButton) {
            this.tg.BackButton.hide();
        }
    }

    // Haptic feedback methods
    impactOccurred(style = 'medium') {
        if (!this.tg?.HapticFeedback) return;
        
        try {
            this.tg.HapticFeedback.impactOccurred(style); // light, medium, heavy, rigid, soft
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }

    notificationOccurred(type = 'success') {
        if (!this.tg?.HapticFeedback) return;
        
        try {
            this.tg.HapticFeedback.notificationOccurred(type); // error, success, warning
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }

    selectionChanged() {
        if (!this.tg?.HapticFeedback) return;
        
        try {
            this.tg.HapticFeedback.selectionChanged();
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }

    // Share game with referral system
    shareGame(customMessage = null) {
        const botUsername = GAME_CONFIG.TELEGRAM.BOT_USERNAME;
        const referralCode = this.user?.id || 'game';
        
        const defaultMessage = `🚀 Join me in CX Odyssey - an amazing space mining adventure!

🌌 Explore alien worlds
⛏️ Mine cosmic resources  
🐉 Battle epic bosses
🏆 Compete on leaderboards
💎 Collect rare items

Start your cosmic journey now!`;

        const message = customMessage || defaultMessage;
        
        // Create share URL with referral parameter
        const shareUrl = `${GAME_CONFIG.TELEGRAM.SHARE_URL}?startapp=ref_${referralCode}`;
        const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message)}`;
        
        if (this.tg?.openTelegramLink) {
            this.tg.openTelegramLink(telegramShareUrl);
        } else {
            window.open(telegramShareUrl, '_blank');
        }
        
        // Track sharing event
        if (window.apiManager) {
            window.apiManager.trackEvent('game_shared', {
                userId: this.user?.id,
                referralCode: referralCode
            });
        }

        if (window.uiManager) {
            window.uiManager.showNotification('🎉 Thanks for sharing CX Odyssey!');
        }
    }

    // Open Telegram link
    openTelegramLink(url) {
        if (this.tg?.openTelegramLink) {
            this.tg.openTelegramLink(url);
        } else {
            window.open(url, '_blank');
        }
    }

    // Close the WebApp
    close() {
        if (this.tg?.close) {
            this.tg.close();
        }
    }

    // Send data to bot
    sendData(data) {
        if (this.tg?.sendData) {
            this.tg.sendData(JSON.stringify(data));
        }
    }

    // Show popup
    showPopup(params) {
        if (!this.tg?.showPopup) return Promise.resolve();
        
        return new Promise((resolve) => {
            this.tg.showPopup(params, (buttonId) => {
                resolve(buttonId);
            });
        });
    }

    // Show alert
    showAlert(message) {
        if (this.tg?.showAlert) {
            this.tg.showAlert(message);
        } else {
            alert(message);
        }
    }

    // Show confirm dialog
    showConfirm(message) {
        if (!this.tg?.showConfirm) {
            return Promise.resolve(confirm(message));
        }
        
        return new Promise((resolve) => {
            this.tg.showConfirm(message, (confirmed) => {
                resolve(confirmed);
            });
        });
    }

    // Request contact sharing
    requestContact() {
        if (this.tg?.requestContact) {
            this.tg.requestContact((shared) => {
                console.log('Contact sharing:', shared);
            });
        }
    }

    // Request location sharing
    requestLocation() {
        if (this.tg?.requestLocation) {
            this.tg.requestLocation((shared) => {
                console.log('Location sharing:', shared);
            });
        }
    }

    // Set header color
    setHeaderColor(color) {
        if (this.tg?.setHeaderColor) {
            this.tg.setHeaderColor(color);
        }
    }

    // Set background color
    setBackgroundColor(color) {
        if (this.tg?.setBackgroundColor) {
            this.tg.setBackgroundColor(color);
        }
    }

    // Get user info for display
    getUserDisplayInfo() {
        if (!this.user) {
            return {
                name: 'Anonymous Player',
                username: null,
                photoUrl: null,
                id: null
            };
        }

        let displayName = this.user.first_name || 'Player';
        if (this.user.last_name) {
            displayName += ' ' + this.user.last_name;
        }

        return {
            name: displayName,
            username: this.user.username,
            photoUrl: this.user.photo_url,
            id: this.user.id,
            firstName: this.user.first_name,
            lastName: this.user.last_name
        };
    }

    // Check if running in Telegram
    isRunningInTelegram() {
        return !!this.tg && !!this.user;
    }

    // Get platform info
    getPlatformInfo() {
        if (!this.tg) return { platform: 'web' };

        return {
            platform: this.tg.platform,
            version: this.tg.version,
            colorScheme: this.tg.colorScheme,
            themeParams: this.tg.themeParams,
            isExpanded: this.tg.isExpanded,
            viewportHeight: this.tg.viewportHeight,
            viewportStableHeight: this.tg.viewportStableHeight
        };
    }

    // Handle referral reward
    async processReferral() {
        if (!this.referrerId || !this.user) return false;

        try {
            // You can implement referral rewards here
            console.log(`Processing referral: ${this.user.id} referred by ${this.referrerId}`);
            
            // Award referral bonus to both users
            const referralBonus = 1000; // 1000 GP bonus
            
            if (window.gameManager) {
                window.gameManager.addGP(referralBonus);
                window.uiManager?.showNotification(`🎁 Referral bonus: +${referralBonus} GP!`);
            }

            // Track referral event
            if (window.apiManager) {
                await window.apiManager.trackEvent('referral_processed', {
                    newUserId: this.user.id,
                    referrerId: this.referrerId,
                    bonus: referralBonus
                });
            }

            return true;
        } catch (error) {
            console.error('Failed to process referral:', error);
            return false;
        }
    }

    // Cloud storage methods (Telegram Cloud Storage)
    async saveToCloudStorage(key, value) {
        if (!this.tg?.CloudStorage) return false;

        try {
            return new Promise((resolve) => {
                this.tg.CloudStorage.setItem(key, JSON.stringify(value), (error, success) => {
                    if (error) {
                        console.error('Cloud storage save failed:', error);
                        resolve(false);
                    } else {
                        resolve(success);
                    }
                });
            });
        } catch (error) {
            console.error('Cloud storage error:', error);
            return false;
        }
    }

    async loadFromCloudStorage(key) {
        if (!this.tg?.CloudStorage) return null;

        try {
            return new Promise((resolve) => {
                this.tg.CloudStorage.getItem(key, (error, value) => {
                    if (error) {
                        console.error('Cloud storage load failed:', error);
                        resolve(null);
                    } else {
                        try {
                            resolve(value ? JSON.parse(value) : null);
                        } catch (parseError) {
                            console.error('Cloud storage parse failed:', parseError);
                            resolve(null);
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Cloud storage error:', error);
            return null;
        }
    }

    // Enable/disable closing confirmation
    setClosingConfirmation(enabled) {
        if (!this.tg) return;
        
        if (enabled) {
            this.tg.enableClosingConfirmation();
        } else {
            this.tg.disableClosingConfirmation();
        }
    }
}

// Create global Telegram manager instance
const telegramManager = new TelegramManager();
window.telegramManager = telegramManager;
