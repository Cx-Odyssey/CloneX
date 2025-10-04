// Shop System - With Confirmation Modals and 2 Tabs (Items & Premium)
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
        if (premiumContent) premiumContent.style.display = tab === 'premium' ? 'grid' : 'none';
    }

    // Show confirmation modal before purchase
    showPurchaseConfirmation(itemType, itemCategory) {
        const items = {
            // Regular Items (moved upgrades here)
            speed: { name: 'Speed Boost', cost: () => 50 * Math.pow(2, window.gameState.getValue('upgrades').speed), icon: '🚀', desc: '+20% Mining Speed' },
            damage: { name: 'Damage Boost', cost: () => 75 * Math.pow(2, window.gameState.getValue('upgrades').damage), icon: '⚔️', desc: '+30% Battle Damage' },
            energy: { name: 'Energy Tank', cost: () => 100 * Math.pow(2, window.gameState.getValue('upgrades').energy), icon: '⚡', desc: '+25 Max Energy' },
            multiplier: { name: 'GP Multiplier', cost: () => 200 * Math.pow(2, window.gameState.getValue('upgrades').multiplier), icon: '💰', desc: '+50% GP Gain' },
            energyPotion: { name: 'Energy Potion', cost: () => 150, icon: '🧪', desc: 'Instant +50 Energy' },
            bossTicket: { name: 'Boss Ticket', cost: () => 200, icon: '🎫', desc: '+1 Game Ticket' },
            shardBooster: { name: 'Shard Booster', cost: () => 300, icon: '💠', desc: '2x Shards (1 hour)' },
            gpBooster: { name: 'GP Booster', cost: () => 400, icon: '🎯', desc: '2x GP (1 hour)' },
            luckyCharm: { name: 'Lucky Charm', cost: () => 500, icon: '🍀', desc: '+50% Drop Rate (1 hour)' },
            
            // Premium Items
            autoMiner: { name: 'Auto Miner', cost: () => 2000, icon: '🤖', desc: 'Auto mine forever (persistent)' },
            vipPass: { name: 'VIP Pass', cost: () => 5000, icon: '👑', desc: '30 days +50% bonuses' },
            legendaryShip: { name: 'Legendary Ship', cost: () => 10000, icon: '🛸', desc: '+100% to all stats' },
            unlimitedEnergy: { name: 'Unlimited Energy', cost: () => 3000, icon: '⚡', desc: '9999 energy (7 days)' },
            gpMegaPack: { name: 'GP Mega Pack', cost: () => 6000, icon: '💰', desc: 'Instant 50,000 GP' },
            cosmicSkinPack: { name: 'Cosmic Skin Pack', cost: () => 8000, icon: '🎨', desc: '10 exclusive skins' },
            doubleXP: { name: 'Double XP Boost', cost: () => 4000, icon: '🔥', desc: '2x XP forever' },
            starterBundle: { name: 'Starter Bundle', cost: () => 2000, icon: '🎁', desc: 'Best value package' },
            ultimatePack: { name: 'Ultimate Pack', cost: () => 20000, icon: '🌟', desc: 'Everything unlocked' }
        };

        const item = items[itemType];
        if (!item) return;

        const cost = typeof item.cost === 'function' ? item.cost() : item.cost;
        const currentGP = window.gameState?.getValue('gp') || 0;

        // Create modal HTML
        const modalHTML = `
            <div class="modal active" id="purchaseConfirmModal" style="z-index: 300;">
                <div class="modal-content" style="max-width: 90%; padding: 25px;">
                    <button class="close-btn" onclick="window.shopSystem.closePurchaseModal()">&times;</button>
                    <div style="font-size: 60px; margin: 20px 0;">${item.icon}</div>
                    <h2 class="modal-title">${item.name}</h2>
                    <p style="font-size: 14px; color: rgba(255,255,255,0.8); margin: 15px 0;">${item.desc}</p>
                    
                    <div style="background: rgba(255,215,0,0.1); padding: 15px; border-radius: 12px; margin: 20px 0;">
                        <div style="font-size: 24px; font-weight: bold; color: var(--primary-gold);">${cost.toLocaleString()} GP</div>
                        <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 5px;">Your Balance: ${currentGP.toLocaleString()} GP</div>
                    </div>

                    ${currentGP < cost ? 
                        '<div style="background: rgba(255,7,58,0.2); padding: 12px; border-radius: 10px; color: var(--danger-red); font-size: 13px; margin-bottom: 15px;">❌ Not enough GP!</div>' : ''}
                    
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button class="action-btn" style="flex: 1; background: var(--danger-red);" onclick="window.shopSystem.closePurchaseModal()">Cancel</button>
                        <button class="action-btn" style="flex: 1; ${currentGP < cost ? 'opacity: 0.5; cursor: not-allowed;' : ''}" 
                                ${currentGP < cost ? 'disabled' : ''} 
                                onclick="window.shopSystem.confirmPurchase('${itemType}', '${itemCategory}')">Purchase</button>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existing = document.getElementById('purchaseConfirmModal');
        if (existing) existing.remove();

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    closePurchaseModal() {
        const modal = document.getElementById('purchaseConfirmModal');
        if (modal) modal.remove();
    }

    confirmPurchase(itemType, itemCategory) {
        this.closePurchaseModal();
        
        if (itemCategory === 'premium' || itemType === 'autoMiner') {
            this.buyPremiumItem(itemType);
        } else if (['speed', 'damage', 'energy', 'multiplier'].includes(itemType)) {
            window.miningSystem?.buyUpgrade(itemType);
        } else {
            this.buyShopItem(itemType);
        }
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
            autoMiner: {
                name: 'Auto Miner',
                cost: 2000,
                icon: '🤖',
                effect: () => {
                    this.activePremiumItems.autoMiner = true;
                    this.activeBoosts.autoMiner = Date.now() + (365 * 24 * 60 * 60 * 1000); // 1 year (persistent)
                    this.startPersistentAutoMiner();
                }
            },
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
                    this.activePremiumItems.autoMiner = true;
                    
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
                    
                    this.startPersistentAutoMiner();
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

    startPersistentAutoMiner() {
        // Set flag in gameState so it persists
        const gameState = window.gameState;
        if (gameState) {
            gameState.setValue('hasAutoMiner', true);
            gameState.setValue('autoMinerStartTime', Date.now());
        }
        
        // Start mining interval
        this.startAutoMinerInterval();
    }

    startAutoMinerInterval() {
        // Clear existing interval
        if (this.autoMinerInterval) {
            clearInterval(this.autoMinerInterval);
        }

        // Mine every 10 seconds if auto miner is active
        this.autoMinerInterval = setInterval(() => {
            const gameState = window.gameState;
            if (!gameState) return;

            const hasAutoMiner = gameState.getValue('hasAutoMiner');
            const autoMinerExpiry = this.activeBoosts.autoMiner;
            
            // Check if still valid
            if (!hasAutoMiner || Date.now() >= autoMinerExpiry) {
                clearInterval(this.autoMinerInterval);
                gameState.setValue('hasAutoMiner', false);
                return;
            }

            const energy = gameState.getValue('energy');
            if (energy >= 2) {
                gameState.mine();
            }
        }, 10000);
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
    window.shopSystem?.showPurchaseConfirmation(itemType, 'item');
}

function buyUpgrade(itemType) {
    window.shopSystem?.showPurchaseConfirmation(itemType, 'item');
}

function buyPremiumItem(itemType) {
    window.shopSystem?.showPurchaseConfirmation(itemType, 'premium');
}

// Initialize auto miner on load if player has it
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const gameState = window.gameState;
        if (gameState && gameState.getValue('hasAutoMiner')) {
            window.shopSystem.startAutoMinerInterval();
        }
    }, 2000);
});
