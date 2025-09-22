const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegram_id, wallet_address } = req.body;
    
    const { data, error } = await supabase
      .from('players')
      .update({ wallet_address, updated_at: new Date() })
      .eq('telegram_id', telegram_id);

    if (error) throw error;

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving wallet:', error);
    res.status(500).json({ error: 'Failed to save wallet' });
  }
};
