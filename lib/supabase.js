import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()

const fallbackUrl = 'https://placeholder.supabase.co'
const fallbackAnonKey = 'placeholder-anon-key'

const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)

if (!hasSupabaseConfig && typeof window !== 'undefined') {
	console.warn('Supabase environment variables are missing. Using fallback client config.')
}

export const supabase = createClient(
	hasSupabaseConfig ? supabaseUrl : fallbackUrl,
	hasSupabaseConfig ? supabaseAnonKey : fallbackAnonKey,
	{
		auth: {
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: true,
		},
	}
)