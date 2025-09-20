// Core Configuration Module for CX Odyssey
const GAME_CONFIG = {
    // API Configuration
    API: {
        BASE_URL: 'https://cx-odyssey-backend.vercel.app/api',
        ENDPOINTS: {
            SAVE_PROGRESS: '/saveProgress',
            LOAD_PROGRESS: '/loadProgress',
            LEADERBOARD: '/leaderboard'
        },
        TIMEOUT: 10000,
        RETRY_COUNT: 3,
        RETRY_DELAY: 1000
    },

    // Telegram Bot Configuration
    TELEGRAM: {
        BOT_USERNAME: '@Cx_odyssey_bot',
        BOT_ID: '48192244',
        BOT_TOKEN: '8446195245:AAEtVtdhad16hqcLpTTVFXLP0kKp37s5eUA',
        SHARE_URL: 'https://t.me/Cx_odyssey_bot/game'
    },

    // Game Balance Configuration
    GAME: {
        ENERGY: {
            DEFAULT_MAX: 100,
            REGEN_RATE: 1, // Energy per interval
            REGEN_INTERVAL: 6000, // 6 seconds
            MINING_COST: 5,
            BATTLE_COST: 10
        },
        
        PLANETS: {
            'Pyrion': { multiplier: 1.2, minReward: 10, maxReward: 20 },
            'Aqueos': { multiplier: 1.0, minReward: 8, maxReward: 16 },
            'Voidex': { multiplier: 1.8, minReward: 15, maxReward: 25 },
            'Verdant': { multiplier: 1.1, minReward: 9, maxReward: 18 },
            'Aurelia': { multiplier: 2.0, minReward: 20, maxReward: 30 },
            'Crimson': { multiplier: 1.5, minReward: 12, maxReward: 22 }
        },

        UPGRADES: {
            speed: { baseCost: 500, costMultiplier: 1.5, bonus: 0.25 },
            damage: { baseCost: 750, costMultiplier: 1.5, bonus: 25 },
            energy: { baseCost: 1000, costMultiplier: 2.0, bonus: 50 },
            multiplier: { baseCost: 3000, costMultiplier: 2.5, bonus: 1.0 }
        },

        SKINS: {
            skin1: { cost: 2000, name: 'Black Ship', icon: '🚀' },
            skin2: { cost: 5000, name: 'Gold Ship', icon: '🚀' }
        },

        BOSS: {
            DEFAULT_HEALTH: 1000,
            MIN_DAMAGE: 10,
            MAX_DAMAGE: 30,
            DEFEAT_REWARD: 5000,
            AD_DAMAGE_MULTIPLIER: 2,
            AD_DAMAGE_ATTACKS: 3
        },

        DAILY: {
            BASE_BONUS: 100,
            STREAK_BONUS: 50,
            MAX_STREAK: 30
        },

        BATTLE: {
            MIN_DAMAGE: 50,
            MAX_DAMAGE: 150,
            MIN_REWARD: 100,
            MAX_REWARD: 300
        }
    },

    // Minigame Configuration
    MINIGAMES: {
        ASTEROID_DODGE: {
            duration: 30,
            baseReward: 300,
            scoreMultiplier: 10,
            maxReward: 1000
        },
        CRYPTO_CLICKER: {
            duration: 10,
            baseReward: 200,
            clickMultiplier: 10,
            maxReward: 800
        },
        PUZZLE_HACK: {
            baseReward: 400,
            randomBonus: 200,
            maxReward: 600
        },
        PVP_ARENA: {
            baseReward: 1000,
            randomBonus: 1000,
            maxReward: 2000
        }
    },

    // UI Configuration
    UI: {
        NOTIFICATION_DURATION: 3200,
        SCREEN_TRANSITION_DURATION: 800,
        AUTO_SAVE_INTERVAL: 30000, // 30 seconds
        AD_DURATION: 5000, // 5 seconds
        LEADERBOARD_LIMIT: 100
    },

    // Monetag Ad Configuration
    MONETAG: {
        ZONE_ID: '9891070',
        SDK_FUNCTION: 'show_9891070',
        TYPES: {
            INTERSTITIAL: 'interstitial',
            POPUP: 'pop',
            IN_APP: 'inApp'
        },
        IN_APP_SETTINGS: {
            frequency: 2,
            capping: 0.1,
            interval: 30,
            timeout: 5,
            everyPage: false
        }
    },

    // Achievement Configuration
    ACHIEVEMENTS: [
        {
            id: 'first_mine',
            name: 'First Strike',
            description: 'Complete your first mining operation',
            condition: (state) => state.shards > 0,
            reward: { gp: 500 },
            icon: '⛏️'
        },
        {
            id: 'gp_collector',
            name: 'GP Collector',
            description: 'Earn 10,000 GP',
            condition: (state) => state.gp >= 10000,
            reward: { gp: 1000 },
            icon: '💰'
        },
        {
            id: 'boss_slayer',
            name: 'Boss Slayer',
            description: 'Defeat the Cosmic Overlord',
            condition: (state, context) => context.bossDefeated,
            reward: { gp: 5000 },
            icon: '🐉'
        },
        {
            id: 'explorer',
            name: 'Galaxy Explorer',
            description: 'Visit all 6 planets',
            condition: (state) => state.planetsExplored && state.planetsExplored.length >= 6,
            reward: { gp: 2000 },
            icon: '🌌'
        },
        {
            id: 'daily_warrior',
            name: 'Daily Warrior',
            description: 'Maintain a 7-day login streak',
            condition: (state) => state.dailyStreak >= 7,
            reward: { gp: 1500 },
            icon: '🏆'
        },
        {
            id: 'upgrade_master',
            name: 'Upgrade Master',
            description: 'Purchase 10 total upgrades',
            condition: (state) => {
                const totalUpgrades = Object.values(state.upgrades || {}).reduce((a, b) => a + b, 0);
                return totalUpgrades >= 10;
            },
            reward: { gp: 3000 },
            icon: '🚀'
        }
    ],

    // Local Storage Keys
    STORAGE_KEYS: {
        GAME_STATE: 'cx_odyssey_game_state',
        USER_SETTINGS: 'cx_odyssey_user_settings',
        LAST_SAVE: 'cx_odyssey_last_save'
    },

    // Error Messages
    ERRORS: {
        NETWORK_ERROR: 'Network connection failed. Playing in offline mode.',
        SAVE_ERROR: 'Failed to save progress to server.',
        LOAD_ERROR: 'Failed to load progress from server.',
        TELEGRAM_ERROR: 'Telegram WebApp not available.',
        AD_ERROR: 'Advertisement failed to load.',
        INSUFFICIENT_ENERGY: 'Not enough energy!',
        INSUFFICIENT_GP: 'Not enough GP!',
        UPGRADE_OWNED: 'You already own this upgrade!',
        DAILY_CLAIMED: 'Daily reward already claimed!'
    },

    // Success Messages
    SUCCESS: {
        GAME_SAVED: 'Progress saved successfully!',
        UPGRADE_PURCHASED: 'Upgrade purchased!',
        ACHIEVEMENT_UNLOCKED: 'Achievement unlocked!',
        DAILY_CLAIMED: 'Daily reward claimed!',
        AD_REWARD: 'Advertisement reward received!'
    }
};

// Utility functions for configuration
const ConfigUtils = {
    // Get planet configuration
    getPlanetConfig(planetName) {
        return GAME_CONFIG.GAME.PLANETS[planetName] || GAME_CONFIG.GAME.PLANETS['Aqueos'];
    },

    // Calculate upgrade cost
    getUpgradeCost(upgradeType, currentLevel = 0) {
        const config = GAME_CONFIG.GAME.UPGRADES[upgradeType];
        if (!config) return 0;
        
        return Math.floor(config.baseCost * Math.pow(config.costMultiplier, currentLevel));
    },

    // Get skin configuration
    getSkinConfig(skinId) {
        return GAME_CONFIG.GAME.SKINS[skinId];
    },

    // Calculate mining reward
    calculateMiningReward(planetName, speedLevel = 0) {
        const planetConfig = this.getPlanetConfig(planetName);
        const speedBonus = 1 + (speedLevel * GAME_CONFIG.GAME.UPGRADES.speed.bonus);
        
        const baseReward = planetConfig.minReward + 
            Math.random() * (planetConfig.maxReward - planetConfig.minReward);
        
        return Math.floor(baseReward * planetConfig.multiplier * speedBonus);
    },

    // Calculate battle reward
    calculateBattleReward(damageLevel = 0, multiplierLevel = 0) {
        const config = GAME_CONFIG.GAME.BATTLE;
        const baseReward = config.MIN_REWARD + 
            Math.random() * (config.MAX_REWARD - config.MIN_REWARD);
        
        const multiplierBonus = 1 + (multiplierLevel * GAME_CONFIG.GAME.UPGRADES.multiplier.bonus);
        
        return Math.floor(baseReward * multiplierBonus);
    },

    // Calculate boss damage
    calculateBossDamage(damageLevel = 0) {
        const config = GAME_CONFIG.GAME.BOSS;
        const baseDamage = config.MIN_DAMAGE + 
            Math.random() * (config.MAX_DAMAGE - config.MIN_DAMAGE);
        
        const damageBonus = damageLevel * GAME_CONFIG.GAME.UPGRADES.damage.bonus;
        
        return Math.floor(baseDamage + damageBonus);
    },

    // Format time for display
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    },

    // Format numbers for display
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
};

// Make configuration globally available
window.GAME_CONFIG = GAME_CONFIG;
window.ConfigUtils = ConfigUtils;
