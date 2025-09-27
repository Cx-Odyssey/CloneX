// Ad system
function watchAdForEnergy() {
    showModal('adModal');
    startAdTimer(() => {
        gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + 25);
        closeModal('adModal');
        showRewardModal('⚡ +25 Energy!', '⚡');
        updateUI();
        saveGameData();
    });
}

function watchAdForDamage() {
    showModal('adModal');
    startAdTimer(() => {
        gameState.adDamageBoost = 3;
        closeModal('adModal');
        showRewardModal('⚔️ 2x Damage for next 3 attacks!', '⚔️');
        saveGameData();
    });
}

function startAdTimer(callback) {
    let timeLeft = 5;
    const progressBar = document.getElementById('adProgress');
    const timeDisplay = document.getElementById('adTime');
    const skipBtn = document.getElementById('skipBtn');

    skipBtn.style.display = 'none';
    progressBar.style.width = '0%';

    const timer = setInterval(() => {
        timeLeft--;
        const progress = ((5 - timeLeft) / 5) * 100;
        progressBar.style.width = progress + '%';
        timeDisplay.textContent = 5 - timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timer);
            skipBtn.style.display = 'block';
            skipBtn.onclick = callback;
        }
    }, 1000);
}

function skipAd() {
    const skipBtn = document.getElementById('skipBtn');
    if (skipBtn.onclick) {
        skipBtn.onclick();
    }
}

// Modal system
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showRewardModal(text, icon) {
    document.getElementById('rewardText').textContent = text;
    document.getElementById('rewardIcon').textContent = icon;
    showModal('rewardModal');
}
