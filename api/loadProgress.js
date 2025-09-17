import supabase from './supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { telegram_id } = req.query;

  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('telegram_id', telegram_id)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ player: data });
}