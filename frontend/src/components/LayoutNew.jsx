import { useState } from 'react'
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Chip
} from '@mui/material'
import { 
  Menu as MenuIcon,
  Dashboard,
  Assignment,
  ViewList,
  Notifications,
  Settings,
  ExitToApp,
  Person,
  SupervisorAccount,
  AccessTime,
  TrendingUp,
  Feedback
} from '@mui/icons-material'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Logo from './Logo'

export default function LayoutNew({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const [anchorEl, setAnchorEl] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    handleClose()
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  // Don't show layout on login/register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>{children}</Box>
  }

  const navigationItems = [
    { 
      text: 'Dashboard', 
      icon: <Dashboard />, 
      path: '/',
      roles: ['student', 'staff']
    },
    { 
      text: 'Submit Grievance', 
      icon: <Assignment />, 
      path: '/submit-grievance',
      roles: ['student']
    },
    { 
      text: 'My Grievances', 
      icon: <ViewList />, 
      path: '/grievances',
      roles: ['student', 'staff']
    },
    { 
      text: 'Notifications', 
      icon: <Notifications />, 
      path: '/notifications',
      roles: ['student', 'staff']
    },
    { 
      text: 'Coordinator Panel', 
      icon: <SupervisorAccount />, 
      path: '/coordinator',
      roles: ['staff']
    },
    { 
      text: 'My Workspace', 
      icon: <Person />, 
      path: '/workspace-coordinator',
      roles: ['staff']
    },
    { 
      text: 'Escalation Management', 
      icon: <TrendingUp />, 
      path: '/escalation',
      roles: ['staff']
    },
    { 
      text: 'Deadlines', 
      icon: <AccessTime />, 
      path: '/deadlines',
      roles: ['staff']
    },
    { 
      text: 'Feedback', 
      icon: <Feedback />, 
      path: '/feedback',
      roles: ['student', 'staff']
    },
  ].filter(item => item.roles.includes(user?.role))

  const drawer = (
    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Logo size="small" />
      </Box>
      <Divider />
      <List sx={{ px: 1 }}>
        {navigationItems.map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            to={item.path}            sx={{
              borderRadius: 2,
              mb: 0.5,
              textDecoration: 'none',
              backgroundColor: location.pathname === item.path ? 'primary.main' : 'transparent',
              color: location.pathname === item.path ? 'white' : 'text.primary',
              '&:hover': {
                backgroundColor: location.pathname === item.path ? 'primary.dark' : 'action.hover',
              },
            }}
            onClick={() => setMobileOpen(false)}
          >
            <ListItemIcon sx={{ 
              color: location.pathname === item.path ? 'white' : 'text.secondary',
              minWidth: 40 
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: location.pathname === item.path ? 600 : 400
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          color: 'text.primary'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user && isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Logo 
              size={isMobile ? "small" : "medium"} 
              showText={!isMobile}
              onClick={() => navigate('/')}
            />
          </Box>

          {user && !isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {navigationItems.slice(0, 5).map((item) => (
                <Button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    backgroundColor: location.pathname === item.path ? 'primary.main' : 'transparent',
                    color: location.pathname === item.path ? 'white' : 'text.primary',
                    '&:hover': {
                      backgroundColor: location.pathname === item.path ? 'primary.dark' : 'action.hover',
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={user.role}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ textTransform: 'capitalize' }}
              />
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                sx={{
                  '& .MuiPaper-root': {
                    borderRadius: 2,
                    minWidth: 200,
                    boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
                  }
                }}
              >
                <MenuItem disabled>
                  <Box>
                    <Typography variant="subtitle2">{user.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleClose}>
                  <Settings sx={{ mr: 1 }} />
                  Settings
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ExitToApp sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {user && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 280,
              borderRadius: '0 16px 16px 0'
            },
          }}
        >
          {drawer}
        </Drawer>
      )}      <Box component="main" sx={{ flexGrow: 1, backgroundColor: 'background.default' }}>
        {children}
      </Box>
    </Box>
  )
}

// Add PropTypes validation
LayoutNew.propTypes = {
  children: () => null // Allow any children
}
