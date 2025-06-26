import { createContext, useContext, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../config/axios'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    try {
      setLoading(true)
      const response = await api.post('/api/auth/login', {
        email,
        password
      })
      const userData = response.data.user
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return userData
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await api.post('/api/users/register', userData)
      toast.success('Registration successful')
      return response.data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}