// Game State Management
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
            walletAddress: ''
        };
        
        this.listeners = [];
        this.autoSaveInterval = null;
    }

    // Get current state data
    get() {
        return { ...this.data };
    }

    // Update state with new data
    update(newData) {
        const oldData = { ...this.data };
        this.data = { ...this.data, ...newData };
        
        // Notify listeners of changes
        this.notifyListeners(oldData, this.data);
        
        // Trigger auto-save
        this.scheduleSave();
    }

    // Set entire state (used when loading)
    set(newData) {
        const oldData = { ...this.data };
        this.data = { ...this.data, ...newData };
        this.notifyListeners(oldData, this.data);
    }

    // Get specific property
    getValue(key) {
        return this.data[key];
    }

    // Set specific property
    setValue(key, value) {
        this.update({ [key]: value });
    }

    // Add to a numeric property
    addValue(key, amount) {
        const currentValue = this.getValue(key) || 0;
        this.setValue(key, Math.max(0, currentValue + amount));
    }

    // Subscribe to state changes
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    // Notify all listeners of state changes
    notifyListeners(oldState, newState) {
        this.listeners.forEach(listener => {
            try {
                listener(newState, oldState);
            } catch (error) {
                console.error('State listener error:', error);
            }
        });
    }

    // Energy regeneration logic
    updateEnergyFromTime() {
        const now = Date.now();
        const timePassed = now - this.data.energyLastRegen;
        const energyToAdd = Math.floor(timePassed / 30000); // 1 energy per 30 seconds
        
        if (energyToAdd > 0) {
            const newEnergy = Math.min(this.data.maxEnergy, this.data.energy + energyToAdd);
            this.update({
                energy: newEnergy,
                energyLastRegen: now
            });
        }
    }

    // Ticket regeneration logic
    updateTicketsFromTime() {
        const now = Date.now();
        const timePassed = now - this.data.lastTicketTime;
        const ticketsToAdd = Math.floor(timePassed / 180000); // 1 ticket every 3 minutes
        
        if (ticketsToAdd > 0) {
            const newTickets = Math.min(this.data.maxTickets, this.data.gameTickets + ticketsToAdd);
            this.update({
                gameTickets: newTickets,
                lastTicketTime: now
            });
        }
    }

    // Daily reset check
    checkDailyReset() {
        const today = new Date().toDateString();
        if (this.data.lastDailyReset !== today) {
            this.update({
                dailyTasks: { login: true, mine: false, boss: false, combo: false }, // Auto-complete login
                dailyTaskProgress: { mines: 0, bossBattles: 0, comboAttempts: 0 },
                lastDailyReset: today,
                gp: this.data.gp + 25 // Daily login bonus
            });
            
            // Show notification
            if (window.showNotification) {
                window.showNotification('🎁 Daily login reward: +25 GP!');
            }
            
            return true; // Indicates reset occurred
        }
        return false;
    }

    // Generate daily combo code
    generateDailyCombo() {
        const today = new Date().toDateString();
        if (!this.data.dailyCombo.code || this.data.dailyCombo.date !== today) {
            this.update({
                dailyCombo: {
                    code: Math.floor(1000 + Math.random() * 9000).toString(),
                    attempts: 3,
                    completed: false,
                    date: today
                }
            });
        }
    }

    // Generate referral code
    generateReferralCode() {
        if (!this.data.referralCode) {
            const code = 'CX' + Math.random().toString(36).substr(2, 8).toUpperCase();
            this.setValue('referralCode', code);
        }
    }

    // Planet multiplier helper
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

    // Mining action
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
        const shardReward = Math.floor(baseReward * planetMultiplier * speedBonus);
        const gpReward = Math.floor(shardReward * 0.5 * (1 + this.data.upgrades.multiplier * 0.5));

        this.update({
            energy: this.data.energy - 2,
            shards: this.data.shards + shardReward,
            gp: this.data.gp + gpReward,
            dailyTaskProgress: {
                ...this.data.dailyTaskProgress,
                mines: this.data.dailyTaskProgress.mines + 1
            }
        });

        if (window.showNotification) {
            window.showNotification(`💎 +${shardReward} Shards, +${gpReward} GP!`);
        }

        return { shards: shardReward, gp: gpReward };
    }

    // Battle aliens action
    battleAliens() {
        if (this.data.energy < 5) {
            if (window.showNotification) {
                window.showNotification('⚡ Need at least 5 energy to battle!');
            }
            return false;
        }

        const baseReward = 25 + Math.random() * 15;
        const reward = Math.floor(baseReward * (1 + this.data.upgrades.multiplier * 0.5));
        
        this.update({
            energy: this.data.energy - 5,
            gp: this.data.gp + reward
        });

        if (window.showNotification) {
            window.showNotification(`⚔️ Defeated aliens! +${reward} GP!`);
        }

        return { gp: reward };
    }

    // Boss attack action
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
            // Boss defeated
            reward = 150 + Math.floor(Math.random() * 100);
            bossDefeated = true;
            
            this.update({
                energy: this.data.energy - 3,
                bossHealth: this.data.maxBossHealth, // Reset boss
                playerDamage: 0, // Reset damage
                gp: this.data.gp + reward,
                adDamageBoost: newAdBoost,
                dailyTaskProgress: {
                    ...this.data.dailyTaskProgress,
                    bossBattles: this.data.dailyTaskProgress.bossBattles + 1
                }
            });

            if (window.showNotification) {
                window.showNotification(`🐉 Boss defeated! +${reward} GP!`);
            }
        } else {
            // Boss damaged but not defeated
            reward = Math.floor(actualDamage * 1.5);
            
            this.update({
                energy: this.data.energy - 3,
                bossHealth: newBossHealth,
                playerDamage: newPlayerDamage,
                gp: this.data.gp + reward,
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

    // Buy upgrade
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

        // Special handling for energy upgrade
        if (upgradeType === 'energy') {
            updateData.maxEnergy = this.data.maxEnergy + 25;
            updateData.energy = this.data.maxEnergy + 25; // Fill to new max
        }

        this.update(updateData);

        // Check for first purchase task
        if (!this.data.oneTimeTasks.purchase) {
            this.update({
                oneTimeTasks: {
                    ...this.data.oneTimeTasks,
                    purchase: true
                },
                gp: this.data.gp + 40 // Bonus for first purchase
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

    // Task completion methods
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
            gp: this.data.gp + rewards[taskType]
        });

        if (window.showNotification) {
            window.showNotification(`✅ Daily task completed! +${rewards[taskType]} GP!`);
        }

        return true;
    }

    claimOneTimeTask(taskType) {
        const rewards = { planet: 20, purchase: 40, shards100: 80, invite5: 200 };
        const requirements = {
            planet: true, // Already checked when visiting planet
            purchase: true, // Already checked when making purchase
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
            gp: this.data.gp + rewards[taskType]
        });

        if (window.showNotification) {
            window.showNotification(`✅ One-time task completed! +${rewards[taskType]} GP!`);
        }

        return true;
    }

    // Auto-save scheduling
    scheduleSave() {
        if (this.autoSaveInterval) {
            clearTimeout(this.autoSaveInterval);
        }
        
        this.autoSaveInterval = setTimeout(() => {
            if (window.backendManager) {
                window.backendManager.saveProgress(this.data);
            }
        }, 2000); // Save 2 seconds after last change
    }

    // Manual save
    async save() {
        if (window.backendManager) {
            return await window.backendManager.saveProgress(this.data);
        }
        return { success: false, error: 'Backend manager not available' };
    }

    // Load data
    async load() {
        if (window.backendManager) {
            const result = await window.backendManager.loadProgress();
            if (result.success && result.data) {
                this.set(result.data);
                
                // Update time-based values
                this.updateEnergyFromTime();
                this.updateTicketsFromTime();
                
                return true;
            }
        }
        return false;
    }

    // Initialize all systems
    initialize() {
        this.generateReferralCode();
        this.generateDailyCombo();
        this.checkDailyReset();
        this.updateEnergyFromTime();
        this.updateTicketsFromTime();
        
        // Start energy regeneration timer
        setInterval(() => {
            if (this.data.energy < this.data.maxEnergy) {
                this.addValue('energy', 1);
                this.setValue('energyLastRegen', Date.now());
            }
        }, 30000); // Every 30 seconds
        
        // Start ticket regeneration timer
        setInterval(() => {
            this.updateTicketsFromTime();
        }, 60000); // Check every minute
    }
}

// Global game state instance
window.gameState = new GameState();