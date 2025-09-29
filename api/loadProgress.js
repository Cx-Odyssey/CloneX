import { supabase } from './supabaseClient.js';

export default async function handler(req, res) {
  // Enhanced CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');

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
      return res.status(400).json({ 
        error: 'telegramId parameter is required',
        example: '/api/loadProgress?telegramId=123456789'
      });
    }

    const telegramIdInt = parseInt(telegramId);
    if (isNaN(telegramIdInt)) {
      return res.status(400).json({ error: 'telegramId must be a valid number' });
    }

    console.log('Loading data for user:', telegramIdInt);

    // Enhanced database query with error handling
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('telegram_id', telegramIdInt)
      .maybeSingle(); // Use maybeSingle instead of single to handle no results gracefully

    if (error) {
      console.error('Database error:', error);
      
      // Return default state for new player instead of error
      const defaultState = createDefaultGameState();
      console.log('Returning default state due to database error');
      return res.status(200).json({
        ...defaultState,
        isNewPlayer: true,
        message: 'Database unavailable, using default state'
      });
    }

    if (!data) {
      // No data found - new player
      console.log('New player detected:', telegramIdInt);
      const defaultState = createDefaultGameState();
      return res.status(200).json({
        ...defaultState,
        isNewPlayer: true
      });
    }

    // Convert database data to game format with proper error handling
    const gameState = {
      energy: safeParseInt(data.energy, 100),
      maxEnergy: safeParseInt(data.max_energy, 100),
      shards: safeParseInt(data.shards, 0),
      gp: safeParseInt(data.gp, 0),
      currentPlanet: data.current_planet || '',
      dailyStreak: safeParseInt(data.daily_streak, 1),
      lastLogin: data.last_login || new Date().toISOString().split('T')[0],
      bossHealth: safeParseInt(data.boss_health, 500),
      maxBossHealth: 500,
      playerDamage: safeParseInt(data.player_damage, 0),
      gameTickets: Math.min(10, Math.max(0, safeParseInt(data.game_tickets, 3))),
      lastTicketTime: data.last_ticket_time ? new Date(data.last_ticket_time).getTime() : Date.now(),
      upgrades: safeParseJSON(data.upgrades, { speed: 0, damage: 0, energy: 0, multiplier: 0 }),
      skins: safeParseJSON(data.skins, []),
      achievements: safeParseJSON(data.achievements, []),
      dailyTasks: safeParseJSON(data.daily_tasks, { login: false, mine: false, boss: false, combo: false }),
      oneTimeTasks: safeParseJSON(data.one_time_tasks, { planet: false, purchase: false, shards100: false, invite5: false }),
      dailyTaskProgress: safeParseJSON(data.daily_task_progress, { mines: 0, bossBattles: 0, comboAttempts: 0 }),
      dailyCombo: safeParseJSON(data.daily_combo, { code: '', attempts: 3, completed: false, date: '' }),
      referralCode: data.referral_code || generateReferralCode(),
      totalReferrals: safeParseInt(data.total_referrals, 0),
      referralEarnings: safeParseInt(data.referral_earnings, 0),
      lastDailyReset: data.last_daily_reset || new Date().toISOString().split('T')[0], // ISO format
      isNewPlayer: false
    };

    // Regenerate energy based on time passed
    if (data.updated_at) {
      const timePassed = Date.now() - new Date(data.updated_at).getTime();
      const energyToAdd = Math.floor(timePassed / 30000); // 1 energy per 30 seconds
      gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + energyToAdd);
    }

    // Update tickets based on time
    updateTicketsFromTime(gameState);

    console.log('Load successful:', {
      telegramId: telegramIdInt,
      gp: gameState.gp,
      energy: gameState.energy,
      tickets: gameState.gameTickets
    });
    console.log('=== LOAD REQUEST END ===');

    return res.status(200).json(gameState);

  } catch (error) {
    console.error('Handler error:', error);
    
    // Return default state instead of error to keep game playable
    const defaultState = createDefaultGameState();
    return res.status(200).json({
      ...defaultState,
      isNewPlayer: true,
      error: 'Server error occurred, using default state',
      message: error.message
    });
  }
}

// Helper functions
function safeParseInt(value, fallback = 0) {
  const parsed = parseInt(value);
  return isNaN(parsed) ? fallback : Math.max(0, parsed);
}

function safeParseJSON(value, fallback = {}) {
  if (typeof value === 'object' && value !== null) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed !== null ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function generateReferralCode() {
  return 'CX' + Math.random().toString(36).substr(2, 8).toUpperCase();
}

function createDefaultGameState() {
  return {
    energy: 100,
    maxEnergy: 100,
    shards: 0,
    gp: 0,
    currentPlanet: '',
    dailyStreak: 1,
    lastLogin: new Date().toISOString().split('T')[0],
    bossHealth: 500,
    maxBossHealth: 500,
    playerDamage: 0,
    gameTickets: 3,
    lastTicketTime: Date.now(),
    upgrades: { speed: 0, damage: 0, energy: 0, multiplier: 0 },
    skins: [],
    achievements: [],
    dailyTasks: { login: false, mine: false, boss: false, combo: false },
    oneTimeTasks: { planet: false, purchase: false, shards100: false, invite5: false },
    dailyTaskProgress: { mines: 0, bossBattles: 0, comboAttempts: 0 },
    dailyCombo: { code: '', attempts: 3, completed: false, date: '' },
    referralCode: generateReferralCode(),
    totalReferrals: 0,
    referralEarnings: 0,
    lastDailyReset: new Date().toDateString()
  };
}

function updateTicketsFromTime(gameState) {
  const now = Date.now();
  const timePassed = now - gameState.lastTicketTime;
  const ticketsToAdd = Math.floor(timePassed / 180000); // 1 ticket every 3 minutes
  
  if (ticketsToAdd > 0) {
    gameState.gameTickets = Math.min(10, gameState.gameTickets + ticketsToAdd);
    gameState.lastTicketTime = now;
  }
}
