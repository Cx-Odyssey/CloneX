// gameState.js - Complete with Achievement Tracking and Shop Boosts

class GameState {
    constructor() {
        this.data = {
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
            lastDailyReset: '',
            walletConnected: false,
            walletAddress: '',
            
            // Achievement tracking
            planetsVisited: [],
            planetMineCount: {},
            totalMines: 0,
            bossesDefeated: 0,
            totalShardsCollected: 0,
            totalGPEarned: 0,
            unlockedAchievements: [],
            dailyStreak: 1,
            dailyTasksCompleted: 0,
            
            // NEW: Shop active boosts
            activeBoosts: { shardBooster: 0, gpBooster: 0, autoMiner: 0, luckyCharm: 0 },
            itemsPurchased: {}
        };
        
        this.listeners = [];
        this.autoSaveInterval = null;
    }

    get() {
        return { ...this.data };
    }

    update(newData) {
        const oldData = { ...this.data };
        this.data = { ...this.data, ...newData };
        this.notifyListeners(oldData, this.data);
        this.scheduleSave();
    }

    set(newData) {
        const oldData = { ...this.data };
        this.data = { ...this.data, ...newData };
        this.notifyListeners(oldData, this.data);
    }

    getValue(key) {
        return this.data[key];
    }

    setValue(key, value) {
        this.update({ [key]: value });
    }

    addValue(key, amount) {
        const currentValue = this.getValue(key) || 0;
        this.setValue(key, Math.max(0, currentValue + amount));
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    notifyListeners(oldState, newState) {
        this.listeners.forEach(listener => {
            try {
                listener(newState, oldState);
            } catch (error) {
                console.error('State listener error:', error);
            }
        });
    }

    updateEnergyFromTime() {
        const now = Date.now();
        const timePassed = now - this.data.energyLastRegen;
        const energyToAdd = Math.floor(timePassed / 30000);
        
        if (energyToAdd > 0) {
            const newEnergy = Math.min(this.data.maxEnergy, this.data.energy + energyToAdd);
            this.update({
                energy: newEnergy,
                energyLastRegen: now
            });
        }
    }

    updateTicketsFromTime() {
        const now = Date.now();
        const timePassed = now - this.data.lastTicketTime;
        const ticketsToAdd = Math.floor(timePassed / 180000);
        
        if (ticketsToAdd > 0) {
            const newTickets = Math.min(this.data.maxTickets, this.data.gameTickets + ticketsToAdd);
            this.update({
                gameTickets: newTickets,
                lastTicketTime: now
            });
        }
    }

    checkDailyReset() {
        const now = new Date();
        const todayUTC = now.toISOString().split('T')[0];
        
        if (this.data.lastDailyReset !== todayUTC) {
            console.log('Daily reset triggered (UTC):', { old: this.data.lastDailyReset, new: todayUTC });
            
            const allTasksCompleted = this.data.dailyTasks.login && 
                                      this.data.dailyTasks.mine && 
                                      this.data.dailyTasks.boss && 
                                      this.data.dailyTasks.combo;
            
            this.update({
                dailyTasks: { 
                    login: true,
                    mine: false, 
                    boss: false, 
                    combo: false 
                },
                dailyTaskProgress: { 
                    mines: 0, 
                    bossBattles: 0, 
                    comboAttempts: 0 
                },
                lastDailyReset: todayUTC,
                gp: this.data.gp + 25,
                totalGPEarned: (this.data.totalGPEarned || this.data.gp) + 25,
                dailyStreak: (this.data.dailyStreak || 0) + 1,
                dailyTasksCompleted: allTasksCompleted ? (this.data.dailyTasksCompleted || 0) + 1 : (this.data.dailyTasksCompleted || 0)
            });
            
            this.generateDailyCombo();
            this.checkAchievements();
            
            if (window.showNotification) {
                window.showNotification(`🎁 Daily login reward: +25 GP! (Day ${this.data.dailyStreak})`);
            }
            
            return true;
        }
        
        return false;
    }

    generateDailyCombo() {
        const today = new Date().toISOString().split('T')[0];
        
        if (!this.data.dailyCombo.code || this.data.dailyCombo.date !== today) {
            const newCode = Math.floor(1000 + Math.random() * 9000).toString();
            console.log('Generated new daily combo:', newCode, 'for date:', today);
            
            this.update({
                dailyCombo: {
                    code: newCode,
                    attempts: 3,
                    completed: false,
                    date: today
                }
            });
        }
    }

    generateReferralCode() {
        if (!this.data.referralCode) {
            const code = 'CX' + Math.random().toString(36).substr(2, 8).toUpperCase();
            this.setValue('referralCode', code);
        }
    }

    getPlanetMultiplier(planetName) {
        const multipliers = {
            'Pyrion': 1.2,
            'Aqueos': 1.0,
            'Voidex': 1.6,
            'Chloros': 1.1,
            'Aurelia': 1.8,
            'Crimson': 1.4
        };
        return multipliers[planetName] || 1.0;
    }

    trackPlanetVisit(planetName) {
        const visited = this.data.planetsVisited || [];
        if (!visited.includes(planetName)) {
            this.update({
                planetsVisited: [...visited, planetName]
            });
            this.checkAchievements();
        }
    }

    mine() {
        if (this.data.energy <= 0) {
            if (window.showNotification) {
                window.showNotification('⚡ No energy! Wait for regeneration or watch an ad.');
            }
            return false;
        }

        const planetMultiplier = this.getPlanetMultiplier(this.data.currentPlanet);
        const speedBonus = 1 + (this.data.upgrades.speed * 0.2);
        const baseReward = 3 + Math.random() * 4;
        
        // Apply shop boosts
        const shardMultiplier = window.shopSystem?.getShardMultiplier() || 1;
        const luckyMultiplier = window.shopSystem?.getLuckyMultiplier() || 1;
        
        const shardReward = Math.floor(baseReward * planetMultiplier * speedBonus * shardMultiplier * luckyMultiplier);
        
        // Apply GP boost
        const gpMultiplier = window.shopSystem?.getGPMultiplier() || 1;
        const gpReward = Math.floor(shardReward * 0.5 * (1 + this.data.upgrades.multiplier * 0.5) * gpMultiplier);

        const planetMineCount = this.data.planetMineCount || {};
        planetMineCount[this.data.currentPlanet] = (planetMineCount[this.data.currentPlanet] || 0) + 1;

        this.update({
            energy: this.data.energy - 2,
            shards: this.data.shards + shardReward,
            gp: this.data.gp + gpReward,
            totalMines: (this.data.totalMines || 0) + 1,
            totalShardsCollected: (this.data.totalShardsCollected || 0) + shardReward,
            totalGPEarned: (this.data.totalGPEarned || this.data.gp) + gpReward,
            planetMineCount: planetMineCount,
            dailyTaskProgress: {
                ...this.data.dailyTaskProgress,
                mines: this.data.dailyTaskProgress.mines + 1
            }
        });

        this.checkAchievements();

        if (window.showNotification) {
            window.showNotification(`💎 +${shardReward} Shards, +${gpReward} GP!`);
        }

        return { shards: shardReward, gp: gpReward };
    }

    battleAliens() {
        if (this.data.energy < 5) {
            if (window.showNotification) {
                window.showNotification('⚡ Need at least 5 energy to battle!');
            }
            return false;
        }

        const baseReward = 25 + Math.random() * 15;
        
        // Apply GP boost
        const gpMultiplier = window.shopSystem?.getGPMultiplier() || 1;
        const reward = Math.floor(baseReward * (1 + this.data.upgrades.multiplier * 0.5) * gpMultiplier);
        
        this.update({
            energy: this.data.energy - 5,
            gp: this.data.gp + reward,
            totalGPEarned: (this.data.totalGPEarned || this.data.gp) + reward
        });

        if (window.showNotification) {
            window.showNotification(`⚔️ Defeated aliens! +${reward} GP!`);
        }

        return { gp: reward };
    }

    attackBoss() {
        if (this.data.energy < 3) {
            if (window.showNotification) {
                window.showNotification('⚡ Need at least 3 energy to attack!');
            }
            return false;
        }

        const baseDamage = 8 + (this.data.upgrades.damage * 5);
        const damage = baseDamage + Math.floor(Math.random() * 12);
        const actualDamage = this.data.adDamageBoost > 0 ? damage * 2 : damage;
        
        const newBossHealth = Math.max(0, this.data.bossHealth - actualDamage);
        const newPlayerDamage = this.data.playerDamage + actualDamage;
        const newAdBoost = Math.max(0, this.data.adDamageBoost - 1);

        let reward = 0;
        let bossDefeated = false;

        if (newBossHealth <= 0) {
            // Apply GP boost to boss rewards
            const gpMultiplier = window.shopSystem?.getGPMultiplier() || 1;
            reward = Math.floor((150 + Math.floor(Math.random() * 100)) * gpMultiplier);
            bossDefeated = true;
            
            this.update({
                energy: this.data.energy - 3,
                bossHealth: this.data.maxBossHealth,
                playerDamage: 0,
                gp: this.data.gp + reward,
                totalGPEarned: (this.data.totalGPEarned || this.data.gp) + reward,
                adDamageBoost: newAdBoost,
                bossesDefeated: (this.data.bossesDefeated || 0) + 1,
                dailyTaskProgress: {
                    ...this.data.dailyTaskProgress,
                    bossBattles: this.data.dailyTaskProgress.bossBattles + 1
                }
            });

            this.checkAchievements();

            if (window.showNotification) {
                window.showNotification(`🐉 Boss defeated! +${reward} GP!`);
            }
        } else {
            const gpMultiplier = window.shopSystem?.getGPMultiplier() || 1;
            reward = Math.floor(actualDamage * 1.5 * gpMultiplier);
            
            this.update({
                energy: this.data.energy - 3,
                bossHealth: newBossHealth,
                playerDamage: newPlayerDamage,
                gp: this.data.gp + reward,
                totalGPEarned: (this.data.totalGPEarned || this.data.gp) + reward,
                adDamageBoost: newAdBoost,
                dailyTaskProgress: {
                    ...this.data.dailyTaskProgress,
                    bossBattles: this.data.dailyTaskProgress.bossBattles + 1
                }
            });

            if (window.showNotification) {
                window.showNotification(`⚔️ Hit for ${actualDamage} damage! +${reward} GP!`);
            }
        }

        return { damage: actualDamage, gp: reward, bossDefeated };
    }

    buyUpgrade(upgradeType) {
        const costs = {
            speed: 50 * Math.pow(2, this.data.upgrades.speed),
            damage: 75 * Math.pow(2, this.data.upgrades.damage),
            energy: 100 * Math.pow(2, this.data.upgrades.energy),
            multiplier: 200 * Math.pow(2, this.data.upgrades.multiplier)
        };

        const cost = costs[upgradeType];
        if (this.data.gp < cost) {
            if (window.showNotification) {
                window.showNotification('🏆 Not enough GP!');
            }
            return false;
        }

        const newUpgrades = { ...this.data.upgrades };
        newUpgrades[upgradeType]++;

        const updateData = {
            gp: this.data.gp - cost,
            upgrades: newUpgrades
        };

        if (upgradeType === 'energy') {
            updateData.maxEnergy = this.data.maxEnergy + 25;
            updateData.energy = this.data.maxEnergy + 25;
        }

        this.update(updateData);
        this.checkAchievements();

        if (!this.data.oneTimeTasks.purchase) {
            this.update({
                oneTimeTasks: {
                    ...this.data.oneTimeTasks,
                    purchase: true
                },
                gp: this.data.gp + 40,
                totalGPEarned: (this.data.totalGPEarned || this.data.gp) + 40
            });

            if (window.showNotification) {
                window.showNotification('🚀 First purchase completed! +40 GP bonus!');
            }
        }

        const messages = {
            speed: 'Mining speed increased!',
            damage: 'Combat damage boosted!',
            energy: 'Maximum energy increased!',
            multiplier: 'GP multiplier activated!'
        };

        return { success: true, message: messages[upgradeType], cost };
    }

    claimDailyTask(taskType) {
        const rewards = { mine: 50, boss: 75, combo: 30 };
        const requirements = {
            mine: this.data.dailyTaskProgress.mines >= 10,
            boss: this.data.dailyTaskProgress.bossBattles >= 3,
            combo: this.data.dailyTaskProgress.comboAttempts > 0
        };
        
        if (this.data.dailyTasks[taskType] || !requirements[taskType]) {
            if (window.showNotification) {
                window.showNotification('❌ Task requirements not met or already completed!');
            }
            return false;
        }
        
        const newDailyTasks = { ...this.data.dailyTasks };
        newDailyTasks[taskType] = true;
        
        this.update({
            dailyTasks: newDailyTasks,
            gp: this.data.gp + rewards[taskType],
            totalGPEarned: (this.data.totalGPEarned || this.data.gp) + rewards[taskType]
        });

        if (window.showNotification) {
            window.showNotification(`✅ Daily task completed! +${rewards[taskType]} GP!`);
        }

        return true;
    }

    claimOneTimeTask(taskType) {
        const rewards = { planet: 20, purchase: 40, shards100: 80, invite5: 200 };
        const requirements = {
            planet: true,
            purchase: true,
            shards100: this.data.shards >= 100,
            invite5: this.data.totalReferrals >= 5
        };
        
        if (this.data.oneTimeTasks[taskType] || !requirements[taskType]) {
            if (window.showNotification) {
                window.showNotification('❌ Task requirements not met or already completed!');
            }
            return false;
        }
        
        const newOneTimeTasks = { ...this.data.oneTimeTasks };
        newOneTimeTasks[taskType] = true;
        
        this.update({
            oneTimeTasks: newOneTimeTasks,
            gp: this.data.gp + rewards[taskType],
            totalGPEarned: (this.data.totalGPEarned || this.data.gp) + rewards[taskType]
        });

        if (window.showNotification) {
            window.showNotification(`✅ One-time task completed! +${rewards[taskType]} GP!`);
        }

        return true;
    }

    checkAchievements() {
        if (!window.AchievementManager) return;

        const achievementManager = new window.AchievementManager();
        const unlockedAchievements = this.data.unlockedAchievements || [];
        let newAchievements = [];
        let totalReward = 0;

        Object.keys(achievementManager.achievements).forEach(achievementId => {
            if (!unlockedAchievements.includes(achievementId)) {
                if (achievementManager.isUnlocked(achievementId, this.data)) {
                    newAchievements.push(achievementId);
                    totalReward += achievementManager.achievements[achievementId].reward;
                }
            }
        });

        if (newAchievements.length > 0) {
            this.update({
                unlockedAchievements: [...unlockedAchievements, ...newAchievements],
                gp: this.data.gp + totalReward,
                totalGPEarned: (this.data.totalGPEarned || this.data.gp) + totalReward
            });

            newAchievements.forEach(id => {
                const achievement = achievementManager.achievements[id];
                if (window.showNotification) {
                    window.showNotification(`🏆 Achievement Unlocked: ${achievement.title}! +${achievement.reward} GP`);
                }
            });
        }
    }

    scheduleSave() {
        if (this.autoSaveInterval) {
            clearTimeout(this.autoSaveInterval);
        }
        
        this.autoSaveInterval = setTimeout(() => {
            if (window.backendManager) {
                window.backendManager.saveProgress(this.data);
            }
        }, 2000);
    }

    async save() {
        if (window.backendManager) {
            return await window.backendManager.saveProgress(this.data);
        }
        return { success: false, error: 'Backend manager not available' };
    }

    async load() {
        if (window.backendManager) {
            const result = await window.backendManager.loadProgress();
            if (result.success && result.data) {
                this.set(result.data);
                this.updateEnergyFromTime();
                this.updateTicketsFromTime();
                return true;
            }
        }
        return false;
    }

    initialize() {
        this.generateReferralCode();
        this.generateDailyCombo();
        this.checkDailyReset();
        this.updateEnergyFromTime();
        this.updateTicketsFromTime();
        
        setInterval(() => {
            if (this.data.energy < this.data.maxEnergy) {
                this.addValue('energy', 1);
                this.setValue('energyLastRegen', Date.now());
            }
        }, 30000);
        
        setInterval(() => {
            this.updateTicketsFromTime();
        }, 60000);
    }
}

window.gameState = new GameState();
