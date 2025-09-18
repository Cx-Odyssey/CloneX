import supabase from './supabaseClient.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegramId } = req.query;

    if (!telegramId) {
      return res.status(400).json({ error: 'Missing telegramId parameter' });
    }

    // Load player data from database
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('telegram_id', parseInt(telegramId))
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Supabase select error:', error);
      return res.status(500).json({ 
        error: 'Database error', 
        details: error.message 
      });
    }

    if (!data) {
      // Return default game state for new player
      console.log(`New player detected: ${telegramId}`);
      return res.status(200).json({
        energy: 100,
        maxEnergy: 100,
        shards: 0,
        gp: 0,
        currentPlanet: '',
        dailyStreak: 1,
        lastLogin: new Date().toISOString().split('T')[0],
        bossHealth: 1000,
        maxBossHealth: 1000,
        playerDamage: 0,
        adDamageBoost: 0,
        upgrades: { speed: 0, damage: 0, energy: 0, multiplier: 0 },
        skins: [],
        achievements: [],
        planetsExplored: [],
        totalPlayTime: 0,
        gamesPlayed: 0,
        highScores: {},
        settings: {
          soundEnabled: true,
          vibrationEnabled: true,
          notifications: true
        },
        isNewPlayer: true
      });
    }

    // Convert database format to game state format
    const gameState = {
      energy: data.energy,
      maxEnergy: data.max_energy,
      shards: data.shards,
      gp: data.gp,
      currentPlanet: data.current_planet,
      dailyStreak: data.daily_streak,
      lastLogin: data.last_login,
      bossHealth: data.boss_health,
      maxBossHealth: 1000, // Static value
      playerDamage: data.player_damage,
      adDamageBoost: 0, // Always reset on load
      upgrades: typeof data.upgrades === 'string' ? JSON.parse(data.upgrades) : data.upgrades,
      skins: typeof data.skins === 'string' ? JSON.parse(data.skins) : data.skins,
      achievements: typeof data.achievements === 'string' ? JSON.parse(data.achievements) : data.achievements,
      planetsExplored: [], // You can add this field to database if needed
      totalPlayTime: 0, // You can add this field to database if needed
      gamesPlayed: 0, // You can add this field to database if needed
      highScores: {}, // You can add this field to database if needed
      settings: {
        soundEnabled: true,
        vibrationEnabled: true,
        notifications: true
      },
      isNewPlayer: false
    };

    console.log(`Progress loaded for user ${telegramId}: ${gameState.gp} GP`);

    return res.status(200).json(gameState);

  } catch (error) {
    console.error('Load progress error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

