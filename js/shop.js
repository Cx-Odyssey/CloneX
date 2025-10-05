// Shop System - Complete with Confirmation Modals

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

    // Show confirmation modal
    showConfirmModal(itemType, itemName, cost, benefits) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'confirmPurchaseModal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <button class="close-btn" onclick="closeConfirmModal()">&times;</button>
                <h2 class="modal-title">Confirm Purchase</h2>
                <div style="font-size: 48px; margin: 20px 0;">${this.getItemIcon(itemType)}</div>
                <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">${itemName}</div>
                <div style="font-size: 16px; color: var(--primary-gold); font-weight: bold; margin-bottom: 20px;">
                    ${cost}
                </div>
                
                <div style="background: rgba(255,215,0,0.1); border-radius: 12px; padding: 15px; margin: 20px 0; border: 1px solid rgba(255,215,0,0.3);">
                    <div style="font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 10px;">✨ Benefits:</div>
                    <div style="font-size: 14px; line-height: 1.8; text-align: left;">
                        ${benefits}
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <button class="action-btn" onclick="closeConfirmModal()" style="background: rgba(255,255,255,0.1);">
                        Cancel
                    </button>
                    <button class="action-btn" onclick="window.shopSystem.confirmPurchase('${itemType}')" style="background: linear-gradient(135deg, var(--primary-gold), var(--secondary-orange));">
                        Confirm
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    getItemIcon(itemType) {
        const icons = {
            speed: '🚀',
            damage: '⚔️',
            energy: '• Maximum energy +25<br>• Mine more before resting<br>• Longer play sessions',
        multiplier: '• GP rewards increased by 50%<br>• Earn more from all activities<br>• Faster progression'
    };
    
    window.shopSystem.showConfirmModal(type, names[type], `${cost} GP`, benefits[type]);
}

function buyShopItem(itemType) {
    const gameState = window.gameState;
    if (!gameState) return;
    
    // Check if trying to buy ticket when maxed
    if (itemType === 'bossTicket' && gameState.getValue('gameTickets') >= 10) {
        if (window.showNotification) {
            window.showNotification('❌ Tickets are already maxed (10/10)!');
        }
        return;
    }
    
    const items = {
        energyPotion: { name: 'Energy Potion', cost: 150, benefits: '• Instant +50 Energy<br>• Use anytime<br>• No cooldown' },
        bossTicket: { name: 'Boss Ticket', cost: 200, benefits: '• +1 Game Ticket<br>• Max 10 tickets<br>• Play more mini-games' },
        shardBooster: { name: 'Shard Booster', cost: 300, benefits: '• 2x Shard rewards<br>• Lasts 1 hour<br>• Stackable with other boosts' },
        gpBooster: { name: 'GP Booster', cost: 400, benefits: '• 2x GP rewards<br>• Lasts 1 hour<br>• Earn faster' },
        luckyCharm: { name: 'Lucky Charm', cost: 500, benefits: '• +50% Drop rates<br>• Lasts 1 hour<br>• Better loot chances' }
    };
    
    const item = items[itemType];
    if (!item) return;
    
    if (gameState.getValue('gp') < item.cost) {
        if (window.showNotification) {
            window.showNotification('❌ Not enough GP!');
        }
        return;
    }
    
    window.shopSystem.showConfirmModal(itemType, item.name, `${item.cost} GP`, item.benefits);
}

function buyPremiumItemTon(itemId) {
    if (window.walletManager) {
        window.walletManager.purchasePremiumItem(itemId);
    }
}⚡',
            multiplier: '💰',
            energyPotion: '🧪',
            bossTicket: '🎫',
            shardBooster: '💠',
            gpBooster: '🎯',
            luckyCharm: '🍀'
        };
        return icons[itemType] || '📦';
    }

    confirmPurchase(itemType) {
        const gameState = window.gameState;
        if (!gameState) return;
        
        // Check if it's an upgrade
        if (['speed', 'damage', 'energy', 'multiplier'].includes(itemType)) {
            const costs = { speed: 50, damage: 75, energy: 100, multiplier: 200 };
            const upgradeLevels = gameState.getValue('upgrades')[itemType] || 0;
            const cost = Math.floor(costs[itemType] * Math.pow(1.5, upgradeLevels));
            
            if (gameState.getValue('gp') < cost) {
                if (window.showNotification) {
                    window.showNotification('❌ Not enough GP!');
                }
                closeConfirmModal();
                return;
            }
            
            const upgrades = {...gameState.getValue('upgrades')};
            upgrades[itemType]++;
            
            let updates = {
                gp: gameState.getValue('gp') - cost,
                upgrades: upgrades
            };
            
            if (itemType === 'energy') {
                updates.maxEnergy = gameState.getValue('maxEnergy') + 25;
                updates.energy = gameState.getValue('maxEnergy') + 25;
            }
            
            gameState.update(updates);
            
            const messages = {
                speed: '🚀 Mining speed increased!',
                damage: '⚔️ Combat damage boosted!',
                energy: '⚡ Maximum energy increased!',
                multiplier: '💰 GP multiplier activated!'
            };
            
            if (window.showNotification) {
                window.showNotification(messages[itemType]);
            }
        } else {
            // It's a shop item
            this.buyShopItemDirect(itemType);
        }
        
        if (window.backendManager) {
            window.backendManager.saveProgress(gameState.get());
        }
        
        if (window.uiController) {
            window.uiController.updateUIElements(gameState.get());
        }
        
        closeConfirmModal();
    }

    buyShopItemDirect(itemType) {
        const gameState = window.gameState;
        if (!gameState) return;
        
        const items = {
            energyPotion: { 
                cost: 150, 
                effect: () => {
                    const currentEnergy = gameState.getValue('energy');
                    const maxEnergy = gameState.getValue('maxEnergy');
                    gameState.setValue('energy', Math.min(maxEnergy, currentEnergy + 50));
                    if (window.showNotification) {
                        window.showNotification('⚡ +50 Energy!');
                    }
                }
            },
            bossTicket: { 
                cost: 200, 
                effect: () => {
                    const currentTickets = gameState.getValue('gameTickets');
                    if (currentTickets >= 10) {
                        if (window.showNotification) {
                            window.showNotification('❌ Tickets are already maxed (10/10)!');
                        }
                        return false;
                    }
                    gameState.setValue('gameTickets', Math.min(10, currentTickets + 1));
                    if (window.showNotification) {
                        window.showNotification('🎫 +1 Game Ticket!');
                    }
                }
            },
            shardBooster: { 
                cost: 300, 
                effect: () => {
                    this.activeBoosts.shardBooster = Date.now() + (60 * 60 * 1000);
                    this.startBoostTimer('shardBooster');
                    if (window.showNotification) {
                        window.showNotification('💠 Shard Booster active for 1 hour!');
                    }
                }
            },
            gpBooster: { 
                cost: 400, 
                effect: () => {
                    this.activeBoosts.gpBooster = Date.now() + (60 * 60 * 1000);
                    this.startBoostTimer('gpBooster');
                    if (window.showNotification) {
                        window.showNotification('🎯 GP Booster active for 1 hour!');
                    }
                }
            },
            luckyCharm: { 
                cost: 500, 
                effect: () => {
                    this.activeBoosts.luckyCharm = Date.now() + (60 * 60 * 1000);
                    this.startBoostTimer('luckyCharm');
                    if (window.showNotification) {
                        window.showNotification('🍀 Lucky Charm active for 1 hour!');
                    }
                }
            }
        };

        const item = items[itemType];
        if (!item) return;

        const currentGP = gameState.getValue('gp');
        if (currentGP < item.cost) {
            if (window.showNotification) {
                window.showNotification('❌ Not enough GP!');
            }
            return;
        }

        if (item.effect() === false) return;
        
        gameState.setValue('gp', currentGP - item.cost);
    }

    startBoostTimer(boostType) {
        const checkBoost = setInterval(() => {
            if (Date.now() >= this.activeBoosts[boostType]) {
                this.activeBoosts[boostType] = 0;
                clearInterval(checkBoost);
                
                if (window.showNotification) {
                    const messages = {
                        shardBooster: '⏰ Shard Booster expired',
                        gpBooster: '⏰ GP Booster expired',
                        luckyCharm: '⏰ Lucky Charm expired'
                    };
                    window.showNotification(messages[boostType] || 'Boost expired');
                }
            }
        }, 5000);
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

function closeConfirmModal() {
    const modal = document.getElementById('confirmPurchaseModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

function switchShopTab(tab) {
    window.shopSystem?.switchTab(tab);
}

function buyUpgrade(type) {
    const gameState = window.gameState;
    if (!gameState) return;
    
    const costs = { speed: 50, damage: 75, energy: 100, multiplier: 200 };
    const upgradeLevels = gameState.getValue('upgrades')[type] || 0;
    const cost = Math.floor(costs[type] * Math.pow(1.5, upgradeLevels));
    
    if (gameState.getValue('gp') < cost) {
        if (window.showNotification) {
            window.showNotification('❌ Not enough GP!');
        }
        return;
    }
    
    const names = {
        speed: 'Speed Boost',
        damage: 'Damage Boost',
        energy: 'Energy Tank',
        multiplier: 'GP Multiplier'
    };
    
    const benefits = {
        speed: '• Mining speed increased by 20%<br>• Faster resource gathering<br>• Better efficiency',
        damage: '• Battle damage increased by 30%<br>• Defeat bosses faster<br>• Higher rewards',
        energy: '
