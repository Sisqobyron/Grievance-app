import { createContext, useContext, useState, useMemo } from 'react'
import { toast } from 'react-toastify'
import api from '../config/axios'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user')
      return storedUser ? JSON.parse(storedUser) : null
    } catch (error) {
      console.error('Error parsing user from localStorage:', error)
      localStorage.removeItem('user')
      return null
    }
  })
  const [loading, setLoading] = useState(false)
  const [staffCodeRequired, setStaffCodeRequired] = useState(false)

  console.log('AuthProvider rendering, user:', user)

  const login = async (email, password) => {
    try {
      setLoading(true)
      const response = await api.post('/api/auth/login', {
        email,
        password
      })
      const userData = response.data.user
      
      // Check if user is staff and requires code verification
      if (userData.role === 'staff') {
        setStaffCodeRequired(true)
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        return { requiresStaffCode: true, user: userData }
      }
      
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return { user: userData }
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
      
      // Remove confirmPassword from userData before sending to backend
      // eslint-disable-next-line no-unused-vars
      const { confirmPassword, ...registrationData } = userData
      
      const response = await api.post('/api/users/register', registrationData)
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
    setStaffCodeRequired(false)
    localStorage.removeItem('user')
  }

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    staffCodeRequired,
    setStaffCodeRequired
  }), [user, loading, staffCodeRequired])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}