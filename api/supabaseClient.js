import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('Environment check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey,
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'missing'
});

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables - check SUPABASE_URL and SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    },
    db: {
        schema: 'public'
    }
});

// Test connection
try {
    const { data, error } = await supabase.from('players').select('count').limit(1);
    if (error) {
        console.error('Supabase connection test failed:', error.message);
    } else {
        console.log('Supabase connection successful');
    }
} catch (err) {
    console.error('Supabase initialization error:', err.message);
