// Tasks System
class TasksManager {
    constructor() {
        this.currentTab = 'daily';
    }

    renderContent() {
        const container = document.getElementById('taskContent');
        if (!container) {
            console.error('taskContent container not found!');
            return;
        }

        console.log('Rendering tasks, current tab:', this.currentTab);

        if (this.currentTab === 'daily') {
            container.innerHTML = this.getDailyTasksHTML();
        } else {
            container.innerHTML = this.getOneTimeTasksHTML();
        }

        this.updateTaskStates();
        console.log('Tasks rendered successfully');
    }

    getDailyTasksHTML() {
        return `
            <div id="dailyTasksContent">
                <!-- Daily Login Task -->
                <div class="task-item">
                    <div class="task-icon" style="background: linear-gradient(135deg, var(--primary-gold), var(--secondary-orange));">📅</div>
                    <div class="task-info">
                        <div class="task-title">Daily reward</div>
                        <div class="task-desc">Log in daily</div>
                    </div>
                    <div class="task-reward" id="dailyLoginStatus">Completed</div>
                </div>

                <!-- Mine 10 Times Task -->
                <div class="task-item">
                    <div class="task-icon" style="background: linear-gradient(135deg, #FF6B35, #D84315);">⛏️</div>
                    <div class="task-info">
                        <div class="task-title">Mine crystals</div>
                        <div class="task-desc">Mine 10 times (<span id="dailyMineCount">0</span>/10)</div>
                    </div>
                    <button class="task-button" id="dailyMineBtn" onclick="claimDailyTask('mine')" disabled>+50 GP</button>
                </div>

                <!-- Boss Battle Task -->
                <div class="task-item">
                    <div class="task-icon" style="background: linear-gradient(135deg, #9C27B0, #6A1B9A);">⚔️</div>
                    <div class="task-info">
                        <div class="task-title">Battle cosmic overlord</div>
                        <div class="task-desc">Attack boss 3 times (<span id="dailyBossCount">0</span>/3)</div>
                    </div>
                    <button class="task-button" id="dailyBossBtn" onclick="claimDailyTask('boss')" disabled>+75 GP</button>
                </div>

                <!-- Daily Combo Task -->
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
                <!-- First Planet Visit -->
                <div class="task-item">
                    <div class="task-icon" style="background: linear-gradient(135deg, #FF6B35, #D84315);">🚀</div>
                    <div class="task-info">
                        <div class="task-title">First exploration</div>
                        <div class="task-desc">Visit any planet for mining</div>
                    </div>
                    <button class="task-button" id="firstPlanetBtn" onclick="claimOneTimeTask('planet')" disabled>+20 GP</button>
                </div>

                <!-- First Purchase -->
                <div class="task-item">
                    <div class="task-icon" style="background: linear-gradient(135deg, #4CAF50, #2E7D32);">💰</div>
                    <div class="task-info">
                        <div class="task-title">First upgrade</div>
                        <div class="task-desc">Buy any upgrade from shop</div>
                    </div>
                    <button class="task-button" id="firstPurchaseBtn" onclick="claimOneTimeTask('purchase')" disabled>+40 GP</button>
                </div>

                <!-- Collect 100 Shards -->
                <div class="task-item">
                    <div class="task-icon" style="background: linear-gradient(135deg, #00F5FF, #0091EA);">💎</div>
                    <div class="task-info">
                        <div class="task-title">Crystal collector</div>
                        <div class="task-desc">Collect 100 shards (<span id="oneTimeShardCount">0</span>/100)</div>
                    </div>
                    <button class="task-button" id="shards100Btn" onclick="claimOneTimeTask('shards100')" disabled>+80 GP</button>
                </div>

                <!-- Invite 5 Friends -->
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

        // Update daily task counts and states
        this.updateElement('dailyMineCount', gameState.dailyTaskProgress.mines);
        this.updateElement('dailyBossCount', gameState.dailyTaskProgress.bossBattles);
        
        // Update one-time task counts
        this.updateElement('oneTimeShardCount', gameState.shards);
        this.updateElement('referralCount', gameState.totalReferrals);
        
        // Update button states
        this.updateTaskButton('dailyMineBtn', gameState.dailyTaskProgress.mines >= 10 && !gameState.dailyTasks.mine);
        this.updateTaskButton('dailyBossBtn', gameState.dailyTaskProgress.bossBattles >= 3 && !gameState.dailyTasks.boss);
        this.updateTaskButton('dailyComboBtn', gameState.dailyTaskProgress.comboAttempts > 0 && !gameState.dailyTasks.combo);
        
        this.updateTaskButton('firstPlanetBtn', gameState.oneTimeTasks.planet, true);
        this.updateTaskButton('firstPurchaseBtn', gameState.oneTimeTasks.purchase, true);
        this.updateTaskButton('shards100Btn', gameState.shards >= 100 && !gameState.oneTimeTasks.shards100);
        this.updateTaskButton('invite5Btn', gameState.totalReferrals >= 5 && !gameState.oneTimeTasks.invite5);
        
        // Update login status
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
        if (!container) {
            console.error('profileContent container not found!');
            return;
        }

        console.log('Rendering profile, current tab:', this.currentTab);

        switch (this.currentTab) {
            case 'referral':
                container.innerHTML = this.getReferralHTML();
                break;
            case 'leaderboard':
                container.innerHTML = this.getLeaderboardHTML();
                this.loadLeaderboardData();
                break;
            case 'wallet':
                container.innerHTML = this.getWalletHTML();
                break;
        }

        this.updateProfileData();
        console.log('Profile rendered successfully');
    }

    getReferralHTML() {
        const gameState = window.gameState?.get();
        const referrals = gameState?.totalReferrals || 0;
        const earnings = gameState?.referralEarnings || 0;
        
        // Calculate progress to next milestone
        const milestones = [1, 5, 10, 25, 50, 100];
        let nextMilestone = milestones.find(m => m > referrals) || 100;
        let progress = referrals >= 100 ? 100 : (referrals / nextMilestone) * 100;
        
        return `
            <div id="referralContent">
                <div style="background: linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 255, 136, 0.05)); border-radius: 25px; padding: 25px; margin: 20px 0; border: 1px solid rgba(0, 255, 136, 0.3);">
                    
                    <!-- Progress to Next Reward -->
                    <div style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 107, 53, 0.1)); padding: 20px; border-radius: 15px; margin-bottom: 20px; border: 2px solid var(--primary-gold);">
                        <div style="text-align: center; margin-bottom: 12px;">
                            <div style="font-size: 14px; color: var(--primary-gold); font-weight: 600;">🎯 Progress to ${nextMilestone} Friends</div>
                            <div style="font-size: 24px; font-weight: bold; color: white; margin: 8px 0;">${referrals} / ${nextMilestone}</div>
                        </div>
                        <div style="width: 100%; height: 8px; background: rgba(0, 0, 0, 0.3); border-radius: 4px; overflow: hidden;">
                            <div style="height: 100%; background: linear-gradient(90deg, var(--success-green), var(--primary-gold)); width: ${progress}%; transition: width 0.3s ease;"></div>
                        </div>
                        <div style="text-align: center; margin-top: 8px; font-size: 12px; color: rgba(255, 255, 255, 0.8);">
                            ${nextMilestone - referrals} more ${nextMilestone - referrals === 1 ? 'friend' : 'friends'} to unlock mega bonus!
                        </div>
                    </div>

                    <!-- Referral Stats Cards -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                        <div style="background: rgba(0, 0, 0, 0.3); padding: 20px; border-radius: 15px; text-align: center; border: 1px solid rgba(0, 255, 136, 0.2);">
                            <div style="font-size: 32px; font-weight: bold; color: var(--success-green);" id="totalReferralsDisplay">${referrals}</div>
                            <div style="font-size: 11px; color: rgba(255, 255, 255, 0.7); margin-top: 5px;">Total Friends</div>
                        </div>
                        <div style="background: rgba(0, 0, 0, 0.3); padding: 20px; border-radius: 15px; text-align: center; border: 1px solid rgba(0, 255, 136, 0.2);">
                            <div style="font-size: 32px; font-weight: bold; color: var(--primary-gold);" id="referralEarningsDisplay">${earnings}</div>
                            <div style="font-size: 11px; color: rgba(255, 255, 255, 0.7); margin-top: 5px;">GP Earned</div>
                        </div>
                    </div>

                    <!-- Invite Section -->
                    <div style="text-align: center; margin: 25px 0;">
                        <h3 style="color: var(--success-green); font-size: 22px; margin-bottom: 10px;">Invite Friends & Earn</h3>
                        <p style="color: rgba(255, 255, 255, 0.8); font-size: 14px; line-height: 1.5;">Share CX Odyssey with friends<br>Both of you get <strong style="color: var(--primary-gold);">25 GP</strong> instantly!</p>
                    </div>
                    
                    <!-- Large Invite Button -->
                    <button style="width: 100%; background: linear-gradient(135deg, var(--success-green), #00CC70); color: #000; border: none; padding: 18px; border-radius: 15px; font-weight: bold; font-size: 16px; cursor: pointer; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);" onclick="shareReferral()">
                        <span style="font-size: 20px;">📤</span>
                        <span>Invite Friends Now</span>
                    </button>

                    <!-- Copy Link Button -->
                    <button style="width: 100%; background: rgba(0, 255, 136, 0.2); color: var(--success-green); border: 2px solid var(--success-green); padding: 15px; border-radius: 15px; font-weight: bold; font-size: 14px; cursor: pointer; margin-bottom: 20px;" onclick="copyReferralLink()">
                        🔗 Copy Invite Link
                    </button>

                    <!-- Referral Milestones & Rewards -->
                    <div style="margin-top: 25px;">
                        <div style="color: white; font-size: 16px; font-weight: 600; margin-bottom: 15px; padding-left: 5px; display: flex; align-items: center; gap: 8px;">
                            <span>🏆</span>
                            <span>Milestone Rewards</span>
                        </div>
                        
                        <!-- 1 Friend -->
                        <div class="task-item" style="background: ${referrals >= 1 ? 'rgba(0, 255, 136, 0.1)' : 'rgba(0, 0, 0, 0.2)'}; border: 1px solid ${referrals >= 1 ? 'var(--success-green)' : 'rgba(0, 255, 136, 0.2)'}; margin-bottom: 10px; position: relative; overflow: hidden;">
                            ${referrals >= 1 ? '<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.1)); animation: shimmer 2s infinite;"></div>' : ''}
                            <div style="display: flex; align-items: center; gap: 12px; flex: 1; position: relative; z-index: 1;">
                                <div style="width: 45px; height: 45px; background: linear-gradient(135deg, var(--success-green), #00CC70); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px;">👥</div>
                                <div style="flex: 1;">
                                    <div style="font-size: 15px; font-weight: 600; color: white;">1 Friend</div>
                                    <div style="font-size: 12px; color: rgba(255, 255, 255, 0.7);">Instant reward for both players</div>
                                </div>
                            </div>
                            <div style="background: ${referrals >= 1 ? 'var(--success-green)' : 'var(--primary-gold)'}; color: #000; padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: bold; position: relative; z-index: 1;">
                                ${referrals >= 1 ? '✓ Claimed' : '+50 GP'}
                            </div>
                        </div>

                        <!-- 5 Friends -->
                        <div class="task-item" style="background: ${referrals >= 5 ? 'rgba(255, 215, 0, 0.1)' : 'rgba(0, 0, 0, 0.2)'}; border: 1px solid ${referrals >= 5 ? 'var(--primary-gold)' : 'rgba(255, 215, 0, 0.2)'}; margin-bottom: 10px; position: relative; overflow: hidden;">
                            ${referrals >= 5 ? '<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.1)); animation: shimmer 2s infinite;"></div>' : ''}
                            <div style="display: flex; align-items: center; gap: 12px; flex: 1; position: relative; z-index: 1;">
                                <div style="width: 45px; height: 45px; background: linear-gradient(135deg, var(--primary-gold), var(--secondary-orange)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px;">🎁</div>
                                <div style="flex: 1;">
                                    <div style="font-size: 15px; font-weight: 600; color: white;">5 Friends</div>
                                    <div style="font-size: 12px; color: rgba(255, 255, 255, 0.7);">Gold chest bonus unlock</div>
                                </div>
                            </div>
                            <div style="background: ${referrals >= 5 ? 'var(--success-green)' : 'var(--primary-gold)'}; color: #000; padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: bold; position: relative; z-index: 1;">
                                ${referrals >= 5 ? '✓ Claimed' : '+250 GP'}
                            </div>
                        </div>

                        <!-- 10 Friends -->
                        <div class="task-item" style="background: ${referrals >= 10 ? 'rgba(114, 9, 183, 0.1)' : 'rgba(0, 0, 0, 0.2)'}; border: 1px solid ${referrals >= 10 ? 'var(--accent-purple)' : 'rgba(114, 9, 183, 0.2)'}; margin-bottom: 10px; position: relative; overflow: hidden;">
                            ${referrals >= 10 ? '<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, transparent, rgba(114, 9, 183, 0.1)); animation: shimmer 2s infinite;"></div>' : ''}
                            <div style="display: flex; align-items: center; gap: 12px; flex: 1; position: relative; z-index: 1;">
                                <div style="width: 45px; height: 45px; background: linear-gradient(135deg, var(--accent-purple), #9C27B0); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px;">👑</div>
                                <div style="flex: 1;">
                                    <div style="font-size: 15px; font-weight: 600; color: white;">10 Friends</div>
                                    <div style="font-size: 12px; color: rgba(255, 255, 255, 0.7);">Premium status + special badge</div>
                                </div>
                            </div>
                            <div style="background: ${referrals >= 10 ? 'var(--success-green)' : 'var(--accent-purple)'}; color: ${referrals >= 10 ? '#000' : 'white'}; padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: bold; position: relative; z-index: 1;">
                                ${referrals >= 10 ? '✓ Claimed' : '+750 GP'}
                            </div>
                        </div>

                        <!-- 25 Friends -->
                        <div class="task-item" style="background: ${referrals >= 25 ? 'rgba(255, 107, 53, 0.1)' : 'rgba(0, 0, 0, 0.2)'}; border: 1px solid ${referrals >= 25 ? 'var(--secondary-orange)' : 'rgba(255, 107, 53, 0.2)'}; margin-bottom: 10px; position: relative; overflow: hidden;">
                            ${referrals >= 25 ? '<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, transparent, rgba(255, 107, 53, 0.1)); animation: shimmer 2s infinite;"></div>' : ''}
                            <div style="display: flex; align-items: center; gap: 12px; flex: 1; position: relative; z-index: 1;">
                                <div style="width: 45px; height: 45px; background: linear-gradient(135deg, var(--secondary-orange), #D84315); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px;">💎</div>
                                <div style="flex: 1;">
                                    <div style="font-size: 15px; font-weight: 600; color: white;">25 Friends</div>
                                    <div style="font-size: 12px; color: rgba(255, 255, 255, 0.7);">Elite status + exclusive perks</div>
                                </div>
                            </div>
                            <div style="background: ${referrals >= 25 ? 'var(--success-green)' : 'var(--secondary-orange)'}; color: ${referrals >= 25 ? '#000' : 'white'}; padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: bold; position: relative; z-index: 1;">
                                ${referrals >= 25 ? '✓ Claimed' : '+2,000 GP'}
                            </div>
                        </div>

                        <!-- 50 Friends -->
                        <div class="task-item" style="background: ${referrals >= 50 ? 'rgba(0, 245, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)'}; border: 1px solid ${referrals >= 50 ? 'var(--neon-blue)' : 'rgba(0, 245, 255, 0.2)'}; margin-bottom: 10px; position: relative; overflow: hidden;">
                            ${referrals >= 50 ? '<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.1)); animation: shimmer 2s infinite;"></div>' : ''}
                            <div style="display: flex; align-items: center; gap: 12px; flex: 1; position: relative; z-index: 1;">
                                <div style="width: 45px; height: 45px; background: linear-gradient(135deg, var(--neon-blue), #0091EA); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px;">🌟</div>
                                <div style="flex: 1;">
                                    <div style="font-size: 15px; font-weight: 600; color: white;">50 Friends</div>
                                    <div style="font-size: 12px; color: rgba(255, 255, 255, 0.7);">Legend status + rare rewards</div>
                                </div>
                            </div>
                            <div style="background: ${referrals >= 50 ? 'var(--success-green)' : 'var(--neon-blue)'}; color: #000; padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: bold; position: relative; z-index: 1;">
                                ${referrals >= 50 ? '✓ Claimed' : '+5,000 GP'}
                            </div>
                        </div>

                        <!-- 100 Friends - Ultimate -->
                        <div class="task-item" style="background: ${referrals >= 100 ? 'rgba(255, 215, 0, 0.2)' : 'rgba(0, 0, 0, 0.2)'}; border: 2px solid ${referrals >= 100 ? 'var(--primary-gold)' : 'rgba(255, 215, 0, 0.3)'}; position: relative; overflow: hidden;">
                            ${referrals >= 100 ? '<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(45deg, transparent, rgba(255, 215, 0, 0.2), transparent); animation: shimmer 2s infinite;"></div>' : ''}
                            <div style="display: flex; align-items: center; gap: 12px; flex: 1; position: relative; z-index: 1;">
                                <div style="width: 45px; height: 45px; background: linear-gradient(135deg, var(--primary-gold), var(--secondary-orange), var(--accent-purple)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);">🏆</div>
                                <div style="flex: 1;">
                                    <div style="font-size: 15px; font-weight: 600; color: var(--primary-gold);">100 Friends</div>
                                    <div style="font-size: 12px; color: rgba(255, 255, 255, 0.7);">Ultimate champion + VIP access</div>
                                </div>
                            </div>
                            <div style="background: ${referrals >= 100 ? 'var(--success-green)' : 'linear-gradient(135deg, var(--primary-gold), var(--secondary-orange))'}; color: ${referrals >= 100 ? '#000' : '#000'}; padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: bold; position: relative; z-index: 1; box-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);">
                                ${referrals >= 100 ? '✓ Claimed' : '+15,000 GP'}
                            </div>
                        </div>
                    </div>

                    <!-- How it Works -->
                    <div style="margin-top: 20px; background: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 12px; border: 1px solid rgba(0, 255, 136, 0.1);">
                        <div style="color: var(--success-green); font-size: 13px; font-weight: 600; margin-bottom: 10px;">💡 How it Works</div>
                        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.8); line-height: 1.6;">
                            1. Share your invite link with friends<br>
                            2. They join CX Odyssey using your link<br>
                            3. <strong style="color: var(--primary-gold);">Both get 25 GP instantly!</strong><br>
                            4. Reach milestones for massive bonus rewards<br>
                            5. Unlock exclusive badges and status
                        </div>
                    </div>

                    <!-- Leaderboard Teaser -->
                    <div style="margin-top: 15px; background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 107, 53, 0.05)); padding: 15px; border-radius: 12px; border: 1px solid rgba(255, 215, 0, 0.2); text-align: center;">
                        <div style="font-size: 13px; color: var(--primary-gold); font-weight: 600; margin-bottom: 8px;">🔥 Top Referrers This Month</div>
                        <div style="font-size: 11px; color: rgba(255, 255, 255, 0.7); line-height: 1.4;">
                            Top 10 referrers get <strong style="color: var(--primary-gold);">exclusive legendary skins</strong><br>
                            + permanent 2x GP multiplier!
                        </div>
                    </div>
                </div>
            </div>

            <style>
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            </style>
        `;
    }px;">💡 How it Works</div>
                        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.8); line-height: 1.6;">
                            1. Share your referral link or code<br>
                            2. Your friend joins using your link<br>
                            3. You both earn 25 GP instantly!<br>
                            4. Complete tasks for bonus rewards
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getLeaderboardHTML() {
        return `
            <div id="leaderboardContent">
                <div style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 107, 53, 0.05)); border-radius: 25px; padding: 25px; margin: 20px 0; border: 1px solid rgba(255, 215, 0, 0.3);">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h3 style="color: var(--primary-gold); font-size: 20px; margin-bottom: 8px;">Top Collectors</h3>
                        <p style="color: rgba(255, 255, 255, 0.8); font-size: 14px;">Compete with other players</p>
                    </div>
                    
                    <div id="leaderboardEntries">
                        <div class="task-item">
                            <div style="color: var(--primary-gold); font-size: 16px;">👑 Loading...</div>
                            <div style="font-weight: 700; color: var(--primary-gold); font-size: 14px;">0 GP</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getWalletHTML() {
        return `
            <div id="walletContent">
                <div style="background: linear-gradient(135deg, rgba(114, 9, 183, 0.15), rgba(74, 20, 140, 0.05)); border-radius: 25px; padding: 25px; margin: 20px 0; border: 1px solid rgba(114, 9, 183, 0.3);">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h3 style="color: var(--accent-purple); font-size: 20px; margin-bottom: 8px;">TON Wallet</h3>
                        <p style="color: rgba(255, 255, 255, 0.8); font-size: 14px;">Connect wallet for future airdrops</p>
                    </div>
                    
                    <button style="width: 100%; background: linear-gradient(135deg, var(--accent-purple), #5A0F8C); color: white; border: none; padding: 15px; border-radius: 15px; font-weight: bold; font-size: 15px; cursor: pointer; margin-bottom: 15px;" onclick="connectWallet()" id="connectWalletBtn">
                        🔗 Connect Wallet
                    </button>
                    
                    <div id="walletInfo" style="display: none; text-align: center;">
                        <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 15px; margin: 15px 0;">
                            <div style="color: var(--accent-purple); font-size: 12px; font-weight: 600; margin-bottom: 8px;">Connected Wallet</div>
                            <div style="word-break: break-all; font-family: monospace; font-size: 13px; color: white;" id="connectedAddress"></div>
                        </div>
                        <button style="width: 100%; background: var(--danger-red); color: white; border: none; padding: 12px; border-radius: 15px; font-weight: bold; font-size: 14px; cursor: pointer;" onclick="disconnectWallet()">
                            Disconnect Wallet
                        </button>
                    </div>
                    
                    <div style="background: rgba(0, 0, 0, 0.2); padding: 20px; border-radius: 15px; margin-top: 20px; text-align: center;">
                        <div style="color: var(--accent-purple); font-size: 14px; font-weight: 600; margin-bottom: 12px;">Future Features</div>
                        <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
                            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 8px; background: rgba(114, 9, 183, 0.1); border-radius: 8px;">
                                <span style="font-size: 16px;">🚀</span>
                                <span style="font-size: 12px; color: rgba(255, 255, 255, 0.9);">CX Token Airdrops</span>
                            </div>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 8px; background: rgba(114, 9, 183, 0.1); border-radius: 8px;">
                                <span style="font-size: 16px;">💰</span>
                                <span style="font-size: 12px; color: rgba(255, 255, 255, 0.9);">NFT Rewards</span>
                            </div>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 8px; background: rgba(114, 9, 183, 0.1); border-radius: 8px;">
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

        // Update referral data
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
        const leaderboardTab = document.getElementById('leaderboardTab');
        const walletTab = document.getElementById('walletTab');
        
        // Reset all tabs
        [referralTab, leaderboardTab, walletTab].forEach(t => {
            if (t) {
                t.classList.remove('active');
                t.style.background = 'transparent';
                t.style.color = 'rgba(255, 255, 255, 0.6)';
            }
        });
        
        // Activate selected tab
        if (tab === 'referral' && referralTab) {
            referralTab.classList.add('active');
            referralTab.style.background = 'linear-gradient(135deg, var(--success-green), #00CC70)';
            referralTab.style.color = '#000';
        } else if (tab === 'leaderboard' && leaderboardTab) {
            leaderboardTab.classList.add('active');
            leaderboardTab.style.background = 'linear-gradient(135deg, var(--primary-gold), var(--secondary-orange))';
            leaderboardTab.style.color = '#000';
        } else if (tab === 'wallet' && walletTab) {
            walletTab.classList.add('active');
            walletTab.style.background = 'linear-gradient(135deg, var(--accent-purple), #5A0F8C)';
            walletTab.style.color = 'white';
        }
        
        this.renderContent();
    }

    loadLeaderboardData() {
        if (window.uiController) {
            window.uiController.loadLeaderboard();
        }
    }
}

// Minigames System
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
        
        // Update attempts and progress
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
        
        // Check if first combo attempt (for task)
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
            // Correct guess
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
            // Wrong guess
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

// Referral System Functions
function shareReferral() {
    const gameState = window.gameState?.get();
    if (!gameState) return;

    const referralText = `🚀 Join me in CX Odyssey and explore the galaxy!\n\n🎁 Use my referral link and we both get 25 GP!\n\n💎 Unlock exclusive rewards together!`;
    const botUsername = 'Cx_odyssey_bot';
    const appName = 'app';
    const startParam = gameState.referralCode;
    
    // Correct Telegram Mini App share URL format
    const miniAppUrl = `https://t.me/${botUsername}/${appName}?startapp=${startParam}`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(miniAppUrl)}&text=${encodeURIComponent(referralText)}`;
    
    const gameInit = window.gameInitializer;
    
    // Priority 1: Use Telegram WebApp API
    if (gameInit?.tg && gameInit.tg.openTelegramLink) {
        gameInit.tg.openTelegramLink(shareUrl);
    } 
    // Priority 2: Use Web Share API
    else if (navigator.share) {
        navigator.share({
            title: 'CX Odyssey - Space Adventure Game',
            text: referralText,
            url: miniAppUrl
        }).catch((error) => {
            console.log('Share failed:', error);
            // Fallback to opening share URL
            window.open(shareUrl, '_blank');
        });
    } 
    // Priority 3: Direct link
    else {
        window.open(shareUrl, '_blank');
    }
    
    if (window.uiController) {
        window.uiController.showNotification('📤 Share with friends to earn rewards together!');
    }
}

function copyReferralLink() {
    const gameState = window.gameState?.get();
    if (!gameState) return;

    const botUsername = 'Cx_odyssey_bot';
    const appName = 'app';
    const startParam = gameState.referralCode;
    const miniAppUrl = `https://t.me/${botUsername}/${appName}?startapp=${startParam}`;
    
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(miniAppUrl).then(() => {
            if (window.uiController) {
                window.uiController.showNotification('🔗 Invite link copied to clipboard!');
            }
        }).catch(() => {
            fallbackCopyTextToClipboard(miniAppUrl);
        });
    } else {
        fallbackCopyTextToClipboard(miniAppUrl);
    }
}

function copyReferralCode() {
    const gameState = window.gameState?.get();
    if (!gameState) return;

    const code = gameState.referralCode;
    
    // Try modern clipboard API first
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
        const successful = document.execCommand('copy');
        if (successful && window.uiController) {
            window.uiController.showNotification('✅ Copied to clipboard!');
        } else {
            // Show the text to user if copy failed
            if (window.uiController) {
                window.uiController.showNotification('Link: ' + text);
            }
        }
    } catch (err) {
        console.error('Could not copy text:', err);
        if (window.uiController) {
            window.uiController.showNotification('❌ Copy failed. Link: ' + text);
        }
    }
    
    document.body.removeChild(textArea);
}

// Check for referral on app start
async function checkReferralCode() {
    const gameInit = window.gameInitializer;
    if (!gameInit?.tg) return;
    
    try {
        // Get start parameter from Telegram
        const startParam = gameInit.tg.initDataUnsafe?.start_param;
        
        if (startParam && startParam.startsWith('CX')) {
            const gameState = window.gameState;
            if (!gameState) return;
            
            const currentCode = gameState.getValue('referralCode');
            const user = gameInit.user;
            
            // Don't process if it's their own code
            if (startParam !== currentCode && user && user.id) {
                console.log('🎁 Processing referral code:', startParam);
                
                // Call backend to process referral
                if (window.backendManager && window.backendManager.api) {
                    const result = await window.backendManager.api.processReferral(
                        user.id,
                        user.first_name || 'Anonymous',
                        startParam
                    );
                    
                    if (result.success && result.data) {
                        // Award bonus to new user
                        gameState.addValue('gp', result.data.newUserBonus || 25);
                        
                        if (window.uiController) {
                            window.uiController.showNotification(
                                `🎁 Welcome! You received ${result.data.newUserBonus || 25} GP bonus!`
                            );
                            
                            // Show milestone achievement if referrer reached one
                            if (result.data.milestoneBonus > 0) {
                                setTimeout(() => {
                                    window.uiController.showNotification(
                                        `🎉 Your referrer unlocked a milestone bonus!`
                                    );
                                }, 3000);
                            }
                        }
                        
                        console.log('✅ Referral processed successfully');
                    } else {
                        console.log('⚠️ Referral processing skipped:', result.error);
                    }
                }
            }
        }
    } catch (error) {
        console.log('Referral check error:', error);
    }
}

// Global instances
window.TasksManager = new TasksManager();
window.ProfileManager = new ProfileManager();
window.MinigamesManager = new MinigamesManager();

// Global functions for HTML onclick handlers
function switchTaskTab(tab) {
    window.TasksManager.switchTab(tab);
}

function switchProfileTab(tab) {
    window.ProfileManager.switchTab(tab);
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
    window.MinigamesManager.inputComboDigit(digit);
}

function clearCombo() {
    window.MinigamesManager.clearCombo();
}

function submitCombo() {
    window.MinigamesManager.submitCombo();
}
