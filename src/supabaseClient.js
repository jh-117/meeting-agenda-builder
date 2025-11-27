// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Required variables:')
  console.error('  - VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌ MISSING')
  console.error('  - VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌ MISSING')
  throw new Error('Supabase environment variables are not configured. Please check your .env file.')
}

// Log configuration (safe info only)
console.log('🔧 Supabase Configuration:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length,
  keyStartsWith: supabaseAnonKey?.substring(0, 20) + '...'
})

// Create Supabase client with optimized options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js/agenda-app'
    }
  },
  // Add timeout for edge functions
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Optional: Add error handler for edge function calls
export const invokeEdgeFunction = async (functionName, payload) => {
  try {
    console.log(`📡 Calling edge function: ${functionName}`)
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload
    })

    if (error) {
      console.error(`❌ Edge function error (${functionName}):`, error)
      throw error
    }

    console.log(`✅ Edge function response (${functionName}):`, data)
    return data
  } catch (error) {
    console.error(`❌ Failed to invoke ${functionName}:`, error.message)
    throw error
  }
}

// Verify connection (optional but recommended)
export const verifySupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('_meta').select('count').limit(1)
    if (error) {
      console.warn('⚠️ Supabase connection warning:', error.message)
      return false
    }
    console.log('✅ Supabase connection verified')
    return true
  } catch (error) {
    console.warn('⚠️ Could not verify Supabase connection:', error.message)
    return false
  }
}