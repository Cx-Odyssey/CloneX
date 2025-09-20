// Mini-games module
class MiniGames {
    constructor() {
        this.activeGame = null;
        this.gameArea = null;
        this.gameCleanupFunctions = [];
    }

    // Initialize mini-games system
    init() {
        this.gameArea = document.getElementById('minigameArea');
        this.resetGameArea();
    }

    // Reset game area to default state
    resetGameArea() {
        if (!this.gameArea) return;
        
        this.gameArea.innerHTML = `
            <h3 style="color: var(--primary-gold); font-size: 24px; margin-bottom: 15px;">Select a mini-game to start!</h3>
            <p style="font-size: 16px; opacity: 0.9;">Earn bonus GP and climb the leaderboards</p>
            <div style="font-size: 60px; margin: 20px 0; animation: gameIdle 3s ease-in-out infinite alternate;">🎮</div>
        `;
        
        this.cleanupCurrentGame();
    }

    // Cleanup current game
    cleanupCurrentGame() {
        this.gameCleanupFunctions.forEach(cleanup => {
            try {
                cleanup();
            } catch (error) {
                console.error('Cleanup error:', error);
            }
        });
        this.gameCleanupFunctions = [];
        this.activeGame = null;
    }

    // Add cleanup function
    addCleanup(fn) {
        this.gameCleanupFunctions.push(fn);
    }

    // End current mini-game
    endGame(reward = 0) {
        if (reward > 0) {
            window.gameState.gp += reward;
            showNotification(`🎮 Game complete! +${reward} GP`);
            window.updateUI();
            
            // Save progress
            if (window.telegramApp.user) {
                window.gameAPI.updatePlayerStats(window.telegramApp.user.id, {
                    gp: window.gameState.gp
                });
            }
        }
        
        this.resetGameArea();
        
        // Haptic feedback
        if (window.telegramApp) {
            window.telegramApp.hapticFeedback(reward > 0 ? 'success' : 'light');
        }
    }

    // Asteroid Dodge Game
    startAsteroidDodge() {
        if (!this.gameArea) return;
        
        this.cleanupCurrentGame();
        this.activeGame = 'asteroidDodge';
        
        this.gameArea.innerHTML = `
            <h3 style="color: var(--primary-gold); font-size: 22px; margin-bottom: 20px;">☄️ Asteroid Dodge</h3>
            <p style="margin-bottom: 20px;">Use touch controls to dodge asteroids!</p>
            <div id="dodgeGame" style="position: relative; width: 300px; height: 400px; background: linear-gradient(135deg, rgba(0,0,0,0.8), rgba(26,26,46,0.8)); border: 3px solid var(--neon-blue); margin: 20px auto; overflow: hidden; border-radius: 20px; box-shadow: 0 0 30px rgba(0, 245, 255, 0.3);">
                <div id="playerShip" style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); width: 30px; height: 30px; background: linear-gradient(45deg, var(--primary-gold), var(--secondary-orange)); border-radius: 50% 50% 0 0; transition: left 0.1s ease; box-shadow: 0 0 15px var(--primary-gold);"></div>
            </div>
            <div style="margin: 20px 0;">
                <div>Score: <span id="dodgeScore" style="color: var(--success-green); font-weight: 700; font-size: 18px;">0</span></div>
                <div>Time: <span id="dodgeTime" style="color: var(--primary-gold); font-weight: 700;">30</span>s</div>
            </div>
            <button class="action-btn" onclick="miniGames.endGame()" style="margin-top: 15px;">🛑 End Game</button>
        `;

        this.runAsteroidDodge();
    }

    // Run Asteroid Dodge game logic
    runAsteroidDodge() {
        let score = 0;
        let timeLeft = 30;
        let gameActive = true;
        const gameContainer = document.getElementById('dodgeGame');
        const playerShip = document.getElementById('playerShip');
        const scoreElement = document.getElementById('dodgeScore');
        const timeElement = document.getElementById('dodgeTime');
        
        if (!gameContainer || !playerShip) return;

        let shipPosition = 50;
        const asteroids = [];

        // Touch/Mouse controls
        const handleMove = (clientX) => {
            const rect = gameContainer.getBoundingClientRect();
            const x = clientX - rect.left;
            shipPosition = (x / rect.width) * 100;
            shipPosition = Math.max(10, Math.min(90, shipPosition));
            playerShip.style.left = shipPosition + '%';
        };

        const onTouchMove = (e) => {
            e.preventDefault();
            handleMove(e.touches[0].clientX);
        };

        const onMouseMove = (e) => {
            if (e.buttons === 1) { // Only when mouse is pressed
                handleMove(e.clientX);
            }
        };

        gameContainer.addEventListener('touchmove', onTouchMove);
        gameContainer.addEventListener('mousemove', onMouseMove);

        // Cleanup functions
        this.addCleanup(() => {
            gameActive = false;
            gameContainer.removeEventListener('touchmove', onTouchMove);
            gameContainer.removeEventListener('mousemove', onMouseMove);
            clearInterval(gameTimer);
            clearInterval(asteroidSpawner);
            asteroids.forEach(asteroid => clearInterval(asteroid.interval));
        });

        // Game timer
        const gameTimer = setInterval(() => {
            if (!gameActive) return;
            
            timeLeft--;
            if (timeElement) timeElement.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                gameActive = false;
                const reward = Math.floor(300 + (score * 10));
                this.endGame(reward);
            }
        }, 1000);

        // Asteroid spawner
        const asteroidSpawner = setInterval(() => {
            if (!gameActive) return;

            const asteroid = document.createElement('div');
            asteroid.style.cssText = `
                position: absolute;
                width: 20px;
                height: 20px;
                background: radial-gradient(circle, #888, #444);
                border-radius: 50%;
                top: -20px;
                left: ${Math.random() * 85 + 5}%;
                box-shadow: 0 0 8px rgba(136, 136, 136, 0.5);
            `;
            gameContainer.appendChild(asteroid);

            let asteroidY = -20;
            const asteroidSpeed = 3 + Math.random() * 2;
            
            const moveInterval = setInterval(() => {
                if (!gameActive) {
                    clearInterval(moveInterval);
                    if (asteroid.parentNode) {
                        asteroid.parentNode.removeChild(asteroid);
                    }
                    return;
                }
                
                asteroidY += asteroidSpeed;
                asteroid.style.top = asteroidY + 'px';

                // Check collision
                const asteroidRect = asteroid.getBoundingClientRect();
                const shipRect = playerShip.getBoundingClientRect();
                
                if (asteroidRect.bottom >= shipRect.top && 
                    asteroidRect.left < shipRect.right && 
                    asteroidRect.right > shipRect.left) {
                    // Collision!
                    gameActive = false;
                    const reward = Math.floor(200 + (score * 5));
                    this.endGame(reward);
                    return;
                }

                if (asteroidY > 400) {
                    clearInterval(moveInterval);
                    if (asteroid.parentNode) {
                        asteroid.parentNode.removeChild(asteroid);
                    }
                    if (gameActive) {
                        score += 10;
                        if (scoreElement) scoreElement.textContent = score;
                    }
                }
            }, 50);

            asteroids.push({ element: asteroid, interval: moveInterval });
        }, 800 - Math.min(score * 5, 400)); // Increase difficulty over time
    }

    // Crypto Clicker Game
    startCryptoClicker() {
        if (!this.gameArea) return;
        
        this.cleanupCurrentGame();
        this.activeGame = 'cryptoClicker';
        
    // Crypto Clicker Game
    startCryptoClicker() {
        if (!this.gameArea) return;
        
        this.cleanupCurrentGame();
        this.activeGame = 'cryptoClicker';
        
        let clicks = 0;
        let timeLeft = 10;
        let gameActive = true;
        let multiplier = 1;
        let consecutiveClicks = 0;

        this.gameArea.innerHTML = `
            <h3 style="color: var(--primary-gold); font-size: 22px; margin-bottom: 20px;">💎 Crypto Clicker</h3>
            <p style="margin-bottom: 20px;">Click as fast as you can in ${timeLeft} seconds!</p>
            <div id="clickTarget" style="font-size: 100px; cursor: pointer; margin: 30px; transition: all 0.1s ease; filter: drop-shadow(0 0 15px var(--primary-gold)); user-select: none;">💎</div>
            <div style="margin: 20px 0;">
                <div>Clicks: <span id="clickCount" style="color: var(--success-green); font-weight: 700; font-size: 24px;">0</span></div>
                <div>Time: <span id="clickTime" style="color: var(--danger-red); font-weight: 700; font-size: 20px;">10</span>s</div>
                <div id="clickMultiplier" style="color: var(--neon-blue); font-weight: 600; margin-top: 10px;">1x Multiplier</div>
            </div>
            <button class="action-btn" onclick="miniGames.endGame()" style="margin-top: 15px;">🛑 End Game</button>
        `;

        const clickTarget = document.getElementById('clickTarget');
        const clickCountEl = document.getElementById('clickCount');
        const clickTimeEl = document.getElementById('clickTime');
        const multiplierEl = document.getElementById('clickMultiplier');

        const handleClick = () => {
            if (!gameActive) return;
            
            clicks += multiplier;
            consecutiveClicks++;
            
            // Increase multiplier for consecutive clicks
            if (consecutiveClicks % 5 === 0) {
                multiplier = Math.min(5, multiplier + 1);
                if (multiplierEl) multiplierEl.textContent = multiplier + 'x Multiplier';
            }
            
            if (clickCountEl) clickCountEl.textContent = clicks;
            
            // Visual feedback
            if (clickTarget) {
                clickTarget.style.transform = 'scale(0.9)';
                clickTarget.style.filter = 'drop-shadow(0 0 25px var(--primary-gold)) brightness(1.3)';
                
                setTimeout(() => {
                    clickTarget.style.transform = 'scale(1)';
                    clickTarget.style.filter = 'drop-shadow(0 0 15px var(--primary-gold)) brightness(1)';
                }, 100);
            }

            // Haptic feedback
            if (window.telegramApp) {
                window.telegramApp.hapticFeedback('light');
            }
        };

        clickTarget.addEventListener('click', handleClick);
        clickTarget.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleClick();
        });

        // Game timer
        const gameTimer = setInterval(() => {
            if (!gameActive) return;
            
            timeLeft--;
            if (clickTimeEl) clickTimeEl.textContent = timeLeft;

            if (timeLeft <= 0) {
                gameActive = false;
                const reward = clicks * 8;
                this.endGame(reward);
            }
        }, 1000);

        // Reset multiplier if no clicks for 2 seconds
        let lastClickTime = Date.now();
        const multiplierReset = setInterval(() => {
            if (!gameActive) return;
            
            if (Date.now() - lastClickTime > 2000) {
                multiplier = 1;
                consecutiveClicks = 0;
                if (multiplierEl) multiplierEl.textContent = '1x Multiplier';
            }
        }, 500);

        // Update last click time on each click
        const originalHandleClick = handleClick;
        const wrappedHandleClick = () => {
            lastClickTime = Date.now();
            originalHandleClick();
        };

        clickTarget.removeEventListener('click', handleClick);
        clickTarget.addEventListener('click', wrappedHandleClick);

        // Cleanup
        this.addCleanup(() => {
            gameActive = false;
            clearInterval(gameTimer);
            clearInterval(multiplierReset);
            clickTarget.removeEventListener('click', handleClick);
            clickTarget.removeEventListener('click', wrappedHandleClick);
        });
    }

    // Puzzle Hack Game
    startPuzzleHack() {
        if (!this.gameArea) return;
        
        this.cleanupCurrentGame();
        this.activeGame = 'puzzleHack';
        
        const targetSequence = Array.from({length: 4}, () => Math.floor(Math.random() * 9) + 1);
        let attempts = 0;
        const maxAttempts = 5;
        
        this.gameArea.innerHTML = `
            <h3 style="color: var(--primary-gold); font-size: 22px; margin-bottom: 20px;">🧩 Puzzle Hack</h3>
            <p style="margin-bottom: 20px;">Crack the alien security code!</p>
            <div style="background: rgba(0,0,0,0.8); padding: 20px; border-radius: 15px; border: 2px solid var(--neon-blue); margin: 20px 0;">
                <div style="font-size: 28px; margin: 15px 0; font-family: 'Orbitron', monospace; letter-spacing: 8px; color: var(--neon-blue);">
                    ${targetSequence.join(' ')}
                </div>
                <div style="font-size: 12px; opacity: 0.7; margin-top: 10px;">Memorize this sequence</div>
            </div>
            <input type="number" placeholder="Enter 4-digit code" id="puzzleInput" style="padding: 12px 18px; font-size: 18px; border-radius: 12px; border: 2px solid var(--primary-gold); background: rgba(0,0,0,0.7); color: white; width: 180px; text-align: center; margin: 15px;" max="9999" min="1000">
            <div style="margin: 20px 0;">
                <div>Attempts: <span id="attemptsLeft" style="color: var(--danger-red); font-weight: 700;">${maxAttempts}</span> left</div>
            </div>
            <div style="margin: 15px 0;">
                <button class="action-btn" onclick="miniGames.solvePuzzle()" style="margin: 8px;">🔍 Crack Code</button>
                <button class="action-btn" onclick="miniGames.endGame()">🛑 Give Up</button>
            </div>
            <div id="puzzleHint" style="color: var(--secondary-orange); margin-top: 12px; font-weight: 600; min-height: 20px;"></div>
        `;

        // Store game state for solve function
        this.puzzleData = {
            targetSequence,
            attempts,
            maxAttempts
        };
    }

    // Solve puzzle function
    solvePuzzle() {
        if (this.activeGame !== 'puzzleHack' || !this.puzzleData) return;

        const input = document.getElementById('puzzleInput');
        const hintElement = document.getElementById('puzzleHint');
        const attemptsElement = document.getElementById('attemptsLeft');
        
        if (!input || !input.value) {
            if (hintElement) hintElement.textContent = '⚠️ Please enter a 4-digit code!';
            return;
        }

        const userInput = input.value.toString().padStart(4, '0');
        if (userInput.length !== 4) {
            if (hintElement) hintElement.textContent = '⚠️ Code must be exactly 4 digits!';
            return;
        }

        const userSequence = userInput.split('').map(Number);
        const { targetSequence, maxAttempts } = this.puzzleData;
        
        this.puzzleData.attempts++;

        if (JSON.stringify(userSequence) === JSON.stringify(targetSequence)) {
            const reward = Math.floor(500 + (maxAttempts - this.puzzleData.attempts) * 50);
            if (window.telegramApp) {
                window.telegramApp.hapticFeedback('success');
            }
            this.endGame(reward);
        } else {
            const attemptsLeft = maxAttempts - this.puzzleData.attempts;
            
            if (attemptsLeft <= 0) {
                if (hintElement) hintElement.textContent = '💀 Out of attempts! Code was: ' + targetSequence.join('');
                if (window.telegramApp) {
                    window.telegramApp.hapticFeedback('error');
                }
                setTimeout(() => this.endGame(0), 2000);
            } else {
                if (hintElement) hintElement.textContent = `❌ Wrong code! ${attemptsLeft} attempts left.`;
                if (attemptsElement) attemptsElement.textContent = attemptsLeft;
                input.value = '';
                
                if (window.telegramApp) {
                    window.telegramApp.hapticFeedback('error');
                }
            }
        }
    }

    // PvP Arena Game
    startPvPArena() {
        if (!this.gameArea) return;
        
        this.cleanupCurrentGame();
        this.activeGame = 'pvpArena';
        
        let playerHealth = 100;
        let enemyHealth = 100;
        let gameActive = true;
        
        this.gameArea.innerHTML = `
            <h3 style="color: var(--primary-gold); font-size: 20px; margin-bottom: 15px;">⚔️ CX Arena PvP</h3>
            <p style="margin-bottom: 15px;">Battle against GalaxyHunter!</p>
            <div style="display: flex; justify-content: space-around; margin: 25px 0; align-items: center;">
                <div style="text-align: center;">
                    <div style="font-size: 50px; margin-bottom: 10px;">🚀</div>
                    <div style="font-weight: 700; margin-bottom: 8px;">You</div>
                    <div style="width: 100px; height: 20px; background: rgba(76, 175, 80, 0.3); border-radius: 10px; border: 2px solid var(--success-green); overflow: hidden;">
                        <div id="playerHealthBar" style="width: 100%; height: 100%; background: linear-gradient(90deg, var(--success-green), var(--primary-gold)); border-radius: 8px; transition: width 0.4s ease;"></div>
                    </div>
                    <div id="playerHealthText" style="margin-top: 4px; font-size: 12px;">100/100</div>
                </div>
                <div style="font-size: 24px; color: var(--danger-red); font-weight: 900;">VS</div>
                <div style="text-align: center;">
                    <div style="font-size: 50px; margin-bottom: 10px;">🤖</div>
                    <div style="font-weight: 700; margin-bottom: 8px;">GalaxyHunter</div>
                    <div style="width: 100px; height: 20px; background: rgba(255, 68, 68, 0.3); border-radius: 10px; border: 2px solid var(--danger-red); overflow: hidden;">
                        <div id="enemyHealthBar" style="width: 100%; height: 100%; background: linear-gradient(90deg, var(--danger-red), var(--secondary-orange)); border-radius: 8px; transition: width 0.4s ease;"></div>
                    </div>
                    <div id="enemyHealthText" style="margin-top: 4px; font-size: 12px;">100/100</div>
                </div>
            </div>
            <div style="margin: 20px 0;">
                <button class="action-btn" onclick="miniGames.pvpAttack()" style="font-size: 16px; padding: 15px 30px;">⚔️ ATTACK!</button>
                <button class="action-btn" onclick="miniGames.endGame()" style="margin-top: 10px;">🛑 Retreat</button>
            </div>
            <div id="battleLog" style="background: rgba(0,0,0,0.6); padding: 12px; border-radius: 12px; max-height: 80px; overflow-y: auto; font-size: 13px; min-height: 40px;"></div>
        `;

        // Store battle state
        this.battleData = {
            playerHealth,
            enemyHealth,
            gameActive
        };
    }

    // PvP attack function
    pvpAttack() {
        if (this.activeGame !== 'pvpArena' || !this.battleData || !this.battleData.gameActive) return;

        const playerDamage = 15 + Math.floor(Math.random() * 20);
        const enemyDamage = 12 + Math.floor(Math.random() * 18);
        
        this.battleData.enemyHealth = Math.max(0, this.battleData.enemyHealth - playerDamage);
        this.battleData.playerHealth = Math.max(0, this.battleData.playerHealth - enemyDamage);
        
        // Update health bars
        const enemyHealthBar = document.getElementById('enemyHealthBar');
        const playerHealthBar = document.getElementById('playerHealthBar');
        const enemyHealthText = document.getElementById('enemyHealthText');
        const playerHealthText = document.getElementById('playerHealthText');
        
        if (enemyHealthBar) enemyHealthBar.style.width = this.battleData.enemyHealth + '%';
        if (playerHealthBar) playerHealthBar.style.width = this.battleData.playerHealth + '%';
        if (enemyHealthText) enemyHealthText.textContent = `${this.battleData.enemyHealth}/100`;
        if (playerHealthText) playerHealthText.textContent = `${this.battleData.playerHealth}/100`;
        
        // Battle log
        const battleLog = document.getElementById('battleLog');
        if (battleLog) {
            battleLog.innerHTML += `<div>You dealt ${playerDamage} damage!</div>`;
            if (this.battleData.enemyHealth > 0) {
                battleLog.innerHTML += `<div style="color: var(--danger-red);">Enemy dealt ${enemyDamage} damage!</div>`;
            }
            battleLog.scrollTop = battleLog.scrollHeight;
        }
        
        // Check win/lose conditions
        if (this.battleData.enemyHealth <= 0) {
            const reward = Math.floor(1200 + Math.random() * 800);
            this.battleData.gameActive = false;
            
            if (window.telegramApp) {
                window.telegramApp.hapticFeedback('success');
            }
            
            setTimeout(() => this.endGame(reward), 1000);
        } else if (this.battleData.playerHealth <= 0) {
            this.battleData.gameActive = false;
            
            if (window.telegramApp) {
                window.telegramApp.hapticFeedback('error');
            }
            
            if (battleLog) {
                battleLog.innerHTML += `<div style="color: var(--danger-red); font-weight: 700;">💀 You have been defeated!</div>`;
            }
            
            setTimeout(() => this.endGame(50), 1500); // Small consolation reward
        } else {
            if (window.telegramApp) {
                window.telegramApp.hapticFeedback('medium');
            }
        }
    }
}

// Initialize mini-games system
const miniGames = new MiniGames();

// Global functions for mini-games
function startAsteroidDodge() {
    miniGames.startAsteroidDodge();
}

function startCryptoClicker() {
    miniGames.startCryptoClicker();
}

function startPuzzleHack() {
    miniGames.startPuzzleHack();
}

function startPvPArena() {
    miniGames.startPvPArena();
}

function endMinigame() {
    miniGames.endGame();
}

// Export for global access
window.miniGames = miniGames;
