// API Configuration
const API_BASE_URL = 'https://cx-odyssey-backend.vercel.app';
const TELEGRAM_BOT_USERNAME = 'Cx_odyssey_bot';

// API Service Class
class GameAPI {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.retryCount = 3;
        this.retryDelay = 1000;
    }

    // Generic API call with retry logic
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const config = { ...defaultOptions, ...options };

        for (let attempt = 1; attempt <= this.retryCount; attempt++) {
            try {
                console.log(`API Request (Attempt ${attempt}):`, url, config);
                const response = await fetch(url, config);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('API Response:', data);
                return data;
                
            } catch (error) {
                console.error(`API Request failed (Attempt ${attempt}):`, error);
                
                if (attempt === this.retryCount) {
                    throw error;
                }
                
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
            }
        }
    }

    // Load player progress
    async loadProgress(telegramId) {
        try {
            const response = await this.makeRequest('/api/loadProgress', {
                method: 'POST',
                body: JSON.stringify({ telegram_id: telegramId })
            });
            
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Failed to load progress:', error);
            return null;
        }
    }

    // Save player progress
    async saveProgress(playerData) {
        try {
            const response = await this.makeRequest('/api/saveProgress', {
                method: 'POST',
                body: JSON.stringify(playerData)
            });
            
            return response.success;
        } catch (error) {
            console.error('Failed to save progress:', error);
            return false;
        }
    }

    // Get leaderboard
    async getLeaderboard(limit = 10) {
        try {
            const response = await this.makeRequest(`/api/leaderboard?limit=${limit}`);
            return response.success ? response.data : [];
        } catch (error) {
            console.error('Failed to get leaderboard:', error);
            return [];
        }
    }

    // Get player rank
    async getPlayerRank(telegramId) {
        try {
            const response = await this.makeRequest('/api/leaderboard', {
                method: 'POST',
                body: JSON.stringify({ telegram_id: telegramId })
            });
            
            return response.success ? response.rank : 999999;
        } catch (error) {
            console.error('Failed to get player rank:', error);
            return 999999;
        }
    }

    // Create or update player
    async createOrUpdatePlayer(telegramUser) {
        const playerData = {
            telegram_id: telegramUser.id,
            username: telegramUser.username || 'Anonymous',
            first_name: telegramUser.first_name || '',
            last_name: telegramUser.last_name || '',
            energy: 100,
            max_energy: 100,
            shards: 0,
            gp: 0,
            current_planet: '',
            daily_streak: 1,
            last_login: new Date().toISOString().split('T')[0],
            boss_health: 1000,
            player_damage: 0,
            upgrades: { speed: 0, damage: 0, energy: 0, multiplier: 0 },
            skins: [],
            achievements: []
        };

        return await this.saveProgress(playerData);
    }

    // Handle daily login
    async handleDailyLogin(telegramId) {
        try {
            const playerData = await this.loadProgress(telegramId);
            if (!playerData) return null;

            const today = new Date().toISOString().split('T')[0];
            const lastLogin = playerData.last_login;

            if (lastLogin !== today) {
                // Calculate streak bonus
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                let newStreak;
                if (lastLogin === yesterdayStr) {
                    // Consecutive day
                    newStreak = playerData.daily_streak + 1;
                } else {
                    // Streak broken
                    newStreak = 1;
                }

                const bonus = newStreak * 100;
                
                // Update player data
                const updatedData = {
                    ...playerData,
                    gp: playerData.gp + bonus,
                    daily_streak: newStreak,
                    last_login: today
                };

                const saved = await this.saveProgress(updatedData);
                
                if (saved) {
                    return {
                        streak: newStreak,
                        bonus: bonus,
                        isNew: true
                    };
                }
            }

            return {
                streak: playerData.daily_streak,
                bonus: 0,
                isNew: false
            };
        } catch (error) {
            console.error('Failed to handle daily login:', error);
            return null;
        }
    }

    // Update specific player stats
    async updatePlayerStats(telegramId, updates) {
        try {
            const playerData = await this.loadProgress(telegramId);
            if (!playerData) return false;

            const updatedData = { ...playerData, ...updates };
            return await this.saveProgress(updatedData);
        } catch (error) {
            console.error('Failed to update player stats:', error);
            return false;
        }
    }

    // Add referral bonus (for future implementation)
    async addReferralBonus(referrerId, referredId) {
        try {
            const referrerData = await this.loadProgress(referrerId);
            if (!referrerData) return false;

            const bonus = 1000; // Referral bonus amount
            const updatedData = {
                ...referrerData,
                gp: referrerData.gp + bonus
            };

            return await this.saveProgress(updatedData);
        } catch (error) {
            console.error('Failed to add referral bonus:', error);
            return false;
        }
    }

    // Get global boss health (for future implementation)
    async getGlobalBossHealth() {
        try {
            // This would query all players' boss damage to calculate global progress
            const response = await this.makeRequest('/api/globalBoss');
            return response.success ? response.data : { health: 1000000, damage: 0 };
        } catch (error) {
            console.error('Failed to get global boss health:', error);
            return { health: 1000000, damage: 0 };
        }
    }
}

// Initialize API instance
const gameAPI = new GameAPI();

// Telegram WebApp Integration
class TelegramIntegration {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.user = null;
        this.isInitialized = false;
    }

    // Initialize Telegram WebApp
    async initialize() {
        if (!this.tg) {
            console.warn('Telegram WebApp not available');
            return false;
        }

        try {
            this.tg.ready();
            this.tg.expand();
            this.tg.enableClosingConfirmation();

            // Get user data
            this.user = this.tg.initDataUnsafe?.user;
            
            if (this.user) {
                console.log('Telegram user:', this.user);
                this.isInitialized = true;
                
                // Set up main button for sharing
                this.tg.MainButton.setText('Share Game');
                this.tg.MainButton.onClick(() => this.shareGame());
                
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Failed to initialize Telegram WebApp:', error);
            return false;
        }
    }

    // Get current user
    getUser() {
        return this.user;
    }

    // Share game functionality
    shareGame() {
        if (!this.tg) return;

        const shareText = `🚀 Join me in CX Odyssey - the ultimate space mining adventure!

🌌 Explore alien worlds
⛏️ Mine cosmic resources  
🐉 Battle epic bosses
🏆 Compete on leaderboards
💰 Earn real TON rewards

Start your cosmic journey now!`;

        const gameUrl = `https://t.me/${TELEGRAM_BOT_USERNAME}/game`;
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(gameUrl)}&text=${encodeURIComponent(shareText)}`;
        
        if (this.tg.openTelegramLink) {
            this.tg.openTelegramLink(shareUrl);
        } else {
            window.open(shareUrl, '_blank');
        }
    }

    // Generate referral link
    generateReferralLink() {
        if (!this.user) return null;
        
        const gameUrl = `https://t.me/${TELEGRAM_BOT_USERNAME}/game`;
        return `${gameUrl}?startapp=ref_${this.user.id}`;
    }

    // Show main button
    showMainButton(text = 'Share Game') {
        if (!this.tg) return;
        
        this.tg.MainButton.setText(text);
        this.tg.MainButton.show();
    }

    // Hide main button
    hideMainButton() {
        if (!this.tg) return;
        
        this.tg.MainButton.hide();
    }

    // Set back button handler
    onBackButton(callback) {
        if (!this.tg) return;
        
        this.tg.BackButton.onClick(callback);
    }

    // Show back button
    showBackButton() {
        if (!this.tg) return;
        
        this.tg.BackButton.show();
    }

    // Hide back button
    hideBackButton() {
        if (!this.tg) return;
        
        this.tg.BackButton.hide();
    }

    // Haptic feedback
    hapticFeedback(type = 'light') {
        if (!this.tg?.HapticFeedback) return;
        
        switch (type) {
            case 'light':
                this.tg.HapticFeedback.impactOccurred('light');
                break;
            case 'medium':
                this.tg.HapticFeedback.impactOccurred('medium');
                break;
            case 'heavy':
                this.tg.HapticFeedback.impactOccurred('heavy');
                break;
            case 'success':
                this.tg.HapticFeedback.notificationOccurred('success');
                break;
            case 'error':
                this.tg.HapticFeedback.notificationOccurred('error');
                break;
            case 'warning':
                this.tg.HapticFeedback.notificationOccurred('warning');
                break;
        }
    }

    // Show alert
    showAlert(message) {
        if (!this.tg) {
            alert(message);
            return;
        }
        
        this.tg.showAlert(message);
    }

    // Show confirm
    showConfirm(message, callback) {
        if (!this.tg) {
            const result = confirm(message);
            callback(result);
            return;
        }
        
        this.tg.showConfirm(message, callback);
    }

    // Close WebApp
    close() {
        if (!this.tg) return;
        
        this.tg.close();
    }
}

// Initialize Telegram integration
const telegramApp = new TelegramIntegration();

// Data sync utilities
class DataSync {
    constructor() {
        this.syncInterval = 30000; // 30 seconds
        this.lastSync = 0;
        this.isOnline = navigator.onLine;
        this.pendingUpdates = [];
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncPendingUpdates();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    // Queue update for sync
    queueUpdate(updateData) {
        this.pendingUpdates.push({
            ...updateData,
            timestamp: Date.now()
        });
        
        if (this.isOnline) {
            this.syncPendingUpdates();
        }
    }

    // Sync all pending updates
    async syncPendingUpdates() {
        if (!this.isOnline || this.pendingUpdates.length === 0) return;
        
        const updates = [...this.pendingUpdates];
        this.pendingUpdates = [];
        
        for (const update of updates) {
            try {
                await gameAPI.saveProgress(update);
                console.log('Synced update:', update);
            } catch (error) {
                console.error('Failed to sync update:', error);
                // Re-queue failed update
                this.pendingUpdates.push(update);
            }
        }
    }

    // Auto-sync at intervals
    startAutoSync() {
        setInterval(() => {
            if (this.isOnline && Date.now() - this.lastSync > this.syncInterval) {
                this.syncPendingUpdates();
                this.lastSync = Date.now();
            }
        }, this.syncInterval);
    }
}

// Initialize data sync
const dataSync = new DataSync();

// Error handling utilities
class ErrorHandler {
    static showError(message, error = null) {
        console.error('Game Error:', message, error);
        
        // Show user-friendly error message
        const userMessage = this.getUserFriendlyMessage(message);
        
        if (telegramApp.tg) {
            telegramApp.showAlert(userMessage);
        } else {
            showNotification('⚠️ ' + userMessage);
        }
    }
    
    static getUserFriendlyMessage(message) {
        const errorMap = {
            'Network error': 'Connection problem. Please check your internet.',
            'Save failed': 'Failed to save progress. Will retry automatically.',
            'Load failed': 'Failed to load data. Please refresh the game.',
            'API error': 'Server error. Please try again later.'
        };
        
        return errorMap[message] || 'Something went wrong. Please try again.';
    }
    
    static async handleAsyncError(asyncFn, fallback = null) {
        try {
            return await asyncFn();
        } catch (error) {
            this.showError('Operation failed', error);
            return fallback;
        }
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.startTimes = {};
    }
    
    start(operation) {
        this.startTimes[operation] = performance.now();
    }
    
    end(operation) {
        if (!this.startTimes[operation]) return;
        
        const duration = performance.now() - this.startTimes[operation];
        
        if (!this.metrics[operation]) {
            this.metrics[operation] = [];
        }
        
        this.metrics[operation].push(duration);
        delete this.startTimes[operation];
        
        // Log slow operations
        if (duration > 1000) {
            console.warn(`Slow operation: ${operation} took ${duration.toFixed(2)}ms`);
        }
    }
    
    getAverageTime(operation) {
        const times = this.metrics[operation];
        if (!times || times.length === 0) return 0;
        
        return times.reduce((a, b) => a + b, 0) / times.length;
    }
    
    logStats() {
        console.log('Performance Stats:', this.metrics);
    }
}

// Initialize performance monitor
const performanceMonitor = new PerformanceMonitor();

// Export for use in other files
window.gameAPI = gameAPI;
window.telegramApp = telegramApp;
window.dataSync = dataSync;
window.ErrorHandler = ErrorHandler;
window.performanceMonitor = performanceMonitor;
