import { supabase } from './supabaseClient.js';

export default async function handler(req, res) {
  // Simple CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed - use GET' });
  }

  try {
    console.log('=== LOAD REQUEST START ===');
    const { telegramId } = req.query;

    if (!telegramId) {
      return res.status(400).json({ error: 'telegramId parameter is required' });
    }

    console.log('Loading data for user:', telegramId);

    // Query database
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('telegram_id', parseInt(telegramId))
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found - new player
        console.log('New player detected:', telegramId);
        const defaultState = {
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
          upgrades: { speed: 0, damage: 0, energy: 0, multiplier: 0 },
          skins: [],
          achievements: [],
          isNewPlayer: true
        };
        return res.status(200).json(defaultState);
      } else {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Database load failed', details: error.message });
      }
    }

    // Convert database data to game format
    const gameState = {
      energy: data.energy || 100,
      maxEnergy: data.max_energy || 100,
      shards: data.shards || 0,
      gp: data.gp || 0,
      currentPlanet: data.current_planet || '',
      dailyStreak: data.daily_streak || 1,
      lastLogin: data.last_login || new Date().toISOString().split('T')[0],
      bossHealth: data.boss_health || 1000,
      maxBossHealth: 1000,
      playerDamage: data.player_damage || 0,
      upgrades: (() => {
        try {
          return typeof data.upgrades === 'string' ? JSON.parse(data.upgrades) : data.upgrades;
        } catch {
          return { speed: 0, damage: 0, energy: 0, multiplier: 0 };
        }
      })(),
      skins: (() => {
        try {
          return typeof data.skins === 'string' ? JSON.parse(data.skins) : data.skins;
        } catch {
          return [];
        }
      })(),
      achievements: (() => {
        try {
          return typeof data.achievements === 'string' ? JSON.parse(data.achievements) : data.achievements;
        } catch {
          return [];
        }
      })(),
      isNewPlayer: false
    };

    console.log('Load successful:', {
      telegramId: data.telegram_id,
      gp: gameState.gp,
      username: data.username
    });
    console.log('=== LOAD REQUEST END ===');

    return res.status(200).json(gameState);

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
}
