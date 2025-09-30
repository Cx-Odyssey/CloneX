// Main Game Initialization
class GameInitializer {
    constructor() {
        this.tg = null;
        this.user = null;
        this.connector = null;
        this.referralCode = null;
        this.loadingSteps = [
            'Generating starfield...',
            'Connecting to Telegram...',
            'Loading game data...',
            'Initializing systems...',
            'Preparing launch...',
            'Ready to explore!'
        ];
    }

    async initGame() {
        console.log('🚀 Initializing CX Odyssey...');
        
        try {
            // Step 1: Generate starfield
            this.updateLoadingProgress(0, this.loadingSteps[0]);
            await this.delay(300);

            // Step 2: Initialize Telegram WebApp
            this.updateLoadingProgress(20, this.loadingSteps[1]);
            this.initializeTelegram();
            await this.delay(500);

            // Step 3: Initialize backend
            this.updateLoadingProgress(40, this.loadingSteps[2]);
            await this.initializeBackend();
            await this.delay(500);

            // Step 4: Load game data
            this.updateLoadingProgress(60, this.loadingSteps[3]);
            await this.loadGameData();
            await this.delay(500);

            // Step 5: Process referral if present
            await this.processReferral();

            // Step 6: Initialize systems
            this.updateLoadingProgress(80, this.loadingSteps[4]);
            this.initializeGameSystems();
            await this.delay(300);

            // Step 7: Complete initialization
            this.updateLoadingProgress(100, this.loadingSteps[5]);
            await this.delay(500);

            // Start the game
            this.startGame();

        } catch (error) {
            console.error('Game initialization failed:', error);
            this.handleInitializationError(error);
        }
    }

    updateLoadingProgress(percent, text) {
        const progressBar = document.getElementById('loadingProgressBar');
        const loadingText = document.getElementById('loadingText');
        
        if (progressBar) progressBar.style.width = percent + '%';
        if (loadingText) loadingText.textContent = text;
    }

    initializeTelegram() {
        try {
            if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
                this.tg = window.Telegram.WebApp;
                this.tg.expand();
                this.tg.ready();
                
                this.user = this.tg.initDataUnsafe?.user;
                
                // Extract referral code from start parameter
                const startParam = this.tg.initDataUnsafe?.start_param;
                if (startParam) {
                    this.referralCode = startParam;
                    console.log('📎 Referral code detected:', this.referralCode);
                }
                
                if (this.user) {
                    console.log('👤 User logged in:', this.user.first_name);
                    this.setupUserInfo();
                } else {
                    console.log('🌐 Running in browser mode');
                }
                
                // Set theme colors
                this.setupTelegramTheme();
                
            } else {
                console.log('🌐 Running in browser mode');
            }
        } catch (error) {
            console.warn('Telegram initialization failed:', error);
        }
    }

    setupUserInfo() {
        if (!this.user) return;

        // Update avatar
        const avatar = document.getElementById('tgAvatar');
        if (avatar && this.user.photo_url) {
            avatar.src = this.user.photo_url;
        }

        // Update username
        const nameEl = document.getElementById('tgUserName');
        if (nameEl) {
            let userName = this.user.first_name;
            if (this.user.last_name) userName += " " + this.user.last_name;
            nameEl.textContent = userName;
        }
    }

    setupTelegramTheme() {
        if (!this.tg) return;

        try {
            // Set main button if needed
            this.tg.MainButton.hide();
            
            // Set theme colors
            if (this.tg.themeParams) {
                document.documentElement.style.setProperty('--tg-bg-color', this.tg.themeParams.bg_color || '#0A0A0A');
                document.documentElement.style.setProperty('--tg-text-color', this.tg.themeParams.text_color || '#ffffff');
            }
        } catch (error) {
            console.warn('Theme setup failed:', error);
        }
    }

    async initializeBackend() {
        if (window.backendManager) {
            await window.backendManager.initialize(this.user);
        }
    }

    async loadGameData() {
        if (window.gameState) {
            const loaded = await window.gameState.load();
            if (!loaded) {
                console.log('📊 Starting with default game state');
            }
        }
    }

    async processReferral() {
        if (!this.referralCode || !this.user) {
            console.log('ℹ️ No referral to process');
            return;
        }

        try {
            console.log('🎁 Processing referral from code:', this.referralCode);
            
            const gameState = window.gameState?.get();
            
            // Check if user is new or hasn't processed this referral before
            if (gameState && gameState.gp === 0 && gameState.referralCode !== this.referralCode) {
                
                // Call backend to process referral
                const response = await fetch('https://cx-odyssey-backend.vercel.app/api/processReferral', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        newUserTelegramId: this.user.id,
                        newUserUsername: this.user.first_name || 'Anonymous',
                        referrerCode: this.referralCode
                    })
                });

                const result = await response.json();
                
                if (result.success) {
                    // Award bonus to new user
                    window.gameState?.update({
                        gp: 25 // New user gets 25 GP
                    });
                    
                    console.log('✅ Referral processed successfully');
                    
                    // Show welcome notification with referral bonus
                    setTimeout(() => {
                        if (window.uiController) {
                            window.uiController.showNotification('🎁 Welcome! You earned 25 GP from referral!');
                        }
                    }, 2000);
                } else {
                    console.log('ℹ️ Referral not processed:', result.message);
                }
            }
        } catch (error) {
            console.warn('⚠️ Failed to process referral:', error);
            // Don't block game initialization if referral fails
        }
    }

    initializeGameSystems() {
        // Initialize game state systems
        if (window.gameState) {
            window.gameState.initialize();
        }

        // Initialize TonConnect
        this.initTonConnect();

        // Setup auto-save
        this.setupAutoSave();

        // Setup energy regeneration display updates
        this.setupEnergyRegeneration();

        // Setup error handling
        this.setupErrorHandling();
    }

    initTonConnect() {
        try {
            if (typeof TonConnectSDK !== 'undefined') {
                this.connector = new TonConnectSDK.TonConnect({
                    manifestUrl: window.location.origin + '/tonconnect-manifest.json'
                });
                
                this.connector.onStatusChange(wallet => {
                    this.handleWalletStatusChange(wallet);
                });
                
                console.log('🔗 TonConnect initialized');
            }
        } catch (error) {
            console.warn('TonConnect initialization failed:', error);
        }
    }

    handleWalletStatusChange(wallet) {
        const connectBtn = document.getElementById('connectWalletBtn');
        const walletInfo = document.getElementById('walletInfo');
        const connectedAddress = document.getElementById('connectedAddress');
        
        if (wallet) {
            if (connectBtn) connectBtn.style.display = 'none';
            if (walletInfo) walletInfo.style.display = 'block';
            if (connectedAddress) {
                connectedAddress.textContent = this.shortenAddress(wallet.account.address);
            }
            
            // Update game state
            if (window.gameState) {
                window.gameState.update({
                    walletConnected: true,
                    walletAddress: wallet.account.address
                });
            }
        } else {
            if (connectBtn) connectBtn.style.display = 'block';
            if (walletInfo) walletInfo.style.display = 'none';
            
            // Update game state
            if (window.gameState) {
                window.gameState.update({
                    walletConnected: false,
                    walletAddress: ''
                });
            }
        }
    }

    shortenAddress(address) {
        if (!address) return '';
        return address.substring(0, 6) + '...' + address.substring(address.length - 4);
    }

    setupAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => {
            if (window.gameState) {
                window.gameState.save();
            }
        }, 30000);

        // Save on page unload
        window.addEventListener('beforeunload', () => {
            if (window.gameState) {
                window.gameState.save();
            }
        });

        // Save when tab becomes hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && window.gameState) {
                window.gameState.save();
            }
        });
    }

    setupEnergyRegeneration() {
        // Update energy display every 5 seconds
        setInterval(() => {
            if (window.gameState && window.uiController) {
                const state = window.gameState.get();
                window.uiController.updateEnergyBar(state);
                window.uiController.updateTickets(state);
            }
        }, 5000);
    }

    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Game error:', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
        });
    }

    startGame() {
        console.log('🎮 Starting game...');
        
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hide');
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        }

        // Show welcome notification
        const userName = this.user?.first_name || 'Explorer';
        if (window.uiController) {
            window.uiController.showNotification(`🚀 Welcome to CX Odyssey, ${userName}!`);
            window.uiController.showScreen('galaxyScreen');
        }

        // Initialize screen-specific data
        this.loadInitialScreenData();
    }

    loadInitialScreenData() {
        // Load leaderboard data
        if (window.uiController) {
            window.uiController.loadLeaderboard();
        }
    }

    handleInitializationError(error) {
        console.error('Initialization error:', error);
        
        const loadingText = document.getElementById('loadingText');
        if (loadingText) {
            loadingText.textContent = 'Error loading game. Please refresh.';
            loadingText.style.color = '#ff073a';
        }

        // Still try to start the game with defaults
        setTimeout(() => {
            this.startGame();
        }, 2000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Wallet connection functions
function connectWallet() {
    const gameInit = window.gameInitializer;
    if (!gameInit?.connector) {
        if (window.uiController) {
            window.uiController.showNotification('❌ Wallet connection not available.');
        }
        return;
    }

    try {
        const connectBtn = document.getElementById('connectWalletBtn');
        if (connectBtn) {
            connectBtn.textContent = 'Connecting...';
            connectBtn.disabled = true;
        }

        gameInit.connector.getWallets()
            .then(wallets => {
                if (wallets && wallets.length > 0) {
                    const wallet = wallets.find(w => w.name === 'Tonkeeper') || wallets[0];
                    return gameInit.connector.connect(wallet.connectionParameters);
                } else {
                    throw new Error('No wallets available');
                }
            })
            .then(() => {
                if (window.uiController) {
                    window.uiController.showNotification('🔗 Wallet connected successfully!');
                }
            })
            .catch(error => {
                console.error('Wallet connection error:', error);
                if (window.uiController) {
                    window.uiController.showNotification('❌ Please install Tonkeeper wallet.');
                }
                resetWalletButton();
            });
    } catch (error) {
        if (window.uiController) {
            window.uiController.showNotification('❌ Wallet connection failed.');
        }
        resetWalletButton();
    }
}

function resetWalletButton() {
    const connectBtn = document.getElementById('connectWalletBtn');
    if (connectBtn) {
        connectBtn.textContent = '🔗 Connect Wallet';
        connectBtn.disabled = false;
    }
}

function disconnectWallet() {
    const gameInit = window.gameInitializer;
    if (gameInit?.connector) {
        try {
            gameInit.connector.disconnect();
            if (window.uiController) {
                window.uiController.showNotification('🔔 Wallet disconnected');
            }
        } catch (error) {
            if (window.uiController) {
                window.uiController.showNotification('🔔 Wallet disconnected');
            }
        }
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gameInitializer = new GameInitializer();
    window.gameInitializer.initGame();
});

// Also initialize on window load as fallback
window.addEventListener('load', () => {
    if (!window.gameInitializer) {
        window.gameInitializer = new GameInitializer();
        window.gameInitializer.initGame();
    }
});
