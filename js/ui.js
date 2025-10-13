// Main UI Controller - FIXED: Resource display on all screens

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
        // FIXED: Update ALL resource displays including GP on mining screen and shards on boss screen
        const resourceElements = {
            energy: document.querySelectorAll('#energy, #energyMining, #energyBoss'),
            shards: document.querySelectorAll('#shards, #shardsMining, #shardsBoss, #shardsShop'),
            gp: document.querySelectorAll('#gp, #gpMining, #gpBoss, #gpShop, #gpMinigames, #gpTasks, #gpProfile')
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

// Global helper functions remain the same
function showDailyRewardsModal() {
    const modal = document.getElementById('dailyRewardsModal');
    const gameState = window.gameState?.get();
    if (!gameState) return;
    const streak = gameState.dailyStreak || 1;
    document.getElementById('currentStreak').textContent = streak;
    const rewardDays = document.querySelectorAll('.reward-day');
    rewardDays.forEach((day, index) => {
        const dayNum = index + 1;
        day.classList.remove('claimed', 'current');
        if (dayNum < streak) {
            day.classList.add('claimed');
        } else if (dayNum === streak) {
            day.classList.add('current');
        }
    });
    const claimStatus = document.getElementById('claimStatus');
    if (gameState.dailyTasks?.login) {
        claimStatus.innerHTML = `
            <div class="status-icon">✅</div>
            <div class="status-text">Already claimed today!</div>
            <div class="status-subtext">Come back tomorrow for Day ${streak + 1}</div>
        `;
    } else {
        claimStatus.innerHTML = `
            <div class="status-icon">🎁</div>
            <div class="status-text">Reward Available!</div>
            <div class="status-subtext">Your daily reward has been automatically claimed</div>
        `;
    }
    modal.classList.add('active');
}

function showShopItemModal(itemType) {
    const gameState = window.gameState?.get();
    
    const items = {
        speed: {
            name: 'Speed Boost',
            icon: '🚀',
            desc: '+20% Mining Speed (Permanent)',
            benefits: ['Faster mining', 'Permanent upgrade', 'Stacks with purchases'],
            cost: () => 50 * Math.pow(2, gameState.upgrades.speed),
            isUpgrade: true
        },
        damage: {
            name: 'Damage Boost',
            icon: '⚔️',
            desc: '+30% Battle Damage (Permanent)',
            benefits: ['Stronger attacks', 'Permanent upgrade', 'Stacks with purchases'],
            cost: () => 75 * Math.pow(2, gameState.upgrades.damage),
            isUpgrade: true
        },
        energy: {
            name: 'Energy Tank',
            icon: '⚡',
            desc: '+25 Max Energy (Permanent)',
            benefits: ['+25 Max Energy', 'Fully restored', 'Permanent upgrade'],
            cost: () => 100 * Math.pow(2, gameState.upgrades.energy),
            isUpgrade: true
        },
        multiplier: {
            name: 'GP Multiplier',
            icon: '💰',
            desc: '+50% GP Gain (Permanent)',
            benefits: ['More GP per action', 'Permanent upgrade', 'Stacks with purchases'],
            cost: () => 200 * Math.pow(2, gameState.upgrades.multiplier),
            isUpgrade: true
        },
        energyPotion: {
            name: 'Energy Potion',
            icon: '🧪',
            desc: 'Instantly restore 50 energy points',
            benefits: ['Instant +50 Energy', 'No cooldown', 'Use anytime'],
            cost: 150
        },
        shardBooster: {
            name: 'Shard Booster',
            icon: '💠',
            desc: 'Double shard gains for 1 hour',
            benefits: ['2x Shard rewards', '60 minutes duration', 'Stackable with other boosts'],
            cost: 300
        },
        gpBooster: {
            name: 'GP Booster',
            icon: '🎯',
            desc: 'Double GP gains for 1 hour',
            benefits: ['2x GP rewards', '60 minutes duration', 'Affects all activities'],
            cost: 400
        },
        luckyCharm: {
            name: 'Lucky Charm',
            icon: '🍀',
            desc: 'Increase drop rates by 50% for 1 hour',
            benefits: ['+50% Drop chance', '60 minutes duration', 'Better loot quality'],
            cost: 500
        }
    };
    
    const item = items[itemType];
    if (!item) return;
    
    const itemCost = typeof item.cost === 'function' ? item.cost() : item.cost;
    const canAfford = gameState && gameState.gp >= itemCost;

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'shopItemModal';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 420px; animation: modalSlideIn 0.3s ease;">
            <button class="close-btn" onclick="closeShopItemModal()">&times;</button>
            
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                <div style="font-size: 50px; animation: iconBounce 0.6s ease;">${item.icon}</div>
                <div style="flex: 1; text-align: left;">
                    <h2 style="color: var(--primary-gold); font-size: 18px; margin: 0 0 4px 0;">${item.name}</h2>
                    <p style="font-size: 11px; color: rgba(255,255,255,0.8); line-height: 1.3; margin: 0;">${item.desc}</p>
                </div>
            </div>

            <div style="background: linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,107,53,0.05)); border-radius: 12px; padding: 12px; margin: 12px 0; border: 1px solid rgba(255,215,0,0.3);">
                <div style="font-size: 12px; font-weight: 600; color: var(--primary-gold); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                    <span>✨</span> Benefits
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                    ${item.benefits.map(b => `
                        <div style="display: flex; align-items: center; gap: 6px; font-size: 10px; color: rgba(255,255,255,0.9);">
                            <span style="color: var(--success-green); font-size: 12px;">•</span>
                            <span>${b}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 12px; margin: 12px 0; text-align: center; border: 2px solid ${canAfford ? 'var(--primary-gold)' : 'var(--danger-red)'};">
                <div style="font-size: 10px; color: rgba(255,255,255,0.7); margin-bottom: 6px;">Price</div>
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span style="font-size: 24px; font-weight: bold; color: ${canAfford ? 'var(--primary-gold)' : 'var(--danger-red)'};">${itemCost}</span>
                    <img src="https://cx-odyssey.github.io/CloneX/assets/gp1.png" alt="GP" style="width: 24px; height: 24px; object-fit: contain;">
                </div>
                ${!canAfford ? '<div style="font-size: 9px; color: var(--danger-red); margin-top: 4px;">Insufficient GP</div>' : ''}
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
                <button onclick="closeShopItemModal()" style="background: rgba(255,255,255,0.1); color: white; border: none; padding: 12px; border-radius: 12px; font-weight: bold; font-size: 13px; cursor: pointer; transition: all 0.3s;">
                    Cancel
                </button>
                <button onclick="purchaseShopItem('${itemType}')" ${!canAfford ? 'disabled' : ''} style="background: ${canAfford ? 'linear-gradient(135deg, var(--primary-gold), var(--secondary-orange))' : 'rgba(128,128,128,0.3)'}; color: ${canAfford ? '#000' : 'rgba(255,255,255,0.5)'}; border: none; padding: 12px; border-radius: 12px; font-weight: bold; font-size: 13px; cursor: ${canAfford ? 'pointer' : 'not-allowed'}; transition: all 0.3s;">
                    Purchase
                </button>
            </div>
        </div>

        <style>
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-30px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            @keyframes iconBounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
        </style>
    `;
    
    document.body.appendChild(modal);
}

function closeShopItemModal() {
    const modal = document.getElementById('shopItemModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

function purchaseShopItem(itemType) {
    const upgradeTypes = ['speed', 'damage', 'energy', 'multiplier'];
    
    if (upgradeTypes.includes(itemType)) {
        window.miningSystem?.buyUpgrade(itemType);
    } else {
        window.shopSystem?.buyShopItem(itemType);
    }
    
    closeShopItemModal();
}

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

window.showDailyRewardsModal = showDailyRewardsModal;
window.showShopItemModal = showShopItemModal;
