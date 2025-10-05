// main.js - Game Initialization and Core Logic

class GameInitializer {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.tgUser = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            console.log('=== GAME INITIALIZATION START ===');
            
            this.updateLoadingProgress(10, 'Checking Telegram...');
            await this.initializeTelegram();
            
            this.updateLoadingProgress(25, 'Initializing backend...');
            await this.initializeBackend();
            
            this.updateLoadingProgress(40, 'Loading game state...');
            await this.loadGameState();
            
            this.updateLoadingProgress(55, 'Initializing wallet...');
            await this.initializeWallet();
            
            this.updateLoadingProgress(70, 'Setting up UI...');
            this.initializeUI();
            
            this.updateLoadingProgress(85, 'Starting game systems...');
            this.startGameSystems();
            
            this.updateLoadingProgress(100, 'Ready!');
            
            setTimeout(() => {
                this.hideLoadingScreen();
                this.isInitialized = true;
                console.log('✅ GAME INITIALIZATION COMPLETE');
            }, 500);
            
        } catch (error) {
            console.error('❌ Initialization error:', error);
            this.updateLoadingProgress(100, 'Error: ' + error.message);
            setTimeout(() => this.hideLoadingScreen(), 2000);
        }
    }

    updateLoadingProgress(percent, text) {
        const progressBar = document.getElementById('loadingProgressBar');
        const loadingText = document.getElementById('loadingText');
        
        if (progressBar) progressBar.style.width = percent + '%';
        if (loadingText) loadingText.textContent = text;
    }

    hideLoadingScreen() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hide');
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        }
    }

    async initializeTelegram() {
        if (this.tg && this.tg.initDataUnsafe?.user) {
            this.tgUser = this.tg.initDataUnsafe.user;
            console.log('Telegram user:', this.tgUser);
            
            this.tg.ready();
            this.tg.expand();
            
            if (this.tg.BackButton) {
                this.tg.BackButton.hide();
            }
            
            this.updateUserInfo();
        } else {
            console.warn('Not running in Telegram, using demo mode');
            this.tgUser = {
                id: Date.now(),
                first_name: 'Demo User',
                username: 'demo_user'
            };
            this.updateUserInfo();
        }
    }

    updateUserInfo() {
        const userName = document.getElementById('tgUserName');
        if (userName && this.tgUser) {
            userName.textContent = this.tgUser.first_name || 'Explorer';
        }

        const userAvatar = document.getElementById('tgAvatar');
        if (userAvatar && this.tgUser?.photo_url) {
            userAvatar.src = this.tgUser.photo_url;
        }
    }

    async initializeBackend() {
        if (window.backendManager) {
            await window.backendManager.initialize(this.tgUser);
        }
    }

    async loadGameState() {
        if (window.gameState) {
            const loaded = await window.gameState.load();
            if (loaded) {
                console.log('Game state loaded from backend');
            } else {
                console.log('Starting with fresh game state');
            }
            
            window.gameState.initialize();
        }
    }

    async initializeWallet() {
        if (window.walletManager) {
            console.log('Initializing TON wallet...');
            const success = await window.walletManager.initialize();
            if (success) {
                console.log('✅ Wallet manager ready');
            } else {
                console.warn('⚠️ Wallet manager initialization failed');
            }
        }
    }

    initializeUI() {
        if (window.uiController) {
            window.uiController.updateUIElements(window.gameState?.get());
        }

        if (window.TasksManager) {
            window.TasksManager.renderContent();
        }

        if (window.ProfileManager) {
            window.ProfileManager.renderContent();
        }
    }

    startGameSystems() {
        if (window.gameState) {
            const gameState = window.gameState.get();
            
            if (gameState.currentPlanet) {
                console.log('Restoring planet:', gameState.currentPlanet);
            }
        }

        this.checkForReferral();
    }

    checkForReferral() {
        if (!this.tg || !this.tg.initDataUnsafe?.start_param) return;

        const startParam = this.tg.initDataUnsafe.start_param;
        console.log('Start param detected:', startParam);

        if (startParam && startParam.startsWith('CX')) {
            this.processReferral(startParam);
        }
    }

    async processReferral(referralCode) {
        if (!window.backendManager || !this.tgUser) return;

        try {
            const response = await fetch('https://cx-odyssey-backend.vercel.app/api/processReferral', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    newUserTelegramId: this.tgUser.id,
                    newUserUsername: this.tgUser.first_name || 'Anonymous',
                    referrerCode: referralCode
                })
            });

            const data = await response.json();
            
            if (data.success) {
                console.log('Referral processed:', data);
                
                if (window.gameState) {
                    const currentGP = window.gameState.getValue('gp');
                    window.gameState.setValue('gp', currentGP + 25);
                }
                
                if (window.showNotification) {
                    window.showNotification('Welcome! You earned 25 GP from referral!');
                }
            }
        } catch (error) {
            console.error('Referral processing failed:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting game initialization...');
    
    window.gameInitializer = new GameInitializer();
    window.gameInitializer.initialize();
});
