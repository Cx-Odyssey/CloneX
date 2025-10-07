// Shop System - Complete with Beautiful Modals (FIXED: Horizontal wide, vertical compact)

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
        
        this.shopItems = {
            // UPGRADES (permanent stat boosts)
            speedUpgrade: {
                name: 'Speed Boost',
                cost: () => 50 * Math.pow(2, window.gameState.getValue('upgrades').speed),
                icon: '🚀',
                description: '+20% Mining Speed (Permanent)',
                benefits: ['Faster mining', 'Permanent upgrade', 'Stacks with purchases'],
                isUpgrade: true,
                upgradeType: 'speed',
                effect: () => {
                    return window.miningSystem?.buyUpgrade('speed');
                }
            },
            damageUpgrade: {
                name: 'Damage Boost',
                cost: () => 75 * Math.pow(2, window.gameState.getValue('upgrades').damage),
                icon: '⚔️',
                description: '+30% Battle Damage (Permanent)',
                benefits: ['Stronger attacks', 'Permanent upgrade', 'Stacks with purchases'],
                isUpgrade: true,
                upgradeType: 'damage',
                effect: () => {
                    return window.miningSystem?.buyUpgrade('damage');
                }
            },
            energyUpgrade: {
                name: 'Energy Tank',
                cost: () => 100 * Math.pow(2, window.gameState.getValue('upgrades').energy),
                icon: '⚡',
                description: '+25 Max Energy (Permanent)',
                benefits: ['+25 Max Energy', 'Fully restored', 'Permanent upgrade'],
                isUpgrade: true,
                upgradeType: 'energy',
                effect: () => {
                    return window.miningSystem?.buyUpgrade('energy');
                }
            },
            multiplierUpgrade: {
                name: 'GP Multiplier',
                cost: () => 200 * Math.pow(2, window.gameState.getValue('upgrades').multiplier),
                icon: '💰',
                description: '+50% GP Gain (Permanent)',
                benefits: ['More GP per action', 'Permanent upgrade', 'Stacks with purchases'],
                isUpgrade: true,
                upgradeType: 'multiplier',
                effect: () => {
                    return window.miningSystem?.buyUpgrade('multiplier');
                }
            },
            // CONSUMABLES & BOOSTERS
            energyPotion: {
                name: 'Energy Potion',
                cost: 150,
                icon: '🧪',
                description: 'Instantly restore 50 energy points',
                benefits: ['Instant +50 Energy', 'No cooldown', 'Use anytime'],
                effect: () => {
                    const gameState = window.gameState;
                    const currentEnergy = gameState.getValue('energy');
                    const maxEnergy = gameState.getValue('maxEnergy');
                    gameState.setValue('energy', Math.min(maxEnergy, currentEnergy + 50));
                }
            },
            shardBooster: {
                name: 'Shard Booster',
                cost: 300,
                icon: '💠',
                description: 'Double shard gains for 1 hour',
                benefits: ['2x Shard rewards', '60 minutes duration', 'Stackable with other boosts'],
                effect: () => {
                    this.activeBoosts.shardBooster = Date.now() + (60 * 60 * 1000);
                    this.startBoostTimer('shardBooster');
                }
            },
            gpBooster: {
                name: 'GP Booster',
                cost: 400,
                icon: '🎯',
                description: 'Double GP gains for 1 hour',
                benefits: ['2x GP rewards', '60 minutes duration', 'Affects all activities'],
                effect: () => {
                    this.activeBoosts.gpBooster = Date.now() + (60 * 60 * 1000);
                    this.startBoostTimer('gpBooster');
                }
            },
            luckyCharm: {
                name: 'Lucky Charm',
                cost: 500,
                icon: '🍀',
                description: 'Increase drop rates by 50% for 1 hour',
                benefits: ['+50% Drop chance', '60 minutes duration', 'Better loot quality'],
                effect: () => {
                    this.activeBoosts.luckyCharm = Date.now() + (60 * 60 * 1000);
                    this.startBoostTimer('luckyCharm');
                }
            }
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
                <div class="shop-item premium-item" onclick="showPremiumItemModal('${itemId}')">
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

    showShopItemModal(itemType) {
        const item = this.shopItems[itemType];
        if (!item) return;

        const gameState = window.gameState?.get();
        
        // Get cost (handle function costs for upgrades)
        const itemCost = typeof item.cost === 'function' ? item.cost() : item.cost;
        const canAfford = gameState && gameState.gp >= itemCost;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'shopItemModal';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 420px; animation: modalSlideIn 0.3s ease;">
                <button class="close-btn" onclick="closeShopItemModal()">&times;</button>
                
                <div style="text-align: center; margin-bottom: 15px;">
                    <div style="font-size: 60px; margin-bottom: 12px; animation: iconBounce 0.6s ease;">${item.icon}</div>
                    <h2 style="color: var(--primary-gold); font-size: 20px; margin-bottom: 6px;">${item.name}</h2>
                    <p style="font-size: 12px; color: rgba(255,255,255,0.8); line-height: 1.4;">${item.description}</p>
                </div>

                <div style="background: linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,107,53,0.05)); border-radius: 15px; padding: 15px; margin: 15px 0; border: 1px solid rgba(255,215,0,0.3);">
                    <div style="font-size: 13px; font-weight: 600; color: var(--primary-gold); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
                        <span>✨</span> Benefits
                    </div>
                    ${item.benefits.map(b => `
                        <div style="display: flex; align-items: center; gap: 8px; margin: 6px 0; font-size: 12px; color: rgba(255,255,255,0.9);">
                            <span style="color: var(--success-green); font-size: 14px;">•</span>
                            <span>${b}</span>
                        </div>
                    `).join('')}
                </div>

                <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 15px; margin: 15px 0; text-align: center; border: 2px solid ${canAfford ? 'var(--primary-gold)' : 'var(--danger-red)'};">
                    <div style="font-size: 11px; color: rgba(255,255,255,0.7); margin-bottom: 8px;">Price</div>
                    <div style="font-size: 28px; font-weight: bold; color: ${canAfford ? 'var(--primary-gold)' : 'var(--danger-red)'};">${itemCost} GP</div>
                    ${!canAfford ? '<div style="font-size: 10px; color: var(--danger-red); margin-top: 6px;">Insufficient GP</div>' : ''}
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px;">
                    <button onclick="closeShopItemModal()" style="background: rgba(255,255,255,0.1); color: white; border: none; padding: 14px; border-radius: 12px; font-weight: bold; font-size: 14px; cursor: pointer; transition: all 0.3s;">
                        Cancel
                    </button>
                    <button onclick="purchaseShopItem('${itemType}')" ${!canAfford ? 'disabled' : ''} style="background: ${canAfford ? 'linear-gradient(135deg, var(--primary-gold), var(--secondary-orange))' : 'rgba(128,128,128,0.3)'}; color: ${canAfford ? '#000' : 'rgba(255,255,255,0.5)'}; border: none; padding: 14px; border-radius: 12px; font-weight: bold; font-size: 14px; cursor: ${canAfford ? 'pointer' : 'not-allowed'}; transition: all 0.3s;">
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

    buyShopItem(itemType) {
        const gameState = window.gameState;
        if (!gameState) return;

        const item = this.shopItems[itemType];
        if (!item) return;

        // Handle upgrades differently
        if (item.isUpgrade) {
            const result = item.effect();
            if (result && result.success) {
                if (window.uiController) {
                    window.uiController.showNotification(`${item.icon} ${item.name} upgraded!`);
                }
            }
            closeShopItemModal();
            return;
        }

        // Handle regular items
        const itemCost = typeof item.cost === 'function' ? item.cost() : item.cost;
        const currentGP = gameState.getValue('gp');
        
        if (currentGP < itemCost) {
            if (window.uiController) {
                window.uiController.showNotification('Not enough GP!');
            }
            return;
        }

        gameState.setValue('gp', currentGP - itemCost);
        item.effect();

        if (window.uiController) {
            window.uiController.showNotification(`${item.icon} ${item.name} activated!`);
        }

        if (window.backendManager) {
            window.backendManager.saveProgress(gameState.get());
        }

        closeShopItemModal();
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

    startAutoMinerInterval() {
        if (this.activeBoosts.autoMiner > Date.now()) {
            this.startAutoMiner();
        }
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

function showShopItemModal(itemType) {
    window.shopSystem?.showShopItemModal(itemType);
}

function closeShopItemModal() {
    const modal = document.getElementById('shopItemModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

function purchaseShopItem(itemType) {
    window.shopSystem?.buyShopItem(itemType);
}

function showPremiumItemModal(itemId) {
    const item = window.PREMIUM_ITEMS?.[itemId];
    if (!item) return;

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'premiumItemModal';
    
    // FIXED: Horizontal wide, vertical compact with proper TON image
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; width: 90%; animation: modalSlideIn 0.3s ease; border: 2px solid var(--neon-blue); background: linear-gradient(135deg, rgba(0, 145, 234, 0.1), rgba(26, 26, 46, 0.95));">
            <button class="close-btn" onclick="closePremiumItemModal()">&times;</button>
            
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                <div style="font-size: 50px; animation: iconBounce 0.6s ease;">${item.icon}</div>
                <div style="flex: 1; text-align: left;">
                    <h2 style="color: var(--neon-blue); font-size: 18px; margin: 0 0 4px 0;">${item.name}</h2>
                    <p style="font-size: 11px; color: rgba(255,255,255,0.8); line-height: 1.3; margin: 0;">${item.description}</p>
                </div>
            </div>

            <div style="background: linear-gradient(135deg, rgba(0,245,255,0.15), rgba(0,145,234,0.05)); border-radius: 12px; padding: 12px; margin: 12px 0; border: 1px solid rgba(0,245,255,0.3);">
                <div style="font-size: 12px; font-weight: 600; color: var(--neon-blue); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                    <span>✨</span> Premium Benefits
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                    ${item.benefits.map(b => `
                        <div style="display: flex; align-items: center; gap: 6px; font-size: 10px; color: rgba(255,255,255,0.9);">
                            <span style="color: var(--neon-blue); font-size: 12px;">•</span>
                            <span>${b}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div style="background: rgba(0,245,255,0.1); border-radius: 12px; padding: 12px; margin: 12px 0; text-align: center; border: 2px solid var(--neon-blue);">
                <div style="font-size: 10px; color: rgba(255,255,255,0.7); margin-bottom: 6px;">Price</div>
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span style="font-size: 24px; font-weight: bold; color: var(--neon-blue);">${item.price}</span>
                    <img src="https://cx-odyssey.github.io/CloneX/assets/ton.png" alt="TON" style="width: 24px; height: 24px; object-fit: contain;">
                </div>
                <div style="font-size: 9px; color: rgba(255,255,255,0.6); margin-top: 4px;">Blockchain payment required</div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
                <button onclick="closePremiumItemModal()" style="background: rgba(255,255,255,0.1); color: white; border: none; padding: 12px; border-radius: 12px; font-weight: bold; font-size: 13px; cursor: pointer; transition: all 0.3s;">
                    Cancel
                </button>
                <button onclick="purchasePremiumItem('${itemId}')" style="background: linear-gradient(135deg, var(--neon-blue), #0091EA); color: #000; border: none; padding: 12px; border-radius: 12px; font-weight: bold; font-size: 13px; cursor: pointer; transition: all 0.3s;">
                    Purchase
                </button>
            </div>
        </div>

        <style>
            @keyframes iconBounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
        </style>
    `;
    
    document.body.appendChild(modal);
}

function closePremiumItemModal() {
    const modal = document.getElementById('premiumItemModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

async function purchasePremiumItem(itemId) {
    closePremiumItemModal();
    if (window.walletManager) {
        await window.walletManager.purchasePremiumItem(itemId);
    } else {
        if (window.showNotification) {
            window.showNotification('Wallet system not available');
        }
    }
}
