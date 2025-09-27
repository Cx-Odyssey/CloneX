// Save wallet to backend
async function saveWalletToBackend(walletAddress) {
    try {
        const telegramId = user?.id || tg?.initDataUnsafe?.user?.id;
        
        if (!telegramId) {
            console.log('⚠️ No Telegram ID, cannot save wallet');
            return false;
        }

        const response = await fetch(`${API_BASE}/saveWallet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                telegram_id: telegramId,
                wallet_address: walletAddress
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error);
        }

        console.log('✅ Wallet saved to backend');
        return true;
        
    } catch (error) {
        console.error('❌ Wallet save failed:', error);
        return false;
    }
}

// Initialize TonConnect
function initTonConnect() {
    try {
        if (typeof TonConnectSDK !== 'undefined') {
            connector = new TonConnectSDK.TonConnect({
                manifestUrl: window.location.origin + '/tonconnect-manifest.json'
            });
            
            connector.onStatusChange(wallet => {
                if (wallet) {
                    document.getElementById('connectWalletBtn').style.display = 'none';
                    document.getElementById('walletInfo').style.display = 'block';
                    document.getElementById('connectedAddress').textContent = shortenAddress(wallet.account.address);
                    
                    // Save wallet to backend
                    saveWalletToBackend(wallet.account.address);
                } else {
                    document.getElementById('connectWalletBtn').style.display = 'block';
                    document.getElementById('walletInfo').style.display = 'none';
                }
            });
        }
    } catch (error) {
        console.log('⚠️ TonConnect initialization failed:', error);
    }
}

// Wallet functions
function connectWallet() {
    if (!connector) {
        showNotification('❌ Wallet connection not available.');
        return;
    }

    try {
        document.getElementById('connectWalletBtn').textContent = 'Connecting...';
        document.getElementById('connectWalletBtn').disabled = true;

        connector.getWallets()
            .then(wallets => {
                if (wallets && wallets.length > 0) {
                    const wallet = wallets.find(w => w.name === 'Tonkeeper') || wallets[0];
                    return connector.connect(wallet.connectionParameters);
                } else {
                    throw new Error('No wallets available');
                }
            })
            .then(() => {
                showNotification('🔗 Wallet connected successfully!');
            })
            .catch(error => {
                console.error('Wallet connection error:', error);
                showNotification('❌ Please install Tonkeeper wallet.');
                resetWalletButton();
            });
    } catch (error) {
        showNotification('❌ Wallet connection failed.');
        resetWalletButton();
    }
}

function resetWalletButton() {
    document.getElementById('connectWalletBtn').textContent = '🔗 Connect Wallet';
    document.getElementById('connectWalletBtn').disabled = false;
}

function disconnectWallet() {
    if (connector) {
        try {
            connector.disconnect();
            showNotification('🔔 Wallet disconnected');
        } catch (error) {
            showNotification('🔔 Wallet disconnected');
        }
    }
}

function shortenAddress(address) {
    if (!address) return '';
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}
