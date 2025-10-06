// Main UI Controller

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

        // Subscribe to game state changes

        if (window.gameState) {

            window.gameState.subscribe((newState, oldState) => {

                this.updateUIElements(newState);

            });

        }

        

        // Generate starfield

        this.generateStarfield();

        

        // Initialize planet images

        this.updatePlanetImages();

    }



    // Generate animated starfield background

    generateStarfield() {

        const starfield = document.getElementById('starfield');

        if (!starfield) return;

        

        const starTypes = ['star-small', 'star-medium', 'star-large'];

        const starCounts = [60, 15, 5]; // More small stars, fewer large ones

        

        starfield.innerHTML = ''; // Clear existing stars

        

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



    // Update planet background images

    updatePlanetImages() {

        // Update galaxy screen planets with proper background settings

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



    // Screen management

    showScreen(screenId) {

        // Hide all screens

        document.querySelectorAll('.screen').forEach(screen => {

            screen.classList.remove('active');

        });

        

        // Show target screen with slight delay for animation

        setTimeout(() => {

            const targetScreen = document.getElementById(screenId);

            if (targetScreen) {

                targetScreen.classList.add('active');

                this.currentScreen = screenId;

            }

        }, 100);



        // Update navigation

        this.updateNavigation(screenId);

        

        // Update UI for current screen

        this.updateUIElements(window.gameState?.get());

        

        // Load screen-specific data

        this.loadScreenData(screenId);

    }



    // Update navigation bar

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



    // Load screen-specific data

    loadScreenData(screenId) {

        switch (screenId) {

            case 'profileScreen':

                // Render profile content if switching tabs

                if (window.ProfileManager) {

                    window.ProfileManager.renderContent();

                }

                break;

            case 'tasksScreen':

                this.renderTaskContent();

                break;

        }

    }



    // Update all UI elements with current game state

    updateUIElements(gameState) {

        if (!gameState) return;



        // Update resource displays

        this.updateResources(gameState);

        

        // Update energy bar

        this.updateEnergyBar(gameState);

        

        // Update boss health

        this.updateBossHealth(gameState);

        

        // Update user info

        this.updateUserInfo(gameState);

        

        // Update tickets

        this.updateTickets(gameState);

        

        // Update shop costs

        this.updateShopCosts(gameState);

    }



    // Update resource counters

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



        // Update balance displays in sections

        const balanceElements = document.querySelectorAll('#taskBalanceDisplay, #profileBalanceDisplay');

        balanceElements.forEach(el => {

            if (el) el.textContent = gameState.gp.toLocaleString();

        });

    }



    // Update energy bar

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



    // Update boss health bar

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



    // Update user info

    updateUserInfo(gameState) {

        const userLevel = Math.floor(gameState.gp / 100) + 1;

        const userLevelEl = document.getElementById('tgUserLevel');

        if (userLevelEl) {

            userLevelEl.textContent = userLevel;

        }



        // Update rank (will be updated by leaderboard)

        const userRankEls = document.querySelectorAll('#userRank, #profileRank');

        userRankEls.forEach(el => {

            if (el && !el.dataset.updating) {

                el.textContent = '999+';

            }

        });

    }



    // Update tickets display

    updateTickets(gameState) {

        const ticketElements = document.querySelectorAll('#gameTickets');

        ticketElements.forEach(el => {

            if (el) el.textContent = gameState.gameTickets;

        });



        // Update cooldown

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



    // Update shop upgrade costs

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

                costEl.textContent = costs[upgrade] + ' GP';

            }

        });

    }



    // Notification system

    showNotification(text) {

        // Remove existing notifications

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



    // Modal management

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



    // Planet selection - UPDATED WITH ACHIEVEMENT TRACKING

    selectPlanet(planetName, planetId) {

        const gameState = window.gameState;

        if (!gameState) return;



        gameState.update({

            currentPlanet: planetName

        });



        // Track planet visit for achievements

        gameState.trackPlanetVisit(planetName);



        // Check first planet task

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



        // Update mining screen

        this.updateMiningScreen(planetName, planetId);

        

        // Show mining screen

        this.showScreen('miningScreen');

        this.showNotification(`🌍 Landed on ${planetName}!`);

    }



    // Update mining screen for selected planet

    updateMiningScreen(planetName, planetId) {

        const currentPlanetEl = document.getElementById('currentPlanet');

        if (currentPlanetEl) {

            currentPlanetEl.textContent = planetName;

        }



        const mineRewardEl = document.getElementById('mineReward');

        if (mineRewardEl) {

            mineRewardEl.textContent = Math.floor(planetId * 1.5 + 3);

        }



        // Update mining planet background

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



    // Load leaderboard data

    async loadLeaderboard() {

        if (!window.backendManager) return;



        try {

            // Show loading state

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

                

                // Update user rank with backend data

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

                // Show error message if backend fails

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



    // Display leaderboard entries

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



    // Render task content

    renderTaskContent() {

        // This will be implemented in the tasks.js file

        if (window.TasksManager) {

            window.TasksManager.renderContent();

        }

    }

}



// Global UI controller instance

window.uiController = new UIController();



// Daily Rewards Modal

function showDailyRewardsModal() {

    const modal = document.getElementById('dailyRewardsModal');

    const gameState = window.gameState?.get();

    

    if (!gameState) return;

    

    const streak = gameState.dailyStreak || 1;

    document.getElementById('currentStreak').textContent = streak;

    

    // Update reward day states

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

    

    // Update claim status

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



// Task Modal Functions

function openTaskModal(taskType) {

    const modal = document.getElementById('taskModal');

    const title = document.getElementById('taskModalTitle');

    const icon = document.getElementById('taskModalIcon');

    const desc = document.getElementById('taskModalDesc');

    const step2 = document.getElementById('taskStep2');

    const openBtn = document.getElementById('taskOpenBtn');

    const checkBtn = document.getElementById('taskCheckBtn');

    

    const gameState = window.gameState?.get();

    

    // Check if already completed

    if (taskType === 'telegram' && gameState?.oneTimeTasks?.telegram) {

        window.showNotification('Task already completed!');

        return;

    }

    if (taskType === 'twitter' && gameState?.oneTimeTasks?.twitter) {

        window.showNotification('Task already completed!');

        return;

    }

    

    const tasks = {

        telegram: {

            title: 'Join Telegram Community',

            icon: `<svg width="80" height="80" viewBox="0 0 24 24" fill="white">

                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>

            </svg>`,

            link: 'https://t.me/Cx_Odyssey_Community',

            step2Text: '2️⃣ Join the channel'

        },

        twitter: {

            title: 'Follow on Twitter',

            icon: `<svg width="80" height="80" viewBox="0 0 24 24" fill="white">

                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>

            </svg>`,

            link: 'https://x.com/Cx_Odyssey',

            step2Text: '2️⃣ Follow the account'

        }

    };

    

    const task = tasks[taskType];

    title.textContent = task.title;

    icon.innerHTML = task.icon;

    step2.textContent = task.step2Text;

    

    openBtn.onclick = () => {

        window.open(task.link, '_blank');

        openBtn.style.display = 'none';

        checkBtn.style.display = 'block';

    };

    

    checkBtn.onclick = () => {

        completeTask(taskType);

    };

    

    checkBtn.style.display = 'none';

    openBtn.style.display = 'block';

    

    modal.classList.add('active');

}



function completeTask(taskType) {

    const gameState = window.gameState;

    if (!gameState) return;

    

    const state = gameState.get();

    const newOneTimeTasks = { ...state.oneTimeTasks };

    newOneTimeTasks[taskType] = true;

    

    gameState.update({

        oneTimeTasks: newOneTimeTasks,

        gp: state.gp + 500,

        totalGPEarned: (state.totalGPEarned || state.gp) + 500

    });

    

    closeModal('taskModal');

    window.showNotification('✅ Task completed! +500 GP');

    

    if (window.TasksManager) {

        window.TasksManager.renderContent();

    }

}



// Shop Item Modal

function showShopItemModal(itemType) {

    const modal = document.getElementById('shopItemModal');

    const title = document.getElementById('shopItemModalTitle');

    const icon = document.getElementById('shopItemModalIcon');

    const desc = document.getElementById('shopItemModalDesc');

    const benefits = document.getElementById('shopItemBenefits');

    const cost = document.getElementById('shopItemCost');

    const purchaseBtn = document.getElementById('shopItemPurchaseBtn');

    

    const items = {

        energyPotion: {

            name: 'Energy Potion',

            icon: '🧪',

            desc: 'Instantly restore 50 energy points',

            benefits: ['Instant +50 Energy', 'No cooldown', 'Use anytime'],

            cost: '150 GP'

        },

        bossTicket: {

            name: 'Boss Ticket',

            icon: '🎫',

            desc: 'Get an extra boss raid ticket',

            benefits: ['+1 Game Ticket', 'More boss battles', 'Extra GP rewards'],

            cost: '200 GP'

        },

        shardBooster: {

            name: 'Shard Booster',

            icon: '💠',

            desc: 'Double shard gains for 1 hour',

            benefits: ['2x Shard rewards', '60 minutes duration', 'Stackable with other boosts'],

            cost: '300 GP'

        },

        gpBooster: {

            name: 'GP Booster',

            icon: '🎯',

            desc: 'Double GP gains for 1 hour',

            benefits: ['2x GP rewards', '60 minutes duration', 'Affects all activities'],

            cost: '400 GP'

        },

        luckyCharm: {

            name: 'Lucky Charm',

            icon: '🍀',

            desc: 'Increase drop rates by 50% for 1 hour',

            benefits: ['+50% Drop chance', '60 minutes duration', 'Better loot quality'],

            cost: '500 GP'

        }

    };

    

    const item = items[itemType];

    title.textContent = item.name;

    icon.textContent = item.icon;

    desc.textContent = item.desc;

    cost.textContent = item.cost;

    

    benefits.innerHTML = item.benefits.map(b => `<div>• ${b}</div>`).join('');

    

    purchaseBtn.onclick = () => {

        if (window.shopSystem) {

            window.shopSystem.buyShopItem(itemType);

            closeModal('shopItemModal');

        }

    };

    

    modal.classList.add('active');

}



// Premium Item Modal (with TON payment)

function buyPremiumItemTon(itemId) {

    const modal = document.getElementById('premiumItemModal');

    const title = document.getElementById('premiumItemModalTitle');

    const icon = document.getElementById('premiumItemModalIcon');

    const desc = document.getElementById('premiumItemModalDesc');

    const benefits = document.getElementById('premiumItemBenefits');

    const cost = document.getElementById('premiumItemCost');

    const purchaseBtn = document.getElementById('premiumItemPurchaseBtn');

    

    const item = window.PREMIUM_ITEMS[itemId];

    if (!item) return;

    

    title.textContent = item.name;

    icon.textContent = item.icon;

    desc.textContent = item.description;

    cost.textContent = `${item.price} TON`;

    

    benefits.innerHTML = item.benefits.map(b => `<div>• ${b}</div>`).join('');

    

    purchaseBtn.onclick = async () => {

        closeModal('premiumItemModal');

        if (window.walletManager) {

            await window.walletManager.purchasePremiumItem(itemId);

        } else {

            window.showNotification('Wallet system not available');

        }

    };

    

    modal.classList.add('active');

}



// Global functions for HTML onclick handlers

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



// Make modal functions globally available

window.showDailyRewardsModal = showDailyRewardsModal;

window.openTaskModal = openTaskModal;

window.showShopItemModal = showShopItemModal;

window.buyPremiumItemTon = buyPremiumItemTon;
