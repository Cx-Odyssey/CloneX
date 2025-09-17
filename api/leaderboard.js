import supabase from './supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data, error } = await supabase
    .from('players')
    .select('telegram_id, username, gp')
    .order('gp', { ascending: false })
    .limit(100);

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ leaderboard: data });
}
