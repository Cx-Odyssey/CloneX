// Daily reset system
function checkDailyReset() {
    const today = new Date().toDateString();
    if (gameState.lastDailyReset !== today) {
        gameState.dailyTasks = { login: false, mine: false, boss: false, combo: false };
        gameState.dailyTaskProgress = { mines: 0, bossBattles: 0, comboAttempts: 0 };
        gameState.lastDailyReset = today;
        
        // Mark login as completed
        gameState.dailyTasks.login = true;
        gameState.gp += 25;
        showNotification('🎁 Daily login reward: +25 GP!');
    }
    updateTaskUI();
}

// Task system
function updateTaskUI() {
    // Daily tasks
    document.getElementById('dailyMineCount').textContent = gameState.dailyTaskProgress.mines;
    document.getElementById('dailyBossCount').textContent = gameState.dailyTaskProgress.bossBattles;
    
    // One-time tasks
    document.getElementById('oneTimeShardCount').textContent = gameState.shards;
    document.getElementById('referralCount').textContent = gameState.totalReferrals;
    
    // Update daily task buttons
    updateTaskButton('dailyMineBtn', gameState.dailyTaskProgress.mines >= 10 && !gameState.dailyTasks.mine);
    updateTaskButton('dailyBossBtn', gameState.dailyTaskProgress.bossBattles >= 3 && !gameState.dailyTasks.boss);
    updateTaskButton('dailyComboBtn', gameState.dailyTaskProgress.comboAttempts > 0 && !gameState.dailyTasks.combo);
    
    // Update one-time task buttons
    updateTaskButton('firstPlanetBtn', gameState.oneTimeTasks.planet, true);
    updateTaskButton('firstPurchaseBtn', gameState.oneTimeTasks.purchase, true);
    updateTaskButton('shards100Btn', gameState.shards >= 100 && !gameState.oneTimeTasks.shards100);
    updateTaskButton('invite5Btn', gameState.totalReferrals >= 5 && !gameState.oneTimeTasks.invite5);
    
    // Update login status
    document.getElementById('dailyLoginStatus').textContent = gameState.dailyTasks.login ? 'Completed' : '+25 GP';
    if (gameState.dailyTasks.login) {
        document.getElementById('dailyLoginStatus').className = 'task-reward';
        document.getElementById('dailyLoginStatus').style.background = 'var(--success-green)';
    }
}

function updateTaskButton(btnId, condition, isCompleted = false) {
    const btn = document.getElementById(btnId);
    if (btn) {
        if (isCompleted) {
            btn.disabled = true;
            btn.textContent = 'Completed';
            btn.style.background = 'var(--success-green)';
        } else {
            btn.disabled = !condition;
        }
    }
}

function claimDailyTask(taskType) {
    const rewards = { mine: 50, boss: 75, combo: 30 };
    const requirements = {
        mine: gameState.dailyTaskProgress.mines >= 10,
        boss: gameState.dailyTaskProgress.bossBattles >= 3,
        combo: gameState.dailyTaskProgress.comboAttempts > 0
    };
    
    if (gameState.dailyTasks[taskType] || !requirements[taskType]) {
        showNotification('❌ Task requirements not met or already completed!');
        return;
    }
    
    gameState.dailyTasks[taskType] = true;
    gameState.gp += rewards[taskType];
    
    showNotification(`✅ Daily task completed! +${rewards[taskType]} GP!`);
    updateTaskUI();
    updateUI();
    saveGameData();
}

function claimOneTimeTask(taskType) {
    const rewards = { planet: 20, purchase: 40, shards100: 80, invite5: 200 };
    const requirements = {
        planet: true, // Already checked when visiting planet
        purchase: true, // Already checked when making purchase
        shards100: gameState.shards >= 100,
        invite5: gameState.totalReferrals >= 5
    };
    
    if (gameState.oneTimeTasks[taskType] || !requirements[taskType]) {
        showNotification('❌ Task requirements not met or already completed!');
        return;
    }
    
    gameState.oneTimeTasks[taskType] = true;
    gameState.gp += rewards[taskType];
    
    showNotification(`✅ One-time task completed! +${rewards[taskType]} GP!`);
    updateTaskUI();
    updateUI();
    saveGameData();
}

// Task tab switching
function switchTaskTab(tab) {
    const dailyTab = document.getElementById('dailyTasksTab');
    const oneTimeTab = document.getElementById('oneTimeTasksTab');
    const dailyContent = document.getElementById('dailyTasksContent');
    const oneTimeContent = document.getElementById('oneTimeTasksContent');
    
    if (tab === 'daily') {
        dailyTab.style.background = 'linear-gradient(135deg, var(--primary-gold), var(--secondary-orange))';
        dailyTab.style.color = '#000';
        oneTimeTab.style.background = 'transparent';
        oneTimeTab.style.color = 'rgba(255, 255, 255, 0.6)';
        dailyContent.style.display = 'block';
        oneTimeContent.style.display = 'none';
    } else {
        oneTimeTab.style.background = 'linear-gradient(135deg, var(--primary-gold), var(--secondary-orange))';
        oneTimeTab.style.color = '#000';
        dailyTab.style.background = 'transparent';
        dailyTab.style.color = 'rgba(255, 255, 255, 0.6)';
        oneTimeContent.style.display = 'block';
        dailyContent.style.display = 'none';
    }
}