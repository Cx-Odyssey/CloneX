// gameState.js - Updated with Harder Leveling and Capped Progress

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
            adWatchCount: 0,
            lastAdTime: 0,
            
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
            
            // Shop active boosts
            activeBoosts: { shardBooster: 0, gpBooster: 0, autoMiner: 0, luckyCharm: 0 },
            itemsPurchased: {},
            
            // Premium items
            activePremiumItems: {
                vipPass: 0,
                legendaryShip: false,
                unlimitedEnergy: 0,
                doubleXP: false,
                autoMinerPremium: 0
            }
        };
        
        this.listeners = [];
        this.autoSaveInterval = null;
        this.adEnergyBoostActive = false;
    }

    // Harder level calculation - exponential growth
    getLevel() {
        const gp = this.data.gp;
        // New formula: Level = floor(sqrt(GP/50)) + 1
        // This makes leveling much harder
        // Level 10 = 5,000 GP
        // Level 50 = 125,000 GP
        // Level 100 = 500,000 GP
        // Level 500 = 12,500,000 GP
        return Math.floor(Math.sqrt(gp / 50)) + 1;
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
        
        // Ad boost: energy regenerates 2x faster for 30 minutes after watching ad
        let regenRate = 30000; // Default: 1 energy per 30 seconds
        if (this.adEnergyBoostActive) {
            const timeSinceAd = now - this.data.lastAdTime;
            if (timeSinceAd < 1800000) { // 30 minutes
                regenRate = 15000; // 2x faster: 1 energy per 15 seconds
            } else {
                this.adEnergyBoostActive = false;
            }
        }
        
        const energyToAdd = Math.floor(timePassed / regenRate);
        
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

    // Auto miner premium - runs even when offline
    processAutoMinerPremium() {
        const now = Date.now();
        if (this.data.activePremiumItems.autoMinerPremium > now && this.data.currentPlanet) {
            // Calculate mines since last update
            const timePassed = Math.min(now - (this.data.lastAutoMineTime || now), 3600000); // Cap at 1 hour
            const mineCount = Math.floor(timePassed / 10000); // 1 mine every 10 seconds
            
            if (mineCount > 0) {
                const planetMultiplier = this.getPlanetMultiplier(this.data.currentPlanet);
                const speedBonus = 1 + (this.data.upgrades.speed * 0.2);
                const baseReward = 3;
                
                const shardMultiplier = window.shopSystem?.getShardMultiplier() || 1;
                const totalShards = Math.floor(mineCount * baseReward * planetMultiplier * speedBonus * shardMultiplier);
                
                const gpMultiplier = window.shopSystem?.getGPMultiplier() || 1;
                const totalGP = Math.floor(totalShards * 0.5 * (1 + this.data.upgrades.multiplier * 0.5) * gpMultiplier);
                
                this.update({
                    shards: this.data.shards + totalShards,
                    gp: this.data.gp + totalGP,
                    totalMines: (this.data.totalMines || 0) + mineCount,
                    totalShardsCollected: (this.data.totalShardsCollected || 0) + totalShards,
                    totalGPEarned: (this.data.totalGPEarned || this.data.gp) + totalGP,
                    lastAutoMineTime: now
                });
                
                if (window.showNotification) {
                    window.showNotification(`Auto Miner: +${totalShards} Shards, +${totalGP} GP!`);
                }
            }
        }
        
        this.data.lastAutoMineTime = now;
    }

    mine() {
        // Check for unlimited energy
        const hasUnlimitedEnergy = window.shopSystem?.hasUnlimitedEnergy();
        
        if (!hasUnlimitedEnergy && this.data.energy <= 0) {
            if (window.showNotification) {
                window.showNotification('No energy! Watch an ad for faster regen!');
            }
            return false;
        }

        const planetMultiplier = this.getPlanetMultiplier(this.data.currentPlanet);
        const speedBonus = 1 + (this.data.upgrades.speed * 0.2);
        const baseReward = 3 + Math.random() * 4;
        
        const shardMultiplier = window.shopSystem?.getShardMultiplier() || 1;
        const luckyMultiplier = window.shopSystem?.getLuckyMultiplier() || 1;
        
        const shardReward = Math.floor(baseReward * planetMultiplier * speedBonus * shardMultiplier * luckyMultiplier);
        
        const gpMultiplier = window.shopSystem?.getGPMultiplier() || 1;
        const gpReward = Math.floor(shardReward * 0.5 * (1 + this.data.upgrades.multiplier * 0.5) * gpMultiplier);

        const planetMineCount = this.data.planetMineCount || {};
        planetMineCount[this.data.currentPlanet] = (planetMineCount[this.data.currentPlanet] || 0) + 1;

        const energyChange = hasUnlimitedEnergy ? 0 : 2;
        
        // Cap daily task progress at 10
        const newMineProgress = Math.min(this.data.dailyTaskProgress.mines + 1, 10);

        this.update({
            energy: this.data.energy - energyChange,
            shards: this.data.shards + shardReward,
            gp: this.data.gp + gpReward,
            totalMines: (this.data.totalMines || 0) + 1,
            totalShardsCollected: (this.data.totalShardsCollected || 0) + shardReward,
            totalGPEarned: (this.data.totalGPEarned || this.data.gp) + gpReward,
            planetMineCount: planetMineCount,
            dailyTaskProgress: {
                ...this.data.dailyTaskProgress,
                mines: newMineProgress
            }
        });

        if (window.showNotification) {
            window.showNotification(`+${shardReward} Shards, +${gpReward} GP!`);
        }

        return { shards: shardReward, gp: gpReward };
    }

    attackBoss() {
        const hasUnlimitedEnergy = window.shopSystem?.hasUnlimitedEnergy();
        
        if (!hasUnlimitedEnergy && this.data.energy < 3) {
            if (window.showNotification) {
                window.showNotification('Need at least 3 energy to attack!');
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

        const energyChange = hasUnlimitedEnergy ? 0 : 3;
        
        // Cap daily boss task progress at 3
        const newBossProgress = Math.min(this.data.dailyTaskProgress.bossBattles + 1, 3);

        if (newBossHealth <= 0) {
            const gpMultiplier = window.shopSystem?.getGPMultiplier() || 1;
            reward = Math.floor((150 + Math.floor(Math.random() * 100)) * gpMultiplier);
            bossDefeated = true;
            
            this.update({
                energy: this.data.energy - energyChange,
                bossHealth: this.data.maxBossHealth,
                playerDamage: 0,
                gp: this.data.gp + reward,
                totalGPEarned: (this.data.totalGPEarned || this.data.gp) + reward,
                adDamageBoost: newAdBoost,
                bossesDefeated: (this.data.bossesDefeated || 0) + 1,
                dailyTaskProgress: {
                    ...this.data.dailyTaskProgress,
                    bossBattles: newBossProgress
                }
            });

            if (window.showNotification) {
                window.showNotification(`Boss defeated! +${reward} GP!`);
            }
        } else {
            const gpMultiplier = window.shopSystem?.getGPMultiplier() || 1;
            reward = Math.floor(actualDamage * 1.5 * gpMultiplier);
            
            this.update({
                energy: this.data.energy - energyChange,
                bossHealth: newBossHealth,
                playerDamage: newPlayerDamage,
                gp: this.data.gp + reward,
                totalGPEarned: (this.data.totalGPEarned || this.data.gp) + reward,
                adDamageBoost: newAdBoost,
                dailyTaskProgress: {
                    ...this.data.dailyTaskProgress,
                    bossBattles: newBossProgress
                }
            });

            if (window.showNotification) {
                window.showNotification(`Hit for ${actualDamage} damage! +${reward} GP!`);
            }
        }

        return { damage: actualDamage, gp: reward, bossDefeated };
    }

    // Track ad watches for bonus
    watchAd(type) {
        const now = Date.now();
        this.update({
            adWatchCount: (this.data.adWatchCount || 0) + 1,
            lastAdTime: now
        });
        
        // Enable faster energy regen for 30 minutes
        if (type === 'energy') {
            this.adEnergyBoostActive = true;
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
        }
    }

    // ... rest of the methods remain the same ...
    
    initialize() {
        this.generateReferralCode();
        this.generateDailyCombo();
        this.checkDailyReset();
        this.updateEnergyFromTime();
        this.updateTicketsFromTime();
        this.processAutoMinerPremium();
        
        setInterval(() => {
            if (this.data.energy < this.data.maxEnergy) {
                this.addValue('energy', 1);
                this.setValue('energyLastRegen', Date.now());
            }
            this.processAutoMinerPremium();
        }, 30000);
        
        setInterval(() => {
            this.updateTicketsFromTime();
        }, 60000);
    }

    generateReferralCode() {
        if (!this.data.referralCode) {
            const code = 'CX' + Math.random().toString(36).substr(2, 8).toUpperCase();
            this.setValue('referralCode', code);
        }
    }

    generateDailyCombo() {
        const today = new Date().toISOString().split('T')[0];
        
        if (!this.data.dailyCombo.code || this.data.dailyCombo.date !== today) {
            const newCode = Math.floor(1000 + Math.random() * 9000).toString();
            
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

    checkDailyReset() {
        const now = new Date();
        const todayUTC = now.toISOString().split('T')[0];
        
        if (this.data.lastDailyReset !== todayUTC) {
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
            
            if (window.showNotification) {
                window.showNotification(`Daily login reward: +25 GP! (Day ${this.data.dailyStreak})`);
            }
            
            return true;
        }
        
        return false;
    }

    // ... (include all other methods from the original gameState.js) ...
}

window.gameState = new GameState();
