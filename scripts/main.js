// Game State with logical balance
let gameState = {
    energy: 100,
    maxEnergy: 100,
    shards: 0,
    gp: 0,
    currentPlanet: '',
    bossHealth: 500,
    maxBossHealth: 500,
    playerDamage: 0,
    upgrades: { speed: 0, damage: 0, energy: 0, multiplier: 0 },
    adDamageBoost: 0,
    gameTickets: 3,
    lastTicketTime: Date.now(),
    maxTickets: 10,
    dailyTasks: { login: false, mine: false, boss: false, combo: false },
    oneTimeTasks: { planet: false, purchase: false, shards100: false, invite5: false },
    dailyTaskProgress: { mines: 0, bossBattles: 0, comboAttempts: 0 },
    dailyCombo: { code: '', attempts: 3, completed: false, date: '' },
    energyLastRegen: Date.now(),
    referralCode: '',
    totalReferrals: 0,
    referralEarnings: 0,
    lastDailyReset: ''
};

// Global variables
let tg = null;
let user = null;
let connector = null;

// Backend API base URL
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// Initialize game with proper loading sequence
async function initGame() {
    console.log('🚀 Initializing CX Odyssey...');
    
    updateLoadingProgress(0, "Generating starfield...");
    generateStarfield();
    
    setTimeout(async () => {
        updateLoadingProgress(20, "Initializing systems...");
        
        // Check if we're in Telegram WebApp
        try {
            if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
                updateLoadingProgress(40, "Connecting to Telegram...");
                
                tg = window.Telegram.WebApp;
                tg.expand();
                tg.ready();
                
                user = tg.initDataUnsafe?.user;
                
                if (user) {
                    console.log('👤 User logged in:', user.first_name);
                    
                    if (user.photo_url) {
                        document.getElementById('tgAvatar').src = user.photo_url;
                    }
                    
                    let userName = user.first_name;
                    if (user.last_name) userName += " " + user.last_name;
                    document.getElementById('tgUserName').textContent = userName;
                }
            }
        } catch (error) {
            console.log('🌐 Running in browser mode');
        }
        
        updateLoadingProgress(60, "Loading game data...");
        await loadGameData();
        
        updateLoadingProgress(80, "Initializing wallet...");
        setTimeout(() => {
            initTonConnect();
            updateLoadingProgress(100, "Ready to launch!");
            setTimeout(startGame, 500);
        }, 500);
    }, 300);
}

function updateLoadingProgress(percent, text) {
    document.getElementById('loadingProgressBar').style.width = percent + '%';
    document.getElementById('loadingText').textContent = text;
}

function startGame() {
    console.log('🎮 Starting game...');
    document.getElementById('loadingOverlay').classList.add('hide');
    setTimeout(() => {
        document.getElementById('loadingOverlay').style.display = 'none';
    }, 500);
    
    generateDailyCombo();
    generateReferralCode();
    checkDailyReset();
    updateUI();
    loadLeaderboard();
    showScreen('galaxyScreen');
    showNotification(`🚀 Welcome to CX Odyssey${user ? ', ' + user.first_name : ''}!`);
    
    startEnergyRegeneration();
}

// Generate starfield
function generateStarfield() {
    const starfield = document.getElementById('starfield');
    const starTypes = ['star-small', 'star-medium', 'star-large'];
    
    for (let i = 0; i < 80; i++) {
        const star = document.createElement('div');
        const type = starTypes[Math.floor(Math.random() * starTypes.length)];
        star.className = `star ${type}`;
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        starfield.appendChild(star);
    }
}

// Load and save game data with backend integration
async function loadGameData() {
    try {
        console.log('🔄 Loading game data from backend...');
        
        // Get Telegram user ID for backend
        const telegramId = user?.id || tg?.initDataUnsafe?.user?.id;
        if (!telegramId) {
            console.log('⚠️ No Telegram ID, using local storage');
            loadFromLocalStorage();
            return;
        }

        const response = await fetch(`${API_BASE}/loadProgress?telegramId=${telegramId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        // Merge backend data with current game state
        if (data.isNewPlayer) {
            console.log('👶 New player detected, keeping default state');
        } else {
            gameState = { ...gameState, ...data };
            console.log('✅ Game data loaded from backend:', data);
        }
        
    } catch (error) {
        console.error('❌ Backend load failed, using local storage:', error);
        loadFromLocalStorage();
    }
}

// Save game data to backend
async function saveGameData() {
    try {
        const telegramId = user?.id || tg?.initDataUnsafe?.user?.id;
        const username = user?.first_name || 'Anonymous';
        
        if (!telegramId) {
            console.log('⚠️ No Telegram ID, saving to local storage only');
            saveToLocalStorage();
            return;
        }

        const response = await fetch(`${API_BASE}/saveProgress`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                telegramId: telegramId,
                username: username,
                gameState: gameState
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error);
        }

        console.log('✅ Game data saved to backend');
        
    } catch (error) {
        console.error('❌ Backend save failed, saving to local storage:', error);
        saveToLocalStorage();
    }
}

// Fallback to local storage
function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('cxOdysseySave');
        if (saved) {
            const data = JSON.parse(saved);
            gameState = { ...gameState, ...data };
            console.log('💾 Loaded from local storage');
        }
    } catch (error) {
        console.log('⚠️ Local storage load failed');
    }
}

function saveToLocalStorage() {
    try {
        gameState.energyLastRegen = Date.now();
        localStorage.setItem('cxOdysseySave', JSON.stringify(gameState));
    } catch (error) {
        console.log('⚠️ Local storage save failed');
    }
}

// Auto-save
setInterval(() => {
    saveGameData();
}, 30000);

// Cleanup
window.addEventListener('beforeunload', () => {
    saveGameData();
});

// Initialize
document.addEventListener('DOMContentLoaded', initGame);
