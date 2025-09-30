import { supabase } from './supabaseClient.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed - use POST' });
  }

  try {
    console.log('=== REFERRAL PROCESSING START ===');
    const { newUserTelegramId, newUserUsername, referrerCode } = req.body;

    if (!newUserTelegramId || !referrerCode) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['newUserTelegramId', 'referrerCode']
      });
    }

    // Find referrer by code
    const { data: referrer, error: referrerError } = await supabase
      .from('players')
      .select('telegram_id, referral_code, total_referrals, referral_earnings')
      .eq('referral_code', referrerCode)
      .single();

    if (referrerError || !referrer) {
      console.log('Referrer not found:', referrerCode);
      return res.status(404).json({ error: 'Referrer not found' });
    }

    // Check if new user already exists (prevent duplicate referrals)
    const { data: existingUser } = await supabase
      .from('players')
      .select('telegram_id')
      .eq('telegram_id', parseInt(newUserTelegramId))
      .maybeSingle();

    if (existingUser) {
      console.log('User already registered, skipping referral');
      return res.status(200).json({ 
        success: false, 
        message: 'User already registered' 
      });
    }

    // Award bonus to referrer
    const referrerBonus = 25;
    const newTotalReferrals = (referrer.total_referrals || 0) + 1;
    const newReferralEarnings = (referrer.referral_earnings || 0) + referrerBonus;

    // Calculate milestone bonuses
    const milestones = {
      1: 25,    // First friend
      5: 225,   // 5 friends (250 total - 25 already given)
      10: 500,  // 10 friends (750 total)
      25: 1250, // 25 friends (2000 total)
      50: 3000, // 50 friends (5000 total)
      100: 10000 // 100 friends (15000 total)
    };

    let milestoneBonus = 0;
    if (milestones[newTotalReferrals]) {
      milestoneBonus = milestones[newTotalReferrals];
      console.log(`🎉 Milestone reached: ${newTotalReferrals} friends! Bonus: ${milestoneBonus} GP`);
    }

    // Update referrer's stats and GP
    const { error: updateError } = await supabase
      .from('players')
      .update({
        total_referrals: newTotalReferrals,
        referral_earnings: newReferralEarnings,
        gp: supabase.rpc('increment', { x: referrerBonus + milestoneBonus }),
        updated_at: new Date().toISOString()
      })
      .eq('telegram_id', referrer.telegram_id);

    if (updateError) {
      console.error('Failed to update referrer:', updateError);
      return res.status(500).json({ error: 'Failed to update referrer' });
    }

    // Create new user with referral bonus
    const newUserData = {
      telegram_id: parseInt(newUserTelegramId),
      username: newUserUsername || 'Anonymous',
      gp: 25, // Bonus for joining via referral
      referral_code: 'CX' + Math.random().toString(36).substr(2, 8).toUpperCase(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: createError } = await supabase
      .from('players')
      .insert(newUserData);

    if (createError) {
      console.error('Failed to create new user:', createError);
      // Don't fail the request if user creation fails
      // They'll be created on first save
    }

    console.log('✅ Referral processed successfully');
    console.log(`Referrer ${referrer.telegram_id} now has ${newTotalReferrals} referrals`);
    console.log('=== REFERRAL PROCESSING END ===');

    return res.status(200).json({
      success: true,
      message: 'Referral processed successfully',
      referrerBonus: referrerBonus,
      milestoneBonus: milestoneBonus,
      totalBonus: referrerBonus + milestoneBonus,
      newUserBonus: 25,
      referrerStats: {
        totalReferrals: newTotalReferrals,
        totalEarnings: newReferralEarnings
      }
    });

  } catch (error) {
    console.error('Referral processing error:', error);
    return res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
}
