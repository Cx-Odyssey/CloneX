// TON Connect Integration
class TONWallet {
    constructor() {
        this.tonConnect = null;
        this.wallet = null;
        this.isConnected = false;
        this.balance = 0;
        this.receiverAddress = 'UQDxhNykUbvk2KwzKzFHT7K9Bd58h5xkqY3J7tCXxbBE8N4z'; // Replace with your TON wallet
        
        this.init();
    }

    // Initialize TON Connect
    async init() {
        try {
            // Initialize TON Connect UI
            this.tonConnect = new TON_CONNECT_UI.TonConnectUI({
                manifestUrl: 'https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/public/tonconnect-manifest.json'
            });

            // Set up the connector
            this.tonConnect.uiOptions = {
                theme: 'DARK',
                borderRadius: 's',
                colorsSet: {
                    [TON_CONNECT_UI.THEME.DARK]: {
                        connectButton: {
                            background: '#FFD700',
                            foreground: '#000000',
                        },
                        accent: '#FFD700',
                        telegramButton: '#FFD700',
                        constant: {
                            white: '#FFFFFF',
                            black: '#000000',
                        },
                        background: {
                            primary: '#1A1A2E',
                            secondary: '#16213E',
                            segment: '#0A0A0A',
                        },
                        text: {
                            primary: '#FFFFFF',
                            secondary: '#CCCCCC',
                        },
                    }
                },
            };

            // Mount to DOM
            const connectContainer = document.getElementById('ton-connect');
            if (connectContainer) {
                connectContainer.innerHTML = '';
                this.tonConnect.connectWallet();
                connectContainer.appendChild(this.tonConnect.walletButton);
            }

            // Listen for connection status changes
            this.tonConnect.onStatusChange((wallet) => {
                this.handleWalletChange(wallet);
            });

            // Check if already connected
            const currentWallet = this.tonConnect.wallet;
            if (currentWallet) {
                this.handleWalletChange(currentWallet);
            }

        } catch (error) {
            console.error('Failed to initialize TON Connect:', error);
            this.showFallbackConnect();
        }
    }

    // Handle wallet connection changes
    async handleWalletChange(wallet) {
        console.log('Wallet status changed:', wallet);
        
        if (wallet) {
            this.wallet = wallet;
            this.isConnected = true;
            this.showConnectedState();
            await this.updateBalance();
        } else {
            this.wallet = null;
            this.isConnected = false;
            this.showDisconnectedState();
        }
    }

    // Show connected wallet state
    showConnectedState() {
        const walletStatus = document.getElementById('walletStatus');
        const walletConnected = document.getElementById('walletConnected');
        
        if (walletStatus) walletStatus.style.display = 'none';
        if (walletConnected) {
            walletConnected.style.display = 'block';
            
            // Update wallet address display
            const addressElement = document.getElementById('walletAddress');
            if (addressElement && this.wallet) {
                const address = this.wallet.account.address;
                addressElement.textContent = this.formatAddress(address);
            }
        }
        
        // Update TON balance display
        this.updateBalanceDisplay();
        
        showNotification('💰 Wallet connected successfully!');
    }

    // Show disconnected wallet state
    showDisconnectedState() {
        const walletStatus = document.getElementById('walletStatus');
        const walletConnected = document.getElementById('walletConnected');
        
        if (walletStatus) walletStatus.style.display = 'block';
        if (walletConnected) walletConnected.style.display = 'none';
        
        this.balance = 0;
        this.updateBalanceDisplay();
    }

    // Format wallet address for display
    formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-6)}`;
    }

    // Update TON balance
    async updateBalance() {
        if (!this.wallet) return;

        try {
            // This is a placeholder - you would need to implement actual balance checking
            // using TON API or your backend
            const response = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${this.wallet.account.address}`);
            const data = await response.json();
            
            if (data.ok) {
                // Convert nanotons to TON
                this.balance = parseInt(data.result) / 1000000000;
            }
        } catch (error) {
            console.error('Failed to get balance:', error);
            this.balance = 0;
        }
        
        this.updateBalanceDisplay();
    }

    // Update balance display in UI
    updateBalanceDisplay() {
        const balanceElement = document.getElementById('tonBalance');
        if (balanceElement) {
            balanceElement.textContent = this.balance.toFixed(4);
        }
        
        // Update GP display in wallet screen
        const gpWalletElement = document.getElementById('gpWallet');
        if (gpWalletElement && window.gameState) {
            gpWalletElement.textContent = window.gameState.gp.toLocaleString();
        }
    }

    // Show fallback connection method
    showFallbackConnect() {
        const connectContainer = document.getElementById('ton-connect');
        if (connectContainer) {
            connectContainer.innerHTML = `
                <button class="action-btn" onclick="tonWallet.openTonkeeper()">
                    📱 Open Tonkeeper
                </button>
                <button class="action-btn" onclick="tonWallet.openTonhub()" style="margin-top: 10px;">
                    💼 Open Tonhub
                </button>
            `;
        }
    }

    // Open Tonkeeper wallet
    openTonkeeper() {
        const deepLink = 'https://app.tonkeeper.com/';
        window.open(deepLink, '_blank');
        showNotification('📱 Opening Tonkeeper wallet...');
    }

    // Open Tonhub wallet
    openTonhub() {
        const deepLink = 'https://tonhub.com/';
        window.open(deepLink, '_blank');
        showNotification('💼 Opening Tonhub wallet...');
    }

    // Disconnect wallet
    async disconnect() {
        if (this.tonConnect) {
            await this.tonConnect.disconnect();
        }
        showNotification('📱 Wallet disconnected');
    }

    // Send transaction
    async sendTransaction(to, amount, comment = '') {
        if (!this.isConnected) {
            showNotification('❌ Please connect your wallet first');
            return null;
        }

        try {
            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes
                messages: [
                    {
                        address: to,
                        amount: (amount * 1000000000).toString(), // Convert TON to nanotons
                        payload: comment ? btoa(comment) : undefined
                    }
                ]
            };

            const result = await this.tonConnect.sendTransaction(transaction);
            console.log('Transaction sent:', result);
            
            return result;
        } catch (error) {
            console.error('Transaction failed:', error);
            showNotification('❌ Transaction failed: ' + error.message);
            return null;
        }
    }
}

// Wallet operations
class WalletOperations {
    constructor(tonWallet) {
        this.tonWallet = tonWallet;
        this.exchangeRates = {
            gpToTon: 0.00001, // 10,000 GP = 0.1 TON
            tonToGp: 100000   // 1 TON = 100,000 GP
        };
    }

    // Withdraw TON (convert GP to TON)
    async withdrawTon() {
        if (!this.tonWallet.isConnected) {
            showNotification('❌ Please connect your wallet first');
            return;
        }

        const requiredGP = 10000;
        if (window.gameState.gp < requiredGP) {
            showNotification(`❌ Need at least ${requiredGP.toLocaleString()} GP to withdraw`);
            return;
        }

        // Show confirmation modal
        this.showConfirmModal(
            '💰 Confirm Withdrawal',
            '💸',
            `Convert ${requiredGP.toLocaleString()} GP to 0.1 TON?`,
            async () => {
                await this.processWithdrawal(requiredGP, 0.1);
            }
        );
    }

    // Process withdrawal
    async processWithdrawal(gpAmount, tonAmount) {
        try {
            // Send TON to user's wallet
            const txResult = await this.tonWallet.sendTransaction(
                this.tonWallet.wallet.account.address,
                tonAmount,
                'CX Odyssey GP Withdrawal'
            );

            if (txResult) {
                // Deduct GP from game state
                window.gameState.gp -= gpAmount;
                
                // Save updated state
                if (window.telegramApp.user) {
                    await window.gameAPI.updatePlayerStats(window.telegramApp.user.id, {
                        gp: window.gameState.gp
                    });
                }
                
                // Update UI
                window.updateUI();
                
                showNotification(`✅ Successfully withdrawn ${tonAmount} TON!`);
                
                // Update balance
                await this.tonWallet.updateBalance();
            }
        } catch (error) {
            console.error('Withdrawal failed:', error);
            showNotification('❌ Withdrawal failed. Please try again.');
        }
    }

    // Deposit TON (boost with TON)
    async depositTon() {
        if (!this.tonWallet.isConnected) {
            showNotification('❌ Please connect your wallet first');
            return;
        }

        const tonAmount = 0.05;
        const gpBonus = 5000;
        const energyBonus = 100;

        if (this.tonWallet.balance < tonAmount) {
            showNotification(`❌ Insufficient balance. Need ${tonAmount} TON`);
            return;
        }

        // Show confirmation modal
        this.showConfirmModal(
            '🚀 Confirm Boost Purchase',
            '🚀',
            `Pay ${tonAmount} TON for ${gpBonus.toLocaleString()} GP + ${energyBonus} Energy?`,
            async () => {
                await this.processDeposit(tonAmount, gpBonus, energyBonus);
            }
        );
    }

    // Process deposit/boost purchase
    async processDeposit(tonAmount, gpBonus, energyBonus) {
        try {
            // Send TON to game's receiving wallet
            const txResult = await this.tonWallet.sendTransaction(
                this.tonWallet.receiverAddress,
                tonAmount,
                'CX Odyssey Boost Purchase'
            );

            if (txResult) {
                // Add bonuses to game state
                window.gameState.gp += gpBonus;
                window.gameState.energy = Math.min(
                    window.gameState.maxEnergy, 
                    window.gameState.energy + energyBonus
                );
                
                // Save updated state
                if (window.telegramApp.user) {
                    await window.gameAPI.updatePlayerStats(window.telegramApp.user.id, {
                        gp: window.gameState.gp,
                        energy: window.gameState.energy
                    });
                }
                
                // Update UI
                window.updateUI();
                
                showNotification(`🚀 Boost activated! +${gpBonus} GP, +${energyBonus} Energy!`);
                
                // Update balance
                await this.tonWallet.updateBalance();
            }
        } catch (error) {
            console.error('Deposit failed:', error);
            showNotification('❌ Purchase failed. Please try again.');
        }
    }

    // Show confirmation modal
    showConfirmModal(title, icon, text, onConfirm) {
        const modal = document.getElementById('confirmModal');
        const titleEl = document.getElementById('confirmTitle');
        const iconEl = document.getElementById('confirmIcon');
        const textEl = document.getElementById('confirmText');
        const confirmBtn = document.getElementById('confirmBtn');

        if (titleEl) titleEl.textContent = title;
        if (iconEl) iconEl.textContent = icon;
        if (textEl) textEl.textContent = text;
        
        // Set up confirm button
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        newConfirmBtn.onclick = () => {
            closeModal('confirmModal');
            onConfirm();
        };
        
        // Show modal
        modal.classList.add('active');
    }

    // Get current exchange rates (for future dynamic pricing)
    async updateExchangeRates() {
        try {
            // This would fetch current TON prices from an API
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd');
            const data = await response.json();
            
            if (data['the-open-network']) {
                const tonPrice = data['the-open-network'].usd;
                console.log('Current TON price:', tonPrice);
                
                // Update exchange rates based on current price
                // This is a simplified example
                this.exchangeRates.gpToTon = 0.00001; // Keep stable for now
            }
        } catch (error) {
            console.error('Failed to update exchange rates:', error);
        }
    }
}

// Initialize wallet system
const tonWallet = new TONWallet();
const walletOps = new WalletOperations(tonWallet);

// Wallet-related global functions
function withdrawTon() {
    walletOps.withdrawTon();
}

function depositTon() {
    walletOps.depositTon();
}

function disconnectWallet() {
    tonWallet.disconnect();
}

// Update exchange rates periodically
setInterval(() => {
    walletOps.updateExchangeRates();
}, 300000); // Every 5 minutes

// Export for global access
window.tonWallet = tonWallet;
window.walletOps = walletOps;
