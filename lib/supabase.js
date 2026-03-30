import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Work address hardcoded for drive time calculations
export const WORK_ADDRESS = '3732 US-1 Suite #4, Cocoa, FL 32926'
export const WORK_ADDRESS_ENCODED = encodeURIComponent(WORK_ADDRESS)

export const AGENT_EMAIL = 'kupadoesrealestate@gmail.com'
export const AGENT_NAME = 'Kupa | KW Atlantic Partners'
