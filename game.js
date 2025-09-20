// CX Odyssey Main Game JavaScript
// Game Configuration
const GAME_CONFIG = {
    API_BASE_URL: 'https://cx-odyssey-backend.vercel.app/api',
    ENERGY_REGEN_RATE: 1,
    ENERGY_REGEN_INTERVAL: 6000, // 6 seconds
    PLANETS: {
        'Pyrion': { multiplier: 1.2, minReward: 10, maxReward: 20 },
        'Aqueos': { multiplier: 1.0, minReward: 8, maxReward: 16 },
        'Voidex': { multiplier: 1.8, minReward: 15, maxReward: 25 },
        'Verdant': { multiplier: 1.1, minReward: 9, maxReward: 18 },
        'Aurelia': { multiplier: 2.0, minReward: 20, maxReward: 30 },
        'Crimson': { multiplier: 1.5, minReward: 12, maxReward: 22 }
    },
    UPGRADES: {
        speed: { baseCost: 500, multiplier: 1.5 },
        damage: { baseCost: 750, multiplier: 1.5 },
        energy: { baseCost: 1000, multiplier: 2.0 },
        multiplier: { baseCost: 3000, multiplier: 2.5 }
    }
};

// Game State
let gameState = {
    energy: 100,
    maxEnergy: 100,
    shards: 0,
    gp: 0,
    currentPlanet: 'Aqueos',
    dailyStreak: 1,
    lastLogin: new Date().toISOString().split('T')[0],
    upgrades: { speed: 0, damage: 0, energy: 0, multiplier: 0 },
    achievements: []
};

let user = null;
let energyRegenInterval = null;
let autoSaveInterval = null;
let currentScreen = 'loadingScreen';

// Initialize game
async function initGame() {
    try {
        generateStarfield();
        updateLoadingStatus('Initializing Telegram WebApp...');

        // Initialize Telegram
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
            user = window.Telegram.WebApp.initDataUnsafe?.user;
            
            if (user) {
                updateLoadingStatus(`Welcome ${user.first_name}!`);
                updateUserInterface();
            }
        }

        // Load game data
        updateLoadingStatus('Loading game data...');
        await loadProgress();

        // Process daily login
        await processDailyLogin();

        // Start game systems
        startSystems();

        // Show main screen
        setTimeout(() => {
            showScreen('galaxyScreen');
            const welcomeMessage = user ? `Welcome back, ${user.first_name}!` : 'Welcome to CX Odyssey!';
            showNotification(welcomeMessage);
        }, 1500);

    } catch (error) {
        console.error('Game initialization failed:', error);
        setTimeout(() => {
            showScreen('galaxyScreen');
            showNotification('Started in offline mode');
        }, 2000);
    }
}

function updateLoadingStatus(message) {
    const statusElement = document.getElementById('tgInitStatus');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

// Generate starfield
function generateStarfield() {
    const starfield = document.getElementById('starfield');
    const starTypes = ['star-small', 'star-medium', 'star-large'];
    
    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        const type = starTypes[Math.floor(Math.random() * starTypes.length)];
        star.className = `star ${type}`;
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (2 + Math.random() * 2) + 's';
        starfield.appendChild(star);
    }
}

// Load/Save progress
async function loadProgress() {
    if (!user?.id) {
        console.log('No user ID - using default state');
        return;
    }

    try {
        const response = await fetch(`${GAME_CONFIG.API_BASE_URL}/loadProgress?telegramId=${user.id}`);
        const data = await response.json();
        
        if (response.ok && !data.isNewPlayer) {
            gameState = { ...gameState, ...data };
            console.log('Game state loaded from backend');
        } else {
            console.log('New player or using defaults');
        }
    } catch (error) {
        console.error('Failed to load progress:', error);
        showNotification('Failed to load save data - using defaults');
    }
}

async function saveProgress() {
    if (!user?.id) return false;

    try {
        const response = await fetch(`${GAME_CONFIG.API_BASE_URL}/saveProgress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegramId: user.id,
                username: user.first_name || 'Anonymous',
                gameState: gameState
            })
        });

        const result = await response.json();
        if (response.ok) {
            console.log('Game state saved to backend');
            return true;
        } else {
            console.error('Save failed:', result);
            return false;
        }
    } catch (error) {
        console.error('Failed to save progress:', error);
        return false;
    }
}

// Daily login processing
async function processDailyLogin() {
    const today = new Date().toISOString().split('T')[0];
    
    if (gameState.lastLogin === today) {
        document.getElementById('dailyReward').style.display = 'none';
        return;
    }

    // Calculate streak
    const lastLogin = new Date(gameState.lastLogin);
    const currentDate = new Date(today);
    const dayDiff = Math.floor((currentDate - lastLogin) / (1000 * 60 * 60 * 24));

    if (dayDiff === 1) {
        gameState.dailyStreak = Math.min(gameState.dailyStreak + 1, 30);
    } else if (dayDiff > 1) {
        gameState.dailyStreak = 1;
    }

    // Calculate bonus
    const baseBonus = 100;
    const streakBonus = gameState.dailyStreak * 50;
    const totalBonus = baseBonus + streakBonus;

    gameState.gp += totalBonus;
    gameState.lastLogin = today;

    // Show daily reward
    document.getElementById('streakDay').textContent = gameState.dailyStreak;
    document.getElementById('bonusAmount').textContent = totalBonus;
    document.getElementById('dailyReward').style.display = 'block';
    
    setTimeout(() => {
        document.getElementById('dailyReward').style.display = 'none';
    }, 8000);

    await saveProgress();
}

// Start game systems
function startSystems() {
    // Energy regeneration
    if (energyRegenInterval) clearInterval(energyRegenInterval);
    energyRegenInterval = setInterval(() => {
        if (gameState.energy < gameState.maxEnergy) {
            gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + GAME_CONFIG.ENERGY_REGEN_RATE);
            updateUI();
        }
    }, GAME_CONFIG.ENERGY_REGEN_INTERVAL);

    // Auto-save
    if (autoSaveInterval) clearInterval(autoSaveInterval);
    autoSaveInterval = setInterval(() => {
        saveProgress();
    }, 30000);

    // Save on page unload
    window.addEventListener('beforeunload', () => {
        saveProgress();
    });
}

// Screen management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    setTimeout(() => {
        document.getElementById(screenId).classList.add('active');
        currentScreen = screenId;
    }, 100);

    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    const navMap = {
        'galaxyScreen': 0,
        'miningScreen': 1,
        'shopScreen': 2,
        'gamesScreen': 3
    };
    
    if (navMap[screenId] !== undefined) {
        document.querySelectorAll('.nav-btn')[navMap[screenId]].classList.add('active');
    }

    updateUI();
}

// Planet selection
function selectPlanet(planetName, planetId) {
    gameState.currentPlanet = planetName;
    document.getElementById('currentPlanet').textContent = planetName;
    
    const planetConfig = GAME_CONFIG.PLANETS[planetName] || GAME_CONFIG.PLANETS['Aqueos'];
    const reward = Math.floor(planetConfig.minReward + Math.random() * (planetConfig.maxReward - planetConfig.minReward));
    document.getElementById('mineReward').textContent = reward;
    
    showScreen('miningScreen');
    showNotification(`Landed on ${planetName}!`);
    
    if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
}

// Mining
async function minePlanet() {
    if (gameState.energy < 5) {
        showNotification('Not enough energy!');
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
        }
        return;
    }

    const planetName = gameState.currentPlanet;
    const planetConfig = GAME_CONFIG.PLANETS[planetName] || GAME_CONFIG.PLANETS['Aqueos'];
    const speedBonus = 1 + (gameState.upgrades.speed * 0.25);
    const baseReward = planetConfig.minReward + Math.random() * (planetConfig.maxReward - planetConfig.minReward);
    const reward = Math.floor(baseReward * planetConfig.multiplier * speedBonus);

    gameState.energy -= 5;
    gameState.shards += reward;
    gameState.gp += Math.floor(reward * 0.5 * (1 + gameState.upgrades.multiplier));

    // Visual effect
    showMiningEffect();
    
    showNotification(`+${reward} Shards, +${Math.floor(reward * 0.5 * (1 + gameState.upgrades.multiplier))} GP!`);
    
    if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }

    updateUI();
    await saveProgress();
}

function showMiningEffect() {
    const miningArea = document.querySelector('.mining-area');
    if (!miningArea) return;

    const beam = document.createElement('div');
    beam.style.cssText = `
        position: absolute;
        width: 6px;
        height: 80px;
        background: linear-gradient(to bottom, var(--primary-gold), var(--secondary-orange), transparent);
        box-shadow: 0 0 20px var(--primary-gold);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 3px;
        animation: miningBeam 1.2s ease-in-out;
    `;
    
    // Add animation if not exists
    if (!document.getElementById('miningAnimation')) {
        const style = document.createElement('style');
        style.id = 'miningAnimation';
        style.textContent = `
            @keyframes miningBeam {
                0% { opacity: 0; height: 0; transform: translate(-50%, -50%) scale(0.5); }
                30% { opacity: 1; height: 80px; transform: translate(-50%, -50%) scale(1); }
                70% { opacity: 1; height: 80px; transform: translate(-50%, -50%) scale(1.1); }
                100% { opacity: 0; height: 80px; transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    miningArea.appendChild(beam);
    setTimeout(() => {
        beam.remove();
    }, 1200);
}

// Battle aliens
async function battleAliens() {
    if (gameState.energy < 10) {
        showNotification('Need at least 10 energy to battle!');
        return;
    }

    gameState.energy -= 10;
    const baseDamage = 50 + (gameState.upgrades.damage * 25);
    const damage = baseDamage + Math.floor(Math.random() * baseDamage * 0.5);
    const reward = Math.floor((100 + Math.random() * 200) * (1 + gameState.upgrades.multiplier));
    
    gameState.gp += reward;
    
    if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
    }
    
    showNotification(`Defeated aliens! +${reward} GP!`);
    updateUI();
    await saveProgress();
}

// Shop system
function getUpgradeCost(upgradeType) {
    const config = GAME_CONFIG.UPGRADES[upgradeType];
    const currentLevel = gameState.upgrades[upgradeType] || 0;
    return Math.floor(config.baseCost * Math.pow(config.multiplier, currentLevel));
}

async function buyUpgrade(upgradeType) {
    const cost = getUpgradeCost(upgradeType);
    
    if (gameState.gp < cost) {
        showNotification('Not enough GP!');
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
        }
        return;
    }

    gameState.gp -= cost;
    gameState.upgrades[upgradeType]++;

    // Apply upgrade effects
    if (upgradeType === 'energy') {
        gameState.maxEnergy += 50;
        gameState.energy = gameState.maxEnergy; // Refill energy
    }

    const messages = {
        speed: 'Mining speed increased!',
        damage: 'Combat damage boosted!',
        energy: 'Maximum energy increased!',
        multiplier: 'GP multiplier activated!'
    };

    if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
    
    showNotification(`${messages[upgradeType]} Level ${gameState.upgrades[upgradeType]}`);
    updateShopPrices();
    updateUI();
    await saveProgress();
}

function updateShopPrices() {
    const upgradeTypes = ['speed', 'damage', 'energy', 'multiplier'];
    upgradeTypes.forEach(type => {
        const element = document.getElementById(type + 'Cost');
        if (element) {
            element.textContent = getUpgradeCost(type) + ' GP';
        }
    });
}

// Mini-games
function playGame(gameType) {
    const gameArea = document.getElementById('gameArea');
    
    if (gameType === 'clicker') {
        startCryptoClicker(gameArea);
    } else if (gameType === 'dodge') {
        startAsteroidDodge(gameArea);
    }
}

function startCryptoClicker(gameArea) {
    let clicks = 0;
    let timeLeft = 10;
    let gameActive = true;

    gameArea.innerHTML = `
        <h3 style="color: var(--primary-gold); font-size: 22px; margin-bottom: 20px;">💎 Crypto Clicker</h3>
        <p style="margin-bottom: 20px;">Click as fast as you can!</p>
        <div id="clickTarget" style="font-size: 120px; cursor: pointer; margin: 30px; transition: all 0.1s ease;" onclick="clickCrypto()">💎</div>
        <div style="margin: 20px 0;">
            <div>Clicks: <span id="clickCount" style="color: var(--success-green); font-weight: 700; font-size: 24px;">0</span></div>
            <div>Time: <span id="clickTime" style="color: var(--danger-red); font-weight: 700; font-size: 20px;">10</span>s</div>
        </div>
    `;

    const timer = setInterval(() => {
        timeLeft--;
        document.getElementById('clickTime').textContent = timeLeft;

        if (timeLeft <= 0) {
            gameActive = false;
            clearInterval(timer);
            const reward = clicks * 10;
            gameState.gp += reward;
            showNotification(`💎 ${clicks} clicks! +${reward} GP`);
            updateUI();
            saveProgress();
            endGame();
        }
    }, 1000);

    window.clickCrypto = () => {
        if (!gameActive) return;
        
        clicks++;
        document.getElementById('clickCount').textContent = clicks;
        
        const target = document.getElementById('clickTarget');
        target.style.transform = 'scale(0.9)';
        target.style.filter = 'brightness(1.5)';
        
        setTimeout(() => {
            target.style.transform = 'scale(1)';
            target.style.filter = 'brightness(1)';
        }, 100);
    };
}

function startAsteroidDodge(gameArea) {
    gameArea.innerHTML = `
        <h3 style="color: var(--primary-gold); font-size: 22px; margin-bottom: 20px;">☄️ Asteroid Dodge</h3>
        <p style="margin-bottom: 20px;">Touch to move your ship!</p>
        <div id="dodgeGame" style="position: relative; width: 300px; height: 200px; background: rgba(0,0,0,0.8); border: 2px solid var(--neon-blue); margin: 20px auto; overflow: hidden; border-radius: 15px;">
            <div id="playerShip" style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); width: 30px; height: 30px; background: var(--primary-gold); border-radius: 50%; transition: left 0.1s ease;"></div>
        </div>
        <div style="margin: 20px 0;">
            <div>Score: <span id="dodgeScore" style="color: var(--success-green); font-weight: 700; font-size: 18px;">0</span></div>
            <div>Time: <span id="dodgeTime" style="color: var(--primary-gold); font-weight: 700;">15</span>s</div>
        </div>
        <button class="action-btn" onclick="endGame()" style="margin-top: 15px;">🛑 End Game</button>
    `;

    let score = 0;
    let timeLeft = 15;
    let gameActive = true;
    const gameContainer = document.getElementById('dodgeGame');
    const playerShip = document.getElementById('playerShip');
    
    // Touch/mouse controls
    let shipPosition = 50;
    gameContainer.addEventListener('touchstart', handleMove);
    gameContainer.addEventListener('mousemove', handleMove);
    
    function handleMove(e) {
        e.preventDefault();
        const rect = gameContainer.getBoundingClientRect();
        const touchX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        shipPosition = (touchX / rect.width) * 100;
        shipPosition = Math.max(10, Math.min(90, shipPosition));
        playerShip.style.left = shipPosition + '%';
    }

    // Game timer
    const timer = setInterval(() => {
        timeLeft--;
        document.getElementById('dodgeTime').textContent = timeLeft;
        
        if (timeLeft <= 0) {
            gameActive = false;
            clearInterval(timer);
            const reward = Math.floor(300 + (score * 20));
            gameState.gp += reward;
            showNotification(`☄️ Game complete! Score: ${score} - +${reward} GP`);
            updateUI();
            saveProgress();
            endGame();
        }
    }, 1000);

    // Simple scoring
    const scoreInterval = setInterval(() => {
        if (gameActive) {
            score += 10;
            document.getElementById('dodgeScore').textContent = score;
        } else {
            clearInterval(scoreInterval);
        }
    }, 500);
}

function endGame() {
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <h3 style="color: var(--primary-gold); font-size: 24px; margin-bottom: 15px;">Select a game to play!</h3>
        <p style="font-size: 16px; opacity: 0.9;">Earn bonus GP and have fun</p>
    `;
    window.clickCrypto = null; // Clean up
}

// Simulate ad watching (since Monetag is disabled)
function simulateWatchAd(rewardType) {
    showNotification('Watching ad simulation...');
    
    setTimeout(() => {
        if (rewardType === 'energy') {
            gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + 50);
            showNotification('⚡ +50 Energy!');
        }
        updateUI();
        saveProgress();
    }, 2000);
}

// Daily reward check
async function checkDailyReward() {
    const today = new Date().toISOString().split('T')[0];
    
    if (gameState.lastLogin === today) {
        showNotification('Already claimed today! Come back tomorrow.');
        return false;
    }
    
    await processDailyLogin();
    return true;
}

// Share game
function shareGame() {
    const botUsername = '@Cx_odyssey_bot';
    const referralCode = user?.id || 'game';
    
    const message = `🚀 Join me in CX Odyssey - an amazing space mining adventure!

🌌 Explore alien worlds
⛏️ Mine cosmic resources  
🐉 Battle epic bosses
🏆 Compete on leaderboards

Start your cosmic journey now!`;

    const shareUrl = `https://t.me/Cx_odyssey_bot/game?startapp=ref_${referralCode}`;
    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message)}`;
    
    if (window.Telegram?.WebApp?.openTelegramLink) {
        window.Telegram.WebApp.openTelegramLink(telegramShareUrl);
    } else {
        window.open(telegramShareUrl, '_blank');
    }
    
    showNotification('Thanks for sharing CX Odyssey!');
}

// Update user interface
function updateUserInterface() {
    if (!user) return;

    let displayName = user.first_name || 'Player';
    if (user.last_name) displayName += ' ' + user.last_name;
    
    document.getElementById('tgUserName').textContent = displayName;
    if (user.photo_url) {
        document.getElementById('tgAvatar').src = user.photo_url;
    }
    
    const level = Math.floor(gameState.gp / 1000) + 1;
    document.getElementById('tgUserLevel').textContent = level;
}

// Update UI
function updateUI() {
    // Update resource displays
    const energyElements = ['energy', 'energyMining'];
    const shardsElements = ['shards', 'shardsMining', 'shardsShop'];
    const gpElements = ['gp', 'gpShop', 'gpGames'];
    
    energyElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = gameState.energy;
    });
    
    shardsElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = gameState.shards.toLocaleString();
    });
    
    gpElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = gameState.gp.toLocaleString();
    });

    // Update energy bar
    const energyPercent = (gameState.energy / gameState.maxEnergy) * 100;
    const energyFill = document.getElementById('energyFill');
    if (energyFill) {
        energyFill.style.width = energyPercent + '%';
    }
    
    const energyText = document.getElementById('energyText');
    if (energyText) {
        energyText.textContent = `${gameState.energy}/${gameState.maxEnergy}`;
    }

    // Update ad button state
    const adBtn = document.getElementById('adBtn');
    if (adBtn) {
        if (gameState.energy >= gameState.maxEnergy) {
            adBtn.disabled = true;
            adBtn.textContent = '⚡ Energy Full';
            adBtn.style.opacity = '0.5';
        } else {
            adBtn.disabled = false;
            adBtn.textContent = '📺 Watch Ad (+50 Energy)';
            adBtn.style.opacity = '1';
        }
    }

    // Update shop prices if on shop screen
    if (currentScreen === 'shopScreen') {
        updateShopPrices();
    }
}

// Notification system
function showNotification(text) {
    // Remove existing notifications
    const existing = document.querySelectorAll('.notification');
    existing.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = text;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3200);
}

// Format numbers for display
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Initialize game when page loads
window.addEventListener('load', initGame);

// Handle visibility change for energy regeneration optimization
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page is hidden, reduce energy regen frequency
        if (energyRegenInterval) {
            clearInterval(energyRegenInterval);
            energyRegenInterval = setInterval(() => {
                if (gameState.energy < gameState.maxEnergy) {
                    gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + GAME_CONFIG.ENERGY_REGEN_RATE);
                }
            }, GAME_CONFIG.ENERGY_REGEN_INTERVAL * 2); // Slower regen when hidden
        }
    } else {
        // Page is visible, resume normal energy regen
        if (energyRegenInterval) {
            clearInterval(energyRegenInterval);
            energyRegenInterval = setInterval(() => {
                if (gameState.energy < gameState.maxEnergy) {
                    gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + GAME_CONFIG.ENERGY_REGEN_RATE);
                    updateUI();
                }
            }, GAME_CONFIG.ENERGY_REGEN_INTERVAL);
        }
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (energyRegenInterval) clearInterval(energyRegenInterval);
    if (autoSaveInterval) clearInterval(autoSaveInterval);
    saveProgress();
});
