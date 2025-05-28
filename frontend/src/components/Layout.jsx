import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Tooltip,
  Badge,
  useTheme,
  useMediaQuery,
  alpha,
  Collapse
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard,
  Create,
  List as ListIcon,
  Notifications,
  Logout,
  ChevronLeft,
  Person,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material'

const drawerWidth = 280

const pageTransition = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 }
}

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expanded, setExpanded] = useState('')
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Submit Grievance', icon: <Create />, path: '/submit-grievance', role: 'student' },
    { text: 'View Grievances', icon: <ListIcon />, path: '/grievances' },
    { text: 'Notifications', icon: <Notifications />, path: '/notifications' }
  ]

  // Close drawer on route change in mobile view
  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false)
    }
  }, [location, isMobile])

  const drawer = (
    <Box sx={{ height: '100%', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        py: 3
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            background: theme.palette.primary.main,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700
          }}
        >
          Student Grievance System
        </Typography>
      </Toolbar>

      <Box sx={{ px: 2, mb: 2 }}>
        <Box
          className="glass-effect hover-card"
          sx={{
            p: 2,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: theme.palette.primary.main
            }}
          >
            {user?.name?.[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.role?.[0].toUpperCase() + user?.role?.slice(1)}
            </Typography>
          </Box>
        </Box>
      </Box>

      <List sx={{ px: 2 }}>
        {menuItems.map((item) => (
          (!item.role || item.role === user?.role) && (
            <ListItem
              component={Link}
              to={item.path}
              className="hover-card"
              key={item.text}
              sx={{
                mb: 1,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                }
              }}
            >
              <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: 500
                }}
              />
            </ListItem>
          )
        ))}
      </List>
    </Box>
  )

  if (!user) {
    return <AnimatePresence mode="wait">{children}</AnimatePresence>
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
        elevation={0}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title="Logout">
            <IconButton 
              onClick={handleLogout}
              sx={{
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.08),
                  color: theme.palette.error.main
                }
              }}
            >
              <Logout />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: 'transparent',
              border: 'none'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: 'transparent',
              border: 'none'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component={motion.main}
        {...pageTransition}
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginTop: '64px',
          minHeight: '100vh',
          background: 'var(--gradient-bg)'
        }}
        className="page-transition-enter-active"
      >
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </Box>
    </Box>
  )
}