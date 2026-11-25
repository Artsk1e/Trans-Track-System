import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import axios from 'axios'
import type { User, AuthContextType } from '@/types/auth'

interface LoginResponse {
  success: boolean
  message: string
  token: string
  user: User
}

const TOKEN_KEY = 'auth_token'

const AuthContext = createContext<AuthContextType | null>(null)

// Lazy initialization to avoid synchronous setState in effect
const getStoredToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY)
  }
  return null
}

// Maps backend roles to frontend roles for UI decisions
const getFrontendRole = (backendRole: User['role']): 'STAFF' | 'EXEC' => {
  return (backendRole === 'EXECUTIVE' || backendRole === 'ADMIN') ? 'EXEC' : 'STAFF'
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token] = useState<string | null>(() => getStoredToken())
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Mark as loaded once after initial render
  if (loading) {
    setLoading(false)
  }

  const login = useCallback(async (username: string, password: string) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const response = await axios.post<LoginResponse>(`${API_BASE_URL}/auth/login`, {
      username,
      password
    })

    if (response.data.success) {
      const { token, user } = response.data
      localStorage.setItem(TOKEN_KEY, token)
      setUser(user)
      return { success: true, user, frontendRole: getFrontendRole(user.role) }
    } else {
      throw new Error(response.data.message || 'Login failed')
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }, [])

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    logout
  }), [user, token, loading, login, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}