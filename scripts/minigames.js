let currentComboIndex = 0;

// Generate daily combo code
function generateDailyCombo() {
    const today = new Date().toDateString();
    if (!gameState.dailyCombo.code || gameState.dailyCombo.date !== today) {
        gameState.dailyCombo = {
            code: Math.floor(1000 + Math.random() * 9000).toString(),
            attempts: 3,
            completed: false,
            date: today
        };
    }
    updateComboUI();
}

function updateComboUI() {
    document.getElementById('comboAttempts').textContent = gameState.dailyCombo.attempts;
}

function inputComboDigit(digit) {
    if (gameState.dailyCombo.completed || gameState.dailyCombo.attempts <= 0) return;
    
    const inputs = ['combo1', 'combo2', 'combo3', 'combo4'];
    const currentInput = document.getElementById(inputs[currentComboIndex]);
    
    if (currentInput) {
        currentInput.value = digit;
        currentComboIndex = (currentComboIndex + 1) % 4;
    }
}

function clearCombo() {
    ['combo1', 'combo2', 'combo3', 'combo4'].forEach(id => {
        document.getElementById(id).value = '';
    });
    currentComboIndex = 0;
}

function submitCombo() {
    if (gameState.dailyCombo.completed || gameState.dailyCombo.attempts <= 0) {
        showNotification('🔮 No attempts remaining!');
        return;
    }
    
    const guess = ['combo1', 'combo2', 'combo3', 'combo4']
        .map(id => document.getElementById(id).value)
        .join('');
    
    if (guess.length !== 4) {
        showNotification('🔮 Please enter a complete 4-digit code!');
        return;
    }
    
    gameState.dailyCombo.attempts--;
    gameState.dailyTaskProgress.comboAttempts++;
    
    if (!gameState.dailyTasks.combo) {
        gameState.dailyTasks.combo = true;
        gameState.gp += 30;
        showNotification('✅ Daily combo task completed! +30 GP!');
    }
    
    if (guess === gameState.dailyCombo.code) {
        gameState.dailyCombo.completed = true;
        gameState.gp += 100;
        showNotification('🎉 Correct! You earned 100 GP!');
        clearCombo();
    } else {
        if (gameState.dailyCombo.attempts > 0) {
            showNotification(`❌ Wrong code! ${gameState.dailyCombo.attempts} attempts remaining.`);
        } else {
            showNotification(`❌ Game over! The code was ${gameState.dailyCombo.code}.`);
        }
        clearCombo();
    }
    
    updateComboUI();
    updateTaskUI();
    updateUI();
    saveGameData();
}