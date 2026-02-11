import { createClient } from '@supabase/supabase-js'

// Variabili ambiente (Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are missing')
}

// Client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 🔹 Helper per ottenere l'utente corrente
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user
}

// 🔹 Verifica se utente loggato
export const isAuthenticated = async () => {
  const { data } = await supabase.auth.getSession()
  return !!data.session
}

// 🔹 Helper per immagini (se usi Supabase Storage)
export const getImageUrl = (bucket, path) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data?.publicUrl || null
}

export default supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase credentials missing! Create a .env file with:\n' +
    'VITE_SUPABASE_URL=your_project_url\n' +
    'VITE_SUPABASE_ANON_KEY=your_anon_key\n' +
    'Get these from: https://supabase.com/dashboard/project/[project-id]/settings/api'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

export default supabase
