import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles').select('*').eq('id', userId).single()
      if (data) { setProfile(data); return data }
      if (error?.code === 'PGRST116') {
        const { data: np } = await supabase
          .from('profiles')
          .insert({ id: userId, username: userId.slice(0, 8), full_name: 'Utente' })
          .select().single()
        if (np) { setProfile(np); return np }
      }
    } catch (e) { console.error('fetchProfile', e) }
    return null
  }

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      if (session) { setUser(session.user); fetchProfile(session.user.id) }
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (!mounted) return
      if (session) { setUser(session.user); await fetchProfile(session.user.id) }
      else { setUser(null); setProfile(null) }
      setLoading(false)
    })
    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { success: false, error: error.message }
    setUser(data.user)
    await fetchProfile(data.user.id)
    return { success: true }
  }

  const signup = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, username: email.split('@')[0] } }
    })
    if (error) return { success: false, error: error.message }
    if (data.user && data.session) {
      setUser(data.user); await fetchProfile(data.user.id)
    }
    return { success: true }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null); setProfile(null)
  }

  const updateProfile = async (updates) => {
    if (!user) return { success: false }
    const { data, error } = await supabase
      .from('profiles').update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id).select().single()
    if (error) return { success: false, error: error.message }
    setProfile(data)
    return { success: true, data }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, signup, logout, updateProfile, fetchProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
