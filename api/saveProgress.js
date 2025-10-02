import { supabase } from './supabaseClient.js';

export default async function handler(req, res) {
  // Enhanced CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method);
    return res.status(405).json({ 
      error: 'Method not allowed', 
      message: 'Use POST method only' 
    });
  }

  try {
    console.log('=== SAVE REQUEST START ===');
    console.log('Request body:', typeof req.body, req.body);

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON in request body' });
      }
    }

    const { telegramId, username, gameState } = body;

    if (!telegramId) {
      console.log('❌ Missing telegramId');
      return res.status(400).json({ 
        error: 'telegramId is required',
        received: { telegramId, username, gameState: !!gameState }
      });
    }

    if (!gameState || typeof gameState !== 'object') {
      console.log('❌ Invalid gameState');
      return res.status(400).json({ 
        error: 'gameState is required and must be an object',
        received: typeof gameState
      });
    }

    const safeParseInt = (value, fallback = 0) => {
      const parsed = parseInt(value);
      return isNaN(parsed) ? fallback : Math.max(0, parsed);
    };

    const safeParseJSON = (value, fallback = {}) => {
      if (typeof value === 'object' && value !== null) return value;
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return fallback;
        }
      }
      return fallback;
    };

    const playerData = {
      telegram_id: parseInt(telegramId),
      username: (username || 'Anonymous').substring(0, 100),
      energy: safeParseInt(gameState.energy, 100),
      max_energy: Math.max(1, safeParseInt(gameState.maxEnergy, 100)),
      shards: safeParseInt(gameState.shards, 0),
      gp: safeParseInt(gameState.gp, 0),
      current_planet: (gameState.currentPlanet || '').substring(0, 100),
      daily_streak: Math.max(1, safeParseInt(gameState.dailyStreak, 1)),
      last_login: gameState.lastLogin || new Date().toISOString().split('T')[0],
      boss_health: safeParseInt(gameState.bossHealth, 500),
      player_damage: safeParseInt(gameState.playerDamage, 0),
      upgrades: JSON.stringify(safeParseJSON(gameState.upgrades, { speed: 0, damage: 0, energy: 0, multiplier: 0 })),
      skins: JSON.stringify(safeParseJSON(gameState.skins, [])),
      achievements: JSON.stringify(safeParseJSON(gameState.achievements, [])),
      game_tickets: Math.min(10, Math.max(0, safeParseInt(gameState.gameTickets, 3))),
      last_ticket_time: new Date(gameState.lastTicketTime || Date.now()).toISOString(),
      daily_tasks: JSON.stringify(safeParseJSON(gameState.dailyTasks, { login: false, mine: false, boss: false, combo: false })),
      one_time_tasks: JSON.stringify(safeParseJSON(gameState.oneTimeTasks, { planet: false, purchase: false, shards100: false, invite5: false })),
      daily_task_progress: JSON.stringify(safeParseJSON(gameState.dailyTaskProgress, { mines: 0, bossBattles: 0, comboAttempts: 0 })),
      daily_combo: JSON.stringify(safeParseJSON(gameState.dailyCombo, { code: '', attempts: 3, completed: false, date: '' })),
      referral_code: gameState.referralCode || ('CX' + Math.random().toString(36).substr(2, 8).toUpperCase()),
      total_referrals: safeParseInt(gameState.totalReferrals, 0),
      referral_earnings: safeParseInt(gameState.referralEarnings, 0),
      last_daily_reset: gameState.lastDailyReset || new Date().toDateString(),
      
      // ACHIEVEMENT TRACKING FIELDS - NEW
      planets_visited: JSON.stringify(safeParseJSON(gameState.planetsVisited, [])),
      planet_mine_count: JSON.stringify(safeParseJSON(gameState.planetMineCount, {})),
      total_mines: safeParseInt(gameState.totalMines, 0),
      bosses_defeated: safeParseInt(gameState.bossesDefeated, 0),
      total_shards_collected: safeParseInt(gameState.totalShardsCollected, 0),
      total_gp_earned: safeParseInt(gameState.totalGPEarned, 0),
      unlocked_achievements: JSON.stringify(safeParseJSON(gameState.unlockedAchievements, [])),
      daily_tasks_completed: safeParseInt(gameState.dailyTasksCompleted, 0),
      
      updated_at: new Date().toISOString()
    };

    console.log('✅ Prepared player data:', {
      telegram_id: playerData.telegram_id,
      gp: playerData.gp,
      username: playerData.username,
      energy: playerData.energy,
      totalMines: playerData.total_mines,
      unlockedAchievements: JSON.parse(playerData.unlocked_achievements).length
    });

    let saveAttempts = 0;
    const maxAttempts = 3;
    let lastError = null;

    while (saveAttempts < maxAttempts) {
      try {
        const { data, error } = await supabase
          .from('players')
          .upsert(playerData, {
            onConflict: 'telegram_id',
            returning: 'representation'
          })
          .select('telegram_id, gp, username, updated_at');

        if (error) {
          throw error;
        }

        console.log('✅ Save successful:', {
          telegramId: data[0]?.telegram_id,
          gp: data[0]?.gp,
          username: data[0]?.username,
          attempt: saveAttempts + 1
        });
        console.log('=== SAVE REQUEST END ===');

        return res.status(200).json({
          success: true,
          message: 'Progress saved successfully',
          saved: {
            telegramId: data[0]?.telegram_id,
            gp: data[0]?.gp,
            username: data[0]?.username,
            timestamp: data[0]?.updated_at
          }
        });

      } catch (error) {
        lastError = error;
        saveAttempts++;
        console.warn(`⚠️ Save attempt ${saveAttempts} failed:`, error.message);
        
        if (saveAttempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * saveAttempts));
        }
      }
    }

    console.error('❌ All save attempts failed:', lastError);
    return res.status(500).json({
      error: 'Database save failed after multiple attempts',
      details: lastError?.message || 'Unknown error',
      attempts: maxAttempts
    });

  } catch (error) {
    console.error('❌ Handler error:', error);
    return res.status(500).json({
      error: 'Server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
