// Shop System - Extended with Items and Premium TON Payments
class ShopSystem {
    constructor() {
        this.currentTab = 'items';
        this.activeBoosts = {
            shardBooster: 0,
            gpBooster: 0,
            autoMiner: 0,
            luckyCharm: 0
        };
        this.activePremiumItems = {
            vipPass: 0,
            legendaryShip: false,
            unlimitedEnergy: 0,
            doubleXP: false
        };
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        const itemsTab = document.getElementById('itemsShopTab');
        const premiumTab = document.getElementById('premiumShopTab');
        
        [itemsTab, premiumTab].forEach(t => {
            if (t) t.classList.remove('active');
        });
        
        if (tab === 'items' && itemsTab) {
            itemsTab.classList.add('active');
        } else if (tab === 'premium' && premiumTab) {
            premiumTab.classList.add('active');
        }
        
        const itemsContent = document.getElementById('itemsShopContent');
        const premiumContent = document.getElementById('premiumShopContent');
        
        if (itemsContent) itemsContent.style.display = tab === 'items' ? 'grid' : 'none';
        if (premiumContent) {
            premiumContent.style.display = tab === 'premium' ? 'grid' : 'none';
            if (tab === 'premium') {
                this.renderPremiumItems();
            }
        }
    }

    renderPremiumItems() {
        const container = document.getElementById('premiumShopContent');
        if (!container || !window.PREMIUM_ITEMS) return;

        let html = '';
        
        Object.keys(window.PREMIUM_ITEMS).forEach(itemId => {
            const item = window.PREMIUM_ITEMS[itemId];
            html += `
                <div class="shop-item premium-item" onclick="buyPremiumItemTon('${itemId}')">
                    <div class="premium-badge">💎</div>
                    <div class="shop-icon">${item.icon}</div>
                    <div class="shop-title">${item.name}</div>
                    <div class="shop-cost">${item.price} TON</div>
                    <div class="shop-desc">${item.description}</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
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
                    this.activeBoosts.shardBooster = Date.now() + (60 * 60 * 1000);
                    this.startBoostTimer('shardBooster');
                }
            },
            gpBooster: {
                name: 'GP Booster',
                cost: 400,
                icon: '🎯',
                effect: () => {
                    this.activeBoosts.gpBooster = Date.now() + (60 * 60 * 1000);
                    this.startBoostTimer('gpBooster');
                }
            },
            luckyCharm: {
                name: 'Lucky Charm',
                cost: 500,
                icon: '🍀',
                effect: () => {
                    this.activeBoosts.luckyCharm = Date.now() + (60 * 60 * 1000);
                    this.startBoostTimer('luckyCharm');
                }
            }
        };

        const item = items[itemType];
        if (!item) return;

        const currentGP = gameState.getValue('gp');
        if (currentGP < item.cost) {
            if (window.uiController) {
                window.uiController.showNotification('Not enough GP!');
            }
            return;
        }

        gameState.setValue('gp', currentGP - item.cost);
        item.effect();

        if (window.uiController) {
            window.uiController.showNotification(`${item.icon} ${item.name} activated!`);
        }

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
                        shardBooster: 'Shard Booster expired',
                        gpBooster: 'GP Booster expired',
                        luckyCharm: 'Lucky Charm expired'
                    };
                    window.uiController.showNotification(messages[boostType] || 'Boost expired');
                }
            }
        }, 5000);
    }

    startPremiumTimer(itemType) {
        const checkTimer = setInterval(() => {
            if (itemType === 'vipPass' && Date.now() >= this.activePremiumItems.vipPass) {
                this.activePremiumItems.vipPass = 0;
                clearInterval(checkTimer);
                if (window.uiController) {
                    window.uiController.showNotification('VIP Pass expired');
                }
            } else if (itemType === 'unlimitedEnergy' && Date.now() >= this.activePremiumItems.unlimitedEnergy) {
                this.activePremiumItems.unlimitedEnergy = 0;
                const gameState = window.gameState;
                if (gameState) {
                    gameState.setValue('maxEnergy', 100);
                    gameState.setValue('energy', 100);
                }
                clearInterval(checkTimer);
                if (window.uiController) {
                    window.uiController.showNotification('Unlimited Energy expired');
                }
            }
        }, 60000);
    }

    startAutoMiner() {
        const mineInterval = setInterval(() => {
            if (Date.now() >= this.activeBoosts.autoMiner) {
                clearInterval(mineInterval);
                if (window.uiController) {
                    window.uiController.showNotification('Auto Miner stopped');
                }
                return;
            }

            const gameState = window.gameState;
            if (!gameState) return;

            const energy = gameState.getValue('energy');
            if (energy >= 2) {
                gameState.mine();
            }
        }, 10000);
    }

    isBoostActive(boostType) {
        return Date.now() < this.activeBoosts[boostType];
    }

    getShardMultiplier() {
        let multiplier = 1;
        if (this.isBoostActive('shardBooster')) multiplier *= 2;
        if (this.activePremiumItems.vipPass > Date.now()) multiplier *= 1.5;
        if (this.activePremiumItems.legendaryShip) multiplier *= 2;
        return multiplier;
    }

    getGPMultiplier() {
        let multiplier = 1;
        if (this.isBoostActive('gpBooster')) multiplier *= 2;
        if (this.activePremiumItems.vipPass > Date.now()) multiplier *= 1.5;
        if (this.activePremiumItems.doubleXP) multiplier *= 2;
        if (this.activePremiumItems.legendaryShip) multiplier *= 1.5;
        return multiplier;
    }

    getLuckyMultiplier() {
        let multiplier = 1;
        if (this.isBoostActive('luckyCharm')) multiplier *= 1.5;
        if (this.activePremiumItems.vipPass > Date.now()) multiplier *= 1.25;
        return multiplier;
    }

    hasUnlimitedEnergy() {
        return this.activePremiumItems.unlimitedEnergy > Date.now();
    }
}

window.shopSystem = new ShopSystem();

function switchShopTab(tab) {
    window.shopSystem?.switchTab(tab);
}

function buyShopItem(itemType) {
    window.shopSystem?.buyShopItem(itemType);
}
