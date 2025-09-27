// Planet selection
function selectPlanet(planetName, planetId) {
    gameState.currentPlanet = planetName;
    document.getElementById('currentPlanet').textContent = planetName;
    document.getElementById('mineReward').textContent = Math.floor(planetId * 1.5 + 3);
    
    if (!gameState.oneTimeTasks.planet) {
        gameState.oneTimeTasks.planet = true;
        gameState.gp += 20;
        showNotification('🚀 First planet visited! +20 GP!');
    }
    
    showScreen('miningScreen');
    showNotification(`🌍 Landed on ${planetName}!`);
    updateTaskUI();
    saveGameData();
}

// Mining mechanics with logical rewards
function minePlanet() {
    if (gameState.energy <= 0) {
        showNotification('⚡ No energy! Wait for regeneration or watch an ad.');
        return;
    }

    const planetName = document.getElementById('currentPlanet').textContent;
    const planetMultiplier = getPlanetMultiplier(planetName);
    const speedBonus = 1 + (gameState.upgrades.speed * 0.2);
    const baseReward = 3 + Math.random() * 4;
    const shardReward = Math.floor(baseReward * planetMultiplier * speedBonus);
    const gpReward = Math.floor(shardReward * 0.5 * (1 + gameState.upgrades.multiplier * 0.5));

    gameState.energy -= 2;
    gameState.shards += shardReward;
    gameState.gp += gpReward;
    gameState.dailyTaskProgress.mines++;

    showNotification(`💎 +${shardReward} Shards, +${gpReward} GP!`);
    updateTaskUI();
    updateUI();
    saveGameData();
}

function getPlanetMultiplier(planetName) {
    const multipliers = {
        'Pyrion': 1.2, 'Aqueos': 1.0, 'Voidex': 1.6,
        'Verdant': 1.1, 'Aurelia': 1.8, 'Crimson': 1.4
    };
    return multipliers[planetName] || 1.0;
}

// Battle system
function battleAliens() {
    if (gameState.energy < 5) {
        showNotification('⚡ Need at least 5 energy to battle!');
        return;
    }

    gameState.energy -= 5;
    const baseReward = 25 + Math.random() * 15;
    const reward = Math.floor(baseReward * (1 + gameState.upgrades.multiplier * 0.5));
    gameState.gp += reward;
    
    showNotification(`⚔️ Defeated aliens! +${reward} GP!`);
    updateUI();
    saveGameData();
}

// Boss raid system
function attackBoss() {
    if (gameState.energy < 3) {
        showNotification('⚡ Need at least 3 energy to attack!');
        return;
    }

    gameState.energy -= 3;
    const baseDamage = 8 + (gameState.upgrades.damage * 5);
    const damage = baseDamage + Math.floor(Math.random() * 12);
    const actualDamage = gameState.adDamageBoost > 0 ? damage * 2 : damage;
    
    gameState.bossHealth = Math.max(0, gameState.bossHealth - actualDamage);
    gameState.playerDamage += actualDamage;
    gameState.dailyTaskProgress.bossBattles++;
    
    if (gameState.adDamageBoost > 0) {
        gameState.adDamageBoost--;
    }

    if (gameState.bossHealth <= 0) {
        const reward = 150 + Math.floor(Math.random() * 100);
        gameState.gp += reward;
        gameState.bossHealth = gameState.maxBossHealth;
        gameState.playerDamage = 0;
        showNotification(`🐉 Boss defeated! +${reward} GP!`);
    } else {
        const gpReward = Math.floor(actualDamage * 1.5);
        gameState.gp += gpReward;
        showNotification(`⚔️ Hit for ${actualDamage} damage! +${gpReward} GP!`);
    }

    updateTaskUI();
    updateUI();
    saveGameData();
}

// Energy regeneration
function startEnergyRegeneration() {
    setInterval(() => {
        if (gameState.energy < gameState.maxEnergy) {
            gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + 1);
            updateUI();
            saveGameData();
        }
    }, 30000); // 1 energy every 30 seconds
}