import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, checkSupabaseConfig, SupabaseConfigError } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      checkSupabaseConfig()
      setError(null)
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
    } catch (error) {
      if (error instanceof SupabaseConfigError) {
        setError(error.message)
      } else {
        setError(error instanceof Error ? error.message : 'An error occurred during sign up')
      }
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      checkSupabaseConfig()
      setError(null)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (error) {
      if (error instanceof SupabaseConfigError) {
        setError(error.message)
      } else {
        setError(error instanceof Error ? error.message : 'An error occurred during sign in')
      }
      throw error
    }
  }

  const signOut = async () => {
    try {
      checkSupabaseConfig()
      setError(null)
      const { error } = await supabase.auth.signOut()
      
      // Check for benign session-related errors immediately after the call
      if (error) {
        const errorMessage = error.message || String(error)
        const isSessionError = 
          errorMessage.includes('Auth session missing!') ||
          errorMessage.includes('Session from session_id claim in JWT does not exist') ||
          errorMessage.includes('session_not_found') ||
          error.status === 403

        if (isSessionError) {
          // Session is already invalid, don't throw error - user is effectively signed out
          return
        }
        
        // For other errors, throw them
        throw error
      }
    } catch (error) {
      if (error instanceof SupabaseConfigError) {
        setError(error.message)
        throw error
      } else {
        setError(error instanceof Error ? error.message : 'An error occurred during sign out')
        throw error
      }
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    error,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}