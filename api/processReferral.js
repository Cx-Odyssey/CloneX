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
      .select('telegram_id, referral_code, total_referrals, referral_earnings, gp')
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

    // Calculate bonuses
    const referrerBonus = 25;
    const newTotalReferrals = (referrer.total_referrals || 0) + 1;
    const newReferralEarnings = (referrer.referral_earnings || 0) + referrerBonus;

    // Calculate milestone bonuses
    const milestones = {
      1: 0,      // First friend - just base 25 GP
      3: 75,     // 3 friends - extra 75 GP (100 total)
      5: 125,    // 5 friends - extra 125 GP (250 total)
      10: 475,   // 10 friends - extra 475 GP (750 total)
      25: 1225,  // 25 friends - extra 1225 GP (2000 total)
      50: 2975,  // 50 friends - extra 2975 GP (5000 total)
      100: 9975  // 100 friends - extra 9975 GP (15000 total)
    };

    let milestoneBonus = milestones[newTotalReferrals] || 0;
    
    if (milestoneBonus > 0) {
      console.log(`🎉 Milestone reached: ${newTotalReferrals} friends! Bonus: ${milestoneBonus} GP`);
    }

    // Calculate new GP total (FIXED: proper addition instead of RPC)
    const newGP = (referrer.gp || 0) + referrerBonus + milestoneBonus;

    // Update referrer's stats and GP
    const { error: updateError } = await supabase
      .from('players')
      .update({
        total_referrals: newTotalReferrals,
        referral_earnings: newReferralEarnings,
        gp: newGP,
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
      referred_by: referrerCode, // Track who referred them
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
    console.log(`Referrer GP increased by ${referrerBonus + milestoneBonus} (new total: ${newGP})`);
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
        totalEarnings: newReferralEarnings,
        newGP: newGP
      }
    });

  } catch (error) {
    console.error('Referral processing error:', error);
    return res.status(500).json({
      error: 'Server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
