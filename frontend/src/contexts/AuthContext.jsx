import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Ao carregar, verifica se há sessão guardada
  useEffect(() => {
    const savedUser = localStorage.getItem('crm_user')
    const savedToken = localStorage.getItem('crm_token')
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (userData, token) => {
    localStorage.setItem('crm_user', JSON.stringify(userData))
    localStorage.setItem('crm_token', token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('crm_user')
    localStorage.removeItem('crm_token')
    setUser(null)
  }

  const isAdmin = () => user?.perfil === 'administrador'

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
