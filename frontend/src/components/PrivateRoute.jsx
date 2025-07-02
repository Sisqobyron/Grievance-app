import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function PrivateRoute({ children }) {
  const authContext = useAuth()
  
  if (!authContext) {
    return <Navigate to="/login" />
  }
  
  const { user } = authContext
  
  return user ? children : <Navigate to="/login" />
}