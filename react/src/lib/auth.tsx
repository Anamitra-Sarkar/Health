"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { wakeUpBackend } from './keepAlive'
import {
  auth as firebaseAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  googleProvider,
  sendPasswordResetEmail
} from './firebase'

type User = { id: string; email: string; role?: string; profile?: unknown } | null

type AuthContextType = {
  user: User
  loading: boolean
  login: (email: string, password: string, remember?: boolean) => Promise<User>
  loginWithGoogle?: (remember?: boolean) => Promise<User>
  signup: (payload: { email: string; password: string; role?: string; profile?: unknown }, remember?: boolean) => Promise<User>
  logout: () => Promise<void>
  authFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getStoredToken() {
  try {
    return localStorage.getItem('hs_token') || sessionStorage.getItem('hs_token')
  } catch {
    return null
  }
}

function storeToken(token: string, remember = true) {
  try {
    if (remember) localStorage.setItem('hs_token', token)
    else sessionStorage.setItem('hs_token', token)
  } catch {
    console.error("failed to store auth token")
  }
}

function clearToken() {
  try {
    localStorage.removeItem('hs_token')
    sessionStorage.removeItem('hs_token')
  } catch {
    console.error("failed to clear auth token")
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    const API_BASE = (import.meta.env.VITE_API_URL as string) || ''

    async function init() {
      setLoading(true)
      const token = getStoredToken()
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) {
          clearToken()
          if (mounted) setUser(null)
          setLoading(false)
          return
        }
        const data = await res.json()
        if (mounted) setUser(data.user || null)
      } catch {
        clearToken()
        if (mounted) setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    init()
    return () => { mounted = false }
  }, [])

  async function login(email: string, password: string, remember = false) {
    const API_BASE = (import.meta.env.VITE_API_URL as string) || ''

    // Wake up backend if it's sleeping (Render free tier)
    await wakeUpBackend()

    try {
      // Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password)
      const idToken = await userCredential.user.getIdToken()

      // Send Firebase ID token to our backend for verification and JWT issuance
      const res = await fetch(`${API_BASE}/api/auth/firebase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, isSignup: false })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Login failed')
      const token: string | undefined = data?.token
      if (token) storeToken(token, remember)
      setUser(data.user || null)
      return data.user || null
    } catch (err: unknown) {
      // Handle Firebase-specific error codes with user-friendly messages
      const firebaseError = err as { code?: string; message?: string }
      if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password')
      }
      if (firebaseError.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password')
      }
      if (firebaseError.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.')
      }
      if (firebaseError.code === 'auth/user-disabled') {
        throw new Error('This account has been disabled.')
      }
      throw err
    }
  }

  async function loginWithGoogle(remember = false) {
    const API_BASE = (import.meta.env.VITE_API_URL as string) || ''

    await wakeUpBackend()

    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider)
      const idToken = await result.user.getIdToken()

      // Try login first
      let res = await fetch(`${API_BASE}/api/auth/firebase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, isSignup: false })
      })
      let data = await res.json()

      // If user not found, auto-signup as doctor
      if (!res.ok && res.status === 401) {
        const profile = {
          name: result.user.displayName || '',
          picture: result.user.photoURL || ''
        }
        res = await fetch(`${API_BASE}/api/auth/firebase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken, isSignup: true, role: 'doctor', profile })
        })
        data = await res.json()
      }

      if (!res.ok) throw new Error(data?.error || 'Google login failed')
      const token: string | undefined = data?.token
      if (token) storeToken(token, remember)
      setUser(data.user || null)
      return data.user || null
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string }
      if (firebaseError.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in popup was closed')
      }
      throw err
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function signup(payload: { email: string; password: string; role?: string; profile?: any }, remember = false) {
    const API_BASE = (import.meta.env.VITE_API_URL as string) || ''

    await wakeUpBackend()

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, payload.email, payload.password)
      const idToken = await userCredential.user.getIdToken()

      // Send Firebase ID token to our backend for user creation in MongoDB
      const res = await fetch(`${API_BASE}/api/auth/firebase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          isSignup: true,
          role: payload.role || 'doctor',
          profile: payload.profile || {}
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Signup failed')
      const token: string | undefined = data?.token
      if (token) storeToken(token, remember)
      setUser(data.user || null)
      return data.user || null
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string }
      if (firebaseError.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists')
      }
      if (firebaseError.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use at least 6 characters.')
      }
      if (firebaseError.code === 'auth/invalid-email') {
        throw new Error('Invalid email address')
      }
      throw err
    }
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(firebaseAuth, email)
  }

  async function logout() {
    try {
      const API_BASE = (import.meta.env.VITE_API_URL as string) || ''
      await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' })
    } catch (err) {
      console.warn('logout error', err)
    }
    try {
      await firebaseSignOut(firebaseAuth)
    } catch (err) {
      console.warn('Firebase sign out error', err)
    }
    clearToken()
    setUser(null)
    navigate('/login')
  }

  async function authFetch(input: RequestInfo, init?: RequestInit) {
    const token = getStoredToken()
    const headers = { ...(init?.headers as Record<string, string> | undefined), ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    const API_BASE = (import.meta.env.VITE_API_URL as string) || ''
    const url = typeof input === 'string' && input.startsWith('/api') ? `${API_BASE}${input}` : input
    return fetch(url, { ...init, headers })
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, signup, logout, authFetch, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthProvider
