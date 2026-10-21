import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api, ApiError } from '../api/client'
import type { User } from '../api/types'

const TOKEN_KEY = 'sitedirect_sitelead_token'

type AuthState = {
  token: string | null
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshMe: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      try {
        const stored = await AsyncStorage.getItem(TOKEN_KEY)
        if (!stored) return
        const me = await api.me(stored)
        if (me.role !== 'SITE_LEAD') {
          await AsyncStorage.removeItem(TOKEN_KEY)
          return
        }
        setToken(stored)
        setUser(me)
      } catch {
        await AsyncStorage.removeItem(TOKEN_KEY)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.login(email.trim(), password)
    if (result.user.role !== 'SITE_LEAD') {
      throw new ApiError(403, 'This app is for Site Lead accounts only')
    }
    await AsyncStorage.setItem(TOKEN_KEY, result.token)
    setToken(result.token)
    setUser(result.user)
  }, [])

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const refreshMe = useCallback(async () => {
    if (!token) return
    const me = await api.me(token)
    setUser(me)
  }, [token])

  const value = useMemo(
    () => ({ token, user, loading, login, logout, refreshMe }),
    [token, user, loading, login, logout, refreshMe],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth requires AuthProvider')
  return ctx
}
