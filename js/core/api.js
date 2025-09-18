// Core API Module for CX Odyssey Backend Integration
class APIManager {
    constructor() {
        this.baseUrl = GAME_CONFIG.API.BASE_URL;
        this.timeout = GAME_CONFIG.API.TIMEOUT;
        this.retryCount = GAME_CONFIG.API.RETRY_COUNT;
        this.retryDelay = GAME_CONFIG.API.RETRY_DELAY;
        this.isOnline = navigator.onLine;
        this.requestQueue = [];
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processQueue();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    // Generic request method with retry logic
    async request(endpoint, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            signal: controller.signal,
            ...options
        };

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, config);
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    // Request with retry logic
    async requestWithRetry(endpoint, options = {}, retries = this.retryCount) {
        try {
            return await this.request(endpoint, options);
        } catch (error) {
            console.error(`API request failed (${retries} retries left):`, error);
            
            if (retries > 0 && !error.message.includes('abort')) {
                await this.delay(this.retryDelay);
                return this.requestWithRetry(endpoint, options, retries - 1);
            }
            throw error;
        }
    }

    // Save game progress to your Vercel backend
    async saveProgress(telegramId, username, gameState) {
        if (!this.isOnline) {
            // Queue the request for when we're back online
            this.requestQueue.push({
                type: 'save',
                data: { telegramId, username, gameState },
                timestamp: Date.now()
            });
            throw new Error('Offline - queued for sync');
        }

        try {
            const response = await this.requestWithRetry(GAME_CONFIG.API.ENDPOINTS.SAVE_PROGRESS, {
                method: 'POST',
                body: JSON.stringify({
                    telegramId: telegramId,
                    username: username,
                    gameState: gameState
                })
            });

            console.log('Progress saved successfully:', response);
            return response;
        } catch (error) {
            console.error('Save progress failed:', error);
            
            // Save to local storage as backup
            this.saveToLocalStorage(gameState);
            throw error;
        }
    }

    // Load game progress from your Vercel backend
    async loadProgress(telegramId) {
        try {
            const response = await this.requestWithRetry(
                `${GAME_CONFIG.API.ENDPOINTS.LOAD_PROGRESS}?telegramId=${telegramId}`
            );

            console.log('Progress loaded successfully:', response);
            return response;
        } catch (error) {
            console.error('Load progress failed:', error);
            
            // Try to load from local storage as fallback
            const localData = this.loadFromLocalStorage();
            if (localData) {
                console.log('Loaded from local storage as fallback');
                return localData;
            }
            
            throw error;
        }
    }

    // Get leaderboard data from your backend
    async getLeaderboard(telegramId = null, limit = GAME_CONFIG.UI.LEADERBOARD_LIMIT) {
        try {
            const params = new URLSearchParams({ limit: limit.toString() });
            if (telegramId) {
                params.append('telegramId', telegramId.toString());
            }

            const response = await this.requestWithRetry(
                `${GAME_CONFIG.API.ENDPOINTS.LEADERBOARD}?${params.toString()}`
            );

            console.log('Leaderboard loaded successfully:', response);
            return response;
        } catch (error) {
            console.error('Leaderboard load failed:', error);
            
            // Return mock data as fallback
            return this.getMockLeaderboard();
        }
    }

    // Process queued requests when back online
    async processQueue() {
        if (this.requestQueue.length === 0) return;

        console.log(`Processing ${this.requestQueue.length} queued requests...`);
        
        const queue = [...this.requestQueue];
        this.requestQueue = [];

        for (const queuedRequest of queue) {
            try {
                if (queuedRequest.type === 'save') {
                    const { telegramId, username, gameState } = queuedRequest.data;
                    await this.saveProgress(telegramId, username, gameState);
                }
            } catch (error) {
                console.error('Failed to process queued request:', error);
                // Re-queue failed requests
                this.requestQueue.push(queuedRequest);
            }
        }
    }

    // Local storage backup methods
    saveToLocalStorage(gameState) {
        try {
            const saveData = {
                gameState,
                timestamp: Date.now()
            };
            localStorage.setItem(GAME_CONFIG.STORAGE_KEYS.GAME_STATE, JSON.stringify(saveData));
            localStorage.setItem(GAME_CONFIG.STORAGE_KEYS.LAST_SAVE, Date.now().toString());
        } catch (error) {
            console.error('Failed to save to local storage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const saveData = localStorage.getItem(GAME_CONFIG.STORAGE_KEYS.GAME_STATE);
            if (saveData) {
                const parsed = JSON.parse(saveData);
                return parsed.gameState;
            }
        } catch (error) {
            console.error('Failed to load from local storage:', error);
        }
        return null;
    }

    // Mock leaderboard for fallback
    getMockLeaderboard() {
        return {
            topPlayers: [
                { rank: 1, username: 'GalaxyMaster', gp: 125000, telegramId: '1' },
                { rank: 2, username: 'StarHunter', gp: 89500, telegramId: '2' },
                { rank: 3, username: 'CosmicRider', gp: 67200, telegramId: '3' },
                { rank: 4, username: 'NebulaKing', gp: 54300, telegramId: '4' },
                { rank: 5, username: 'VoidExplorer', gp: 43100, telegramId: '5' },
                { rank: 6, username: 'PlanetHopper', gp: 38900, telegramId: '6' },
                { rank: 7, username: 'AsteroidMiner', gp: 32400, telegramId: '7' },
                { rank: 8, username: 'SolarFlare', gp: 28700, telegramId: '8' },
                { rank: 9, username: 'CometChaser', gp: 25100, telegramId: '9' },
                { rank: 10, username: 'SpacePirate', gp: 22800, telegramId: '10' }
            ],
            userRank: 999,
            userInTop100: false
        };
    }

    // Utility delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Analytics tracking
    async trackEvent(eventName, eventData = {}) {
        if (!this.isOnline) return;

        try {
            // This would typically go to an analytics endpoint
            console.log('Event tracked:', eventName, eventData);
        } catch (error) {
            console.error('Analytics tracking failed:', error);
        }
    }

    // Health check
    async checkHealth() {
        try {
            const response = await this.request('/health');
            return response.status === 'ok';
        } catch (error) {
            return false;
        }
    }

    // Connection status
    getConnectionStatus() {
        return {
            online: this.isOnline,
            queuedRequests: this.requestQueue.length,
            lastSave: localStorage.getItem(GAME_CONFIG.STORAGE_KEYS.LAST_SAVE)
        };
    }

    // Clear local storage
    clearLocalStorage() {
        try {
            localStorage.removeItem(GAME_CONFIG.STORAGE_KEYS.GAME_STATE);
            localStorage.removeItem(GAME_CONFIG.STORAGE_KEYS.LAST_SAVE);
            localStorage.removeItem(GAME_CONFIG.STORAGE_KEYS.USER_SETTINGS);
        } catch (error) {
            console.error('Failed to clear local storage:', error);
        }
    }

    // Batch operations for efficiency
    async batchSave(operations) {
        if (!this.isOnline) {
            this.requestQueue.push(...operations);
            throw new Error('Offline - queued for sync');
        }

        try {
            const response = await this.requestWithRetry('/batch', {
                method: 'POST',
                body: JSON.stringify({ operations })
            });

            return response;
        } catch (error) {
            // Queue individual operations
            this.requestQueue.push(...operations);
            throw error;
        }
    }
}

// Create global API manager instance
const apiManager = new APIManager();
window.apiManager = apiManager;
