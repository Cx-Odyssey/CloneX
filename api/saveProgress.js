import { supabase } from './supabaseClient.js';

export default async function handler(req, res) {
  // Simple CORS - works for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'false');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed - use POST' });
  }

  try {
    console.log('=== SAVE REQUEST START ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    const { telegramId, username, gameState } = req.body;

    // Validate required fields
    if (!telegramId) {
      console.log('Missing telegramId');
      return res.status(400).json({ error: 'telegramId is required' });
    }

    if (!gameState) {
      console.log('Missing gameState');
      return res.status(400).json({ error: 'gameState is required' });
    }

    // Prepare data - keep it simple
    const playerData = {
      telegram_id: parseInt(telegramId),
      username: username || 'Anonymous',
      energy: Math.max(0, parseInt(gameState.energy) || 0),
      max_energy: Math.max(1, parseInt(gameState.maxEnergy) || 100),
      shards: Math.max(0, parseInt(gameState.shards) || 0),
      gp: Math.max(0, parseInt(gameState.gp) || 0),
      current_planet: (gameState.currentPlanet || '').substring(0, 100),
      daily_streak: Math.max(1, parseInt(gameState.dailyStreak) || 1),
      last_login: gameState.lastLogin || new Date().toISOString().split('T')[0],
      boss_health: Math.max(0, parseInt(gameState.bossHealth) || 1000),
      player_damage: Math.max(0, parseInt(gameState.playerDamage) || 0),
      upgrades: JSON.stringify(gameState.upgrades || { speed: 0, damage: 0, energy: 0, multiplier: 0 }),
      skins: JSON.stringify(gameState.skins || []),
      achievements: JSON.stringify(gameState.achievements || []),
      updated_at: new Date().toISOString()
    };

    console.log('Prepared player data:', {
      telegram_id: playerData.telegram_id,
      gp: playerData.gp,
      username: playerData.username
    });

    // Save to database
    const { data, error } = await supabase
      .from('players')
      .upsert(playerData, {
        onConflict: 'telegram_id'
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        error: 'Database save failed', 
        details: error.message 
      });
    }

    console.log('Save successful:', data?.[0]?.telegram_id, data?.[0]?.gp);
    console.log('=== SAVE REQUEST END ===');

    return res.status(200).json({ 
      success: true, 
      message: 'Progress saved successfully',
      saved: {
        telegramId: data[0]?.telegram_id,
        gp: data[0]?.gp,
        username: data[0]?.username
      }
    });

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

