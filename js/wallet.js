// wallet.js - TON Wallet Connection and Payment Manager

class WalletManager {
    constructor() {
        this.tonConnectUI = null;
        this.isConnected = false;
        this.walletAddress = null;
        this.pendingPurchases = new Map();
    }

    async initialize() {
        try {
            console.log('🔗 Initializing TON Connect UI...');
            
            this.tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
                manifestUrl: 'https://cx-odyssey.github.io/CloneX/tonconnect-manifest.json',
                buttonRootId: null
            });

            this.tonConnectUI.onStatusChange(wallet => {
                if (wallet) {
                    this.handleWalletConnected(wallet);
                } else {
                    this.handleWalletDisconnected();
                }
            });

            // FIXED: Check for existing wallet connection
            const currentWallet = this.tonConnectUI.wallet;
            if (currentWallet) {
                this.handleWalletConnected(currentWallet);
            } else {
                // Check if wallet was previously connected (from gameState)
                const gameState = window.gameState?.get();
                if (gameState?.walletConnected && gameState?.walletAddress) {
                    // Wallet was connected before but session expired
                    this.isConnected = false;
                    this.walletAddress = null;
                    // Update UI to show disconnected state
                    this.updateWalletUI(null);
                }
            }

            console.log('✅ TON Connect UI initialized');
            return true;
        } catch (error) {
            console.error('❌ Wallet initialization error:', error);
            return false;
        }
    }

    handleWalletConnected(wallet) {
        this.isConnected = true;
        this.walletAddress = wallet.account.address;
        
        const friendlyAddress = this.formatAddress(this.walletAddress);
        console.log('✅ Wallet connected:', friendlyAddress);

        this.updateWalletUI(friendlyAddress);
        this.saveWalletToBackend();

        if (window.gameState) {
            window.gameState.update({
                walletConnected: true,
                walletAddress: this.walletAddress
            });
        }

        if (window.showNotification) {
            window.showNotification('Wallet connected successfully!');
        }
    }

    handleWalletDisconnected() {
        this.isConnected = false;
        this.walletAddress = null;
        
        console.log('🔌 Wallet disconnected');
        this.updateWalletUI(null);

        if (window.gameState) {
            window.gameState.update({
                walletConnected: false,
                walletAddress: ''
            });
        }
    }

    formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    }

    updateWalletUI(address) {
        const connectBtn = document.getElementById('connectWalletBtn');
        const walletInfo = document.getElementById('walletInfo');
        const connectedAddress = document.getElementById('connectedAddress');

        if (address && connectBtn && walletInfo) {
            connectBtn.style.display = 'none';
            walletInfo.style.display = 'block';
            if (connectedAddress) {
                connectedAddress.textContent = address;
            }
        } else if (connectBtn && walletInfo) {
            connectBtn.style.display = 'block';
            walletInfo.style.display = 'none';
        }
    }

    async saveWalletToBackend() {
        if (!window.backendManager || !this.walletAddress) return;

        const gameInit = window.gameInitializer;
        if (!gameInit?.tgUser?.id) return;

        try {
            await window.backendManager.saveWallet(this.walletAddress);
            console.log('✅ Wallet saved to backend');
        } catch (error) {
            console.error('Failed to save wallet:', error);
        }
    }

    async connect() {
        if (!this.tonConnectUI) {
            console.error('TON Connect UI not initialized');
            if (window.showNotification) {
                window.showNotification('Wallet system not ready. Please refresh the page.');
            }
            return;
        }

        try {
            console.log('🔗 Opening wallet connection modal...');
            
            // FIXED: Properly handle the connection flow
            await this.tonConnectUI.openModal();
            
        } catch (error) {
            console.error('❌ Connection error:', error);
            
            // More specific error handling
            if (error.message && error.message.includes('user reject')) {
                if (window.showNotification) {
                    window.showNotification('Connection cancelled');
                }
            } else {
                if (window.showNotification) {
                    window.showNotification('Failed to connect wallet. Please try again.');
                }
            }
        }
    }

    async disconnect() {
        if (!this.tonConnectUI) return;

        try {
            await this.tonConnectUI.disconnect();
            if (window.showNotification) {
                window.showNotification('Wallet disconnected');
            }
        } catch (error) {
            console.error('Disconnect error:', error);
        }
    }

    async purchasePremiumItem(itemId) {
        if (!this.isConnected) {
            if (window.showNotification) {
                window.showNotification('Please connect your wallet first');
            }
            // Try to connect
            await this.connect();
            return false;
        }

        const item = window.PREMIUM_ITEMS?.[itemId];
        if (!item) {
            console.error('Item not found:', itemId);
            if (window.showNotification) {
                window.showNotification('Item not found');
            }
            return false;
        }

        // FIXED: Use correct recipient address format
        const recipientAddress = 'EQDte6-r3llgo8OsQ6_wGRzSmXM4cg2i1irWY5B35QATaOAI';

        const tonAmount = item.price;
        const nanotons = Math.floor(tonAmount * 1e9).toString();

        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
            messages: [
                {
                    address: recipientAddress,
                    amount: nanotons
                }
            ]
        };

        try {
            if (window.showNotification) {
                window.showNotification(`Sending ${tonAmount} TON for ${item.name}...`);
            }

            const result = await this.tonConnectUI.sendTransaction(transaction);
            
            console.log('✅ Transaction sent:', result);

            // Store purchase for verification
            const purchaseId = `${Date.now()}_${itemId}`;
            this.pendingPurchases.set(purchaseId, {
                itemId,
                amount: tonAmount,
                timestamp: Date.now(),
                userWallet: this.walletAddress,
                boc: result.boc
            });

            // Start verification process
            await this.verifyAndUnlockItem(purchaseId, itemId);

            return true;
        } catch (error) {
            console.error('❌ Transaction failed:', error);
            
            // FIXED: Better error messages
            if (window.showNotification) {
                if (error.message && error.message.toLowerCase().includes('reject')) {
                    window.showNotification('Transaction cancelled');
                } else if (error.message && error.message.toLowerCase().includes('insufficient')) {
                    window.showNotification('Insufficient TON balance');
                } else {
                    window.showNotification('Payment failed. Please try again');
                }
            }
            
            return false;
        }
    }

    async verifyAndUnlockItem(purchaseId, itemId) {
        const maxAttempts = 30;
        let attempts = 0;

        const checkPayment = async () => {
            attempts++;

            try {
                const purchase = this.pendingPurchases.get(purchaseId);
                if (!purchase) return;

                const gameInit = window.gameInitializer;
                const telegramId = gameInit?.tgUser?.id;

                if (!telegramId) {
                    console.error('No telegram ID available');
                    return;
                }

                const response = await fetch('https://cx-odyssey-backend.vercel.app/api/verifyPayment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        telegramId: telegramId,
                        itemId: itemId,
                        userWalletAddress: purchase.userWallet,
                        expectedAmount: purchase.amount,
                        timestamp: purchase.timestamp
                    })
                });

                const data = await response.json();

                if (data.verified) {
                    this.pendingPurchases.delete(purchaseId);
                    await this.unlockPremiumItem(itemId, data.transactionHash);
                    return;
                }

                if (attempts < maxAttempts) {
                    setTimeout(checkPayment, 2000);
                } else {
                    this.pendingPurchases.delete(purchaseId);
                    if (window.showNotification) {
                        window.showNotification('Payment verification timeout. Contact support if payment was sent.');
                    }
                }

            } catch (error) {
                console.error('Verification error:', error);
                if (attempts < maxAttempts) {
                    setTimeout(checkPayment, 2000);
                }
            }
        };

        setTimeout(checkPayment, 5000);
    }

    async unlockPremiumItem(itemId, txHash) {
        const gameState = window.gameState;
        if (!gameState) return;

        const item = window.PREMIUM_ITEMS[itemId];
        
        const effects = {
            starterBundle: () => {
                gameState.update({
                    gp: gameState.getValue('gp') + 5000,
                    shards: gameState.getValue('shards') + 1000,
                    maxEnergy: gameState.getValue('maxEnergy') + 50,
                    energy: gameState.getValue('maxEnergy') + 50
                });
                const upgrades = gameState.getValue('upgrades');
                gameState.update({
                    upgrades: {
                        speed: upgrades.speed + 2,
                        damage: upgrades.damage + 2,
                        energy: upgrades.energy + 1,
                        multiplier: upgrades.multiplier + 1
                    }
                });
            },
            autoMiner: () => {
                if (window.shopSystem) {
                    window.shopSystem.activeBoosts.autoMiner = Date.now() + (365 * 24 * 60 * 60 * 1000);
                    window.shopSystem.startAutoMiner();
                }
            },
            vipPass: () => {
                if (window.shopSystem) {
                    window.shopSystem.activePremiumItems.vipPass = Date.now() + (30 * 24 * 60 * 60 * 1000);
                }
            },
            unlimitedEnergy: () => {
                if (window.shopSystem) {
                    window.shopSystem.activePremiumItems.unlimitedEnergy = Date.now() + (7 * 24 * 60 * 60 * 1000);
                }
                gameState.update({ maxEnergy: 9999, energy: 9999 });
            },
            doubleXP: () => {
                if (window.shopSystem) {
                    window.shopSystem.activePremiumItems.doubleXP = true;
                }
            },
            gpMegaPack: () => {
                gameState.update({ gp: gameState.getValue('gp') + 50000 });
            },
            cosmicSkinPack: () => {
                const skins = gameState.getValue('skins') || [];
                const newSkins = ['Nebula', 'Supernova', 'Quasar', 'Pulsar', 'BlackHole', 'WhiteDwarf', 'RedGiant', 'NeutronStar', 'Magnetar', 'Gamma'];
                gameState.update({ skins: [...new Set([...skins, ...newSkins])] });
            },
            legendaryShip: () => {
                if (window.shopSystem) {
                    window.shopSystem.activePremiumItems.legendaryShip = true;
                }
                const upgrades = gameState.getValue('upgrades');
                gameState.update({
                    upgrades: {
                        speed: upgrades.speed + 5,
                        damage: upgrades.damage + 5,
                        energy: upgrades.energy + 3,
                        multiplier: upgrades.multiplier + 3
                    },
                    maxEnergy: gameState.getValue('maxEnergy') + 75,
                    energy: gameState.getValue('maxEnergy') + 75
                });
            },
            ultimatePack: () => {
                gameState.update({ 
                    gp: gameState.getValue('gp') + 100000,
                    shards: gameState.getValue('shards') + 10000,
                    maxEnergy: 500,
                    energy: 500
                });
                if (window.shopSystem) {
                    window.shopSystem.activePremiumItems.vipPass = Date.now() + (365 * 24 * 60 * 60 * 1000);
                    window.shopSystem.activePremiumItems.doubleXP = true;
                    window.shopSystem.activePremiumItems.legendaryShip = true;
                    window.shopSystem.activeBoosts.autoMiner = Date.now() + (365 * 24 * 60 * 60 * 1000);
                }
            }
        };

        if (effects[itemId]) {
            effects[itemId]();
        }

        const purchases = gameState.getValue('premiumPurchases') || [];
        purchases.push({
            itemId,
            timestamp: Date.now(),
            txHash
        });
        gameState.update({ premiumPurchases: purchases });

        if (window.backendManager) {
            await window.backendManager.saveProgress(gameState.get());
        }

        if (window.showNotification) {
            window.showNotification(`${item.name} unlocked successfully!`);
        }
    }

    createPayload(comment) {
        try {
            const bytes = new TextEncoder().encode(comment);
            return btoa(String.fromCharCode(...bytes));
        } catch {
            return '';
        }
    }
}

window.walletManager = new WalletManager();

async function connectWallet() {
    await window.walletManager?.connect();
}

async function disconnectWallet() {
    await window.walletManager?.disconnect();
}

async function buyPremiumItemTon(itemId) {
    await window.walletManager?.purchasePremiumItem(itemId);
}
