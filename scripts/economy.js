// Shop system with logical costs
function buyUpgrade(upgradeType) {
    const costs = {
        speed: 50 * Math.pow(2, gameState.upgrades.speed),
        damage: 75 * Math.pow(2, gameState.upgrades.damage),
        energy: 100 * Math.pow(2, gameState.upgrades.energy),
        multiplier: 200 * Math.pow(2, gameState.upgrades.multiplier)
    };

    const cost = costs[upgradeType];
    if (gameState.gp < cost) {
        showNotification('🏆 Not enough GP!');
        return;
    }

    gameState.gp -= cost;
    gameState.upgrades[upgradeType]++;
    
    if (upgradeType === 'energy') {
        gameState.maxEnergy += 25;
        gameState.energy = gameState.maxEnergy;
    }
    
    if (!gameState.oneTimeTasks.purchase) {
        gameState.oneTimeTasks.purchase = true;
        gameState.gp += 40;
        showNotification('🚀 First purchase completed! +40 GP bonus!');
    }

    updateShopCosts();
    updateTaskUI();

    const messages = {
        speed: 'Mining speed increased!',
        damage: 'Combat damage boosted!',
        energy: 'Maximum energy increased!',
        multiplier: 'GP multiplier activated!'
    };

    showRewardModal(messages[upgradeType], '⚡');
    updateUI();
    saveGameData();
}

function updateShopCosts() {
    const costs = {
        speed: 50 * Math.pow(2, gameState.upgrades.speed),
        damage: 75 * Math.pow(2, gameState.upgrades.damage),
        energy: 100 * Math.pow(2, gameState.upgrades.energy),
        multiplier: 200 * Math.pow(2, gameState.upgrades.multiplier)
    };

    document.getElementById('speedCost').textContent = costs.speed + ' GP';
    document.getElementById('damageCost').textContent = costs.damage + ' GP';
    document.getElementById('energyCost').textContent = costs.energy + ' GP';
    document.getElementById('multiplierCost').textContent = costs.multiplier + ' GP';
}