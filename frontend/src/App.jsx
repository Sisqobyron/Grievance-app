import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'
import AuthProvider, { useAuth } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import StaffDashboard from './pages/StaffDashboard'
import SubmitGrievance from './pages/SubmitGrievance'
import ViewGrievances from './pages/ViewGrievances'
import Notifications from './pages/Notifications'
import CoordinatorDashboard from './components/CoordinatorDashboard'
import CoordinatorWorkspaceDashboard from './components/CoordinatorWorkspaceDashboard'
import EscalationManagement from './components/EscalationManagement'
import DeadlineTracking from './components/DeadlineTracking'
import FeedbackSystem from './components/FeedbackSystem'

// Create theme configuration
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // Modern blue
      light: '#3b82f6',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#7c3aed', // Modern purple
      light: '#8b5cf6',
      dark: '#6d28d9',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif'
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f8fafc',
          scrollBehavior: 'smooth',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
        elevation1: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '0.5rem 1.25rem',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
  },
})

// Role-based dashboard component
const DashboardWrapper = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  return user.role === 'staff' ? <StaffDashboard /> : <Dashboard />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <PrivateRoute>
                  <DashboardWrapper />
                </PrivateRoute>
              } />
              <Route path="/submit-grievance" element={
                <PrivateRoute>
                  <SubmitGrievance />
                </PrivateRoute>
              } />
              <Route path="/grievances" element={
                <PrivateRoute>
                  <ViewGrievances />
                </PrivateRoute>
              } />
              <Route path="/notifications" element={
                <PrivateRoute>
                  <Notifications />
                </PrivateRoute>
              } />
              <Route path="/coordinator" element={
                <PrivateRoute>
                  <CoordinatorDashboard />
                </PrivateRoute>
              } />
              <Route path="/workspace-coordinator" element={
                <PrivateRoute>
                  <CoordinatorWorkspaceDashboard />
                </PrivateRoute>
              } />
              <Route path="/escalation" element={
                <PrivateRoute>
                  <EscalationManagement />
                </PrivateRoute>
              } />
              <Route path="/deadlines" element={
                <PrivateRoute>
                  <DeadlineTracking />
                </PrivateRoute>
              } />
              <Route path="/feedback" element={
                <PrivateRoute>
                  <FeedbackSystem />
                </PrivateRoute>
              } />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} />
    </ThemeProvider>
  )
}

export default App
