// mining.js - Updated with Ad Tracking

class MiningSystem {
    constructor() {
        this.adTimerActive = false;
        this.adTimerInterval = null;
    }

    // Main mining function
    minePlanet() {
        const result = window.gameState?.mine();
        if (result) {
            this.playMiningAnimation();
        }
    }

    // Battle aliens function
    battleAliens() {
        const result = window.gameState?.battleAliens();
        if (result) {
            this.playBattleAnimation();
        }
    }

    // Boss attack function
    attackBoss() {
        const result = window.gameState?.attackBoss();
        if (result && result.bossDefeated) {
            this.playBossDefeatAnimation();
        }
    }

    // Watch ad for energy - now with tracking
    watchAdForEnergy() {
        if (window.uiController) {
            window.uiController.showModal('adModal');
            this.startAdTimer(() => {
                const gameState = window.gameState;
                if (gameState) {
                    const currentEnergy = gameState.getValue('energy');
                    const maxEnergy = gameState.getValue('maxEnergy');
                    gameState.setValue('energy', Math.min(maxEnergy, currentEnergy + 25));
                    
                    // Track ad watch for faster energy regen
                    gameState.watchAd('energy');
                }
                
                window.uiController.closeModal('adModal');
                window.uiController.showRewardModal('⚡ +25 Energy!\n\nEnergy now regenerates 2x faster for 30 minutes!', '⚡');
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
                    gameState.watchAd('damage');
                }
                
                window.uiController.closeModal('adModal');
                window.uiController.showRewardModal('⚔️ 2x Damage for next 3 attacks!', '⚔️');
            });
        }
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

    // Buy upgrade function - now just redirects to purchase confirmation
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

            // Update shop costs display
            window.uiController?.updateShopCosts(window.gameState.get());
        }
    }

    // Mining animation
    playMiningAnimation() {
        const miningPlanet = document.getElementById('miningPlanet');
        if (miningPlanet) {
            miningPlanet.style.transform = 'scale(1.05)';
            setTimeout(() => {
                miningPlanet.style.transform = 'scale(1)';
            }, 200);
        }
    }

    // Battle animation
    playBattleAnimation() {
        const body = document.body;
        body.style.animation = 'shake 0.5s';
        setTimeout(() => {
            body.style.animation = '';
        }, 500);
    }

    // Boss defeat animation
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
