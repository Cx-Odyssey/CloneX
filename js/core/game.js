// Main Game Manager Module for CX Odyssey
class GameManager {
    constructor() {
        this.state = this.getDefaultState();
        this.user = null;
        this.isInitialized = false;
        this.autoSaveInterval = null;
        this.energyRegenInterval = null;
        this.playTimeStart = Date.now();
        this.currentScreen = 'loadingScreen';
        
        // Bind methods to preserve context
        this.initialize = this.initialize.bind(this);
        this.saveProgress = this.saveProgress.bind(this);
        this.loadProgress = this.loadProgress.bind(this);
    }

    getDefaultState() {
        return {
            energy: GAME_CONFIG.GAME.ENERGY.DEFAULT_MAX,
            maxEnergy: GAME_CONFIG.GAME.ENERGY.DEFAULT_MAX,
            shards: 0,
            gp: 0,
            currentPlanet: '',
            dailyStreak: 1,
            lastLogin: new Date().toISOString().split('T')[0],
            bossHealth: GAME_CONFIG.GAME.BOSS.DEFAULT_HEALTH,
            maxBossHealth: GAME_CONFIG.GAME.BOSS.DEFAULT_HEALTH,
            playerDamage: 0,
            adDamageBoost: 0,
            upgrades: {
                speed: 0,
                damage: 0,
                energy: 0,
                multiplier: 0
            },
            skins: [],
            achievements: [],
            planetsExplored: [],
            totalPlayTime: 0,
            gamesPlayed: 0,
            highScores: {},
            settings: {
                soundEnabled: true,
                vibrationEnabled: true,
                notifications: true
            }
        };
    }

    async initialize() {
        try {
            // Update loading status
            this.updateLoadingStatus('Initializing Telegram WebApp...');
            
            // Initialize Telegram first
            const telegramResult = await telegramManager.initialize();
            this.user = telegramResult.user;
            
            if (telegramResult.isWebMode) {
                this.updateLoadingStatus('Running in web mode...');
            } else {
                this.updateLoadingStatus(`Welcome ${this.user.first_name}!`);
                
                // Process referral if exists
                if (telegramResult.referrerId) {
                    await telegramManager.processReferral();
                }
            }
            
            // Load game progress
            this.updateLoadingStatus('Loading game data...');
            await this.loadProgress();
            
            // Process daily login
            await this.processDailyLogin();
            
            // Start game systems
            this.startSystems();
            
            // Update UI with user info
            this.updateUserInterface();
            
            this.isInitialized = true;
            
            // Show main game screen
            setTimeout(() => {
                this.showScreen('galaxyScreen');
                if (window.uiManager) {
                    const welcomeMessage = this.user ? 
                        `Welcome back, ${this.user.first_name}!` :
                        'Welcome to CX Odyssey!';
                    window.uiManager.showNotification(welcomeMessage);
                }
            }, 1500);
            
        } catch (error) {
            console.error('Game initialization failed:', error);
            this.updateLoadingStatus('Initialization failed - starting offline mode');
            
            // Fallback initialization
            setTimeout(() => {
                this.startSystems();
                this.showScreen('galaxyScreen');
                if (window.uiManager) {
                    window.uiManager.showNotification('Started in offline mode');
                }
            }, 2000);
        }
    }

    updateLoadingStatus(message) {
        const statusElement = document.getElementById('tgInitStatus');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    async loadProgress() {
        if (!this.user?.id) {
            console.log('No user ID - using default state');
            return;
        }

        try {
            const savedState = await apiManager.loadProgress(this.user.id);
            if (savedState && !savedState.isNewPlayer) {
                this.state = { ...this.state, ...savedState };
                console.log('Game state loaded from backend');
            } else {
                console.log('New player or no saved data - using defaults');
            }
        } catch (error) {
            console.error('Failed to load progress:', error);
            if (window.uiManager) {
                window.uiManager.showNotification('Failed to load save data - using defaults');
            }
        }
    }

    async saveProgress() {
        if (!this.user?.id) {
            return false;
        }

        try {
            const username = telegramManager.getUserDisplayInfo().name;
            await apiManager.saveProgress(this.user.id, username, this.state);
            console.log('Game state saved to backend');
            return true;
        } catch (error) {
            console.error('Failed to save progress:', error);
            return false;
        }
    }

    async processDailyLogin() {
        const today = new Date().toISOString().split('T')[0];
        
        if (this.state.lastLogin === today) {
            // Already logged in today
            if (window.uiManager) {
                document.getElementById('dailyReward').style.display = 'none';
            }
            return;
        }

        // Calculate streak
        const lastLogin = new Date(this.state.lastLogin);
        const currentDate = new Date(today);
        const dayDiff = Math.floor((currentDate - lastLogin) / (1000 * 60 * 60 * 24));

        if (dayDiff === 1) {
            // Consecutive day
            this.state.dailyStreak = Math.min(this.state.dailyStreak + 1, GAME_CONFIG.GAME.DAILY.MAX_STREAK);
        } else if (dayDiff > 1) {
            // Streak broken
            this.state.dailyStreak = 1;
        }

        // Calculate and award daily bonus
        const baseBonus = GAME_CONFIG.GAME.DAILY.BASE_BONUS;
        const streakBonus = this.state.dailyStreak * GAME_CONFIG.GAME.DAILY.STREAK_BONUS;
        const totalBonus = baseBonus + streakBonus;

        this.state.gp += totalBonus;
        this.state.lastLogin = today;

        // Update UI
        if (window.uiManager) {
            document.getElementById('streakDay').textContent = this.state.dailyStreak;
            document.getElementById('bonusAmount').textContent = totalBonus;
            
            // Hide after 8 seconds
            setTimeout(() => {
                document.getElementById('dailyReward').style.display = 'none';
            }, 8000);
        }

        // Track daily login
        if (apiManager) {
            await apiManager.trackEvent('daily_login', {
                userId: this.user?.id,
                streak: this.state.dailyStreak,
                bonus: totalBonus
            });
        }

        await this.saveProgress();
    }

    startSystems() {
        this.startEnergyRegeneration();
        this.startAutoSave();
        this.startPlayTimeTracking();
    }

    startEnergyRegeneration() {
        if (this.energyRegenInterval) {
            clearInterval(this.energyRegenInterval);
        }
        
        this.energyRegenInterval = setInterval(() => {
            if (this.state.energy < this.state.maxEnergy) {
                this.state.energy = Math.min(
                    this.state.maxEnergy,
                    this.state.energy + GAME_CONFIG.GAME.ENERGY.REGEN_RATE
                );
                this.updateUI();
            }
        }, GAME_CONFIG.GAME.ENERGY.REGEN_INTERVAL);
    }

    startAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        this.autoSaveInterval = setInterval(() => {
            this.saveProgress();
        }, GAME_CONFIG.UI.AUTO_SAVE_INTERVAL);
    }

    startPlayTimeTracking() {
        setInterval(() => {
            this.state.totalPlayTime += 1;
        }, 1000);

        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveProgress();
        });
    }

    // Screen management
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        setTimeout(() => {
            document.getElementById(screenId).classList.add('active');
            this.currentScreen = screenId;
        }, 100);

        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        
        const navMap = {
            'galaxyScreen': 0,
            'leaderboardScreen': 1,
            'shopScreen': 2,
            'minigamesScreen': 3
        };
        
        if (navMap[screenId] !== undefined) {
            document.querySelectorAll('.nav-btn')[navMap[screenId]].classList.add('active');
        }

        // Handle Telegram back button
        if (screenId === 'galaxyScreen') {
            telegramManager.hideBackButton();
        } else {
            telegramManager.showBackButton();
        }

        // Load screen-specific data
        if (screenId === 'leaderboardScreen') {
            this.loadLeaderboard();
        }

        this.updateUI();
    }

    // Resource management
    consumeEnergy(amount) {
        if (this.state.energy < amount) {
            if (window.uiManager) {
                window.uiManager.showNotification(GAME_CONFIG.ERRORS.INSUFFICIENT_ENERGY);
            }
            telegramManager.notificationOccurred('error');
            return false;
        }
        
        this.state.energy -= amount;
        this.updateUI();
        return true;
    }

    addEnergy(amount) {
        this.state.energy = Math.min(this.state.maxEnergy, this.state.energy + amount);
        this.updateUI();
    }

    addGP(amount) {
        this.state.gp += amount;
        this.updateUI();
    }

    addShards(amount) {
        this.state.shards += amount;
        this.updateUI();
    }

    canAfford(cost) {
        return this.state.gp >= cost;
    }

    spendGP(amount) {
        if (!this.canAfford(amount)) return false;
        this.state.gp -= amount;
        this.updateUI();
        return true;
    }

    // Planet mining
    async selectPlanet(planetName, planetId) {
        this.state.currentPlanet = planetName;
        
        // Track planet exploration
        if (!this.state.planetsExplored.includes(planetName)) {
            this.state.planetsExplored.push(planetName);
            await this.checkAchievements({ planetExplored: planetName });
        }
        
        // Update UI
        document.getElementById('currentPlanet').textContent = planetName;
        const reward = ConfigUtils.calculateMiningReward(planetName, this.state.upgrades.speed);
        document.getElementById('mineReward').textContent = reward;
        
        this.showScreen('miningScreen');
        
        if (window.uiManager) {
            window.uiManager.showNotification(`Landed on ${planetName}!`);
        }
        telegramManager.impactOccurred('medium');
    }

    async minePlanet() {
        if (!this.consumeEnergy(GAME_CONFIG.GAME.ENERGY.MINING_COST)) {
            return;
        }

        const planetName = this.state.currentPlanet;
        const reward = ConfigUtils.calculateMiningReward(planetName, this.state.upgrades.speed);
        const gpReward = Math.floor(reward * 0.5 * (1 + this.state.upgrades.multiplier));

        this.addShards(reward);
        this.addGP(gpReward);

        // Visual effects
        this.showMiningEffect();
        
        if (window.uiManager) {
            window.uiManager.showNotification(`+${reward} Shards, +${gpReward} GP!`);
        }
        telegramManager.impactOccurred('light');

        await this.checkAchievements({ miningCompleted: true });
        await this.saveProgress();
    }

    showMiningEffect() {
        const miningArea = document.querySelector('.mining-area');
        if (!miningArea) return;

        const beam = document.createElement('div');
        beam.className = 'mining-beam';
        miningArea.appendChild(beam);

        setTimeout(() => {
            beam.remove();
        }, 1200);
    }

    // Battle system
    async battleAliens() {
        if (!this.consumeEnergy(GAME_CONFIG.GAME.ENERGY.BATTLE_COST)) {
            return;
        }

        const reward = ConfigUtils.calculateBattleReward(
            this.state.upgrades.damage, 
            this.state.upgrades.multiplier
        );
        
        this.addGP(reward);
        
        if (window.uiManager) {
            window.uiManager.showNotification(`Defeated aliens! +${reward} GP!`);
        }
        telegramManager.impactOccurred('heavy');

        await this.saveProgress();
    }

    // Boss raid system
    async attackBoss() {
        const damage = ConfigUtils.calculateBossDamage(this.state.upgrades.damage);
        const actualDamage = this.state.adDamageBoost > 0 ? damage * GAME_CONFIG.GAME.BOSS.AD_DAMAGE_MULTIPLIER : damage;
        
        this.state.bossHealth = Math.max(0, this.state.bossHealth - actualDamage);
        this.state.playerDamage += actualDamage;
        
        if (this.state.adDamageBoost > 0) {
            this.state.adDamageBoost--;
        }

        if (this.state.bossHealth <= 0) {
            // Boss defeated
            const reward = GAME_CONFIG.GAME.BOSS.DEFEAT_REWARD;
            this.addGP(reward);
            this.state.bossHealth = this.state.maxBossHealth;
            this.state.playerDamage = 0;
            
            telegramManager.notificationOccurred('success');
            if (window.uiManager) {
                window.uiManager.showNotification(`Boss defeated! +${reward} GP!`);
            }

            await this.checkAchievements({ bossDefeated: true });
        } else {
            telegramManager.impactOccurred('medium');
            if (window.uiManager) {
                window.uiManager.showNotification(`Hit for ${actualDamage} damage!`);
            }
        }

        this.updateUI();
        await this.saveProgress();
    }

    setAdDamageBoost(attacks) {
        this.state.adDamageBoost = attacks;
    }

    // Upgrade system
    async purchaseUpgrade(upgradeType) {
        const cost = ConfigUtils.getUpgradeCost(upgradeType, this.state.upgrades[upgradeType]);
        
        if (!this.canAfford(cost)) {
            if (window.uiManager) {
                window.uiManager.showNotification(GAME_CONFIG.ERRORS.INSUFFICIENT_GP);
            }
            telegramManager.notificationOccurred('error');
            return false;
        }

        this.spendGP(cost);
        this.state.upgrades[upgradeType]++;

        // Apply upgrade effects
        if (upgradeType === 'energy') {
            this.state.maxEnergy += GAME_CONFIG.GAME.UPGRADES.energy.bonus;
            this.state.energy = this.state.maxEnergy; // Refill energy
        }

        telegramManager.notificationOccurred('success');
        if (window.uiManager) {
            const messages = {
                speed: 'Mining speed increased!',
                damage: 'Combat damage boosted!',
                energy: 'Maximum energy increased!',
                multiplier: 'GP multiplier activated!'
            };
            window.uiManager.showUpgradeModal('⚡', messages[upgradeType]);
        }

        await this.checkAchievements({ upgradeCompleted: upgradeType });
        await this.saveProgress();
        return true;
    }

    // Leaderboard
    async loadLeaderboard() {
        try {
            const leaderboardData = await apiManager.getLeaderboard(this.user?.id);
            this.displayLeaderboard(leaderboardData);
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
        }
    }

    displayLeaderboard(data) {
        const container = document.getElementById('leaderboardEntries');
        if (!container) return;

        container.innerHTML = '';
        
        data.topPlayers.forEach((player, index) => {
            const entryEl = document.createElement('div');
            entryEl.className = `leaderboard-entry ${index < 3 ? 'top-3' : ''}`;
            
            let rankIcon = '';
            if (index === 0) rankIcon = '<span style="color: #ffd700; font-size: 24px;">👑</span> ';
            else if (index === 1) rankIcon = '<span style="color: #ff6b35; font-size: 20px;">🥈</span> ';
            else if (index === 2) rankIcon = '<span style="color: #7209b7; font-size: 20px;">🥉</span> ';
            else rankIcon = `<span style="color: #888;">${index + 1}.</span> `;
            
            entryEl.innerHTML = `
                <div style="font-weight: 600;">${rankIcon}${player.username}</div>
                <div style="font-weight: 700; color: var(--primary-gold);">${ConfigUtils.formatNumber(player.gp)} GP</div>
            `;
            
            container.appendChild(entryEl);
        });

        // Update user rank display
        const rankElements = ['leaderboardRank', 'playerRank'];
        rankElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = data.userRank || '999+';
        });
    }

    // Achievement system
    async checkAchievements(context = {}) {
        for (const achievement of GAME_CONFIG.ACHIEVEMENTS) {
            if (!this.state.achievements.includes(achievement.id) && achievement.condition(this.state, context)) {
                await this.unlockAchievement(achievement);
            }
        }
    }

    async unlockAchievement(achievement) {
        this.state.achievements.push(achievement.id);
        
        if (achievement.reward.gp) {
            this.addGP(achievement.reward.gp);
        }

        if (window.uiManager) {
            window.uiManager.showAchievement(achievement);
        }

        telegramManager.notificationOccurred('success');
        
        if (apiManager) {
            await apiManager.trackEvent('achievement_unlocked', {
                userId: this.user?.id,
                achievementId: achievement.id,
                reward: achievement.reward
            });
        }

        await this.saveProgress();
    }

    // Daily reward check
    async checkDailyReward() {
        const today = new Date().toISOString().split('T')[0];
        
        if (this.state.lastLogin === today) {
            if (window.uiManager) {
                window.uiManager.showNotification(GAME_CONFIG.ERRORS.DAILY_CLAIMED);
            }
            return false;
        }
        
        await this.processDailyLogin();
        return true;
    }

    updateUserInterface() {
        if (!this.user) return;

        const userInfo = telegramManager.getUserDisplayInfo();
        
        // Update user info display
        document.getElementById('tgUserName').textContent = userInfo.name;
        if (userInfo.photoUrl) {
            document.getElementById('tgAvatar').src = userInfo.photoUrl;
        }
        
        const level = Math.floor(this.state.gp / 1000) + 1;
        document.getElementById('tgUserLevel').textContent = level;
    }

    updateUI() {
        // Update resource displays
        const resources = ['energy', 'energyMining', 'shards', 'shardsMining', 'shardsShop', 'gp', 'gpBoss', 'gpLeaderboard', 'gpShop', 'gpMinigames'];
        
        resources.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (id.includes('energy')) {
                    element.textContent = this.state.energy;
                } else if (id.includes('shards')) {
                    element.textContent = ConfigUtils.formatNumber(this.state.shards);
                } else if (id.includes('gp')) {
                    element.textContent = ConfigUtils.formatNumber(this.state.gp);
                }
            }
        });

        // Update energy bar
        const energyPercent = (this.state.energy / this.state.maxEnergy) * 100;
        const energyFill = document.getElementById('energyFill');
        if (energyFill) {
            energyFill.style.width = energyPercent + '%';
        }
        
        const energyText = document.getElementById('energyText');
        if (energyText) {
            energyText.textContent = `${this.state.energy}/${this.state.maxEnergy}`;
        }

        // Update boss health
        const bossPercent = (this.state.bossHealth / this.state.maxBossHealth) * 100;
        const bossHealthFill = document.getElementById('bossHealthFill');
        if (bossHealthFill) {
            bossHealthFill.style.width = bossPercent + '%';
        }
        
        const bossHealthText = document.getElementById('bossHealthText');
        if (bossHealthText) {
            bossHealthText.textContent = `${this.state.bossHealth}/${this.state.maxBossHealth}`;
        }
        
        const playerDamageEl = document.getElementById('playerDamage');
        if (playerDamageEl) {
            playerDamageEl.textContent = ConfigUtils.formatNumber(this.state.playerDamage);
        }

        // Update ad button state
        const adBtn = document.getElementById('adBtn');
        if (adBtn) {
            if (this.state.energy >= this.state.maxEnergy) {
                adBtn.disabled = true;
                adBtn.textContent = '⚡ Energy Full';
                adBtn.style.opacity = '0.5';
            } else {
                adBtn.disabled = false;
                adBtn.textContent = '📺 Watch Ad (+50 Energy)';
                adBtn.style.opacity = '1';
            }
        }
    }

    // Cleanup
    destroy() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        if (this.energyRegenInterval) {
            clearInterval(this.energyRegenInterval);
        }
        
        this.saveProgress();
    }
}

// Create global game manager instance
const gameManager = new GameManager();
window.gameManager = gameManager;
