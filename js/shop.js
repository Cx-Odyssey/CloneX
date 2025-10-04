// shop.js - Updated with Auto Miner Premium and 2-tab system

class ShopSystem {
    constructor() {
        this.currentTab = 'items';
        this.activeBoosts = {
            shardBooster: 0,
            gpBooster: 0,
            luckyCharm: 0
        };
        this.activePremiumItems = {
            vipPass: 0,
            legendaryShip: false,
            unlimitedEnergy: 0,
            doubleXP: false,
            autoMinerPremium: 0
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

    buyPremiumItem(itemType) {
        const gameState = window.gameState;
        if (!gameState) return;

        const premiumItems = {
            vipPass: {
                name: 'VIP Pass',
                cost: 5000,
                icon: '👑',
                effect: () => {
                    this.activePremiumItems.vipPass = Date.now() + (30 * 24 * 60 * 60 * 1000);
                    this.startPremiumTimer('vipPass');
                }
            },
            legendaryShip: {
                name: 'Legendary Ship',
                cost: 10000,
                icon: '🛸',
                effect: () => {
                    this.activePremiumItems.legendaryShip = true;
                    const upgrades = gameState.getValue('upgrades');
                    gameState.setValue('upgrades', {
                        speed: upgrades.speed + 5,
                        damage: upgrades.damage + 5,
                        energy: upgrades.energy + 3,
                        multiplier: upgrades.multiplier + 3
                    });
                    gameState.setValue('maxEnergy', gameState.getValue('maxEnergy') + 75);
                    gameState.setValue('energy', gameState.getValue('maxEnergy'));
                }
            },
            autoMiner: {
                name: 'Auto Miner Premium',
                cost: 5000,
                icon: '🤖',
                effect: () => {
                    this.activePremiumItems.autoMinerPremium = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days
                    gameState.setValue('activePremiumItems', this.activePremiumItems);
                    this.startPremiumTimer('autoMinerPremium');
                }
            },
            unlimitedEnergy: {
                name: 'Unlimited Energy',
                cost: 3000,
                icon: '⚡',
                effect: () => {
                    this.activePremiumItems.unlimitedEnergy = Date.now() + (7 * 24 * 60 * 60 * 1000);
                    gameState.setValue('maxEnergy', 9999);
                    gameState.setValue('energy', 9999);
                    this.startPremiumTimer('unlimitedEnergy');
                }
            },
            gpMegaPack: {
                name: 'GP Mega Pack',
                cost: 6000,
                icon: '💰',
                effect: () => {
                    const currentGP = gameState.getValue('gp');
                    gameState.setValue('gp', currentGP + 50000);
                    gameState.setValue('totalGPEarned', (gameState.getValue('totalGPEarned') || currentGP) + 50000);
                }
            },
            cosmicSkinPack: {
                name: 'Cosmic Skin Pack',
                cost: 8000,
                icon: '🎨',
                effect: () => {
                    const skins = gameState.getValue('skins') || [];
                    const newSkins = ['Nebula', 'Supernova', 'Quasar', 'Pulsar', 'BlackHole', 'WhiteDwarf', 'RedGiant', 'NeutronStar', 'Magnetar', 'Gamma'];
                    gameState.setValue('skins', [...new Set([...skins, ...newSkins])]);
                }
            },
            doubleXP: {
                name: 'Double XP Boost',
                cost: 4000,
                icon: '🔥',
                effect: () => {
                    this.activePremiumItems.doubleXP = true;
                }
            },
            starterBundle: {
                name: 'Starter Bundle',
                cost: 2000,
                icon: '🎁',
                effect: () => {
                    gameState.setValue('gp', gameState.getValue('gp') + 5000);
                    gameState.setValue('shards', gameState.getValue('shards') + 1000);
                    gameState.setValue('gameTickets', 10);
                    gameState.setValue('maxEnergy', gameState.getValue('maxEnergy') + 50);
                    gameState.setValue('energy', gameState.getValue('maxEnergy'));
                    
                    const upgrades = gameState.getValue('upgrades');
                    gameState.setValue('upgrades', {
                        speed: upgrades.speed + 2,
                        damage: upgrades.damage + 2,
                        energy: upgrades.energy + 1,
                        multiplier: upgrades.multiplier + 1
                    });
                }
            },
            ultimatePack: {
                name: 'Ultimate Pack',
                cost: 20000,
                icon: '🌟',
                effect: () => {
                    this.activePremiumItems.vipPass = Date.now() + (365 * 24 * 60 * 60 * 1000);
                    this.activePremiumItems.doubleXP = true;
                    this.activePremiumItems.legendaryShip = true;
                    
                    gameState.setValue('gp', gameState.getValue('gp') + 100000);
                    gameState.setValue('shards', gameState.getValue('shards') + 10000);
                    gameState.setValue('maxEnergy', 500);
                    gameState.setValue('energy', 500);
                    gameState.setValue('gameTickets', 10);
                    
                    const upgrades = gameState.getValue('upgrades');
                    gameState.setValue('upgrades', {
                        speed: upgrades.speed + 10,
                        damage: upgrades.damage + 10,
                        energy: upgrades.energy + 5,
                        multiplier: upgrades.multiplier + 5
                    });
                }
            }
        };

        const item = premiumItems[itemType];
        if (!item) return;

        const currentGP = gameState.getValue('gp');
        if (currentGP < item.cost) {
            if (window.uiController) {
                window.uiController.showNotification('Not enough GP for premium item!');
            }
            return;
        }

        gameState.setValue('gp', currentGP - item.cost);
        item.effect();

        if (window.uiController) {
            window.uiController.showNotification(`${item.icon} ${item.name} purchased!`);
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
            } else if (itemType === 'autoMinerPremium' && Date.now() >= this.activePremiumItems.autoMinerPremium) {
                this.activePremiumItems.autoMinerPremium = 0;
                clearInterval(checkTimer);
                if (window.uiController) {
                    window.uiController.showNotification('Auto Miner Premium expired');
                }
            }
        }, 60000);
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

// Global shop system
window.shopSystem = new ShopSystem();

// Global functions for HTML
function switchShopTab(tab) {
    window.shopSystem?.switchTab(tab);
}

function buyShopItem(itemType) {
    window.shopSystem?.buyShopItem(itemType);
}

function buyPremiumItem(itemType) {
    window.shopSystem?.buyPremiumItem(itemType);
}
