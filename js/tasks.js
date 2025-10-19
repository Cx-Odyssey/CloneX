// tasks.js - COMPLETE FIXED VERSION with proper daily rewards and real logos

// Achievement Definitions
const ACHIEVEMENTS = {
    // Exploration
    explorer_beginner: { id: 'explorer_beginner', title: 'Space Cadet', description: 'Visit your first planet', icon: '🚀', category: 'exploration', requirement: { type: 'planets_visited', value: 1 }, reward: 50 },
    explorer_intermediate: { id: 'explorer_intermediate', title: 'Planet Hopper', description: 'Visit all 6 planets', icon: '🌍', category: 'exploration', requirement: { type: 'planets_visited', value: 6 }, reward: 250 },
    explorer_master: { id: 'explorer_master', title: 'Galaxy Cartographer', description: 'Mine on every planet 100 times each', icon: '🌌', category: 'exploration', requirement: { type: 'all_planets_mined', value: 100 }, reward: 1000 },

    // Mining
    miner_beginner: { id: 'miner_beginner', title: 'First Strike', description: 'Mine 100 times', icon: '⛏️', category: 'mining', requirement: { type: 'total_mines', value: 100 }, reward: 100 },
    miner_intermediate: { id: 'miner_intermediate', title: 'Professional Miner', description: 'Mine 2,500 times', icon: '💎', category: 'mining', requirement: { type: 'total_mines', value: 2500 }, reward: 500 },
    miner_expert: { id: 'miner_expert', title: 'Master Excavator', description: 'Mine 10,000 times', icon: '⚡', category: 'mining', requirement: { type: 'total_mines', value: 10000 }, reward: 2000 },
    miner_legend: { id: 'miner_legend', title: 'Cosmic Miner', description: 'Mine 50,000 times', icon: '👑', category: 'mining', requirement: { type: 'total_mines', value: 50000 }, reward: 5000 },

    // Combat
    warrior_beginner: { id: 'warrior_beginner', title: 'First Blood', description: 'Defeat 10 bosses', icon: '⚔️', category: 'combat', requirement: { type: 'bosses_defeated', value: 10 }, reward: 150 },
    warrior_intermediate: { id: 'warrior_intermediate', title: 'Boss Hunter', description: 'Defeat 100 bosses', icon: '🗡️', category: 'combat', requirement: { type: 'bosses_defeated', value: 100 }, reward: 600 },
    warrior_expert: { id: 'warrior_expert', title: 'Overlord Slayer', description: 'Defeat 500 bosses', icon: '🛡️', category: 'combat', requirement: { type: 'bosses_defeated', value: 500 }, reward: 2500 },
    warrior_legend: { id: 'warrior_legend', title: 'Cosmic Destroyer', description: 'Defeat 2,000 bosses', icon: '👑', category: 'combat', requirement: { type: 'bosses_defeated', value: 2000 }, reward: 6000 },

    // Collection
    collector_beginner: { id: 'collector_beginner', title: 'Shard Gatherer', description: 'Collect 2,500 shards (total)', icon: '💠', category: 'collection', requirement: { type: 'total_shards', value: 2500 }, reward: 200 },
    collector_intermediate: { id: 'collector_intermediate', title: 'Crystal Hoarder', description: 'Collect 25,000 shards (total)', icon: '💎', category: 'collection', requirement: { type: 'total_shards', value: 25000 }, reward: 800 },
    collector_expert: { id: 'collector_expert', title: 'Gem Tycoon', description: 'Collect 100,000 shards (total)', icon: '💰', category: 'collection', requirement: { type: 'total_shards', value: 100000 }, reward: 3000 },
    collector_legend: { id: 'collector_legend', title: 'Treasure Emperor', description: 'Collect 500,000 shards (total)', icon: '🏆', category: 'collection', requirement: { type: 'total_shards', value: 500000 }, reward: 8000 },

    // Progression
    progress_level10: { id: 'progress_level10', title: 'Apprentice Collector', description: 'Reach level 10', icon: '⭐', category: 'progression', requirement: { type: 'level', value: 10 }, reward: 150 },
    progress_level25: { id: 'progress_level25', title: 'Veteran Collector', description: 'Reach level 25', icon: '🌟', category: 'progression', requirement: { type: 'level', value: 25 }, reward: 500 },
    progress_level50: { id: 'progress_level50', title: 'Elite Collector', description: 'Reach level 50', icon: '✨', category: 'progression', requirement: { type: 'level', value: 50 }, reward: 1500 },
    progress_level100: { id: 'progress_level100', title: 'Legendary Collector', description: 'Reach level 100', icon: '💫', category: 'progression', requirement: { type: 'level', value: 100 }, reward: 5000 },

    // Upgrades
    upgrader_beginner: { id: 'upgrader_beginner', title: 'Tech Enthusiast', description: 'Purchase 10 upgrades', icon: '🔧', category: 'upgrades', requirement: { type: 'total_upgrades', value: 10 }, reward: 300 },
    upgrader_intermediate: { id: 'upgrader_intermediate', title: 'Ship Optimizer', description: 'Purchase 25 upgrades', icon: '⚙️', category: 'upgrades', requirement: { type: 'total_upgrades', value: 25 }, reward: 1000 },
    upgrader_expert: { id: 'upgrader_expert', title: 'Tech Master', description: 'Purchase 50 upgrades', icon: '🛸', category: 'upgrades', requirement: { type: 'total_upgrades', value: 50 }, reward: 3000 },
    upgrader_legend: { id: 'upgrader_legend', title: 'Ultimate Engineer', description: 'Max out all upgrade types (20+ each)', icon: '🚀', category: 'upgrades', requirement: { type: 'all_upgrades_maxed', value: 20 }, reward: 7500 },

    // Special
    consistency_week: { id: 'consistency_week', title: 'Dedicated Explorer', description: 'Login 7 days in a row', icon: '📅', category: 'special', requirement: { type: 'daily_streak', value: 7 }, reward: 400 },
    consistency_month: { id: 'consistency_month', title: 'Committed Collector', description: 'Login 30 days in a row', icon: '🗓️', category: 'special', requirement: { type: 'daily_streak', value: 30 }, reward: 2000 },
    consistency_veteran: { id: 'consistency_veteran', title: 'Space Veteran', description: 'Login 100 days in a row', icon: '📆', category: 'special', requirement: { type: 'daily_streak', value: 100 }, reward: 8000 },
    social_starter: { id: 'social_starter', title: 'Friend Finder', description: 'Invite 5 friends', icon: '👥', category: 'special', requirement: { type: 'total_referrals', value: 5 }, reward: 500 },
    social_networker: { id: 'social_networker', title: 'Community Builder', description: 'Invite 20 friends', icon: '👫', category: 'special', requirement: { type: 'total_referrals', value: 20 }, reward: 2000 },
    social_influencer: { id: 'social_influencer', title: 'Galaxy Ambassador', description: 'Invite 50 friends', icon: '🌟', category: 'special', requirement: { type: 'total_referrals', value: 50 }, reward: 6000 },
    master_wealth: { id: 'master_wealth', title: 'GP Millionaire', description: 'Accumulate 100,000 GP', icon: '💰', category: 'special', requirement: { type: 'total_gp', value: 100000 }, reward: 5000 },
    master_complete: { id: 'master_complete', title: 'Completionist', description: 'Complete all daily tasks 50 times', icon: '✅', category: 'special', requirement: { type: 'daily_tasks_completed', value: 50 }, reward: 4000 },
    master_ultimate: { id: 'master_ultimate', title: 'Cosmic Champion', description: 'Unlock all other achievements', icon: '🏆', category: 'special', requirement: { type: 'all_achievements', value: 1 }, reward: 10000 }
};

// Achievement Manager Class
class AchievementManager {
    constructor() {
        this.achievements = ACHIEVEMENTS;
    }

    isUnlocked(achievementId, gameState) {
        const achievement = this.achievements[achievementId];
        if (!achievement) return false;

        const { type, value } = achievement.requirement;
        
        switch (type) {
            case 'planets_visited':
                return (gameState.planetsVisited || []).length >= value;
            case 'total_mines':
                return (gameState.totalMines || 0) >= value;
            case 'bosses_defeated':
                return (gameState.bossesDefeated || 0) >= value;
            case 'total_shards':
                return (gameState.totalShardsCollected || 0) >= value;
            case 'level':
                return Math.floor(gameState.gp / 100) + 1 >= value;
            case 'total_upgrades':
                const totalUpgrades = Object.values(gameState.upgrades || {}).reduce((sum, val) => sum + val, 0);
                return totalUpgrades >= value;
            case 'all_upgrades_maxed':
                const upgrades = gameState.upgrades || {};
                return Object.values(upgrades).every(v => v >= value);
            case 'daily_streak':
                return (gameState.dailyStreak || 0) >= value;
            case 'total_referrals':
                return (gameState.totalReferrals || 0) >= value;
            case 'total_gp':
                return (gameState.totalGPEarned || gameState.gp || 0) >= value;
            case 'daily_tasks_completed':
                return (gameState.dailyTasksCompleted || 0) >= value;
            case 'all_achievements':
                const allOthers = Object.keys(this.achievements).filter(id => id !== achievementId);
                return allOthers.every(id => this.isUnlocked(id, gameState));
            case 'all_planets_mined':
                const planetMines = gameState.planetMineCount || {};
                const planets = ['Pyrion', 'Aqueos', 'Voidex', 'Chloros', 'Aurelia', 'Crimson'];
                return planets.every(p => (planetMines[p] || 0) >= value);
            default:
                return false;
        }
    }

    getProgress(achievementId, gameState) {
        const achievement = this.achievements[achievementId];
        if (!achievement) return 0;

        const { type, value } = achievement.requirement;
        let current = 0;

        switch (type) {
            case 'planets_visited':
                current = (gameState.planetsVisited || []).length;
                break;
            case 'total_mines':
                current = gameState.totalMines || 0;
                break;
            case 'bosses_defeated':
                current = gameState.bossesDefeated || 0;
                break;
            case 'total_shards':
                current = gameState.totalShardsCollected || 0;
                break;
            case 'level':
                current = Math.floor(gameState.gp / 100) + 1;
                break;
            case 'total_upgrades':
                current = Object.values(gameState.upgrades || {}).reduce((sum, val) => sum + val, 0);
                break;
            case 'all_upgrades_maxed':
                const upgrades = gameState.upgrades || {};
                const minUpgrade = Math.min(...Object.values(upgrades));
                current = minUpgrade;
                break;
            case 'daily_streak':
                current = gameState.dailyStreak || 0;
                break;
            case 'total_referrals':
                current = gameState.totalReferrals || 0;
                break;
            case 'total_gp':
                current = gameState.totalGPEarned || gameState.gp || 0;
                break;
            case 'daily_tasks_completed':
                current = gameState.dailyTasksCompleted || 0;
                break;
            case 'all_achievements':
                const allOthers = Object.keys(this.achievements).filter(id => id !== achievementId);
                const unlockedOthers = allOthers.filter(id => this.isUnlocked(id, gameState)).length;
                current = unlockedOthers;
                break;
            case 'all_planets_mined':
                const planetMines = gameState.planetMineCount || {};
                const avgMines = Object.values(planetMines).reduce((a, b) => a + b, 0) / 6;
                current = Math.floor(avgMines);
                break;
        }

        return Math.min(100, Math.floor((current / value) * 100));
    }

    getByCategory(category) {
        return Object.values(this.achievements).filter(a => a.category === category);
    }

    getUnlockedAchievements(gameState) {
        return Object.keys(this.achievements).filter(id => 
            this.isUnlocked(id, gameState)
        );
    }

    getStats(gameState) {
        const total = Object.keys(this.achievements).length;
        const unlocked = this.getUnlockedAchievements(gameState).length;
        return {
            total,
            unlocked,
            percentage: Math.floor((unlocked / total) * 100)
        };
    }
}

// Main Tasks Configuration - Social tasks with REAL LOGOS
const MAIN_TASKS = [
    {
        id: 'telegram',
        title: 'Join Telegram Community',
        description: 'Subscribe to our official channel',
        icon: 'telegram',
        reward: 500,
        requirement: { type: 'social_task', value: 1 },
        isSocialTask: true,
        link: 'https://t.me/Cx_Odyssey_Community'
    },
    {
        id: 'twitter',
        title: 'Follow on X (Twitter)',
        description: 'Follow us on X for updates',
        icon: 'twitter',
        reward: 500,
        requirement: { type: 'social_task', value: 1 },
        isSocialTask: true,
        link: 'https://x.com/Cx_Odyssey'
    },
    {
        id: 'reach_level_10',
        title: 'Reach Level 10',
        description: 'Earn enough GP to reach level 10',
        icon: '⭐',
        reward: 500,
        requirement: { type: 'level', value: 10 }
    },
    {
        id: 'collect_10k_shards',
        title: 'Collect 10,000 Shards',
        description: 'Mine and collect a total of 10,000 shards',
        icon: '💎',
        reward: 750,
        requirement: { type: 'total_shards', value: 10000 }
    },
    {
        id: 'defeat_50_bosses',
        title: 'Defeat 50 Bosses',
        description: 'Win 50 boss battles',
        icon: '⚔️',
        reward: 1000,
        requirement: { type: 'bosses_defeated', value: 50 }
    },
    {
        id: 'mine_1000_times',
        title: 'Mine 1,000 Times',
        description: 'Complete 1,000 mining operations',
        icon: '⛏️',
        reward: 800,
        requirement: { type: 'total_mines', value: 1000 }
    },
    {
        id: 'visit_all_planets',
        title: 'Visit All Planets',
        description: 'Explore all 6 planets in the galaxy',
        icon: '🌍',
        reward: 600,
        requirement: { type: 'planets_visited', value: 6 }
    },
    {
        id: 'upgrade_10_times',
        title: 'Purchase 10 Upgrades',
        description: 'Buy a total of 10 upgrade levels',
        icon: '🔧',
        reward: 700,
        requirement: { type: 'total_upgrades', value: 10 }
    },
    {
        id: 'daily_streak_7',
        title: '7 Day Login Streak',
        description: 'Login for 7 consecutive days',
        icon: '📅',
        reward: 900,
        requirement: { type: 'daily_streak', value: 7 }
    },
    {
        id: 'earn_50k_gp',
        title: 'Earn 50,000 GP',
        description: 'Accumulate a total of 50,000 GP',
        icon: '💰',
        reward: 1500,
        requirement: { type: 'total_gp', value: 50000 }
    }
];

// Tasks Manager Class
class TasksManager {
    constructor() {
        this.currentTab = 'tasks';
        this.mainTasks = MAIN_TASKS;
    }

    renderContent() {
        const container = document.getElementById('taskContent');
        if (!container) return;

        if (this.currentTab === 'tasks') {
            container.innerHTML = this.getTasksHTML();
        } else {
            container.innerHTML = this.getMainTasksHTML();
        }

        this.updateTaskStates();
    }

    getTasksHTML() {
        return `
            <div style="padding: 40px 20px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 20px;">📋</div>
                <div style="font-size: 18px; font-weight: 600; color: var(--primary-gold); margin-bottom: 10px;">All Tasks Completed!</div>
                <div style="font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.6;">
                    Check out <strong>Main Tasks</strong> for more challenges and rewards!
                </div>
            </div>
        `;
    }

    getMainTasksHTML() {
        const gameState = window.gameState?.get();
        if (!gameState) return '<div style="padding: 20px; text-align: center; color: rgba(255,255,255,0.7);">Loading...</div>';

        const completedTasks = gameState.oneTimeTasks || {};

        return this.mainTasks.map(task => {
            const isCompleted = completedTasks[task.id] || false;
            const isSocialTask = task.isSocialTask || false;
            const isUnlocked = isSocialTask ? true : this.checkRequirement(task.requirement, gameState);
            const progress = isSocialTask ? 0 : this.getProgress(task.requirement, gameState);

            // Get REAL logos for social tasks
            const getLogo = (iconType) => {
                if (iconType === 'telegram') {
                    return `<svg width="32" height="32" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="tg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#2AABEE;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#229ED9;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <circle cx="120" cy="120" r="120" fill="url(#tg-grad)"/>
                        <path fill="#fff" d="M81.229 128.772l14.237 39.406s1.78 3.687 3.686 3.687 30.255-29.492 30.255-29.492l31.525-60.89L81.737 118.6z"/>
                        <path fill="#d2e5f1" d="M100.106 138.878l-2.733 29.046s-1.144 8.9 7.754 0 17.415-15.763 17.415-15.763"/>
                        <path fill="#b5cfe4" d="M81.486 130.178l-17.8-5.467s-2.133-.905-1.395-2.947c.156-.425.371-.763.927-1.082 5.1-2.913 94.753-35.459 94.753-35.459s3.848-1.47 6.14-.968c.636.14 1.104.396 1.386 1.182.078.218.118.38.137.666.027.42-.006.948-.023 1.468-.135 4.138-3.755 74.635-3.755 74.635s-.214 3.5-3.232 3.66c-.99.052-2.373-.36-4.17-1.346-5.142-2.823-22.678-16.22-25.853-18.868-.85-.71-1.634-2.093.087-3.728 11.95-11.3 26.315-25.13 34.943-33.757 1.81-1.81 3.62-6.046-3.93-.93l-47.69 32.126s-2.593 1.615-7.446.18z"/>
                    </svg>`;
                } else if (iconType === 'twitter') {
                    return `<svg width="32" height="32" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
                        <rect width="300" height="300" rx="60" fill="#000000"/>
                        <path fill="#ffffff" d="M178.57 127.15 290.27 0h-26.46l-97.03 110.38L89.34 0H0l117.13 166.93L0 300.25h26.46l102.4-116.59 81.8 116.59h89.34M36.01 19.54H76.66l187.13 262.13h-40.66"/>
                    </svg>`;
                }
                return `<span style="font-size: 32px;">${iconType}</span>`;
            };

            const taskIconDisplay = isSocialTask ? getLogo(task.icon) : `<span style="font-size: 32px;">${task.icon}</span>`;

            return `
                <div class="task-item" style="opacity: ${isCompleted ? 0.6 : 1};">
                    <div class="task-icon" style="background: linear-gradient(135deg, ${isCompleted ? 'rgba(0,255,136,0.2)' : 'rgba(255,215,0,0.2)'}, rgba(255,107,53,0.1)); display: flex; align-items: center; justify-content: center;">
                        ${taskIconDisplay}
                    </div>
                    <div class="task-info">
                        <div class="task-title">${task.title}</div>
                        <div class="task-desc">${task.description}</div>
                        ${!isCompleted && !isSocialTask ? `
                            <div style="margin-top: 8px;">
                                <div style="width: 100%; height: 4px; background: rgba(0,0,0,0.3); border-radius: 2px; overflow: hidden;">
                                    <div style="height: 100%; background: var(--primary-gold); width: ${progress}%;"></div>
                                </div>
                                <div style="font-size: 10px; color: rgba(255,255,255,0.6); margin-top: 3px;">${progress}% Complete</div>
                            </div>
                        ` : ''}
                    </div>
                    ${isCompleted 
                        ? `<div class="task-reward" style="background: var(--success-green); color: #000;">✅ Claimed</div>`
                        : isSocialTask
                            ? `<button class="task-button" onclick="openSocialTaskModal('${task.id}', '${task.link}', ${task.reward}, '${task.title}')">Start</button>`
                            : isUnlocked
                                ? `<button class="task-button" onclick="claimMainTask('${task.id}')">Claim ${task.reward} GP</button>`
                                : `<div class="task-reward" style="background: rgba(255,215,0,0.2); color: var(--primary-gold);">Locked</div>`
                    }
                </div>
            `;
        }).join('');
    }

    checkRequirement(requirement, gameState) {
        const { type, value } = requirement;
        
        switch (type) {
            case 'social_task':
                return false;
            case 'level':
                return Math.floor(gameState.gp / 100) + 1 >= value;
            case 'total_shards':
                return (gameState.totalShardsCollected || 0) >= value;
            case 'bosses_defeated':
                return (gameState.bossesDefeated || 0) >= value;
            case 'total_mines':
                return (gameState.totalMines || 0) >= value;
            case 'planets_visited':
                return (gameState.planetsVisited || []).length >= value;
            case 'total_upgrades':
                const totalUpgrades = Object.values(gameState.upgrades || {}).reduce((sum, val) => sum + val, 0);
                return totalUpgrades >= value;
            case 'daily_streak':
                return (gameState.dailyStreak || 0) >= value;
            case 'total_gp':
                return (gameState.totalGPEarned || gameState.gp || 0) >= value;
            default:
                return false;
        }
    }

    getProgress(requirement, gameState) {
        const { type, value } = requirement;
        let current = 0;

        switch (type) {
            case 'level':
                current = Math.floor(gameState.gp / 100) + 1;
                break;
            case 'total_shards':
                current = gameState.totalShardsCollected || 0;
                break;
            case 'bosses_defeated':
                current = gameState.bossesDefeated || 0;
                break;
            case 'total_mines':
                current = gameState.totalMines || 0;
                break;
            case 'planets_visited':
                current = (gameState.planetsVisited || []).length;
                break;
            case 'total_upgrades':
                current = Object.values(gameState.upgrades || {}).reduce((sum, val) => sum + val, 0);
                break;
            case 'daily_streak':
                current = gameState.dailyStreak || 0;
                break;
            case 'total_gp':
                current = gameState.totalGPEarned || gameState.gp || 0;
                break;
        }

        return Math.min(100, Math.floor((current / value) * 100));
    }

    updateTaskStates() {
        const gameState = window.gameState?.get();
        if (!gameState) return;
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        const tasksTab = document.getElementById('tasksTab');
        const mainTasksTab = document.getElementById('mainTasksTab');
        
        [tasksTab, mainTasksTab].forEach(t => {
            if (t) t.classList.remove('active');
        });
        
        if (tab === 'tasks' && tasksTab) {
            tasksTab.classList.add('active');
        } else if (tab === 'main' && mainTasksTab) {
            mainTasksTab.classList.add('active');
        }
        
        this.renderContent();
    }
}

// Profile/Command Center Manager
class ProfileManager {
    constructor() {
        this.currentTab = 'referral';
    }

    renderContent() {
        const container = document.getElementById('profileContent');
        if (!container) return;

        switch (this.currentTab) {
            case 'referral':
                container.innerHTML = this.getReferralHTML();
                break;
            case 'achievements':
                container.innerHTML = this.getAchievementsHTML();
                break;
            case 'leaderboard':
                container.innerHTML = this.getLeaderboardHTML();
                this.loadLeaderboardData();
                break;
            case 'wallet':
                container.innerHTML = this.getWalletHTML();
                setTimeout(() => {
                    if (window.walletManager) {
                        window.walletManager.refreshWalletUI();
                    }
                }, 100);
                break;
        }

        setTimeout(() => {
            this.updateProfileData();
        }, 100);
    }

    getReferralHTML() {
        const gameState = window.gameState?.get();
        const totalReferrals = gameState?.totalReferrals || 0;
        const referralEarnings = gameState?.referralEarnings || 0;
        
        const milestones = [1, 3, 5, 10, 25, 50, 100];
        const nextMilestone = milestones.find(m => m > totalReferrals) || 100;
        const progress = totalReferrals >= 100 ? 100 : Math.min(100, (totalReferrals / nextMilestone) * 100);
        
        const getMilestoneReward = (count) => {
            const rewards = { 1: 25, 3: 100, 5: 250, 10: 750, 25: 2000, 50: 5000, 100: 15000 };
            return rewards[count] || 0;
        };
        
        return `
            <div id="referralContent">
                <div style="background: linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 255, 136, 0.05)); border-radius: 25px; padding: 25px; margin: 20px 0; border: 1px solid rgba(0, 255, 136, 0.3);">
                    
                    <div style="background: rgba(0, 0, 0, 0.3); padding: 20px; border-radius: 15px; margin-bottom: 20px; border: 1px solid rgba(0, 255, 136, 0.2);">
                        <div style="text-align: center; margin-bottom: 15px;">
                            <div style="font-size: 14px; color: rgba(255, 255, 255, 0.7); margin-bottom: 5px;">Next Milestone</div>
                            <div style="font-size: 24px; font-weight: bold; color: var(--success-green);">${totalReferrals}/${nextMilestone} Friends</div>
                            <div style="font-size: 12px; color: var(--primary-gold); margin-top: 5px;">+${getMilestoneReward(nextMilestone)} GP Bonus!</div>
                        </div>
                        <div style="width: 100%; height: 12px; background: rgba(0, 0, 0, 0.4); border-radius: 6px; overflow: hidden;">
                            <div style="height: 100%; background: linear-gradient(90deg, var(--success-green), #00CC70); width: ${progress}%; transition: width 0.5s ease;"></div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                        <div style="background: rgba(0, 0, 0, 0.3); padding: 20px; border-radius: 15px; text-align: center; border: 1px solid rgba(0, 255, 136, 0.2);">
                            <div style="font-size: 32px; font-weight: bold; color: var(--success-green);" id="totalReferralsDisplay">${totalReferrals}</div>
                            <div style="font-size: 11px; color: rgba(255, 255, 255, 0.7); margin-top: 5px;">Friends</div>
                        </div>
                        <div style="background: rgba(0, 0, 0, 0.3); padding: 20px; border-radius: 15px; text-align: center; border: 1px solid rgba(0, 255, 136, 0.2);">
                            <div style="font-size: 32px; font-weight: bold; color: var(--primary-gold);" id="referralEarningsDisplay">${referralEarnings}</div>
                            <div style="font-size: 11px; color: rgba(255, 255, 255, 0.7); margin-top: 5px;">GP Earned</div>
                        </div>
                    </div>

                    <div style="text-align: center; margin: 25px 0;">
                        <h3 style="color: var(--success-green); font-size: 22px; margin-bottom: 10px;">Invite Friends & Earn</h3>
                        <p style="color: rgba(255, 255, 255, 0.8); font-size: 14px; line-height: 1.5;">Each friend you invite earns you both rewards!<br>Unlock <strong style="color: var(--primary-gold);">massive bonuses</strong> at milestones!</p>
                    </div>
                    
                    <button style="width: 100%; background: linear-gradient(135deg, var(--success-green), #00CC70); color: #000; border: none; padding: 18px; border-radius: 15px; font-weight: bold; font-size: 16px; cursor: pointer; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);" onclick="shareReferral()">
                        <span style="font-size: 20px;">📤</span>
                        <span>Invite Friends Now</span>
                    </button>

                    <div style="background: rgba(0, 0, 0, 0.3); padding: 18px; border-radius: 15px; margin: 15px 0; border: 1px solid rgba(0, 255, 136, 0.2);">
                        <div style="color: rgba(255, 255, 255, 0.7); font-size: 12px; font-weight: 600; margin-bottom: 10px; text-align: center;">Your Referral Code</div>
                        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0, 0, 0, 0.4); padding: 12px 15px; border-radius: 10px;">
                            <div style="font-family: 'Courier New', monospace; font-weight: bold; font-size: 18px; color: var(--success-green);" id="referralCodeDisplay">Loading...</div>
                            <button style="background: var(--success-green); color: #000; border: none; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: bold; cursor: pointer;" onclick="copyReferralCode()">Copy</button>
                        </div>
                    </div>

                    <div style="margin-top: 25px;">
                        <div style="color: white; font-size: 16px; font-weight: 600; margin-bottom: 12px; padding-left: 5px;">🎁 Milestone Rewards</div>
                        ${this.getMilestoneRewardsHTML(totalReferrals)}
                    </div>

                    <div style="margin-top: 20px; background: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 12px; border: 1px solid rgba(0, 255, 136, 0.1);">
                        <div style="color: var(--success-green); font-size: 13px; font-weight: 600; margin-bottom: 10px;">💡 How Referrals Work</div>
                        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.8); line-height: 1.6;">
                            1️⃣ Share your referral link with friends<br>
                            2️⃣ Your friend joins using your link<br>
                            3️⃣ You both get <strong style="color: var(--primary-gold);">25 GP</strong> instantly!<br>
                            4️⃣ Unlock huge milestone bonuses as you invite more!
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getMilestoneRewardsHTML(currentReferrals) {
        const milestones = [
            { count: 1, reward: 25, emoji: '👥', title: 'First Friend', color: 'var(--success-green)' },
            { count: 3, reward: 100, emoji: '🎯', title: '3 Friends Squad', color: 'var(--neon-blue)' },
            { count: 5, reward: 250, emoji: '🎁', title: '5 Friends Team', color: 'var(--primary-gold)' },
            { count: 10, reward: 750, emoji: '💎', title: '10 Friends Crew', color: 'var(--accent-purple)' },
            { count: 25, reward: 2000, emoji: '👑', title: '25 Friends Elite', color: 'var(--secondary-orange)' },
            { count: 50, reward: 5000, emoji: '🏆', title: '50 Friends Legend', color: '#FF073A' },
            { count: 100, reward: 15000, emoji: '⭐', title: '100 Friends Master', color: '#FFD700' }
        ];

        return milestones.map(m => {
            const isCompleted = currentReferrals >= m.count;
            const isCurrent = !isCompleted && (milestones.find(x => currentReferrals < x.count)?.count === m.count);
            
            return `
                <div class="task-item" style="background: ${isCompleted ? 'rgba(0, 255, 136, 0.1)' : 'rgba(0, 0, 0, 0.2)'}; border: 1px solid ${isCompleted ? 'var(--success-green)' : isCurrent ? m.color : 'rgba(0, 255, 136, 0.2)'}; margin-bottom: 10px; ${isCurrent ? 'box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);' : ''}">
                    <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, ${m.color}, ${m.color}88); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">${m.emoji}</div>
                        <div style="flex: 1;">
                            <div style="font-size: 14px; font-weight: 600; color: white;">${m.title}</div>
                            <div style="font-size: 12px; color: rgba(255, 255, 255, 0.7);">${m.count} friends • ${m.reward.toLocaleString()} GP</div>
                        </div>
                    </div>
                    <div style="background: ${isCompleted ? 'var(--success-green)' : m.color}; color: ${isCompleted ? '#000' : '#fff'}; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: bold;">
                        ${isCompleted ? '✓ Done' : '+' + m.reward.toLocaleString() + ' GP'}
                    </div>
                </div>
            `;
        }).join('');
    }

    getAchievementsHTML() {
        const gameState = window.gameState?.get();
        if (!gameState) {
            return '<div style="padding: 20px; text-align: center; color: rgba(255,255,255,0.7);">Loading game state...</div>';
        }
        
        const achievementManager = new AchievementManager();
        const stats = achievementManager.getStats(gameState);
        
        const categories = [
            { id: 'exploration', name: 'Exploration', icon: '🌍' },
            { id: 'mining', name: 'Mining', icon: '⛏️' },
            { id: 'combat', name: 'Combat', icon: '⚔️' },
            { id: 'collection', name: 'Collection', icon: '💎' },
            { id: 'progression', name: 'Progression', icon: '⭐' },
            { id: 'upgrades', name: 'Upgrades', icon: '🔧' },
            { id: 'special', name: 'Special', icon: '🏆' }
        ];

        let html = `
            <div id="achievementsContent">
                <div style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 107, 53, 0.05)); border-radius: 25px; padding: 25px; margin: 20px 0; border: 1px solid rgba(255, 215, 0, 0.3);">
                    
                    <div style="text-align: center; margin-bottom: 25px;">
                        <h3 style="color: var(--primary-gold); font-size: 20px; margin-bottom: 15px;">Your Achievements</h3>
                        <div style="display: flex; justify-content: center; align-items: center; gap: 15px; margin-bottom: 10px;">
                            <div style="font-size: 48px; font-weight: bold; color: var(--primary-gold);">${stats.unlocked}</div>
                            <div style="font-size: 24px; color: rgba(255, 255, 255, 0.5);">/</div>
                            <div style="font-size: 32px; color: rgba(255, 255, 255, 0.7);">${stats.total}</div>
                        </div>
                        <div style="font-size: 14px; color: rgba(255, 255, 255, 0.8);">${stats.percentage}% Complete</div>
                        
                        <div style="width: 100%; height: 8px; background: rgba(0, 0, 0, 0.3); border-radius: 4px; margin-top: 15px; overflow: hidden;">
                            <div style="height: 100%; background: linear-gradient(90deg, var(--primary-gold), var(--secondary-orange)); width: ${stats.percentage}%; transition: width 0.5s ease;"></div>
                        </div>
                    </div>
        `;

        categories.forEach(category => {
            const achievements = achievementManager.getByCategory(category.id);
            const categoryUnlocked = achievements.filter(a => achievementManager.isUnlocked(a.id, gameState)).length;
            
            html += `
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding: 0 5px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 20px;">${category.icon}</span>
                            <span style="font-size: 16px; font-weight: 600; color: white;">${category.name}</span>
                        </div>
                        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6);">${categoryUnlocked}/${achievements.length}</div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px;">
            `;

            achievements.forEach(achievement => {
                const unlockedList = gameState.unlockedAchievements || [];
                const isUnlocked = unlockedList.includes(achievement.id);
                const progress = achievementManager.getProgress(achievement.id, gameState);
                
                html += `
                    <div style="background: ${isUnlocked ? 'rgba(255, 215, 0, 0.15)' : 'rgba(0, 0, 0, 0.3)'}; border: 1px solid ${isUnlocked ? 'var(--primary-gold)' : 'rgba(255, 255, 255, 0.1)'}; border-radius: 12px; padding: 12px; text-align: center; position: relative; ${isUnlocked ? '' : 'opacity: 0.6;'}">
                        <div style="font-size: 32px; margin-bottom: 8px; ${isUnlocked ? '' : 'filter: grayscale(100%);'}">${achievement.icon}</div>
                        <div style="font-size: 12px; font-weight: 600; color: ${isUnlocked ? 'var(--primary-gold)' : 'rgba(255, 255, 255, 0.8)'}; margin-bottom: 4px;">${achievement.title}</div>
                        <div style="font-size: 10px; color: rgba(255, 255, 255, 0.6); margin-bottom: 8px; line-height: 1.3;">${achievement.description}</div>
                        
                        ${isUnlocked ? `
                            <div style="background: var(--success-green); color: #000; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: bold;">
                                +${achievement.reward} GP
                            </div>
                        ` : `
                            <div style="width: 100%; height: 4px; background: rgba(0, 0, 0, 0.3); border-radius: 2px; overflow: hidden; margin-top: 4px;">
                                <div style="height: 100%; background: var(--primary-gold); width: ${progress}%;"></div>
                            </div>
                            <div style="font-size: 9px; color: rgba(255, 255, 255, 0.5); margin-top: 4px;">${progress}%</div>
                        `}
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        return html;
    }

    getLeaderboardHTML() {
        return `
            <div id="leaderboardContent">
                <div style="background: linear-gradient(135deg, rgba(114, 9, 183, 0.15), rgba(74, 20, 140, 0.05)); border-radius: 25px; padding: 25px; margin: 20px 0; border: 1px solid rgba(114, 9, 183, 0.3);">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h3 style="color: var(--accent-purple); font-size: 20px; margin-bottom: 8px;">Top Collectors</h3>
                        <p style="color: rgba(255, 255, 255, 0.8); font-size: 14px;">Compete with other players</p>
                    </div>
                    
                    <div id="leaderboardEntries">
                        <div class="task-item">
                            <div style="color: var(--accent-purple); font-size: 16px;">👑 Loading...</div>
                            <div style="font-weight: 700; color: var(--accent-purple); font-size: 14px;">0 GP</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getWalletHTML() {
        return `
            <div id="walletContent">
                <div style="background: linear-gradient(135deg, rgba(0, 245, 255, 0.15), rgba(0, 145, 234, 0.05)); border-radius: 25px; padding: 25px; margin: 20px 0; border: 1px solid rgba(0, 245, 255, 0.3);">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h3 style="color: var(--neon-blue); font-size: 20px; margin-bottom: 8px;">TON Wallet</h3>
                        <p style="color: rgba(255, 255, 255, 0.8); font-size: 14px;">Connect wallet for premium purchases</p>
                    </div>
                    
                    <button style="width: 100%; background: linear-gradient(135deg, var(--neon-blue), #0091EA); color: #000; border: none; padding: 15px; border-radius: 15px; font-weight: bold; font-size: 15px; cursor: pointer; margin-bottom: 15px;" onclick="connectWallet()" id="connectWalletBtn">
                        🔗 Connect Wallet
                    </button>
                    
                    <div id="walletInfo" style="display: none; text-align: center;">
                        <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 15px; margin: 15px 0;">
                            <div style="color: var(--neon-blue); font-size: 12px; font-weight: 600; margin-bottom: 8px;">Connected Wallet</div>
                            <div style="word-break: break-all; font-family: monospace; font-size: 13px; color: white;" id="connectedAddress"></div>
                        </div>
                        <button style="width: 100%; background: var(--danger-red); color: white; border: none; padding: 12px; border-radius: 15px; font-weight: bold; font-size: 14px; cursor: pointer;" onclick="disconnectWallet()">
                            Disconnect Wallet
                        </button>
                    </div>
                    
                    <div style="background: rgba(0, 0, 0, 0.2); padding: 20px; border-radius: 15px; margin-top: 20px; text-align: center;">
                        <div style="color: var(--neon-blue); font-size: 14px; font-weight: 600; margin-bottom: 12px;">Premium Items (TON)</div>
                        <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
                            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 8px; background: rgba(0, 245, 255, 0.1); border-radius: 8px;">
                                <span style="font-size: 16px;">🤖</span>
                                <span style="font-size: 12px; color: rgba(255, 255, 255, 0.9);">Auto Miner (1 TON)</span>
                            </div>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 8px; background: rgba(0, 245, 255, 0.1); border-radius: 8px;">
                                <span style="font-size: 16px;">👑</span>
                                <span style="font-size: 12px; color: rgba(255, 255, 255, 0.9);">VIP Pass (2 TON)</span>
                            </div>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 8px; background: rgba(0, 245, 255, 0.1); border-radius: 8px;">
                                <span style="font-size: 16px;">🛸</span>
                                <span style="font-size: 12px; color: rgba(255, 255, 255, 0.9);">Legendary Ship (5 TON)</span>
                            </div>
                        </div>
                        <div style="margin-top: 12px; font-size: 11px; color: rgba(255,255,255,0.6);">Visit Shop → Premium to purchase</div>
                    </div>
                </div>
            </div>
        `;
    }

    updateProfileData() {
        const gameState = window.gameState?.get();
        if (!gameState) return;

        const referralCodeEl = document.getElementById('referralCodeDisplay');
        const totalReferralsEl = document.getElementById('totalReferralsDisplay');
        const referralEarningsEl = document.getElementById('referralEarningsDisplay');

        if (referralCodeEl) referralCodeEl.textContent = gameState.referralCode || 'Loading...';
        if (totalReferralsEl) totalReferralsEl.textContent = gameState.totalReferrals;
        if (referralEarningsEl) referralEarningsEl.textContent = gameState.referralEarnings;
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        const referralTab = document.getElementById('referralTab');
        const achievementsTab = document.getElementById('achievementsTab');
        const leaderboardTab = document.getElementById('leaderboardTab');
        const walletTab = document.getElementById('walletTab');
        
        [referralTab, achievementsTab, leaderboardTab, walletTab].forEach(t => {
            if (t) {
                t.classList.remove('active');
                t.style.background = 'transparent';
                t.style.color = 'rgba(255, 255, 255, 0.6)';
            }
        });
        
        if (tab === 'referral' && referralTab) {
            referralTab.classList.add('active');
            referralTab.style.background = 'linear-gradient(135deg, var(--success-green), #00CC70)';
            referralTab.style.color = '#000';
        } else if (tab === 'achievements' && achievementsTab) {
            achievementsTab.classList.add('active');
            achievementsTab.style.background = 'linear-gradient(135deg, var(--primary-gold), var(--secondary-orange))';
            achievementsTab.style.color = '#000';
        } else if (tab === 'leaderboard' && leaderboardTab) {
            leaderboardTab.classList.add('active');
            leaderboardTab.style.background = 'linear-gradient(135deg, var(--accent-purple), #5A0F8C)';
            leaderboardTab.style.color = 'white';
        } else if (tab === 'wallet' && walletTab) {
            walletTab.classList.add('active');
            walletTab.style.background = 'linear-gradient(135deg, var(--neon-blue), #0091EA)';
            walletTab.style.color = '#000';
        }
        
        this.renderContent();
    }

    loadLeaderboardData() {
        if (window.uiController) {
            window.uiController.loadLeaderboard();
        }
    }
}

// Minigames Manager
class MinigamesManager {
    constructor() {
        this.currentComboIndex = 0;
    }

    inputComboDigit(digit) {
        const gameState = window.gameState?.get();
        if (!gameState || gameState.dailyCombo.completed || gameState.dailyCombo.attempts <= 0) return;
        
        const inputs = ['combo1', 'combo2', 'combo3', 'combo4'];
        const currentInput = document.getElementById(inputs[this.currentComboIndex]);
        
        if (currentInput) {
            currentInput.value = digit;
            this.currentComboIndex = (this.currentComboIndex + 1) % 4;
        }
    }

    clearCombo() {
        ['combo1', 'combo2', 'combo3', 'combo4'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        this.currentComboIndex = 0;
    }

    submitCombo() {
        const gameState = window.gameState;
        if (!gameState) return;

        const state = gameState.get();
        if (state.dailyCombo.completed || state.dailyCombo.attempts <= 0) {
            if (window.uiController) {
                window.uiController.showNotification('No attempts remaining!');
            }
            return;
        }
        
        const guess = ['combo1', 'combo2', 'combo3', 'combo4']
            .map(id => document.getElementById(id)?.value || '')
            .join('');
        
        if (guess.length !== 4) {
            if (window.uiController) {
                window.uiController.showNotification('Please enter a complete 4-digit code!');
            }
            return;
        }
        
        gameState.update({
            dailyCombo: {
                ...state.dailyCombo,
                attempts: state.dailyCombo.attempts - 1
            },
            dailyTaskProgress: {
                ...state.dailyTaskProgress,
                comboAttempts: state.dailyTaskProgress.comboAttempts + 1
            }
        });
        
        if (!state.dailyTasks.combo) {
            gameState.update({
                dailyTasks: {
                    ...state.dailyTasks,
                    combo: true
                },
                gp: state.gp + 30
            });
            
            if (window.uiController) {
                window.uiController.showNotification('Daily combo task completed! +30 GP!');
            }
        }
        
        const newState = gameState.get();
        
        if (guess === newState.dailyCombo.code) {
            gameState.update({
                dailyCombo: {
                    ...newState.dailyCombo,
                    completed: true
                },
                gp: newState.gp + 100
            });
            
            if (window.uiController) {
                window.uiController.showNotification('Correct! You earned 100 GP!');
            }
            this.clearCombo();
        } else {
            if (newState.dailyCombo.attempts > 0) {
                if (window.uiController) {
                    window.uiController.showNotification(`Wrong code! ${newState.dailyCombo.attempts} attempts remaining.`);
                }
            } else {
                if (window.uiController) {
                    window.uiController.showNotification(`Game over! The code was ${newState.dailyCombo.code}.`);
                }
            }
            this.clearCombo();
        }
        
        this.updateComboUI();
    }

    updateComboUI() {
        const gameState = window.gameState?.get();
        if (!gameState) return;

        const attemptsEl = document.getElementById('comboAttempts');
        if (attemptsEl) {
            attemptsEl.textContent = gameState.dailyCombo.attempts;
        }
    }
}

// FIXED: Daily Rewards Modal
function showDailyRewardsModal() {
    const gameState = window.gameState;
    if (!gameState) return;
    
    const state = gameState.get();
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'dailyRewardsModal';
    
    const streakRewards = [
        { day: 1, gp: 100, tickets: 0 },
        { day: 2, gp: 200, tickets: 0 },
        { day: 3, gp: 300, tickets: 1 },
        { day: 4, gp: 500, tickets: 0 },
        { day: 5, gp: 700, tickets: 1 },
        { day: 6, gp: 1000, tickets: 2 },
        { day: 7, gp: 1500, tickets: 3 }
    ];
    
    const currentStreak = Math.min(state.dailyStreak || 1, 7);
    const today = new Date().toISOString().split('T')[0];
    const lastClaim = state.lastDailyClaim || '';
    const canClaim = lastClaim !== today;
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-btn" onclick="closeDailyRewardsModal()">&times;</button>
            <h2 class="modal-title">📅 Daily Rewards</h2>
            <div style="font-size: 14px; margin-bottom: 20px; color: rgba(255,255,255,0.9);">
                Current Streak: <strong style="color: var(--primary-gold);">${currentStreak} ${currentStreak === 1 ? 'Day' : 'Days'}</strong>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 20px 0;">
                ${streakRewards.map(r => `
                    <div style="
                        padding: 15px;
                        background: ${r.day === currentStreak && canClaim 
                            ? 'linear-gradient(135deg, rgba(255,215,0,0.3), rgba(255,107,53,0.2))' 
                            : r.day < currentStreak 
                                ? 'rgba(0,255,136,0.1)' 
                                : 'rgba(255,255,255,0.05)'};
                        border: 2px solid ${r.day === currentStreak && canClaim 
                            ? 'var(--primary-gold)' 
                            : r.day < currentStreak 
                                ? 'var(--success-green)' 
                                : 'rgba(255,255,255,0.1)'};
                        border-radius: 12px;
                        text-align: center;
                    ">
                        <div style="font-size: 11px; opacity: 0.8; margin-bottom: 5px;">Day ${r.day}</div>
                        <div style="font-size: 14px; font-weight: bold; color: var(--primary-gold);">
                            ${r.gp} GP
                        </div>
                        ${r.tickets > 0 ? `<div style="font-size: 11px; color: var(--success-green);">+${r.tickets} 🎫</div>` : ''}
                        ${r.day < currentStreak ? '<div style="margin-top: 5px;">✅</div>' : ''}
                        ${r.day === currentStreak && canClaim ? '<div style="margin-top: 5px;">⭐</div>' : ''}
                    </div>
                `).join('')}
            </div>
            
            ${canClaim ? `
                <button class="action-btn" onclick="claimDailyReward()" style="width: 100%; background: linear-gradient(135deg, var(--primary-gold), var(--secondary-orange));">
                    🎁 Claim Day ${currentStreak} Reward
                </button>
            ` : `
                <div style="padding: 15px; background: rgba(255,215,0,0.1); border-radius: 12px; border: 1px solid rgba(255,215,0,0.3); text-align: center;">
                    <div style="font-size: 13px; color: rgba(255,255,255,0.8);">✅ Already claimed today!</div>
                    <div style="font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 5px;">Come back tomorrow for Day ${Math.min(currentStreak + 1, 7)}</div>
                </div>
            `}
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeDailyRewardsModal() {
    const modal = document.getElementById('dailyRewardsModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

function claimDailyReward() {
    const gameState = window.gameState;
    if (!gameState) return;
    
    const state = gameState.get();
    const streakRewards = [
        { day: 1, gp: 100, tickets: 0 },
        { day: 2, gp: 200, tickets: 0 },
        { day: 3, gp: 300, tickets: 1 },
        { day: 4, gp: 500, tickets: 0 },
        { day: 5, gp: 700, tickets: 1 },
        { day: 6, gp: 1000, tickets: 2 },
        { day: 7, gp: 1500, tickets: 3 }
    ];
    
    const currentStreak = Math.min(state.dailyStreak || 1, 7);
    const reward = streakRewards[currentStreak - 1];
    const today = new Date().toISOString().split('T')[0];
    
    gameState.update({
        gp: state.gp + reward.gp,
        gameTickets: Math.min(10, state.gameTickets + reward.tickets),
        lastDailyClaim: today,
        dailyStreak: currentStreak === 7 ? 1 : currentStreak + 1,
        totalGPEarned: (state.totalGPEarned || state.gp) + reward.gp,
        dailyTasks: {
            ...state.dailyTasks,
            login: true
        }
    });
    
    if (window.showNotification) {
        window.showNotification(`🎁 Claimed! +${reward.gp} GP${reward.tickets > 0 ? ` +${reward.tickets} 🎫` : ''}`);
    }
    
    if (window.backendManager) {
        window.backendManager.saveProgress(gameState.get());
    }
    
    if (window.uiController) {
        window.uiController.updateUIElements(gameState.get());
    }
    
    closeDailyRewardsModal();
}

// Social Task Modal with Verification
let socialTaskTimers = {};

function openSocialTaskModal(taskId, link, reward, title) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'socialTaskModal';
    
    const isTelegram = taskId === 'telegram';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <button class="close-btn" onclick="closeSocialTaskModal()">&times;</button>
            <h2 class="modal-title" style="font-size: 20px; margin-bottom: 15px;">${title}</h2>
            <div style="font-size: 80px; margin: 20px 0;">${isTelegram ? '📱' : '✖️'}</div>
            <p style="font-size: 14px; margin-bottom: 20px;">Complete this task to earn <strong style="color: var(--primary-gold);">${reward} GP</strong></p>
            
            <div style="margin: 20px 0; padding: 15px; background: rgba(255,215,0,0.1); border-radius: 12px; border: 1px solid rgba(255,215,0,0.3);">
                <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 10px;">📋 Steps:</div>
                <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                    1️⃣ Click "Open" below<br>
                    2️⃣ ${isTelegram ? 'Join the channel' : 'Follow the account'}<br>
                    3️⃣ Return and click "Check"
                </div>
            </div>
            
            <button class="action-btn" id="socialOpenBtn" onclick="handleSocialTaskStep1('${taskId}', '${link}')" style="width: 100%; margin-bottom: 10px; background: linear-gradient(135deg, ${isTelegram ? '#2AABEE, #229ED9' : '#000, #333'});">
                🔗 Open ${isTelegram ? 'Telegram' : 'X'}
            </button>
            
            <button class="action-btn" id="socialCheckBtn" onclick="handleSocialTaskStep2('${taskId}', ${reward}, ${isTelegram})" style="width: 100%; background: var(--success-green); color: #000; display: none;">
                ✅ Check
            </button>
            
            <div id="socialTimer" style="display: none; text-align: center; padding: 15px; background: rgba(255,107,53,0.1); border-radius: 12px; margin-top: 10px; border: 1px solid var(--secondary-orange);">
                <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 5px;">Please wait...</div>
                <div style="font-size: 18px; font-weight: bold; color: var(--secondary-orange);" id="socialTimerText">5</div>
                <div style="font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 5px;">Verifying task completion</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function handleSocialTaskStep1(taskId, link) {
    window.open(link, '_blank');
    
    const openBtn = document.getElementById('socialOpenBtn');
    const checkBtn = document.getElementById('socialCheckBtn');
    
    if (openBtn) openBtn.style.display = 'none';
    if (checkBtn) checkBtn.style.display = 'block';
}

function handleSocialTaskStep2(taskId, reward, needsVerification) {
    const checkBtn = document.getElementById('socialCheckBtn');
    const timerDiv = document.getElementById('socialTimer');
    const timerText = document.getElementById('socialTimerText');
    
    if (checkBtn) checkBtn.style.display = 'none';
    if (timerDiv) timerDiv.style.display = 'block';
    
    let timeLeft = needsVerification ? 5 : 3;
    if (timerText) timerText.textContent = timeLeft;
    
    const timer = setInterval(() => {
        timeLeft--;
        if (timerText) timerText.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            completeSocialTask(taskId, reward);
        }
    }, 1000);
    
    socialTaskTimers[taskId] = timer;
}

function completeSocialTask(taskId, reward) {
    const gameState = window.gameState;
    if (!gameState) return;
    
    const currentTasks = gameState.getValue('oneTimeTasks') || {};
    currentTasks[taskId] = true;
    
    gameState.update({
        oneTimeTasks: currentTasks,
        gp: gameState.getValue('gp') + reward,
        totalGPEarned: (gameState.getValue('totalGPEarned') || gameState.getValue('gp')) + reward
    });
    
    if (window.showNotification) {
        window.showNotification(`✅ Task completed! +${reward} GP`);
    }
    
    if (window.backendManager) {
        window.backendManager.saveProgress(gameState.get());
    }
    
    closeSocialTaskModal();
    if (window.TasksManager) {
        window.TasksManager.renderContent();
    }
}

function closeSocialTaskModal() {
    const modal = document.getElementById('socialTaskModal');
    if (modal) {
        Object.values(socialTaskTimers).forEach(timer => clearInterval(timer));
        socialTaskTimers = {};
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// Main Task Claim Function
function claimMainTask(taskId) {
    const gameState = window.gameState;
    if (!gameState) return;
    
    const state = gameState.get();
    const task = MAIN_TASKS.find(t => t.id === taskId);
    
    if (!task) return;
    
    const completedTasks = state.oneTimeTasks || {};
    if (completedTasks[taskId]) {
        if (window.showNotification) {
            window.showNotification('Task already completed!');
        }
        return;
    }
    
    const taskManager = new TasksManager();
    const isUnlocked = taskManager.checkRequirement(task.requirement, state);
    
    if (!isUnlocked) {
        if (window.showNotification) {
            window.showNotification('Task requirements not met!');
        }
        return;
    }
    
    completedTasks[taskId] = true;
    
    gameState.update({
        oneTimeTasks: completedTasks,
        gp: state.gp + task.reward,
        totalGPEarned: (state.totalGPEarned || state.gp) + task.reward
    });
    
    if (window.showNotification) {
        window.showNotification(`${task.icon} ${task.title} completed! +${task.reward} GP`);
    }
    
    if (window.backendManager) {
        window.backendManager.saveProgress(gameState.get());
    }
    
    if (window.TasksManager) {
        window.TasksManager.renderContent();
    }
}

// Referral Functions
function shareReferral() {
    const gameState = window.gameState?.get();
    if (!gameState || !gameState.referralCode) {
        if (window.uiController) {
            window.uiController.showNotification('Referral code not ready!');
        }
        return;
    }

    const botUsername = 'Cx_odyssey_bot';
    const directLink = `https://t.me/${botUsername}/app?startapp=${gameState.referralCode}`;
    
    const referralText = `🚀 Join me in CX Odyssey and explore the galaxy!

🎁 Use my referral code: ${gameState.referralCode}
⚡ We both get 25 GP instantly!
💎 Plus unlock massive milestone bonuses!

Start your space adventure now!`;
    
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(directLink)}&text=${encodeURIComponent(referralText)}`;
    
    const gameInit = window.gameInitializer;
    
    if (gameInit?.tg && gameInit.tg.openTelegramLink) {
        gameInit.tg.openTelegramLink(shareUrl);
    } else if (navigator.share) {
        navigator.share({
            title: 'CX Odyssey - Join Me!',
            text: referralText,
            url: directLink
        }).catch(() => {
            window.open(shareUrl, '_blank');
        });
    } else {
        window.open(shareUrl, '_blank');
    }
    
    if (window.uiController) {
        window.uiController.showNotification('Share with friends to earn rewards!');
    }
}

function copyReferralCode() {
    const gameState = window.gameState?.get();
    if (!gameState) return;

    const code = gameState.referralCode;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(() => {
            if (window.uiController) {
                window.uiController.showNotification('Referral code copied!');
            }
        }).catch(() => {
            fallbackCopyTextToClipboard(code);
        });
    } else {
        fallbackCopyTextToClipboard(code);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        if (window.uiController) {
            window.uiController.showNotification('Referral code copied!');
        }
    } catch (err) {
        if (window.uiController) {
            window.uiController.showNotification('Copy failed. Code: ' + text);
        }
    }
    
    document.body.removeChild(textArea);
}

// Initialize global instances
window.TasksManager = new TasksManager();
window.ProfileManager = new ProfileManager();
window.MinigamesManager = new MinigamesManager();
window.AchievementManager = AchievementManager;

// Global task functions
function switchTaskTab(tab) {
    window.TasksManager?.switchTab(tab);
}

function switchProfileTab(tab) {
    window.ProfileManager?.switchTab(tab);
}

function claimDailyTask(taskType) {
    const success = window.gameState?.claimDailyTask(taskType);
    if (success && window.TasksManager) {
        window.TasksManager.updateTaskStates();
    }
}

function claimOneTimeTask(taskType) {
    const success = window.gameState?.claimOneTimeTask(taskType);
    if (success && window.TasksManager) {
        window.TasksManager.updateTaskStates();
    }
}

function inputComboDigit(digit) {
    window.MinigamesManager?.inputComboDigit(digit);
}

function clearCombo() {
    window.MinigamesManager?.clearCombo();
}

function submitCombo() {
    window.MinigamesManager?.submitCombo();
}

// Initialize tasks on load
function initializeTasks() {
    console.log('📋 Initializing tasks...');
    if (window.TasksManager) {
        window.TasksManager.renderContent();
    }
}

// Export functions
if (typeof window !== 'undefined') {
    window.initializeTasks = initializeTasks;
    window.switchTaskTab = switchTaskTab;
    window.switchProfileTab = switchProfileTab;
    window.showDailyRewardsModal = showDailyRewardsModal;
    window.closeDailyRewardsModal = closeDailyRewardsModal;
    window.claimDailyReward = claimDailyReward;
    window.openSocialTaskModal = openSocialTaskModal;
    window.closeSocialTaskModal = closeSocialTaskModal;
    window.handleSocialTaskStep1 = handleSocialTaskStep1;
    window.handleSocialTaskStep2 = handleSocialTaskStep2;
    window.completeSocialTask = completeSocialTask;
    window.shareReferral = shareReferral;
    window.copyReferralCode = copyReferralCode;
    window.claimDailyTask = claimDailyTask;
    window.claimOneTimeTask = claimOneTimeTask;
    window.claimMainTask = claimMainTask;
    window.inputComboDigit = inputComboDigit;
    window.clearCombo = clearCombo;
    window.submitCombo = submitCombo;
}

console.log('✅ Tasks.js loaded successfully');
