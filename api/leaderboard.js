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
  const limit = Math.min(parseInt(searchParams.get('limit')) || 100, 100);

  try {
    const { data: topPlayers, error: topError } = await supabase
      .from('players')
      .select('telegram_id, username, gp, updated_at')
      .order('gp', { ascending: false })
      .order('updated_at', { ascending: true })
      .limit(limit);

    if (topError) {
      return new Response(JSON.stringify({ error: topError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let userRank = null;
    let userInTop100 = false;
    let userData = null;

    if (telegramId) {
      const userTelegramId = parseInt(telegramId, 10);
      const userInTop = topPlayers.find(p => p.telegram_id === userTelegramId);

      if (userInTop) {
        userRank = topPlayers.indexOf(userInTop) + 1;
        userInTop100 = true;
        userData = userInTop;
      } else {
        const { data: userRankData } = await supabase
          .rpc('get_player_rank', { p_telegram_id: userTelegramId });
        if (userRankData) {
          userRank = userRankData;
          const { data: userDataResult } = await supabase
            .from('players')
            .select('telegram_id, username, gp')
            .eq('telegram_id', userTelegramId)
            .maybeSingle();
          userData = userDataResult;
        }
      }
    }

    const response = {
      topPlayers: topPlayers.map((p, i) => ({
        rank: i + 1,
        username: p.username || 'Anonymous',
        gp: p.gp,
        telegramId: p.telegram_id.toString()
      })),
      userRank: userRank || 999,
      userInTop100,
      userData: userData
        ? {
            username: userData.username || 'Anonymous',
            gp: userData.gp,
            telegramId: userData.telegram_id.toString()
          }
        : null,
      totalPlayers: topPlayers.length,
      lastUpdated: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
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
