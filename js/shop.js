// shop.js - FIXED: Proper TON/GP icon display and alignment

class ShopSystem {
    constructor() {
        this.currentTab = 'items';
        // ... rest of constructor same
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
                    <div class="shop-cost" style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                        <span style="font-size: 18px; font-weight: bold;">${item.price}</span>
                        <img src="https://cx-odyssey.github.io/CloneX/assets/ton.png" alt="TON" style="width: 20px; height: 20px; object-fit: contain;">
                    </div>
                    <div class="shop-desc">${item.description}</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    // FIXED: Updated modal with proper icon alignment
    showShopItemModal(itemType) {
        const item = this.shopItems[itemType];
        if (!item) return;

        const gameState = window.gameState?.get();
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
                        <p style="font-size: 11px; color: rgba(255,255,255,0.8); line-height: 1.3; margin: 0;">${item.description}</p>
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
                        <img src="https://cx-odyssey.github.io/CloneX/assets/gp.png" alt="GP" style="width: 24px; height: 24px; object-fit: contain;">
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

    // ... rest of methods remain same
}

// FIXED: Premium item modal with proper TON icon alignment
function showPremiumItemModal(itemId) {
    const item = window.PREMIUM_ITEMS?.[itemId];
    if (!item) return;

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'premiumItemModal';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 420px; animation: modalSlideIn 0.3s ease; border: 2px solid var(--neon-blue); background: linear-gradient(135deg, rgba(0, 145, 234, 0.1), rgba(26, 26, 46, 0.95));">
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
