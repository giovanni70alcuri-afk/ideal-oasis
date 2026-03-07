import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('[Supabase] Mancano VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY nel file .env.local')
}

export const supabase = createClient(url ?? '', key ?? '')
