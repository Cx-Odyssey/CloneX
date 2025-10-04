// Mining System with Enhanced Ad Incentives
class MiningSystem {
    constructor() {
        this.adTimerActive = false;
        this.adTimerInterval = null;
    }

    minePlanet() {
        const result = window.gameState?.mine();
        if (result) {
            this.playMiningAnimation();
        }
    }

    battleAliens() {
        const result = window.gameState?.battleAliens();
        if (result) {
            this.playBattleAnimation();
        }
    }

    attackBoss() {
        const result = window.gameState?.attackBoss();
        if (result && result.bossDefeated) {
            this.playBossDefeatAnimation();
        }
    }

    // ENHANCED: Watch ad for energy + 5min 2x reward boost
    watchAdForEnergy() {
        if (window.uiController) {
            window.uiController.showModal('adModal');
            this.startAdTimer(() => {
                const gameState = window.gameState;
                if (gameState) {
                    const currentEnergy = gameState.getValue('energy');
                    const maxEnergy = gameState.getValue('maxEnergy');
                    gameState.setValue('energy', Math.min(maxEnergy, currentEnergy + 25));
                    
                    // Add 5 minute 2x reward boost
                    const boostExpiry = Date.now() + (5 * 60 * 1000); // 5 minutes
                    gameState.setValue('adBoostExpiry', boostExpiry);
                    
                    this.startAdBoostTimer();
                }
                
                window.uiController.closeModal('adModal');
                window.uiController.showRewardModal('⚡ +25 Energy + 2x Rewards (5min)!', '⚡');
            });
        }
    }

    // Watch ad for damage boost
    watchAdForDamage() {
        if (window.uiController) {
            window.uiController.showModal('adModal');
            this.startAdTimer(() => {
                const gameState = window.gameState;
                if (gameState) {
                    gameState.setValue('adDamageBoost', 3);
                }
                
                window.uiController.closeModal('adModal');
                window.uiController.showRewardModal('⚔️ 2x Damage for next 3 attacks!', '⚔️');
            });
        }
    }

    // NEW: Ad boost countdown timer
    startAdBoostTimer() {
        // Update UI to show remaining boost time
        const updateBoostDisplay = () => {
            const gameState = window.gameState;
            if (!gameState) return;

            const boostExpiry = gameState.getValue('adBoostExpiry');
            const now = Date.now();
            
            if (now >= boostExpiry) {
                clearInterval(this.boostTimerInterval);
                if (window.uiController) {
                    window.uiController.showNotification('2x Reward boost expired!');
                }
                return;
            }

            const timeLeft = Math.ceil((boostExpiry - now) / 1000);
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            // Update button text if on mining screen
            const adBtn = document.getElementById('adBtn');
            if (adBtn && window.uiController.currentScreen === 'miningScreen') {
                const boostActive = `
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <span style="font-size: 20px;">🔥</span>
                        <div style="text-align: left;">
                            <div style="font-size: 14px; font-weight: bold;">2x Boost Active!</div>
                            <div style="font-size: 10px; opacity: 0.9;">${minutes}:${seconds.toString().padStart(2, '0')} remaining</div>
                        </div>
                    </div>
                `;
                adBtn.innerHTML = boostActive;
                adBtn.style.background = 'linear-gradient(135deg, #00FF88, #00CC70)';
                adBtn.style.border = '2px solid var(--primary-gold)';
            }
        };

        // Clear existing interval
        if (this.boostTimerInterval) {
            clearInterval(this.boostTimerInterval);
        }

        // Update every second
        updateBoostDisplay();
        this.boostTimerInterval = setInterval(updateBoostDisplay, 1000);
    }

    // Ad timer system
    startAdTimer(callback) {
        let timeLeft = 5;
        const progressBar = document.getElementById('adProgress');
        const timeDisplay = document.getElementById('adTime');
        const skipBtn = document.getElementById('skipBtn');

        if (!progressBar || !timeDisplay || !skipBtn) return;

        skipBtn.style.display = 'none';
        progressBar.style.width = '0%';
        this.adTimerActive = true;

        this.adTimerInterval = setInterval(() => {
            timeLeft--;
            const progress = ((5 - timeLeft) / 5) * 100;
            progressBar.style.width = progress + '%';
            timeDisplay.textContent = 5 - timeLeft;

            if (timeLeft <= 0) {
                clearInterval(this.adTimerInterval);
                this.adTimerActive = false;
                skipBtn.style.display = 'block';
                skipBtn.onclick = callback;
            }
        }, 1000);
    }

    skipAd() {
        const skipBtn = document.getElementById('skipBtn');
        if (skipBtn && skipBtn.onclick) {
            skipBtn.onclick();
        }
    }

    buyUpgrade(upgradeType) {
        const result = window.gameState?.buyUpgrade(upgradeType);
        if (result && result.success) {
            const messages = {
                speed: 'Mining speed increased!',
                damage: 'Combat damage boosted!',
                energy: 'Maximum energy increased!',
                multiplier: 'GP multiplier activated!'
            };

            const icons = {
                speed: '🚀',
                damage: '⚔️',
                energy: '⚡',
                multiplier: '💰'
            };

            if (window.uiController) {
                window.uiController.showRewardModal(messages[upgradeType], icons[upgradeType]);
            }

            window.uiController?.updateShopCosts(window.gameState.get());
        }
    }

    playMiningAnimation() {
        const miningPlanet = document.getElementById('miningPlanet');
        if (miningPlanet) {
            miningPlanet.style.transform = 'scale(1.05)';
            setTimeout(() => {
                miningPlanet.style.transform = 'scale(1)';
            }, 200);
        }
    }

    playBattleAnimation() {
        const body = document.body;
        body.style.animation = 'shake 0.5s';
        setTimeout(() => {
            body.style.animation = '';
        }, 500);
    }

    playBossDefeatAnimation() {
        const bossImage = document.querySelector('.boss-image');
        if (bossImage) {
            bossImage.style.animation = 'bossDefeat 1s';
            setTimeout(() => {
                bossImage.style.animation = '';
            }, 1000);
        }
    }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-2px); }
        75% { transform: translateX(2px); }
    }
    
    @keyframes bossDefeat {
        0% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.1) rotate(-5deg); }
        50% { transform: scale(0.9) rotate(5deg); }
        75% { transform: scale(1.05) rotate(-2deg); }
        100% { transform: scale(1) rotate(0deg); }
    }
`;
document.head.appendChild(style);

// Global mining system instance
window.miningSystem = new MiningSystem();

// Global functions for HTML onclick handlers
function minePlanet() {
    window.miningSystem.minePlanet();
}

function battleAliens() {
    window.miningSystem.battleAliens();
}

function attackBoss() {
    window.miningSystem.attackBoss();
}

function watchAdForEnergy() {
    window.miningSystem.watchAdForEnergy();
}

function watchAdForDamage() {
    window.miningSystem.watchAdForDamage();
}

function skipAd() {
    window.miningSystem.skipAd();
}

function buyUpgrade(upgradeType) {
    window.miningSystem.buyUpgrade(upgradeType);
}
