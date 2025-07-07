import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'
import AuthProvider, { useAuth } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import StaffProtectedRoute from './components/StaffProtectedRoute'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import Layout from './components/LayoutNew'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import StaffDashboard from './pages/StaffDashboard'
import AdminDashboard from './pages/AdminDashboard'
import SubmitGrievance from './pages/SubmitGrievance'
import ViewGrievances from './pages/ViewGrievances'
import Notifications from './pages/Notifications'
import CoordinatorDashboard from './components/CoordinatorDashboard'
import CoordinatorWorkspaceDashboard from './components/CoordinatorWorkspaceDashboard'
import EscalationManagement from './components/EscalationManagement'
import DeadlineTracking from './components/DeadlineTracking'
import FeedbackSystem from './components/FeedbackSystem'

// Create modern 2025 theme configuration
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Professional blue matching your logo
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#9c27b0', // Modern purple accent
      light: '#ba68c8',
      dark: '#7b1fa2',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c2c2c',
      secondary: '#666666',
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.025em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.025em',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '0.95rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#fafafa',
          scrollBehavior: 'smooth',
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
          boxShadow: '0px 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.95rem',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: 'none',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.06)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 12px 40px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover fieldset': {
              borderColor: '#1976d2',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 0px rgba(0,0,0,0.08)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(255,255,255,0.95)',
        },
      },
    },
  },
})

// Role-based dashboard component
const DashboardWrapper = () => {
  const authContext = useAuth();
  
  if (!authContext) return <Navigate to="/login" />;
  
  const { user } = authContext;
  
  if (!user) return <Navigate to="/login" />;
  
  // Route based on user role
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'staff':
      return <StaffDashboard />;
    case 'student':
      return <Dashboard />;
    default:
      return <Navigate to="/login" />;
  }
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
                  <StaffProtectedRoute>
                    <DashboardWrapper />
                  </StaffProtectedRoute>
                </PrivateRoute>
              } />
              <Route path="/submit-grievance" element={
                <PrivateRoute>
                  <StaffProtectedRoute>
                    <SubmitGrievance />
                  </StaffProtectedRoute>
                </PrivateRoute>
              } />
              <Route path="/grievances" element={
                <PrivateRoute>
                  <StaffProtectedRoute>
                    <ViewGrievances />
                  </StaffProtectedRoute>
                </PrivateRoute>
              } />
              <Route path="/notifications" element={
                <PrivateRoute>
                  <StaffProtectedRoute>
                    <Notifications />
                  </StaffProtectedRoute>
                </PrivateRoute>
              } />
              <Route path="/coordinator" element={
                <PrivateRoute>
                  <AdminProtectedRoute>
                    <CoordinatorDashboard />
                  </AdminProtectedRoute>
                </PrivateRoute>
              } />
              <Route path="/coordinator-workspace" element={
                <PrivateRoute>
                  <StaffProtectedRoute>
                    <CoordinatorWorkspaceDashboard />
                  </StaffProtectedRoute>
                </PrivateRoute>
              } />
              <Route path="/workspace-coordinator" element={
                <PrivateRoute>
                  <StaffProtectedRoute>
                    <CoordinatorWorkspaceDashboard />
                  </StaffProtectedRoute>
                </PrivateRoute>
              } />
              <Route path="/escalation" element={
                <PrivateRoute>
                  <StaffProtectedRoute>
                    <EscalationManagement />
                  </StaffProtectedRoute>
                </PrivateRoute>
              } />
              <Route path="/deadlines" element={
                <PrivateRoute>
                  <StaffProtectedRoute>
                    <DeadlineTracking />
                  </StaffProtectedRoute>
                </PrivateRoute>
              } />
              <Route path="/feedback" element={
                <PrivateRoute>
                  <StaffProtectedRoute>
                    <FeedbackSystem />
                  </StaffProtectedRoute>
                </PrivateRoute>
              } />
              <Route path="/admin" element={
                <PrivateRoute>
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
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
