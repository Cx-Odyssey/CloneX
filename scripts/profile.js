// Generate referral code
function generateReferralCode() {
    if (!gameState.referralCode) {
        gameState.referralCode = 'CX' + Math.random().toString(36).substr(2, 8).toUpperCase();
    }
    document.getElementById('referralCode').textContent = gameState.referralCode;
}

// Referral system
function shareReferral() {
    const referralText = `🚀 Join me in CX Odyssey! Use my referral code: ${gameState.referralCode} and get bonus rewards!`;
    const shareUrl = `https://t.me/share/url?url=https://t.me/Cx_odyssey_bot?start=${gameState.referralCode}&text=${encodeURIComponent(referralText)}`;
    
    if (tg && tg.openTelegramLink) {
        tg.openTelegramLink(shareUrl);
    } else if (navigator.share) {
        navigator.share({
            title: 'CX Odyssey',
            text: referralText,
            url: `https://t.me/Cx_odyssey_bot?start=${gameState.referralCode}`
        }).catch(() => {
            window.open(shareUrl, '_blank');
        });
    } else {
        window.open(shareUrl, '_blank');
    }
    
    showNotification('📤 Referral link shared! Invite friends to earn rewards!');
}

// Leaderboard system
function loadLeaderboard() {
    const baseLeaders = [
        { username: 'GalaxyMaster', baseGp: 2500 },
        { username: 'StarHunter', baseGp: 1890 },
        { username: 'CosmicRider', baseGp: 1450 },
        { username: 'SpaceMiner', baseGp: 1200 },
        { username: 'AsteroidKing', baseGp: 980 },
        { username: 'QuantumExplorer', baseGp: 820 },
        { username: 'NebulaCrusher', baseGp: 650 },
        { username: 'VoidWalker', baseGp: 540 },
        { username: 'StarDust', baseGp: 420 },
        { username: 'CosmicMiner', baseGp: 350 }
    ];

    const currentLeaders = baseLeaders.map(leader => ({
        ...leader,
        gp: leader.baseGp + Math.floor(Math.random() * 200)
    }));

    if (gameState.gp > 100) {
        const playerEntry = {
            username: user ? user.first_name : 'You',
            gp: gameState.gp,
            isPlayer: true
        };
        currentLeaders.push(playerEntry);
        currentLeaders.sort((a, b) => b.gp - a.gp);
    }

    displayLeaderboard(currentLeaders.slice(0, 10));
    
    const playerRank = Math.max(1, currentLeaders.findIndex(p => p.isPlayer) + 1);
    document.getElementById('userRank').textContent = playerRank <= 1000 ? playerRank : '999+';
    document.getElementById('profileRank').textContent = playerRank <= 1000 ? playerRank : '999+';
}

function displayLeaderboard(leaders) {
    const entriesContainer = document.getElementById('leaderboardEntries');
    entriesContainer.innerHTML = '';
    
    leaders.forEach((entry, index) => {
        const entryEl = document.createElement('div');
        entryEl.className = 'task-item';
        
        if (entry.isPlayer) {
            entryEl.style.background = 'rgba(255, 215, 0, 0.2)';
            entryEl.style.borderLeft = '4px solid var(--secondary-orange)';
        }
        
        let rankIcon = '';
        if (index === 0) rankIcon = '<span style="color: #ffd700; font-size: 18px;">👑</span> ';
        else if (index === 1) rankIcon = '<span style="color: #ff6b35; font-size: 16px;">🥈</span> ';
        else if (index === 2) rankIcon = '<span style="color: #7209b7; font-size: 16px;">🥉</span> ';
        else rankIcon = `<span style="color: #888; font-size: 12px;">${index + 1}.</span> `;
        
        entryEl.innerHTML = `
            <div style="font-size: 13px;">${rankIcon}${entry.username}${entry.isPlayer ? ' (You)' : ''}</div>
            <div style="color: var(--primary-gold); font-weight: 700; font-size: 12px;">${entry.gp.toLocaleString()} GP</div>
        `;
        
        entriesContainer.appendChild(entryEl);
    });
}

// Profile tab switching
function switchProfileTab(tab) {
    const referralTab = document.getElementById('referralTab');
    const leaderboardTab = document.getElementById('leaderboardTab');
    const walletTab = document.getElementById('walletTab');
    const referralContent = document.getElementById('referralContent');
    const leaderboardContent = document.getElementById('leaderboardContent');
    const walletContent = document.getElementById('walletContent');
    
    // Reset all tabs
    [referralTab, leaderboardTab, walletTab].forEach(t => {
        t.style.background = 'transparent';
        t.style.color = 'rgba(255, 255, 255, 0.6)';
    });
    [referralContent, leaderboardContent, walletContent].forEach(c => {
        c.style.display = 'none';
    });
    
    // Activate selected tab
    if (tab === 'referral') {
        referralTab.style.background = 'linear-gradient(135deg, var(--success-green), #00CC70)';
        referralTab.style.color = '#000';
        referralContent.style.display = 'block';
    } else if (tab === 'leaderboard') {
        leaderboardTab.style.background = 'linear-gradient(135deg, var(--primary-gold), var(--secondary-orange))';
        leaderboardTab.style.color = '#000';
        leaderboardContent.style.display = 'block';
        loadLeaderboard();
    } else if (tab === 'wallet') {
        walletTab.style.background = 'linear-gradient(135deg, var(--accent-purple), #5A0F8C)';
        walletTab.style.color = 'white';
        walletContent.style.display = 'block';
    }
}