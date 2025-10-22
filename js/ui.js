// ui.js - Main UI Controller (No Duplicate Notifications)

class UIController {
    constructor() {
        this.currentScreen = 'galaxyScreen';
        this.planetImages = {
            'pyrion': 'https://cx-odyssey.github.io/CloneX/assets/bgpyrion.png',
            'aqueos': 'https://cx-odyssey.github.io/CloneX/assets/bgaqueous.png',
            'voidex': 'https://cx-odyssey.github.io/CloneX/assets/bgvoidex.png',
            'chloros': 'https://cx-odyssey.github.io/CloneX/assets/bgchloros.png',
            'aurelia': 'https://cx-odyssey.github.io/CloneX/assets/bgaurelia.png',
            'crimson': 'https://cx-odyssey.github.io/CloneX/assets/bgcrimson.png'
        };
        this.init();
    }

    init() {
        if (window.gameState) {
            window.gameState.subscribe((newState, oldState) => {
                this.updateUIElements(newState);
            });
        }
        this.generateStarfield();
        this.updatePlanetImages();
    }

    generateStarfield() {
        const starfield = document.getElementById('starfield');
        if (!starfield) return;
        const starTypes = ['star-small', 'star-medium', 'star-large'];
        const starCounts = [60, 15, 5];
        starfield.innerHTML = '';
        starTypes.forEach((type, index) => {
            for (let i = 0; i < starCounts[index]; i++) {
                const star = document.createElement('div');
                star.className = `star ${type}`;
                star.style.left = Math.random() * 100 + '%';
                star.style.top = Math.random() * 100 + '%';
                star.style.animationDelay = Math.random() * 3 + 's';
                star.style.animationDuration = (2 + Math.random() * 2) + 's';
                starfield.appendChild(star);
            }
        });
    }

    updatePlanetImages() {
        Object.keys(this.planetImages).forEach(planet => {
            const planetElement = document.querySelector(`.planet-${planet}`);
            if (planetElement) {
                planetElement.style.backgroundImage = `url(${this.planetImages[planet]})`;
                planetElement.style.backgroundSize = 'cover';
                planetElement.style.backgroundPosition = 'center';
                planetElement.style.backgroundRepeat = 'no-repeat';
            }
        });
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        setTimeout(() => {
            const targetScreen = document.getElementById(screenId);
            if (targetScreen) {
                targetScreen.classList.add('active');
                this.currentScreen = screenId;
            }
        }, 100);
        this.updateNavigation(screenId);
        this.updateUIElements(window.gameState?.get());
        this.loadScreenData(screenId);
    }

    updateNavigation(screenId) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const navMap = {
            'galaxyScreen': 0,
            'shopScreen': 1,
            'minigamesScreen': 2,
            'tasksScreen': 3,
            'profileScreen': 4
        };
        if (navMap[screenId] !== undefined) {
            const navButtons = document.querySelectorAll('.nav-btn');
            if (navButtons[navMap[screenId]]) {
                navButtons[navMap[screenId]].classList.add('active');
            }
        }
    }

    loadScreenData(screenId) {
        switch (screenId) {
            case 'profileScreen':
                if (window.ProfileManager) {
                    window.ProfileManager.renderContent();
                }
                break;
            case 'tasksScreen':
                this.renderTaskContent();
                break;
        }
    }

    updateUIElements(gameState) {
        if (!gameState) return;
        this.updateResources(gameState);
        this.updateEnergyBar(gameState);
        this.updateBossHealth(gameState);
        this.updateUserInfo(gameState);
        this.updateTickets(gameState);
        this.updateShopCosts(gameState);
    }

    updateResources(gameState) {
        const resourceElements = {
            energy: document.querySelectorAll('#energy, #energyMining'),
            shards: document.querySelectorAll('#shards, #shardsMining, #shardsShop'),
            gp: document.querySelectorAll('#gp, #gpBoss, #gpShop, #gpMinigames, #gpTasks, #gpProfile')
        };
        resourceElements.energy.forEach(el => {
            if (el) el.textContent = gameState.energy;
        });
        resourceElements.shards.forEach(el => {
            if (el) el.textContent = gameState.shards.toLocaleString();
        });
        resourceElements.gp.forEach(el => {
            if (el) el.textContent = gameState.gp.toLocaleString();
        });
        const balanceElements = document.querySelectorAll('#taskBalanceDisplay, #profileBalanceDisplay');
        balanceElements.forEach(el => {
            if (el) el.textContent = gameState.gp.toLocaleString();
        });
    }

    updateEnergyBar(gameState) {
        const energyPercent = (gameState.energy / gameState.maxEnergy) * 100;
        const energyFill = document.getElementById('energyFill');
        if (energyFill) {
            energyFill.style.width = energyPercent + '%';
        }
        const energyText = document.getElementById('energyText');
        if (energyText) {
            energyText.textContent = `${gameState.energy}/${gameState.maxEnergy}`;
        }
    }

    updateBossHealth(gameState) {
        const bossPercent = (gameState.bossHealth / gameState.maxBossHealth) * 100;
        const bossHealthFill = document.getElementById('bossHealthFill');
        if (bossHealthFill) {
            bossHealthFill.style.width = bossPercent + '%';
        }
        const bossHealthText = document.getElementById('bossHealthText');
        if (bossHealthText) {
            bossHealthText.textContent = `${gameState.bossHealth}/${gameState.maxBossHealth}`;
        }
        const playerDamageEl = document.getElementById('playerDamage');
        if (playerDamageEl) {
            playerDamageEl.textContent = gameState.playerDamage.toLocaleString();
        }
    }

    updateUserInfo(gameState) {
        const userLevel = Math.floor(gameState.gp / 100) + 1;
        const userLevelEl = document.getElementById('tgUserLevel');
        if (userLevelEl) {
            userLevelEl.textContent = userLevel;
        }
        const userRankEls = document.querySelectorAll('#userRank, #profileRank');
        userRankEls.forEach(el => {
            if (el && !el.dataset.updating) {
                el.textContent = '999+';
            }
        });
    }

    updateTickets(gameState) {
        const ticketElements = document.querySelectorAll('#gameTickets');
        ticketElements.forEach(el => {
            if (el) el.textContent = gameState.gameTickets;
        });
        const now = Date.now();
        const nextTicketIn = 180000 - (now - gameState.lastTicketTime);
        const minutesLeft = Math.ceil(nextTicketIn / 60000);
        const cooldownElement = document.getElementById('ticketCooldown');
        if (cooldownElement) {
            if (gameState.gameTickets < 10 && nextTicketIn > 0) {
                cooldownElement.textContent = `Next in ${minutesLeft}m`;
            } else {
                cooldownElement.textContent = gameState.gameTickets >= 10 ? 'Max tickets' : '';
            }
        }
    }

    updateShopCosts(gameState) {
        const costs = {
            speed: 50 * Math.pow(2, gameState.upgrades.speed),
            damage: 75 * Math.pow(2, gameState.upgrades.damage),
            energy: 100 * Math.pow(2, gameState.upgrades.energy),
            multiplier: 200 * Math.pow(2, gameState.upgrades.multiplier)
        };
        
        Object.keys(costs).forEach(upgrade => {
            const costEl = document.getElementById(`${upgrade}Cost`);
            if (costEl) {
                costEl.textContent = costs[upgrade];
            }
        });
    }

    showNotification(text) {
        document.querySelectorAll('.notification').forEach(n => n.remove());
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = text;
        document.body.appendChild(notification);
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3200);
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    showRewardModal(text, icon) {
        const rewardTextEl = document.getElementById('rewardText');
        const rewardIconEl = document.getElementById('rewardIcon');
        if (rewardTextEl) rewardTextEl.textContent = text;
        if (rewardIconEl) rewardIconEl.textContent = icon;
        this.showModal('rewardModal');
    }

    selectPlanet(planetName, planetId) {
        const gameState = window.gameState;
        if (!gameState) return;
        gameState.update({
            currentPlanet: planetName
        });
        gameState.trackPlanetVisit(planetName);
        if (!gameState.getValue('oneTimeTasks').planet) {
            gameState.update({
                oneTimeTasks: {
                    ...gameState.getValue('oneTimeTasks'),
                    planet: true
                },
                gp: gameState.getValue('gp') + 20,
                totalGPEarned: (gameState.getValue('totalGPEarned') || gameState.getValue('gp')) + 20
            });
            this.showNotification('🚀 First planet visited! +20 GP!');
        }
        this.updateMiningScreen(planetName, planetId);
        this.showScreen('miningScreen');
        this.showNotification(`🌍 Landed on ${planetName}!`);
    }

    updateMiningScreen(planetName, planetId) {
        const currentPlanetEl = document.getElementById('currentPlanet');
        if (currentPlanetEl) {
            currentPlanetEl.textContent = planetName;
        }
        const mineRewardEl = document.getElementById('mineReward');
        if (mineRewardEl) {
            mineRewardEl.textContent = Math.floor(planetId * 1.5 + 3);
        }
        const miningPlanet = document.getElementById('miningPlanet');
        if (miningPlanet) {
            const planetKey = planetName.toLowerCase();
            const backgroundImage = this.planetImages[planetKey];
            if (backgroundImage) {
                miningPlanet.style.backgroundImage = `url(${backgroundImage})`;
                miningPlanet.style.backgroundSize = 'cover';
                miningPlanet.style.backgroundPosition = 'center';
                miningPlanet.style.backgroundRepeat = 'no-repeat';
            }
        }
    }

    async loadLeaderboard() {
        if (!window.backendManager) return;
        try {
            const entriesContainer = document.getElementById('leaderboardEntries');
            if (entriesContainer) {
                entriesContainer.innerHTML = `
                    <div class="task-item" style="justify-content: center;">
                        <div style="color: var(--primary-gold); font-size: 14px;">Loading leaderboard...</div>
                    </div>
                `;
            }
            const result = await window.backendManager.loadLeaderboard();
            if (result.success && result.data && result.data.topPlayers) {
                this.displayLeaderboard(result.data.topPlayers);
                const userRankEls = document.querySelectorAll('#userRank, #profileRank');
                userRankEls.forEach(el => {
                    if (el) {
                        el.dataset.updating = 'true';
                        const rank = result.data.userRank || 999;
                        el.textContent = rank <= 1000 ? rank : '999+';
                        setTimeout(() => delete el.dataset.updating, 100);
                    }
                });
                console.log('✅ Leaderboard loaded successfully from backend');
            } else {
                if (entriesContainer) {
                    entriesContainer.innerHTML = `
                        <div class="task-item" style="flex-direction: column; text-align: center; padding: 30px;">
                            <div style="font-size: 40px; margin-bottom: 10px;">📊</div>
                            <div style="color: rgba(255, 255, 255, 0.8); font-size: 14px; margin-bottom: 8px;">Leaderboard temporarily unavailable</div>
                            <div style="color: rgba(255, 255, 255, 0.6); font-size: 12px;">Check back soon!</div>
                        </div>
                    `;
                }
                console.warn('⚠️ Leaderboard data not available');
            }
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
            const entriesContainer = document.getElementById('leaderboardEntries');
            if (entriesContainer) {
                entriesContainer.innerHTML = `
                    <div class="task-item" style="flex-direction: column; text-align: center; padding: 30px;">
                        <div style="font-size: 40px; margin-bottom: 10px;">❌</div>
                        <div style="color: rgba(255, 255, 255, 0.8); font-size: 14px;">Failed to load leaderboard</div>
                    </div>
                `;
            }
        }
    }

    displayLeaderboard(leaders) {
        const entriesContainer = document.getElementById('leaderboardEntries');
        if (!entriesContainer || !leaders) return;
        entriesContainer.innerHTML = '';
        leaders.forEach((entry, index) => {
            const entryEl = document.createElement('div');
            entryEl.className = 'task-item';
            if (entry.telegramId === 'current_user') {
                entryEl.style.background = 'rgba(255, 215, 0, 0.2)';
                entryEl.style.borderLeft = '4px solid var(--secondary-orange)';
            }
            let rankIcon = '';
            if (index === 0) rankIcon = '<span style="color: #ffd700; font-size: 18px;">👑</span> ';
            else if (index === 1) rankIcon = '<span style="color: #ff6b35; font-size: 16px;">🥈</span> ';
            else if (index === 2) rankIcon = '<span style="color: #7209b7; font-size: 16px;">🥉</span> ';
            else rankIcon = `<span style="color: #888; font-size: 12px;">${index + 1}.</span> `;
            entryEl.innerHTML = `
                <div style="font-size: 13px;">
                    ${rankIcon}${entry.username}${entry.telegramId === 'current_user' ? ' (You)' : ''}
                </div>
                <div style="color: var(--primary-gold); font-weight: 700; font-size: 12px;">
                    ${entry.gp.toLocaleString()} GP
                </div>
            `;
            entriesContainer.appendChild(entryEl);
        });
    }

    renderTaskContent() {
        if (window.TasksManager) {
            window.TasksManager.renderContent();
        }
    }
}

window.uiController = new UIController();

// REMOVED: Galaxy screen notification function
// The Daily Rewards banner already exists on the Tasks screen

function showScreen(screenId) {
    window.uiController.showScreen(screenId);
}

function selectPlanet(planetName, planetId) {
    window.uiController.selectPlanet(planetName, planetId);
}

function showNotification(text) {
    window.uiController.showNotification(text);
}

function showModal(modalId) {
    window.uiController.showModal(modalId);
}

function closeModal(modalId) {
    window.uiController.closeModal(modalId);
}

// Daily Rewards Modal is accessible via Tasks screen banner
window.showDailyRewardsModal = showDailyRewardsModal;

console.log('✅ UI Controller initialized (no duplicate notifications)');
