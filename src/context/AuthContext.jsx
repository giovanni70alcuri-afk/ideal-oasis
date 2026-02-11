import { createContext, useContext, useEffect, useState } from 'react'
import { pb, getCurrentUser, isAuthenticated } from '../lib/pocketbase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch user profile from PocketBase
  const fetchProfile = async (userId) => {
    try {
      const record = await pb.collection('profiles').getOne(userId)
      setProfile(record)
      return record
    } catch (err) {
      console.error('Error fetching profile:', err)
      // Profile might not exist yet, create it
      if (err.status === 404) {
        try {
          const newProfile = await pb.collection('profiles').create({
            id: userId,
            username: userId.slice(0, 8),
          })
          setProfile(newProfile)
          return newProfile
        } catch (createErr) {
          console.error('Error creating profile:', createErr)
        }
      }
      return null
    }
  }

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initAuth = () => {
      if (isAuthenticated()) {
        const currentUser = getCurrentUser()
        if (mounted) {
          setUser(currentUser)
          fetchProfile(currentUser.id)
        }
      }
      if (mounted) setLoading(false)
    }

    initAuth()

    // Listen for auth changes
    pb.authStore.onChange((auth) => {
      if (mounted) {
        if (isAuthenticated()) {
          const currentUser = getCurrentUser()
          setUser(currentUser)
          fetchProfile(currentUser.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    })

    return () => {
      mounted = false
    }
  }, [])

  // Login
  const login = async (email, password) => {
    try {
      setError(null)
      const authData = await pb.collection('users').authWithPassword(email, password)
      setUser(authData.record)
      await fetchProfile(authData.record.id)
      return { success: true, data: authData }
    } catch (err) {
      console.error('Login error:', err)
      const message = err.message || "Errore durante l'accesso"
      setError(message)
      return { success: false, error: message }
    }
  }

  // Signup
  const signup = async (email, password, fullName) => {
    try {
      setError(null)
      const data = {
        email,
        password,
        passwordConfirm: password,
        name: fullName,
      }
      await pb.collection('users').create(data)
      // Auto login after signup
      const loginResult = await login(email, password)
      return loginResult
    } catch (err) {
      console.error('Signup error:', err)
      const message = err.message || 'Errore durante la registrazione'
      setError(message)
      return { success: false, error: message }
    }
  }

  // Logout
  const logout = async () => {
    try {
      pb.authStore.clear()
      setUser(null)
      setProfile(null)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // Update profile
  const updateProfile = async (updates) => {
    if (!user) return { success: false, error: 'Not authenticated' }

    try {
      setError(null)
      const updated = await pb.collection('profiles').update(user.id, updates)
      setProfile(updated)
      return { success: true, data: updated }
    } catch (err) {
      const message = err.message || "Errore nell'aggiornamento"
      setError(message)
      return { success: false, error: message }
    }
  }

  const value = {
    user,
    profile,
    loading,
    error,
    login,
    signup,
    logout,
    updateProfile,
    fetchProfile,
    isAuthenticated: () => isAuthenticated(),
    clearError: () => setError(null)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
