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
    console.log('=== LEADERBOARD REQUEST START ===');
    const { telegramId, limit = 100 } = req.query;
    const limitNum = Math.min(parseInt(limit) || 100, 100);

    // Get top players
    const { data: topPlayers, error: topError } = await supabase
      .from('players')
      .select('telegram_id, username, gp, updated_at')
      .order('gp', { ascending: false })
      .order('updated_at', { ascending: true })
      .limit(limitNum);

    if (topError) {
      console.error('Top players query error:', topError);
      // Return fallback data instead of failing
      return res.status(200).json({
        topPlayers: [
          { rank: 1, username: 'GalaxyMaster', gp: 125000, telegramId: '1' },
          { rank: 2, username: 'StarHunter', gp: 89500, telegramId: '2' },
          { rank: 3, username: 'CosmicRider', gp: 67200, telegramId: '3' }
        ],
        userRank: 999,
        userInTop100: false,
        totalPlayers: 3,
        error: 'Database error - showing sample data'
      });
    }

    let userRank = null;
    let userInTop100 = false;

    if (telegramId) {
      const userTelegramId = parseInt(telegramId);
      const userInTop = topPlayers.find(player => player.telegram_id === userTelegramId);
      
      if (userInTop) {
        userRank = topPlayers.indexOf(userInTop) + 1;
        userInTop100 = true;
      } else {
        // Try to get user rank with function
        try {
          const { data: rankData } = await supabase.rpc('get_player_rank', { 
            p_telegram_id: userTelegramId 
          });
          userRank = rankData || 999;
        } catch {
          userRank = 999;
        }
      }
    }

    const response = {
      topPlayers: topPlayers.map((player, index) => ({
        rank: index + 1,
        username: player.username || 'Anonymous',
        gp: player.gp,
        telegramId: player.telegram_id.toString()
      })),
      userRank: userRank || 999,
      userInTop100,
      totalPlayers: topPlayers.length,
      lastUpdated: new Date().toISOString()
    };

    console.log(`Leaderboard: ${topPlayers.length} players, user ${telegramId} rank: ${userRank}`);
    console.log('=== LEADERBOARD REQUEST END ===');

    return res.status(200).json(response);

  } catch (error) {
    console.error('Leaderboard handler error:', error);
    
    // Always return something, never fail completely
    return res.status(200).json({
      topPlayers: [
        { rank: 1, username: 'GalaxyMaster', gp: 125000, telegramId: '1' },
        { rank: 2, username: 'StarHunter', gp: 89500, telegramId: '2' },
        { rank: 3, username: 'CosmicRider', gp: 67200, telegramId: '3' }
      ],
      userRank: 999,
      userInTop100: false,
      totalPlayers: 3,
      error: 'Server error - showing sample data'
    });
  }
}
