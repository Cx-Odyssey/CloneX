// Screen management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    setTimeout(() => {
        document.getElementById(screenId).classList.add('active');
    }, 100);

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const navMap = {
        'galaxyScreen': 0,
        'shopScreen': 1,
        'minigamesScreen': 2,
        'tasksScreen': 3,
        'profileScreen': 4
    };
    
    if (navMap[screenId] !== undefined) {
        document.querySelectorAll('.nav-btn')[navMap[screenId]].classList.add('active');
    }

    updateUI();
    if (screenId === 'profileScreen') {
        loadLeaderboard();
    }
}

// UI updates with balance displays
function updateUI() {
    // Update tickets first
    updateTickets();
    
    // Update all resource displays
    const energyElements = document.querySelectorAll('#energy, #energyMining');
    energyElements.forEach(el => {
        if (el) el.textContent = gameState.energy;
    });
    
    const shardElements = document.querySelectorAll('#shards, #shardsMining, #shardsShop');
    shardElements.forEach(el => {
        if (el) el.textContent = gameState.shards.toLocaleString();
    });
    
    const gpElements = document.querySelectorAll('#gp, #gpBoss, #gpShop, #gpMinigames, #gpTasks, #gpProfile');
    gpElements.forEach(el => {
        if (el) el.textContent = gameState.gp.toLocaleString();
    });

    // Update balance displays in pinned sections
    const balanceElements = document.querySelectorAll('#taskBalanceDisplay, #profileBalanceDisplay');
    balanceElements.forEach(el => {
        if (el) el.textContent = gameState.gp.toLocaleString();
    });

    const ticketElements = document.querySelectorAll('#gameTickets');
    ticketElements.forEach(el => {
        if (el) el.textContent = gameState.gameTickets;
    });

    // Update energy bar
    const energyPercent = (gameState.energy / gameState.maxEnergy) * 100;
    const energyFill = document.getElementById('energyFill');
    if (energyFill) {
        energyFill.style.width = energyPercent + '%';
    }
    
    const energyText = document.getElementById('energyText');
    if (energyText) {
        energyText.textContent = `${gameState.energy}/${gameState.maxEnergy}`;
    }

    // Update boss health
    const bossPercent = (gameState.bossHealth / gameState.maxBossHealth) * 100;
    const bossHealthFill = document.getElementById('bossHealthFill');
    if (bossHealthFill) {
        bossHealthFill.style.width = bossPercent + '%';
    }
    
    const bossHealthText = document.getElementById('bossHealthText');
    if (bossHealthText) {
        bossHealthText.textContent = `${gameState.bossHealth}/${gameState.maxBossHealth}`;
    }
    
    const playerDamageEl = document.getElementById('playerDamage');
    if (playerDamageEl) {
        playerDamageEl.textContent = gameState.playerDamage.toLocaleString();
    }

    // Update user level
    const userLevel = Math.floor(gameState.gp / 100) + 1;
    const userLevelEl = document.getElementById('tgUserLevel');
    if (userLevelEl) {
        userLevelEl.textContent = userLevel;
    }

    // Update referral stats
    const totalReferralsEl = document.getElementById('totalReferrals');
    const referralEarningsEl = document.getElementById('referralEarnings');
    if (totalReferralsEl) totalReferralsEl.textContent = gameState.totalReferrals;
    if (referralEarningsEl) referralEarningsEl.textContent = gameState.referralEarnings;

    updateShopCosts();
    updateTaskUI();
}

function updateTickets() {
    const now = Date.now();
    const timePassed = now - gameState.lastTicketTime;
    const ticketsToAdd = Math.floor(timePassed / 180000); // 1 ticket every 3 minutes
    
    if (ticketsToAdd > 0) {
        gameState.gameTickets = Math.min(gameState.maxTickets, gameState.gameTickets + ticketsToAdd);
        gameState.lastTicketTime = now;
    }
    
    const nextTicketIn = 180000 - (now - gameState.lastTicketTime);
    const minutesLeft = Math.ceil(nextTicketIn / 60000);
    
    const cooldownElement = document.getElementById('ticketCooldown');
    if (cooldownElement && gameState.gameTickets < gameState.maxTickets) {
        cooldownElement.textContent = `Next in ${minutesLeft}m`;
    } else if (cooldownElement) {
        cooldownElement.textContent = 'Max tickets';
    }
}

// Notification system
function showNotification(text) {
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = text;
    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) notification.remove();
    }, 3200);
}