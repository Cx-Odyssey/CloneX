// Shop System - Extended with Items and Premium
class ShopSystem {
    constructor() {
        this.currentTab = 'upgrades';
        this.activeBoosts = {
            shardBooster: 0,
            gpBooster: 0,
            autoMiner: 0,
            luckyCharm: 0
        };
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        // Update tab buttons
        const upgradesTab = document.getElementById('upgradesShopTab');
        const itemsTab = document.getElementById('itemsShopTab');
        const premiumTab = document.getElementById('premiumShopTab');
        
        [upgradesTab, itemsTab, premiumTab].forEach(t => {
            if (t) t.classList.remove('active');
        });
        
        if (tab === 'upgrades' && upgradesTab) {
            upgradesTab.classList.add('active');
        } else if (tab === 'items' && itemsTab) {
            itemsTab.classList.add('active');
        } else if (tab === 'premium' && premiumTab) {
            premiumTab.classList.add('active');
        }
        
        // Show/hide content
        const upgradesContent = document.getElementById('upgradesShopContent');
        const itemsContent = document.getElementById('itemsShopContent');
        const premiumContent = document.getElementById('premiumShopContent');
        
        if (upgradesContent) upgradesContent.style.display = tab === 'upgrades' ? 'grid' : 'none';
        if (itemsContent) itemsContent.style.display = tab === 'items' ? 'grid' : 'none';
        if (premiumContent) premiumContent.style.display = tab === 'premium' ? 'grid' : 'none';
    }

    buyShopItem(itemType) {
        const gameState = window.gameState;
        if (!gameState) return;

        const items = {
            energyPotion: {
                name: 'Energy Potion',
                cost: 150,
                icon: '🧪',
                effect: () => {
                    const currentEnergy = gameState.getValue('energy');
                    const maxEnergy = gameState.getValue('maxEnergy');
                    gameState.setValue('energy', Math.min(maxEnergy, currentEnergy + 50));
                }
            },
            bossTicket: {
                name: 'Boss Ticket',
                cost: 200,
                icon: '🎫',
                effect: () => {
                    const currentTickets = gameState.getValue('gameTickets');
                    const maxTickets = gameState.getValue('maxTickets') || 10;
                    gameState.setValue('gameTickets', Math.min(maxTickets, currentTickets + 1));
                }
            },
            shardBooster: {
                name: 'Shard Booster',
                cost: 300,
                icon: '💠',
                effect: () => {
                    this.activeBoosts.shardBooster = Date.now() + (60 * 60 * 1000); // 1 hour
                    this.startBoostTimer('shardBooster');
                }
            },
            gpBooster: {
                name: 'GP Booster',
                cost: 400,
                icon: '🎯',
                effect: () => {
                    this.activeBoosts.gpBooster = Date.now() + (60 * 60 * 1000); // 1 hour
                    this.startBoostTimer('gpBooster');
                }
            },
            autoMiner: {
                name: 'Auto Miner',
                cost: 800,
                icon: '🤖',
                effect: () => {
                    this.activeBoosts.autoMiner = Date.now() + (2 * 60 * 60 * 1000); // 2 hours
                    this.startAutoMiner();
                }
            },
            luckyCharm: {
                name: 'Lucky Charm',
                cost: 500,
                icon: '🍀',
                effect: () => {
                    this.activeBoosts.luckyCharm = Date.now() + (60 * 60 * 1000); // 1 hour
                    this.startBoostTimer('luckyCharm');
                }
            }
        };

        const item = items[itemType];
        if (!item) return;

        const currentGP = gameState.getValue('gp');
        if (currentGP < item.cost) {
            if (window.uiController) {
                window.uiController.showNotification('🏆 Not enough GP!');
            }
            return;
        }

        // Deduct cost
        gameState.setValue('gp', currentGP - item.cost);

        // Apply effect
        item.effect();

        // Show notification
        if (window.uiController) {
            window.uiController.showNotification(`${item.icon} ${item.name} activated!`);
        }

        // Save progress
        if (window.backendManager) {
            window.backendManager.saveProgress(gameState.get());
        }
    }

    startBoostTimer(boostType) {
        const checkBoost = setInterval(() => {
            if (Date.now() >= this.activeBoosts[boostType]) {
                this.activeBoosts[boostType] = 0;
                clearInterval(checkBoost);
                
                if (window.uiController) {
                    const messages = {
                        shardBooster: '💠 Shard Booster expired',
                        gpBooster: '🎯 GP Booster expired',
                        luckyCharm: '🍀 Lucky Charm expired'
                    };
                    window.uiController.showNotification(messages[boostType] || 'Boost expired');
                }
            }
        }, 5000);
    }

    startAutoMiner() {
        const mineInterval = setInterval(() => {
            if (Date.now() >= this.activeBoosts.autoMiner) {
                clearInterval(mineInterval);
                if (window.uiController) {
                    window.uiController.showNotification('🤖 Auto Miner stopped');
                }
                return;
            }

            const gameState = window.gameState;
            if (!gameState) return;

            const energy = gameState.getValue('energy');
            if (energy >= 2) {
                gameState.mine();
            }
        }, 10000); // Mine every 10 seconds
    }

    isBoostActive(boostType) {
        return Date.now() < this.activeBoosts[boostType];
    }

    getShardMultiplier() {
        return this.isBoostActive('shardBooster') ? 2 : 1;
    }

    getGPMultiplier() {
        return this.isBoostActive('gpBooster') ? 2 : 1;
    }

    getLuckyMultiplier() {
        return this.isBoostActive('luckyCharm') ? 1.5 : 1;
    }
}

// Premium Shop Functions
function showPremiumComingSoon() {
    if (window.uiController) {
        window.uiController.showModal('premiumComingSoonModal');
    }
}

// Global shop system
window.shopSystem = new ShopSystem();

// Global functions for HTML
function switchShopTab(tab) {
    window.shopSystem?.switchTab(tab);
}

function buyShopItem(itemType) {
    window.shopSystem?.buyShopItem(itemType);
}
