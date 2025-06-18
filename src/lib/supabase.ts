import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Provide fallback values to prevent URL constructor errors during development
const defaultUrl = 'https://placeholder.supabase.co'
const defaultKey = 'placeholder-key'

export const supabase = createClient(
  supabaseUrl || defaultUrl,
  supabaseAnonKey || defaultKey
)

// Export a function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey && 
         supabaseUrl !== defaultUrl && 
         supabaseAnonKey !== defaultKey &&
         supabaseUrl !== 'https://your-project.supabase.co' &&
         supabaseAnonKey !== 'your-anon-key-here'
}

// Custom error class for Supabase configuration issues
export class SupabaseConfigError extends Error {
  constructor() {
    super('Supabase is not configured. Please click "Connect to Supabase" in the top right corner to set up your database connection.')
    this.name = 'SupabaseConfigError'
  }
}

// Wrapper function to check configuration before making requests
export const checkSupabaseConfig = () => {
  if (!isSupabaseConfigured()) {
    throw new SupabaseConfigError()
  }
}