import supabase from './supabaseClient.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegramId, limit = 100 } = req.query;
    const limitNum = Math.min(parseInt(limit) || 100, 100); // Cap at 100

    // Get top players ordered by GP
    const { data: topPlayers, error: topError } = await supabase
      .from('players')
      .select('telegram_id, username, gp, updated_at')
      .order('gp', { ascending: false })
      .order('updated_at', { ascending: true }) // Secondary sort for ties
      .limit(limitNum);

    if (topError) {
      console.error('Supabase error (top players):', topError);
      return res.status(500).json({ 
        error: 'Database error', 
        details: topError.message 
      });
    }

    let userRank = null;
    let userInTop100 = false;
    let userData = null;

    if (telegramId) {
      const userTelegramId = parseInt(telegramId);
      
      // Check if user is in top players
      const userInTop = topPlayers.find(player => player.telegram_id === userTelegramId);
      
      if (userInTop) {
        userRank = topPlayers.indexOf(userInTop) + 1;
        userInTop100 = true;
        userData = userInTop;
      } else {
        // Get user's rank if not in top 100 using the database function
        try {
          const { data: userRankData, error: rankError } = await supabase
            .rpc('get_player_rank', { p_telegram_id: userTelegramId });

          if (!rankError && userRankData) {
            userRank = userRankData;
            
            // Get user data separately
            const { data: userDataResult } = await supabase
              .from('players')
              .select('telegram_id, username, gp')
              .eq('telegram_id', userTelegramId)
              .single();
              
            userData = userDataResult;
          }
        } catch (rankError) {
          console.error('Error getting user rank:', rankError);
          userRank = 999;
        }
      }
    }

    // Format response
    const response = {
      topPlayers: topPlayers.map((player, index) => ({
        rank: index + 1,
        username: player.username || 'Anonymous',
        gp: player.gp,
        telegramId: player.telegram_id.toString()
      })),
      userRank: userRank || 999,
      userInTop100,
      userData: userData ? {
        username: userData.username || 'Anonymous',
        gp: userData.gp,
        telegramId: userData.telegram_id.toString()
      } : null,
      totalPlayers: topPlayers.length,
      lastUpdated: new Date().toISOString()
    };

    console.log(`Leaderboard loaded: ${topPlayers.length} players, user ${telegramId} rank: ${userRank}`);

    return res.status(200).json(response);

  } catch (error) {
    console.error('Leaderboard error:', error);
    
    // Return fallback data in case of error
    const fallbackData = {
      topPlayers: [
        { rank: 1, username: 'GalaxyMaster', gp: 125000, telegramId: '1' },
        { rank: 2, username: 'StarHunter', gp: 89500, telegramId: '2' },
        { rank: 3, username: 'CosmicRider', gp: 67200, telegramId: '3' },
        { rank: 4, username: 'NebulaKing', gp: 54300, telegramId: '4' },
        { rank: 5, username: 'VoidExplorer', gp: 43100, telegramId: '5' }
      ],
      userRank: 999,
      userInTop100: false,
      userData: null,
      totalPlayers: 5,
      lastUpdated: new Date().toISOString(),
      error: 'Using fallback data due to server error'
    };
    
    return res.status(200).json(fallbackData);
  }
}


