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
        if (!container) return;

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
    }

    getReferralHTML() {
        return `
            <div id="referralContent">
                <div style="background: linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 255, 136, 0.05)); border-radius: 25px; padding: 25px; margin: 20px 0; border: 1px solid rgba(0, 255, 136, 0.3);">
                    
                    <!-- Referral Stats Cards -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                        <div style="background: rgba(0, 0, 0, 0.3); padding: 20px; border-radius: 15px; text-align: center; border: 1px solid rgba(0, 255, 136, 0.2);">
                            <div style="font-size: 32px; font-weight: bold; color: var(--success-green);" id="totalReferralsDisplay">0</div>
                            <div style="font-size: 11px; color: rgba(255, 255, 255, 0.7); margin-top: 5px;">Friends</div>
                        </div>
                        <div style="background: rgba(0, 0, 0, 0.3); padding: 20px; border-radius: 15px; text-align: center; border: 1px solid rgba(0, 255, 136, 0.2);">
                            <div style="font-size: 32px; font-weight: bold; color: var(--primary-gold);" id="referralEarningsDisplay">0</div>
                            <div style="font-size: 11px; color: rgba(255, 255, 255, 0.7); margin-top: 5px;">GP Earned</div>
                        </div>
                    </div>

                    <!-- Invite Section -->
                    <div style="text-align: center; margin: 25px 0;">
                        <h3 style="color: var(--success-green); font-size: 22px; margin-bottom: 10px;">Invite Friends</h3>
                        <p style="color: rgba(255, 255, 255, 0.8); font-size: 14px; line-height: 1.5;">Share CX Odyssey with friends<br>and earn <strong style="color: var(--primary-gold);">25 GP</strong> for each referral!</p>
                    </div>
                    
                    <!-- Large Invite Button -->
                    <button style="width: 100%; background: linear-gradient(135deg, var(--success-green), #00CC70); color: #000; border: none; padding: 18px; border-radius: 15px; font-weight: bold; font-size: 16px; cursor: pointer; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);" onclick="shareReferral()">
                        <span style="font-size: 20px;">📤</span>
                        <span>Invite Friends</span>
                    </button>

                    <!-- Referral Code Section -->
                    <div style="background: rgba(0, 0, 0, 0.3); padding: 18px; border-radius: 15px; margin: 15px 0; border: 1px solid rgba(0, 255, 136, 0.2);">
                        <div style="color: rgba(255, 255, 255, 0.7); font-size: 12px; font-weight: 600; margin-bottom: 10px; text-align: center;">Your Referral Code</div>
                        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0, 0, 0, 0.4); padding: 12px 15px; border-radius: 10px;">
                            <div style="font-family: 'Courier New', monospace; font-weight: bold; font-size: 18px; color: var(--success-green);" id="referralCodeDisplay">Loading...</div>
                            <button style="background: var(--success-green); color: #000; border: none; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: bold; cursor: pointer;" onclick="copyReferralCode()">Copy</button>
                        </div>
                    </div>

                    <!-- Referral Tasks -->
                    <div style="margin-top: 25px;">
                        <div style="color: white; font-size: 16px; font-weight: 600; margin-bottom: 12px; padding-left: 5px;">📋 Referral Rewards</div>
                        
                        <div class="task-item" style="background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(0, 255, 136, 0.2); margin-bottom: 10px;">
                            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, var(--success-green), #00CC70); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">👥</div>
                                <div style="flex: 1;">
                                    <div style="font-size: 14px; font-weight: 600; color: white;">Invite 1 Friend</div>
                                    <div style="font-size: 12px; color: rgba(255, 255, 255, 0.7);">Reward: 25 GP</div>
                                </div>
                            </div>
                            <div style="background: var(--primary-gold); color: #000; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: bold;">+25 GP</div>
                        </div>

                        <div class="task-item" style="background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(0, 255, 136, 0.2); margin-bottom: 10px;">
                            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, var(--primary-gold), var(--secondary-orange)); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">🎁</div>
                                <div style="flex: 1;">
                                    <div style="font-size: 14px; font-weight: 600; color: white;">Invite 5 Friends</div>
                                    <div style="font-size: 12px; color: rgba(255, 255, 255, 0.7);">Bonus: 200 GP</div>
                                </div>
                            </div>
                            <div style="background: var(--primary-gold); color: #000; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: bold;">+200 GP</div>
                        </div>

                        <div class="task-item" style="background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(0, 255, 136, 0.2);">
                            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, var(--accent-purple), #9C27B0); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">👑</div>
                                <div style="flex: 1;">
                                    <div style="font-size: 14px; font-weight: 600; color: white;">Invite 10 Friends</div>
                                    <div style="font-size: 12px; color: rgba(255, 255, 255, 0.7);">Premium Bonus: 500 GP</div>
                                </div>
                            </div>
                            <div style="background: var(--accent-purple); color: white; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: bold;">+500 GP</div>
                        </div>
                    </div>

                    <!-- How it Works -->
                    <div style="margin-top: 20px; background: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 12px; border: 1px solid rgba(0, 255, 136, 0.1);">
                        <div style="color: var(--success-green); font-size: 13px; font-weight: 600; margin-bottom: 10px;">💡 How it Works</div>
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

// Referral System
function shareReferral() {
    const gameState = window.gameState?.get();
    if (!gameState) return;

    const referralText = `🚀 Join me in CX Odyssey and explore the galaxy! Use my referral code: ${gameState.referralCode} to get bonus rewards!`;
    const botUsername = 'Cx_odyssey_bot'; // Replace with your actual bot username
    const shareUrl = `https://t.me/share/url?url=https://t.me/${botUsername}?start=${gameState.referralCode}&text=${encodeURIComponent(referralText)}`;
    
    const gameInit = window.gameInitializer;
    if (gameInit?.tg && gameInit.tg.openTelegramLink) {
        gameInit.tg.openTelegramLink(shareUrl);
    } else if (navigator.share) {
        navigator.share({
            title: 'CX Odyssey',
            text: referralText,
            url: `https://t.me/${botUsername}?start=${gameState.referralCode}`
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
    
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(() => {
            if (window.uiController) {
                window.uiController.showNotification('✅ Referral code copied!');
            }
        }).catch(() => {
            // Fallback to old method
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
            window.uiController.showNotification('✅ Referral code copied!');
        }
    } catch (err) {
        console.error('Fallback: Could not copy text', err);
        if (window.uiController) {
            window.uiController.showNotification('❌ Copy failed. Code: ' + text);
        }
    }
    
    document.body.removeChild(textArea);
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
