import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { api, clearSession, getStoredUser, getToken, saveSession } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (getToken() ? getStoredUser() : null))

  const login = useCallback(async (username, password) => {
    const res = await api.post('/api/login', { username, password, tokenFcm: '' })
    saveSession(res.token, res.user)
    setUser(res.user)
    return res.user
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const value = useMemo(() => {
    const role = user?.authorities?.name
    return { user, isLoggedIn: !!user, isAdmin: role === 'ROLE_ADMIN', login, logout, setUser }
  }, [user, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
