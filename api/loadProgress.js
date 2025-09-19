import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export const config = {
  runtime: 'edge'
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const telegramId = searchParams.get('telegramId');

  if (!telegramId) {
    return new Response(JSON.stringify({ error: 'Missing telegramId parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('telegram_id', parseInt(telegramId, 10))
      .maybeSingle();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!data) {
      // Default game state for new player
      const newPlayer = {
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
      };

      return new Response(JSON.stringify(newPlayer), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
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
      maxBossHealth: 1000,
      playerDamage: data.player_damage,
      adDamageBoost: 0,
      upgrades: typeof data.upgrades === 'string' ? JSON.parse(data.upgrades) : data.upgrades,
      skins: typeof data.skins === 'string' ? JSON.parse(data.skins) : data.skins,
      achievements: typeof data.achievements === 'string' ? JSON.parse(data.achievements) : data.achievements,
      planetsExplored: [],
      totalPlayTime: 0,
      gamesPlayed: 0,
      highScores: {},
      settings: {
        soundEnabled: true,
        vibrationEnabled: true,
        notifications: true
      },
      isNewPlayer: false
    };

    return new Response(JSON.stringify(gameState), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

