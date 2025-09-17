import supabase from './supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { telegram_id, username, energy, shards, gp } = req.body;

  const { data, error } = await supabase
    .from('players')
    .upsert(
      { telegram_id, username, energy, shards, gp, updated_at: new Date() },
      { onConflict: 'telegram_id' }
    )
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ success: true, player: data[0] });
}