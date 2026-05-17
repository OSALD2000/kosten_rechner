import { createContext, useContext, useState } from 'react'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kr_user')) } catch { return null }
  })

  function login(userData, token) {
    setUser(userData)
    localStorage.setItem('kr_user', JSON.stringify(userData))
    localStorage.setItem('kr_token', token)
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('kr_user')
    localStorage.removeItem('kr_token')
  }

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
