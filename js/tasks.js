// tasks.js - Complete File with Balanced Achievements

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
                value = allOthers.length;
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

// Tasks System
class TasksManager {
    constructor() {
        this.currentTab = 'daily';
    }

    renderContent() {
        const container = document.getElementById('taskContent');
        if (!container) return;

        if (this.currentTab === 'daily') {
            container.innerHTML = this.getDailyTasksHTML();
        } else {
            container.innerHTML = this.getOneTimeTasksHTML();
        }

        this.updateTaskStates();
    }

    getDailyTasksHTML() {
        return `
            <div id="dailyTasksContent">
                <div class="task-item">
                    <div class="task-icon" style="background: linear-gradient(135deg, var(--primary-gold), var(--secondary-orange));">📅</div>
                    <div class="task-info">
                        <div class="task-title">Daily reward</div>
                        <div class="task-desc">Log in daily</div>
                    </div>
                    <div class="task-reward" id="dailyLoginStatus">Completed</div>
                </div>

                <div class="task-item">
                    <div class="task-icon" style="background: linear-gradient(135deg, #FF6B35, #D84315);">⛏️</div>
                    <div class="task-info">
                        <div class="task-title">Mine crystals</div>
                        <div class="task-desc">Mine 10 times (<span id="dailyMineCount">0</span>/10)</div>
                    </div>
                    <button class="task-button" id="dailyMineBtn" onclick="claimDailyTask('mine')" disabled>+50 GP</button>
                </div>

                <div class="task-item">
                    <div class="task-icon" style="background: linear-gradient(135deg, #9C27B0, #6A1B9A);">⚔️</div>
                    <div class="task-info">
                        <div class="task-title">Battle cosmic overlord</div>
                        <div class="task-desc">Attack boss 3 times (<span id="dailyBossCount">0</span>/3)</div>
                    </div>
                    <button class="task-button" id="dailyBossBtn" onclick="claimDailyTask('boss')" disabled>+75 GP</button>
                </div>

                <div class="task-item">
                    <div class="task-icon" style="background: linear-gradient(135deg, #7209B7, #4A148C);">🔮</div>
                    <div class="task-info">
                        <div class="task-title">Code puzzle</div>
                        <div class="task-desc">Try the daily combo</div>
                    </div>
                    <button class="task-button" id="dailyComboBtn" onclick="claimDailyTask('combo')" disabled>+30 GP</button>
                </div>
            </div>
        `;
    }

    getOneTimeTasksHTML() {
        return `
            <div id="oneTimeTasksContent">
                <div class="task-item">
                    <div class="task-icon" style="background: linear-gradient(135deg, #FF6B35, #D84315);">🚀</div>
                    <div class="task-info">
                        <div class="task-title">First exploration</div>
                        <div class="task-desc">Visit any planet for mining</div>
                    </div>
                    <button class="task-button" id="firstPlanetBtn" onclick="claimOneTimeTask('planet')" disabled>+20 GP</button>
                </div>

                <div class="task-item">
                    <div class="task-icon" style="background: linear-gradient(135deg, #4CAF50, #2E7D32);">💰</div>
                    <div class="task-info">
                        <div class="task-title">First upgrade</div>
                        <div class="task-desc">Buy any upgrade from shop</div>
                    </div>
                    <button class="task-button" id="firstPurchaseBtn" onclick="claimOneTimeTask('purchase')" disabled>+40 GP</button>
                </div>

                <div class="task-item">
                    <div class="task-icon" style="background: linear-gradient(135deg, #00F5FF, #0091EA);">💎</div>
                    <div class="task-info">
                        <div class="task-title">Crystal collector</div>
                        <div class="task-desc">Collect 100 shards (<span id="oneTimeShardCount">0</span>/100)</div>
                    </div>
                    <button class="task-button" id="shards100Btn" onclick="claimOneTimeTask('shards100')" disabled>+80 GP</button>
                </div>

                <div class="task-item">
                    <div class="task-icon" style="background: linear-gradient(135deg, #E91E63, #AD1457);">👥</div>
                    <div class="task-info">
                        <div class="task-title">Invite friends</div>
                        <div class="task-desc">Refer 5 friends to game (<span id="referralCount">0</span>/5)</div>
                    </div>
                    <button class="task-button" id="invite5Btn" onclick="claimOneTimeTask('invite5')" disabled>+200 GP</button>
                </div>
            </div>
        `;
    }

    updateTaskStates() {
        const gameState = window.gameState?.get();
        if (!gameState) return;

        this.updateElement('dailyMineCount', gameState.dailyTaskProgress.mines);
        this.updateElement('dailyBossCount', gameState.dailyTaskProgress.bossBattles);
        this.updateElement('oneTimeShardCount', gameState.shards);
        this.updateElement('referralCount', gameState.totalReferrals);
        
        this.updateTaskButton('dailyMineBtn', gameState.dailyTaskProgress.mines >= 10 && !gameState.dailyTasks.mine);
        this.updateTaskButton('dailyBossBtn', gameState.dailyTaskProgress.bossBattles >= 3 && !gameState.dailyTasks.boss);
        this.updateTaskButton('dailyComboBtn', gameState.dailyTaskProgress.comboAttempts > 0 && !gameState.dailyTasks.combo);
        
        this.updateTaskButton('firstPlanetBtn', gameState.oneTimeTasks.planet, true);
        this.updateTaskButton('firstPurchaseBtn', gameState.oneTimeTasks.purchase, true);
        this.updateTaskButton('shards100Btn', gameState.shards >= 100 && !gameState.oneTimeTasks.shards100);
        this.updateTaskButton('invite5Btn', gameState.totalReferrals >= 5 && !gameState.oneTimeTasks.invite5);
        
        const loginStatus = document.getElementById('dailyLoginStatus');
        if (loginStatus) {
            loginStatus.textContent = gameState.dailyTasks.login ? 'Completed' : '+25 GP';
            if (gameState.dailyTasks.login) {
                loginStatus.className = 'task-reward';
            }
        }
    }

    updateElement(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    updateTaskButton(btnId, condition, isCompleted = false) {
        const btn = document.getElementById(btnId);
        if (btn) {
            if (isCompleted) {
                btn.disabled = true;
                btn.textContent = 'Completed';
                btn.style.background = 'var(--success-green)';
            } else {
                btn.disabled = !condition;
            }
        }
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        const dailyTab = document.getElementById('dailyTasksTab');
        const oneTimeTab = document.getElementById('oneTimeTasksTab');
        
        if (tab === 'daily') {
            dailyTab.classList.add('active');
            oneTimeTab.classList.remove('active');
        } else {
            oneTimeTab.classList.add('active');
            dailyTab.classList.remove('active');
        }
        
        this.renderContent();
    }
}

// Profile/Command Center System
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
                const isUnlocked = achievementManager.isUnlocked(achievement.id, gameState);
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
                        <p style="color: rgba(255, 255, 255, 0.8); font-size: 14px;">Connect wallet for future airdrops</p>
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
                        <div style="color: var(--neon-blue); font-size: 14px; font-weight: 600; margin-bottom: 12px;">Future Features</div>
                        <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
                            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 8px; background: rgba(0, 245, 255, 0.1); border-radius: 8px;">
                                <span style="font-size: 16px;">🚀</span>
                                <span style="font-size: 12px; color: rgba(255, 255, 255, 0.9);">CX Token Airdrops</span>
                            </div>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 8px; background: rgba(0, 245, 255, 0.1); border-radius: 8px;">
                                <span style="font-size: 16px;">💰</span>
                                <span style="font-size: 12px; color: rgba(255, 255, 255, 0.9);">NFT Rewards</span>
                            </div>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 8px; background: rgba(0, 245, 255, 0.1); border-radius: 8px;">
                                <span style="font-size: 16px;">🎮</span>
                                <span style="font-size: 12px; color: rgba(255, 255, 255, 0.9);">Exclusive Items</span>
                            </div>
                        </div>
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
                window.uiController.showNotification('🔮 No attempts remaining!');
            }
            return;
        }
        
        const guess = ['combo1', 'combo2', 'combo3', 'combo4']
            .map(id => document.getElementById(id)?.value || '')
            .join('');
        
        if (guess.length !== 4) {
            if (window.uiController) {
                window.uiController.showNotification('🔮 Please enter a complete 4-digit code!');
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
                window.uiController.showNotification('✅ Daily combo task completed! +30 GP!');
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
                window.uiController.showNotification('🎉 Correct! You earned 100 GP!');
            }
            this.clearCombo();
        } else {
            if (newState.dailyCombo.attempts > 0) {
                if (window.uiController) {
                    window.uiController.showNotification(`❌ Wrong code! ${newState.dailyCombo.attempts} attempts remaining.`);
                }
            } else {
                if (window.uiController) {
                    window.uiController.showNotification(`❌ Game over! The code was ${newState.dailyCombo.code}.`);
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

// Referral Functions
function shareReferral() {
    const gameState = window.gameState?.get();
    if (!gameState || !gameState.referralCode) {
        if (window.uiController) {
            window.uiController.showNotification('❌ Referral code not ready!');
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
        window.uiController.showNotification('📤 Share with friends to earn rewards!');
    }
}

function copyReferralCode() {
    const gameState = window.gameState?.get();
    if (!gameState) return;

    const code = gameState.referralCode;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(() => {
            if (window.uiController) {
                window.uiController.showNotification('✅ Referral code copied!');
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
            window.uiController.showNotification('✅ Referral code copied!');
        }
    } catch (err) {
        if (window.uiController) {
            window.uiController.showNotification('❌ Copy failed. Code: ' + text);
        }
    }
    
    document.body.removeChild(textArea);
}

// Initialize global instances
window.TasksManager = new TasksManager();
window.ProfileManager = new ProfileManager();
window.MinigamesManager = new MinigamesManager();
window.AchievementManager = AchievementManager;

// Global functions
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
