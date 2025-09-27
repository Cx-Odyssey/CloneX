// Backend API service
class BackendService {
    constructor() {
        this.API_BASE = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api' 
            : '/api';
    }

    async loadProgress(telegramId) {
        return this._apiCall(`/loadProgress?telegramId=${telegramId}`);
    }

    async saveProgress(telegramId, username, gameState) {
        return this._apiCall('/saveProgress', 'POST', {
            telegramId, username, gameState
        });
    }

    async getLeaderboard(telegramId) {
        return this._apiCall(`/leaderboard?telegramId=${telegramId}`);
    }

    async saveWallet(telegramId, walletAddress) {
        return this._apiCall('/saveWallet', 'POST', {
            telegram_id: telegramId,
            wallet_address: walletAddress
        });
    }

    async _apiCall(endpoint, method = 'GET', body = null) {
        try {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            if (body) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(this.API_BASE + endpoint, options);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API call failed: ${endpoint}`, error);
            throw error;
        }
    }
}

// Global backend service instance
const backend = new BackendService();

// Test backend connection
async function testBackendConnection() {
    console.log('🔌 Testing backend connection...');
    
    try {
        const response = await fetch('/api/loadProgress?telegramId=test123');
        console.log('✅ Backend is accessible');
        return true;
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
        return false;
    }
}
