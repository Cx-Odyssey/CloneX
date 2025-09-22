import { supabase } from './supabaseClient.js';

export default async function handler(req, res) {
  // Simple CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed - use POST' });
  }

  try {
    console.log('=== SAVE WALLET REQUEST START ===');
    const { telegram_id, wallet_address } = req.body;

    if (!telegram_id || !wallet_address) {
      return res.status(400).json({ error: 'telegram_id and wallet_address are required' });
    }

    // Update wallet address for the user
    const { data, error } = await supabase
      .from('players')
      .update({ 
        wallet_address: wallet_address,
        updated_at: new Date().toISOString()
      })
      .eq('telegram_id', parseInt(telegram_id));

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to save wallet address' });
    }

    console.log('Wallet saved successfully for user:', telegram_id);
    console.log('=== SAVE WALLET REQUEST END ===');

    return res.status(200).json({ success: true, message: 'Wallet address saved successfully' });

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
