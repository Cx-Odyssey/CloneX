// Main Game Logic
class CXOdyssey {
    constructor() {
        this.gameState = {
            energy: 100,
            maxEnergy: 100,
            shards: 0,
            gp: 0,
            currentPlanet: '',
            dailyStreak: 1,
            lastLogin: '',
            bossHealth: 1000,
            maxBossHealth: 1000,
            playerDamage: 0,
            upgrades: {
                speed: 0,
                damage: 0,
                energy: 0,
                multiplier: 0
            },
            skins: [],
            achievements: [],
            adDamageBoost: 0
        };
        
        this.isInitialized = false;
        this.energyRegenInterval = null;
        this.autoSaveInterval = null;
    }

    // Initialize the game
    async init() {
        console.log('Initializing CX Odyssey...');
        
        try {
            // Initialize visual effects
            this.generateEnhancedStarfield();
            this.generateFloatingParticles();
            
            // Initialize Telegram WebApp
            const tgInitialized = await window.telegramApp.initialize();
            
            if (tgInitialized) {
                const user = window.telegramApp.getUser();
                document.getElementById('tgInitStatus').textContent = `Welcome, ${user.first_name}!`;
                
                // Update user info in UI
                this.updateUserInfo(user);
                
                // Load game state
                await this.loadGameState(user.id);
                
                // Handle daily login
                await this.handleDailyLogin(user.id);
                
                setTimeout(() => {
                    this.showScreen('galaxyScreen');
                    this.showNotification(`🚀 Welcome back, ${user.first_name}!`);
                }, 1500);
                
            } else {
                // Fallback for non-Telegram environment
                document.getElementById('tgInitStatus').textContent = "Playing in demo mode";
                setTimeout(() => {
                    this.showScreen('galaxyScreen');
                    this.showNotification('🚀 Welcome to CX Odyssey!');
                }, 2000);
            }
            
            // Initialize systems
            this.initializeGameSystems();
            this.updateUI();
            this.isInitialized = true;
            
            console.log('Game initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize game:', error);
            window.ErrorHandler.showError('Failed to initialize game', error);
            
            // Fallback initialization
            setTimeout(() => {
                this.showScreen('galaxyScreen');
                this.updateUI();
            }, 2000);
        }
    }

    // Initialize game systems
    initializeGameSystems() {
        // Initialize mini-games
        if (window.miniGames) {
            window.miniGames.init();
        }
        
        // Start energy regeneration
        this.startEnergyRegen();
        
        // Start auto-save
        this.startAutoSave();
        
        // Initialize data sync
        if (window.dataSync) {
            window.dataSync.startAutoSync();
        }
    }

    // Load game state from backend
    async loadGameState(telegramId) {
        try {
            window.performanceMonitor.start('loadGameState');
            
            const savedState = await window.gameAPI.loadProgress(telegramId);
            
            if (savedState) {
                this.gameState = { ...this.gameState, ...savedState };
                console.log('Loaded game state:', this.gameState);
            } else {
                // Create new player
                const user = window.telegramApp.getUser();
                await window.gameAPI.createOrUpdatePlayer(user);
                console.log('Created new player');
            }
            
            window.performanceMonitor.end('loadGameState');
            
        } catch (error) {
            console.error('Failed to load game state:', error);
            window.ErrorHandler.showError('Load failed', error);
        }
    }

    // Save game state to backend
    async saveGameState() {
        try {
            const user = window.telegramApp.getUser();
            if (!user) return;
            
            window.performanceMonitor.start('saveGameState');
            
            const playerData = {
                telegram_id: user.id,
                username: user.username || 'Anonymous',
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                ...this.gameState
            };
            
            const success = await window.gameAPI.saveProgress(playerData);
            
            if (!success) {
                // Queue for later sync if online save fails
                window.dataSync.queueUpdate(playerData);
            }
            
            window.performanceMonitor.end('saveGameState');
            
        } catch (error) {
            console.error('Failed to save game state:', error);
            window.ErrorHandler.showError('Save failed', error);
        }
    }

    // Handle daily login
    async handleDailyLogin(telegramId) {
        try {
            const result = await window.gameAPI.handleDailyLogin(telegramId);
            
            if (result && result.isNew) {
                this.gameState.gp += result.bonus;
                this.gameState.dailyStreak = result.streak;
                this.gameState.lastLogin = new Date().toISOString().split('T')[0];
                
                // Show daily reward UI
                document.getElementById('streakDay').textContent = result.streak;
                document.getElementById('bonusAmount').textContent = result.bonus;
                
                setTimeout(() => {
                    document.getElementById('dailyReward').style.display = 'none';
                }, 8000);
            } else if (result) {
                document.getElementById('dailyReward').style.display = 'none';
            }
        } catch (error) {
            console.error('Failed to handle daily login:', error);
        }
    }

    // Update user info in UI
    updateUserInfo(user) {
        if (user.photo_url) {
            document.getElementById('tgAvatar').src = user.photo_url;
        }
        
        let userName = user.first_name;
        if (user.last_name) userName += ` ${user.last_name}`;
        if (user.username) userName += ` (@${user.username})`;
        
        document.getElementById('tgUserName').textContent = userName;
    }

    // Generate enhanced starfield
    generateEnhancedStarfield() {
        const starfield = document.getElementById('starfield');
        if (!starfield) return;
        
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

    // Generate floating particles
    generateFloatingParticles() {
        setInterval(() => {
            if (Math.random() < 0.3) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDuration = (6 + Math.random() * 4) + 's';
                document.querySelector('.game-container').appendChild(particle);
                
                setTimeout(() => {
                    particle.remove();
                }, 10000);
            }
        }, 1000);
    }

    // Screen management
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        setTimeout(() => {
            document.getElementById(screenId).classList.add('active');
        }, 100);

        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const navMap = {
            'galaxyScreen': 0,
            'leaderboardScreen': 1,
            'shopScreen': 2,
            'minigamesScreen': 3,
            'walletScreen': 4
        };
        
        if (navMap[screenId] !== undefined) {
            document.querySelectorAll('.nav-btn')[navMap[screenId]].classList.add('active');
        }

        // Load data for specific screens
        if (screenId === 'leaderboardScreen') {
            this.loadLeaderboard();
        } else if (screenId === 'walletScreen' && window.tonWallet) {
            window.tonWallet.updateBalance();
        }

        this.updateUI();
    }

    // Planet selection
    selectPlanet(planetName, planetId) {
        this.gameState.currentPlanet = planetName;
        document.getElementById('currentPlanet').textContent = planetName;
        document.getElementById('mineReward').textContent = planetId * 5 + 5;
        this.showScreen('miningScreen');
        this.showNotification(`🌍 Landed on ${planetName}!`);
        
        if (window.telegramApp) {
            window.telegramApp.hapticFeedback('medium');
        }
    }

    // Mining mechanics
    async minePlanet() {
        if (this.gameState.energy <= 0) {
            this.showNotification('⚡ No energy! Watch an ad or wait for regeneration.');
            if (window.telegramApp) {
                window.telegramApp.hapticFeedback('error');
            }
            return;
        }

        const planetName = this.gameState.currentPlanet;
        const planetMultiplier = this.getPlanetMultiplier(planetName);
        const speedBonus = 1 + (this.gameState.upgrades.speed * 0.25);
        const reward = Math.floor((10 + Math.random() * 10) * planetMultiplier * speedBonus);

        this.gameState.energy -= 5;
        this.gameState.shards += reward;
        this.gameState.gp += Math.floor(reward * 0.5 * (1 + this.gameState.upgrades.multiplier));

        // Visual effects
        this.createMiningEffect();

        if (window.telegramApp) {
            window.telegramApp.hapticFeedback('light');
        }

        this.showNotification(`💎 +${reward} Shards, +${Math.floor(reward * 0.5 * (1 + this.gameState.upgrades.multiplier))} GP!`);
        this.updateUI();
        await this.saveGameState();
    }

    // Create mining visual effect
    createMiningEffect() {
        const miningArea = document.querySelector('.mining-area');
        if (!miningArea) return;
        
        const beam = document.createElement('div');
        beam.className = 'mining-beam';
        miningArea.appendChild(beam);

        // Screen shake effect
        miningArea.style.animation = 'miningShake 0.5s ease-out';

        setTimeout(() => {
            beam.remove();
            miningArea.style.animation = '';
        }, 1200);
    }

    // Get planet multiplier
    getPlanetMultiplier(planetName) {
        const multipliers = {
            'Pyrion': 1.2,
            'Aqueos': 1.0,
            'Voidex': 1.8,
            'Verdant': 1.1,
            'Aurelia': 2.0,
            'Crimson': 1.5
        };
        return multipliers[planetName] || 1.0;
    }

    // Battle aliens
    async battleAliens() {
        if (this.gameState.energy < 10) {
            this.showNotification('⚡ Need at least 10 energy to battle!');
            return;
        }

        this.gameState.energy -= 10;
        const baseDamage = 50 + (this.gameState.upgrades.damage * 25);
        const damage = baseDamage + Math.floor(Math.random() * baseDamage * 0.5);
        const reward = Math.floor((100 + Math.random() * 200) * (1 + this.gameState.upgrades.multiplier));
        
        this.gameState.gp += reward;
        
        if (window.telegramApp) {
            window.telegramApp.hapticFeedback('heavy');
        }
        
        this.showNotification(`⚔️ Defeated aliens! +${reward} GP!`);
        this.updateUI();
        await this.saveGameState();
    }

    // Attack boss
    async attackBoss() {
        const baseDamage = 10 + (this.gameState.upgrades.damage * 5);
        const damage = baseDamage + Math.floor(Math.random() * 20);
        const actualDamage = this.gameState.adDamageBoost > 0 ? damage * 2 : damage;
        
        this.gameState.bossHealth = Math.max(0, this.gameState.bossHealth - actualDamage);
        this.gameState.playerDamage += actualDamage;
        
    // Attack boss
    async attackBoss() {
        const baseDamage = 10 + (this.gameState.upgrades.damage * 5);
        const damage = baseDamage + Math.floor(Math.random() * 20);
        const actualDamage = this.gameState.adDamageBoost > 0 ? damage * 2 : damage;
        
        this.gameState.bossHealth = Math.max(0, this.gameState.bossHealth - actualDamage);
        this.gameState.playerDamage += actualDamage;
        
        if (this.gameState.adDamageBoost > 0) {
            this.gameState.adDamageBoost--;
        }

        // Boss hit effect
        const bossImage = document.querySelector('.boss-image');
        if (bossImage) {
            bossImage.style.animation = 'none';
            setTimeout(() => {
                bossImage.style.animation = 'bossHit 0.2s ease, bossPulse 2s infinite alternate 0.2s';
            }, 10);
        }

        if (this.gameState.bossHealth <= 0) {
            const reward = 5000;
            this.gameState.gp += reward;
            this.gameState.bossHealth = this.gameState.maxBossHealth;
            this.gameState.playerDamage = 0;
            
            if (window.telegramApp) {
                window.telegramApp.hapticFeedback('success');
            }
            
            this.showNotification(`🐉 Boss defeated! +${reward} GP!`);
        } else {
            if (window.telegramApp) {
                window.telegramApp.hapticFeedback('medium');
            }
            
            this.showNotification(`⚔️ Hit for ${actualDamage} damage!`);
        }

        this.updateUI();
        await this.saveGameState();
    }

    // Watch ad for energy
    watchAdForEnergy() {
        this.showModal('adModal');
        this.startAdTimer(async () => {
            this.gameState.energy = Math.min(this.gameState.maxEnergy, this.gameState.energy + 50);
            this.closeModal('adModal');
            this.showRewardModal('⚡ +50 Energy!', '⚡');
            this.updateUI();
            await this.saveGameState();
        });
    }

    // Watch ad for damage boost
    watchAdForDamage() {
        this.showModal('adModal');
        this.startAdTimer(async () => {
            this.gameState.adDamageBoost = 3;
            this.closeModal('adModal');
            this.showRewardModal('⚔️ 2x Damage for next 3 attacks!', '⚔️');
            await this.saveGameState();
        });
    }

    // Start ad timer
    startAdTimer(callback) {
        let timeLeft = 5;
        const progressBar = document.getElementById('adProgress');
        const timeDisplay = document.getElementById('adTime');
        const skipBtn = document.getElementById('skipBtn');

        if (progressBar) progressBar.style.width = '0%';
        if (timeDisplay) timeDisplay.textContent = '0';
        if (skipBtn) skipBtn.style.display = 'none';

        const timer = setInterval(() => {
            timeLeft--;
            const progress = ((5 - timeLeft) / 5) * 100;
            if (progressBar) progressBar.style.width = progress + '%';
            if (timeDisplay) timeDisplay.textContent = 5 - timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timer);
                if (skipBtn) {
                    skipBtn.style.display = 'block';
                    skipBtn.onclick = callback;
                }
            }
        }, 1000);
    }

    // Buy upgrade
    async buyUpgrade(upgradeType) {
        const costs = {
            speed: 500 * (this.gameState.upgrades.speed + 1),
            damage: 750 * (this.gameState.upgrades.damage + 1),
            energy: 1000 * (this.gameState.upgrades.energy + 1),
            multiplier: 3000 * (this.gameState.upgrades.multiplier + 1)
        };

        const cost = costs[upgradeType];
        if (this.gameState.gp < cost) {
            this.showNotification('🏆 Not enough GP!');
            if (window.telegramApp) {
                window.telegramApp.hapticFeedback('error');
            }
            return;
        }

        this.gameState.gp -= cost;
        this.gameState.upgrades[upgradeType]++;
        
        if (upgradeType === 'energy') {
            this.gameState.maxEnergy += 50;
            this.gameState.energy = this.gameState.maxEnergy;
        }

        const messages = {
            speed: 'Mining speed increased!',
            damage: 'Combat damage boosted!',
            energy: 'Maximum energy increased!',
            multiplier: 'GP multiplier activated!'
        };

        this.showUpgradeModal('⚡', messages[upgradeType]);

        if (window.telegramApp) {
            window.telegramApp.hapticFeedback('success');
        }

        this.updateUI();
        this.updateShopPrices();
        await this.saveGameState();
    }

    // Update shop prices based on current upgrade levels
    updateShopPrices() {
        const costs = {
            speed: 500 * (this.gameState.upgrades.speed + 1),
            damage: 750 * (this.gameState.upgrades.damage + 1),
            energy: 1000 * (this.gameState.upgrades.energy + 1),
            multiplier: 3000 * (this.gameState.upgrades.multiplier + 1)
        };

        Object.entries(costs).forEach(([type, cost]) => {
            const element = document.getElementById(type + 'Cost');
            if (element) {
                element.textContent = cost.toLocaleString();
            }
        });
    }

    // Load leaderboard
    async loadLeaderboard() {
        try {
            const leaderboard = await window.gameAPI.getLeaderboard(10);
            const entriesContainer = document.getElementById('leaderboardEntries');
            
            if (!entriesContainer) return;
            
            entriesContainer.innerHTML = '';
            
            leaderboard.forEach((entry, index) => {
                const entryEl = document.createElement('div');
                entryEl.className = `leaderboard-entry ${index < 3 ? 'top-3' : ''}`;
                
                let rankIcon = '';
                if (index === 0) rankIcon = '<span style="color: #ffd700; font-size: 24px;">👑</span> ';
                else if (index === 1) rankIcon = '<span style="color: #ff6b35; font-size: 20px;">🥈</span> ';
                else if (index === 2) rankIcon = '<span style="color: #7209b7; font-size: 20px;">🥉</span> ';
                else rankIcon = `<span style="color: #888;">${index + 1}.</span> `;
                
                entryEl.innerHTML = `
                    <div style="font-weight: 600;">${rankIcon}${entry.username}</div>
                    <div style="font-weight: 700; color: var(--primary-gold);">${entry.gp.toLocaleString()} GP</div>
                `;
                
                entriesContainer.appendChild(entryEl);
            });

            // Update player rank
            const user = window.telegramApp.getUser();
            if (user) {
                const rank = await window.gameAPI.getPlayerRank(user.id);
                const rankElements = document.querySelectorAll('#playerRank, #leaderboardRank');
                rankElements.forEach(el => {
                    if (el) el.textContent = rank;
                });
            }
            
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
            // Show fallback leaderboard
            this.showFallbackLeaderboard();
        }
    }

    // Show fallback leaderboard
    showFallbackLeaderboard() {
        const entriesContainer = document.getElementById('leaderboardEntries');
        if (!entriesContainer) return;
        
        entriesContainer.innerHTML = `
            <div class="leaderboard-entry top-3">
                <div style="font-weight: 600;"><span style="color: #ffd700; font-size: 24px;">👑</span> GalaxyMaster</div>
                <div style="font-weight: 700; color: var(--primary-gold);">125,000 GP</div>
            </div>
            <div class="leaderboard-entry top-3">
                <div style="font-weight: 600;"><span style="color: #ff6b35; font-size: 20px;">🥈</span> StarHunter</div>
                <div style="font-weight: 700; color: var(--primary-gold);">89,500 GP</div>
            </div>
            <div class="leaderboard-entry top-3">
                <div style="font-weight: 600;"><span style="color: #7209b7; font-size: 20px;">🥉</span> CosmicRider</div>
                <div style="font-weight: 700; color: var(--primary-gold);">67,200 GP</div>
            </div>
        `;
    }

    // Check daily reward
    checkDailyReward() {
        const dailyRewardEl = document.getElementById('dailyReward');
        if (dailyRewardEl && dailyRewardEl.style.display === 'none') {
            this.showNotification('🎁 Already claimed today! Come back tomorrow.');
        }
    }

    // Share game
    shareGame() {
        if (window.telegramApp) {
            window.telegramApp.shareGame();
        } else {
            // Fallback sharing
            const shareText = `🚀 Join me in CX Odyssey - an amazing space mining adventure!

🌌 Explore alien worlds
⛏️ Mine cosmic resources  
🐉 Battle epic bosses
🏆 Compete on leaderboards
💰 Earn real TON rewards

Start your cosmic journey now!`;

            if (navigator.share) {
                navigator.share({
                    title: 'CX Odyssey',
                    text: shareText,
                    url: window.location.href
                });
            } else {
                // Copy to clipboard fallback
                navigator.clipboard.writeText(shareText + '\n' + window.location.href);
                this.showNotification('🎉 Game link copied to clipboard!');
            }
        }
    }

    // Start energy regeneration
    startEnergyRegen() {
        if (this.energyRegenInterval) {
            clearInterval(this.energyRegenInterval);
        }
        
        this.energyRegenInterval = setInterval(() => {
            if (this.gameState.energy < this.gameState.maxEnergy) {
                this.gameState.energy = Math.min(this.gameState.maxEnergy, this.gameState.energy + 1);
                this.updateUI();
            }
        }, 6000); // Regenerate 1 energy every 6 seconds
    }

    // Start auto-save
    startAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        this.autoSaveInterval = setInterval(() => {
            if (window.telegramApp.getUser()) {
                this.saveGameState();
            }
        }, 30000); // Auto-save every 30 seconds
    }

    // Update UI
    updateUI() {
        // Update resource displays
        document.querySelectorAll('#energy, #energyMining').forEach(el => {
            if (el) el.textContent = this.gameState.energy;
        });
        
        document.querySelectorAll('#shards, #shardsMining, #shardsShop').forEach(el => {
            if (el) el.textContent = this.gameState.shards.toLocaleString();
        });
        
        document.querySelectorAll('#gp, #gpBoss, #gpLeaderboard, #gpShop, #gpMinigames, #gpWallet').forEach(el => {
            if (el) el.textContent = this.gameState.gp.toLocaleString();
        });

        // Update energy bar
        const energyPercent = (this.gameState.energy / this.gameState.maxEnergy) * 100;
        const energyFill = document.getElementById('energyFill');
        if (energyFill) {
            energyFill.style.width = energyPercent + '%';
        }
        
        const energyText = document.getElementById('energyText');
        if (energyText) {
            energyText.textContent = `${this.gameState.energy}/${this.gameState.maxEnergy}`;
        }

        // Update boss health
        const bossPercent = (this.gameState.bossHealth / this.gameState.maxBossHealth) * 100;
        const bossHealthFill = document.getElementById('bossHealthFill');
        if (bossHealthFill) {
            bossHealthFill.style.width = bossPercent + '%';
        }
        
        const bossHealthText = document.getElementById('bossHealthText');
        if (bossHealthText) {
            bossHealthText.textContent = `${this.gameState.bossHealth}/${this.gameState.maxBossHealth}`;
        }
        
        const playerDamageEl = document.getElementById('playerDamage');
        if (playerDamageEl) {
            playerDamageEl.textContent = this.gameState.playerDamage.toLocaleString();
        }

        // Update leaderboard GP
        const leaderboardGP = document.getElementById('leaderboardGP');
        if (leaderboardGP) {
            leaderboardGP.textContent = this.gameState.gp.toLocaleString();
        }

        // Update ad button state
        const adBtn = document.getElementById('adBtn');
        if (adBtn) {
            if (this.gameState.energy >= this.gameState.maxEnergy) {
                adBtn.disabled = true;
                adBtn.textContent = '⚡ Energy Full';
                adBtn.style.opacity = '0.5';
            } else {
                adBtn.disabled = false;
                adBtn.textContent = '📺 Watch Ad (+50 Energy)';
                adBtn.style.opacity = '1';
            }
        }

        // Update user level
        const userLevel = Math.floor(this.gameState.gp / 1000) + 1;
        const userLevelEl = document.getElementById('tgUserLevel');
        if (userLevelEl) {
            userLevelEl.textContent = userLevel;
        }

        // Update shop prices
        this.updateShopPrices();
    }

    // Modal system
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    showRewardModal(text, icon) {
        const rewardText = document.getElementById('rewardText');
        const rewardIcon = document.getElementById('rewardIcon');
        
        if (rewardText) rewardText.textContent = text;
        if (rewardIcon) rewardIcon.textContent = icon;
        
        this.showModal('rewardModal');
    }

    showUpgradeModal(icon, text) {
        const upgradeIcon = document.getElementById('upgradeIcon');
        const upgradeText = document.getElementById('upgradeText');
        
        if (upgradeIcon) upgradeIcon.textContent = icon;
        if (upgradeText) upgradeText.textContent = text;
        
        this.showModal('upgradeModal');
    }

    // Notification system
    showNotification(text) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = text;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3200);
    }
}

// Initialize the game
const game = new CXOdyssey();

// Global functions for HTML onclick handlers
function showScreen(screenId) {
    game.showScreen(screenId);
}

function selectPlanet(planetName, planetId) {
    game.selectPlanet(planetName, planetId);
}

function minePlanet() {
    game.minePlanet();
}

function battleAliens() {
    game.battleAliens();
}

function attackBoss() {
    game.attackBoss();
}

function watchAdForEnergy() {
    game.watchAdForEnergy();
}

function watchAdForDamage() {
    game.watchAdForDamage();
}

function skipAd() {
    const skipBtn = document.getElementById('skipBtn');
    if (skipBtn && skipBtn.onclick) {
        skipBtn.onclick();
    }
}

function buyUpgrade(upgradeType) {
    game.buyUpgrade(upgradeType);
}

function checkDailyReward() {
    game.checkDailyReward();
}

function shareGame() {
    game.shareGame();
}

function closeModal(modalId) {
    game.closeModal(modalId);
}

function confirmAction() {
    // This will be set dynamically by specific confirm dialogs
    const confirmBtn = document.getElementById('confirmBtn');
    if (confirmBtn && confirmBtn.onclick) {
        confirmBtn.onclick();
    }
}

// Export game state for global access
window.gameState = game.gameState;
window.updateUI = () => game.updateUI();
window.showNotification = (text) => game.showNotification(text);
window.showModal = (modalId) => game.showModal(modalId);
window.closeModal = (modalId) => game.closeModal(modalId);

// Initialize the game when the page loads
window.addEventListener('load', () => {
    game.init();
});

// Handle Telegram WebApp events
if (typeof Telegram !== 'undefined') {
    Telegram.WebApp.onEvent('mainButtonClicked', () => {
        shareGame();
    });
    
    Telegram.WebApp.onEvent('backButtonClicked', () => {
        showScreen('galaxyScreen');
    });
}
