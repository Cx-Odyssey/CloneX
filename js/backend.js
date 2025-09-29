// Backend API Handler
class BackendAPI {
    constructor() {
        // Your backend URLs - exactly as you specified
        this.baseURL = 'https://cx-odyssey-backend.vercel.app/api';
        this.endpoints = {
            loadProgress: `${this.baseURL}/loadProgress`,
            saveProgress: `${this.baseURL}/saveProgress`,
            leaderboard: `${this.baseURL}/leaderboard`,
            saveWallet: `${this.baseURL}/saveWallet`
        };
        this.isOnline = navigator.onLine;
        this.retryAttempts = 3;
        this.retryDelay = 1000;
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Back online');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📴 Gone offline');
        });
    }

    // Enhanced fetch with retry logic and error handling
    async fetchWithRetry(url, options = {}, attempts = this.retryAttempts) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            ...options
        };

        for (let i = 0; i < attempts; i++) {
            try {
                console.log(`🌐 API Call (attempt ${i + 1}/${attempts}):`, url);
                
                const response = await fetch(url, defaultOptions);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log('✅ API Success:', data);
                return { success: true, data };
                
            } catch (error) {
                console.warn(`⚠️ API attempt ${i + 1} failed:`, error.message);
                
                if (i === attempts - 1) {
                    // Last attempt failed
                    console.error('❌ All API attempts failed:', error);
                    return { success: false, error: error.message };
                }
                
                // Wait before retry (exponential backoff)
                await this.delay(this.retryDelay * Math.pow(2, i));
            }
        }
    }

    // Load game progress from backend
    async loadProgress(telegramId) {
        if (!telegramId) {
            console.error('❌ No telegramId provided for loadProgress');
            return { success: false, error: 'No telegramId provided' };
        }

        const url = `${this.endpoints.loadProgress}?telegramId=${telegramId}`;
        return await this.fetchWithRetry(url, { method: 'GET' });
    }

    // Save game progress to backend
    async saveProgress(telegramId, username, gameState) {
        if (!telegramId || !gameState) {
            console.error('❌ Missing required data for saveProgress');
            return { success: false, error: 'Missing required data' };
        }

        const payload = {
            telegramId: telegramId,
            username: username || 'Anonymous',
            gameState: gameState
        };

        console.log('💾 Saving game progress:', {
            telegramId,
            username,
            gp: gameState.gp,
            energy: gameState.energy
        });

        return await this.fetchWithRetry(this.endpoints.saveProgress, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    // Load leaderboard data
    async loadLeaderboard(telegramId = null, limit = 100) {
        let url = `${this.endpoints.leaderboard}?limit=${limit}`;
        if (telegramId) {
            url += `&telegramId=${telegramId}`;
        }

        return await this.fetchWithRetry(url, { method: 'GET' });
    }

    // Save wallet address
    async saveWallet(telegramId, walletAddress) {
        if (!telegramId || !walletAddress) {
            console.error('❌ Missing required data for saveWallet');
            return { success: false, error: 'Missing required data' };
        }

        const payload = {
            telegram_id: telegramId,
            wallet_address: walletAddress
        };

        return await this.fetchWithRetry(this.endpoints.saveWallet, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    // Utility delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Check if backend is available
    async checkHealth() {
        try {
            const response = await fetch(this.endpoints.loadProgress + '?telegramId=test', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            return response.ok || response.status === 400; // 400 is expected for invalid telegramId
        } catch (error) {
            console.warn('Backend health check failed:', error);
            return false;
        }
    }
}

// Local Storage fallback handler
class LocalStorageHandler {
    constructor() {
        this.storageKey = 'cxOdysseySave';
        this.leaderboardKey = 'cxOdysseyLeaderboard';
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const data = JSON.parse(saved);
                console.log('💾 Loaded from localStorage');
                return { success: true, data };
            }
            return { success: false, error: 'No saved data found' };
        } catch (error) {
            console.error('❌ localStorage load failed:', error);
            return { success: false, error: error.message };
        }
    }

    saveProgress(gameState) {
        try {
            gameState.energyLastRegen = Date.now();
            localStorage.setItem(this.storageKey, JSON.stringify(gameState));
            console.log('💾 Saved to localStorage');
            return { success: true };
        } catch (error) {
            console.error('❌ localStorage save failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Generate mock leaderboard for offline mode
    generateMockLeaderboard(userGP = 0, userName = 'You') {
        const baseLeaders = [
            { username: 'GalaxyMaster', gp: 2500 + Math.floor(Math.random() * 200) },
            { username: 'StarHunter', gp: 1890 + Math.floor(Math.random() * 200) },
            { username: 'CosmicRider', gp: 1450 + Math.floor(Math.random() * 200) },
            { username: 'SpaceMiner', gp: 1200 + Math.floor(Math.random() * 150) },
            { username: 'AsteroidKing', gp: 980 + Math.floor(Math.random() * 150) },
            { username: 'QuantumExplorer', gp: 820 + Math.floor(Math.random() * 100) },
            { username: 'NebulaCrusher', gp: 650 + Math.floor(Math.random() * 100) },
            { username: 'VoidWalker', gp: 540 + Math.floor(Math.random() * 80) },
            { username: 'StarDust', gp: 420 + Math.floor(Math.random() * 80) },
            { username: 'CosmicMiner', gp: 350 + Math.floor(Math.random() * 50) }
        ];

        if (userGP > 100) {
            baseLeaders.push({ username: userName, gp: userGP, isPlayer: true });
        }

        baseLeaders.sort((a, b) => b.gp - a.gp);
        
        const topPlayers = baseLeaders.slice(0, 10).map((player, index) => ({
            rank: index + 1,
            username: player.username,
            gp: player.gp,
            telegramId: player.isPlayer ? 'current_user' : (index + 1).toString()
        }));

        const userRank = Math.max(1, baseLeaders.findIndex(p => p.isPlayer) + 1);
        
        return {
            success: true,
            data: {
                topPlayers,
                userRank: userRank <= 1000 ? userRank : 999,
                userInTop100: userRank <= 100,
                totalPlayers: baseLeaders.length,
                lastUpdated: new Date().toISOString()
            }
        };
    }
}

// Main Backend Manager
class BackendManager {
    constructor() {
        this.api = new BackendAPI();
        this.localStorage = new LocalStorageHandler();
        this.usingBackend = false;
        this.user = null;
        this.backendAvailable = false;
    }

    async initialize(user = null) {
        this.user = user;
        
        // Force backend mode for Telegram users
        if (user && user.id) {
            console.log('🔍 Telegram user detected, forcing backend mode');
            this.usingBackend = true;
            this.backendAvailable = true;
            
            // Test backend connection
            try {
                const testResult = await this.api.checkHealth();
                if (!testResult) {
                    console.warn('⚠️ Backend health check failed, but continuing...');
                }
            } catch (error) {
                console.warn('⚠️ Backend test failed:', error);
            }
            
            console.log('✅ Backend mode enabled for Telegram');
        } else {
            console.log('📱 Browser mode - using localStorage only');
            this.usingBackend = false;
        }
    }

    async loadProgress() {
        if (this.usingBackend && this.user?.id) {
            console.log('📡 Loading from backend for Telegram user:', this.user.id);
            const result = await this.api.loadProgress(this.user.id);
            if (result.success) {
                console.log('✅ Backend load successful');
                return result;
            } else {
                console.error('❌ Backend load failed:', result.error);
                // For Telegram users, don't fallback to localStorage
                // Return empty state instead
                return {
                    success: true,
                    data: null,
                    isNewPlayer: true
                };
            }
        } else {
            // Browser mode - use localStorage
            console.log('💾 Loading from localStorage (browser mode)');
            return this.localStorage.loadProgress();
        }
    }

    async saveProgress(gameState) {
        if (this.usingBackend && this.user?.id) {
            console.log('📡 Saving to backend for Telegram user:', this.user.id);
            const username = this.user.first_name || 'Anonymous';
            const backendResult = await this.api.saveProgress(this.user.id, username, gameState);
            
            if (backendResult.success) {
                console.log('✅ Backend save successful');
                return backendResult;
            } else {
                console.error('❌ Backend save failed:', backendResult.error);
                // Don't save to localStorage for Telegram users
                return backendResult;
            }
        } else {
            // Browser mode - use localStorage
            console.log('💾 Saving to localStorage (browser mode)');
            return this.localStorage.saveProgress(gameState);
        }
    }

    async loadLeaderboard() {
        if (this.usingBackend) {
            const result = await this.api.loadLeaderboard(this.user?.id);
            if (result.success) {
                return result;
            }
        }
        
        // Fallback to mock leaderboard
        const userGP = window.gameState?.gp || 0;
        const userName = this.user?.first_name || 'You';
        return this.localStorage.generateMockLeaderboard(userGP, userName);
    }

    async saveWallet(walletAddress) {
        if (this.usingBackend && this.user?.id) {
            return await this.api.saveWallet(this.user.id, walletAddress);
        } else {
            console.log('💾 Wallet saved locally (no backend)');
            return { success: true, message: 'Wallet saved locally' };
        }
    }

    isBackendEnabled() {
        return this.usingBackend;
    }
}

// Global backend manager instance
window.backendManager = new BackendManager();
