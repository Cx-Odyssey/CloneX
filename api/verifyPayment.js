import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed - use POST' });
  }

  try {
    console.log('=== PAYMENT VERIFICATION START ===');
    const { telegramId, itemId, userWalletAddress, expectedAmount, timestamp } = req.body;

    if (!telegramId || !itemId || !userWalletAddress || !expectedAmount || !timestamp) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['telegramId', 'itemId', 'userWalletAddress', 'expectedAmount', 'timestamp']
      });
    }

    const YOUR_WALLET = process.env.TON_WALLET_ADDRESS;
    
    console.log('Checking payments to:', YOUR_WALLET);
    console.log('Expected amount:', expectedAmount, 'TON');
    console.log('From wallet:', userWalletAddress);

    // Query TON Console API for recent transactions
    const response = await fetch(
      `https://tonconsole.com/tonapi/v2/blockchain/accounts/${YOUR_WALLET}/transactions?limit=20`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.TONAPI_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`TON API error: ${response.status}`);
    }

    const data = await response.json();
    
    let verified = false;
    let txHash = null;
    
    // Check each transaction
    for (const tx of data.transactions || []) {
      // Skip if no incoming message
      if (!tx.in_msg || !tx.in_msg.value) continue;
      
      const txAmount = parseInt(tx.in_msg.value) / 1e9; // Convert from nanotons
      const txTime = tx.utime * 1000; // Convert to milliseconds
      const txFrom = tx.in_msg.source?.address || '';
      
      console.log('Checking transaction:', {
        from: txFrom,
        amount: txAmount,
        time: new Date(txTime).toISOString(),
        hash: tx.hash
      });
      
      // Normalize addresses for comparison
      const normalizedTxFrom = normalizeAddress(txFrom);
      const normalizedUserWallet = normalizeAddress(userWalletAddress);
      
      // Check if addresses match (handle both EQ and UQ formats)
      const addressMatch = 
        normalizedTxFrom === normalizedUserWallet ||
        normalizedTxFrom.replace('EQ', 'UQ') === normalizedUserWallet ||
        normalizedTxFrom === normalizedUserWallet.replace('UQ', 'EQ') ||
        normalizedTxFrom.replace('UQ', 'EQ') === normalizedUserWallet;
      
      // Check if amount matches (with 2% tolerance)
      const amountMatch = txAmount >= expectedAmount * 0.98 && txAmount <= expectedAmount * 1.02;
      
      // Check if time is within 10 minute window
      const timeMatch = Math.abs(txTime - timestamp) < 600000;
      
      if (addressMatch && amountMatch && timeMatch) {
        verified = true;
        txHash = tx.hash;
        console.log('✅ Payment verified!');
        break;
      }
    }
    
    if (verified) {
      // Check if this transaction was already recorded
      const { data: existingPurchase } = await supabase
        .from('premium_purchases')
        .select('id')
        .eq('tx_hash', txHash)
        .maybeSingle();
      
      if (!existingPurchase) {
        // Record the purchase
        const { error: insertError } = await supabase
          .from('premium_purchases')
          .insert({
            telegram_id: parseInt(telegramId),
            item_id: itemId,
            amount_ton: expectedAmount,
            tx_hash: txHash,
            user_wallet: userWalletAddress,
            purchased_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('Failed to record purchase:', insertError);
          // Don't fail verification, just log error
        } else {
          console.log('Purchase recorded in database');
        }
      } else {
        console.log('Purchase already recorded (duplicate check)');
      }
    } else {
      console.log('❌ Payment not found yet');
    }
    
    console.log('=== PAYMENT VERIFICATION END ===');
    
    return res.status(200).json({
      success: true,
      verified,
      transactionHash: txHash || null,
      message: verified ? 'Payment confirmed' : 'Payment not found yet'
    });
    
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    return res.status(500).json({
      error: 'Verification failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

function normalizeAddress(address) {
  if (!address) return '';
  return address.trim();
}
