import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database.types'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || ''

console.log('🔧 Supabase config:', {
  url: supabaseUrl,
  keyPresent: !!supabaseAnonKey,
  keyLength: supabaseAnonKey.length
});

if (!supabaseAnonKey) {
  console.error('❌ Supabase anonymous key not found! Authentication will not work.')
  console.error('❌ Please set REACT_APP_SUPABASE_ANON_KEY in your .env file')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Test connection immediately
console.log('🔧 Testing Supabase connection...');
const testConnection = async () => {
  try {
    const response = await supabase.from('user_profiles').select('count').limit(0);
    console.log('🔧 Supabase connection test result:', response.error ? 'FAILED' : 'SUCCESS');
    if (response.error) {
      console.error('🔧 Connection error:', response.error);
    }
  } catch (error) {
    console.error('🔧 Supabase connection test failed:', error);
  }
};
testConnection();

export type { Database } from '../types/database.types'