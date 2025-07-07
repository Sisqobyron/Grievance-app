import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../config/axios'
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Chip,
  Alert,
  LinearProgress,
  alpha,
  useTheme
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import GrievanceViz from '../components/GrievanceViz';
import DeadlineTracking from '../components/DeadlineTracking';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();const [stats, setStats] = useState({
    totalGrievances: 0,
    resolvedGrievances: 0,
    pendingGrievances: 0,
    overdueGrievances: 0,
    averageResolutionTime: 0,
    criticalGrievances: 0
  });
  const [recentGrievances, setRecentGrievances] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showViz, setShowViz] = useState(false);
  const [showDeadlines, setShowDeadlines] = useState(false);  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch grievances
      let grievancesUrl;
      if (user.role === 'student') {
        grievancesUrl = `/api/grievances/student/${user.id}`;
      } else if (user.role === 'staff') {
        grievancesUrl = '/api/grievances/department';
      } else {
        grievancesUrl = '/api/grievances'; // admin gets all grievances
      }
      const grievancesResponse = await api.get(grievancesUrl);
      
      // Handle different response formats based on user role
      let grievances;
      if (user.role === 'staff' && grievancesResponse.data.grievances) {
        // Staff endpoint returns { department, count, grievances: [...] }
        grievances = Array.isArray(grievancesResponse.data.grievances) ? grievancesResponse.data.grievances : [];
      } else {
        // Student and admin endpoints return grievances array directly
        grievances = Array.isArray(grievancesResponse.data) ? grievancesResponse.data : [];
      }

      // Calculate enhanced stats
      const resolved = grievances.filter(g => g.status === 'Resolved').length;
      const total = grievances.length;
      const overdue = grievances.filter(g => {
        if (g.deadline_date && g.status !== 'Resolved') {
          return new Date(g.deadline_date) < new Date();
        }
        return false;
      }).length;
      const critical = grievances.filter(g => g.priority === 'Critical' && g.status !== 'Resolved').length;

      setStats({
        totalGrievances: total,
        resolvedGrievances: resolved,
        pendingGrievances: total - resolved,
        overdueGrievances: overdue,
        averageResolutionTime: 0, // TODO: Calculate from timeline data
        criticalGrievances: critical
      });

      // Get recent grievances
      setRecentGrievances(grievances.slice(0, 5));      // Fetch upcoming deadlines
      try {
        const deadlinesResponse = await api.get('/api/deadlines/upcoming');
        setUpcomingDeadlines(deadlinesResponse.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching deadlines:', error);
      }

      // Fetch notifications
      const notificationsResponse = await api.get(
        `/api/notifications/${user.id}`
      );
      setRecentNotifications(notificationsResponse.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1"
          sx={{ 
            fontWeight: 700, 
            mb: 1,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Welcome back, {user.name}! 👋
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
          Here's what's happening with your grievances today
        </Typography>
      </Box>

      {/* Modern Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            title: 'Total Grievances',
            value: stats.totalGrievances,
            color: 'primary',
            icon: '📊',
            trend: '+12%'
          },
          {
            title: 'Resolved',
            value: stats.resolvedGrievances,
            color: 'success',
            icon: '✅',
            percentage: stats.totalGrievances > 0 ? (stats.resolvedGrievances / stats.totalGrievances) * 100 : 0
          },
          {
            title: 'Pending',
            value: stats.pendingGrievances,
            color: 'warning',
            icon: '⏳',
            trend: stats.pendingGrievances > 5 ? 'High' : 'Normal'
          },
          {
            title: 'Overdue',
            value: stats.overdueGrievances,
            color: 'error',
            icon: '🚨',
            urgent: stats.overdueGrievances > 0
          }
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card
              sx={{
                height: '100%',
                background: stat.urgent 
                  ? `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)}, ${alpha(theme.palette.error.light, 0.05)})`
                  : 'background.paper',
                border: stat.urgent ? `1px solid ${alpha(theme.palette.error.main, 0.2)}` : '1px solid',
                borderColor: stat.urgent ? 'error.main' : 'divider',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0px 12px 40px ${alpha(theme.palette[stat.color].main, 0.15)}`,
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" color="text.secondary" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: `${stat.color}.main`, mt: 1 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      fontSize: '2rem',
                      opacity: 0.8,
                      transform: 'rotate(-10deg)'
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                
                {stat.percentage !== undefined && (
                  <LinearProgress 
                    variant="determinate" 
                    value={stat.percentage}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: alpha(theme.palette[stat.color].main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        backgroundColor: `${stat.color}.main`
                      }
                    }} 
                  />
                )}
                
                {stat.trend && (
                  <Chip 
                    label={stat.trend}
                    size="small"
                    color={stat.color}
                    variant="outlined"
                    sx={{ mt: 1, fontSize: '0.75rem' }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Critical Alerts */}
      {stats.criticalGrievances > 0 && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 4, 
            borderRadius: 3,
            '& .MuiAlert-icon': { fontSize: '1.5rem' }
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            🚨 {stats.criticalGrievances} Critical Grievance{stats.criticalGrievances > 1 ? 's' : ''} Need Immediate Attention
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Please review and take action on high-priority cases
          </Typography>
        </Alert>
      )}

      {/* Modern Action Buttons */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { 
            text: showViz ? 'Hide Analytics' : '🎯 View 3D Analytics', 
            action: () => setShowViz(!showViz),
            variant: showViz ? 'outlined' : 'contained',
            color: 'primary',
            gradient: 'linear-gradient(135deg, #4fc3f7, #29b6f6)',
            icon: '📊'
          },
          { 
            text: showDeadlines ? 'Hide Deadlines' : '⏰ Track Deadlines', 
            action: () => setShowDeadlines(!showDeadlines),
            variant: 'outlined',
            color: 'secondary',
            icon: '⏰'
          },
          { 
            text: '✍️ Submit New Grievance', 
            action: () => navigate('/submit-grievance'),
            variant: 'contained',
            color: 'primary',
            icon: '✍️'
          },
          { 
            text: '📋 View All Grievances', 
            action: () => navigate('/grievances'),
            variant: 'contained',
            color: 'secondary',
            icon: '📋'
          }
        ].map((btn) => (
          <Grid item xs={12} sm={6} md={3} key={btn.text}>
            <Button
              fullWidth
              variant={btn.variant}
              color={btn.color}
              onClick={btn.action}
              sx={{ 
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                background: btn.gradient || undefined,
                boxShadow: btn.gradient ? '0 8px 16px rgba(79, 195, 247, 0.3)' : undefined,
                border: btn.variant === 'outlined' ? '2px solid' : undefined,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: btn.gradient 
                    ? '0 12px 24px rgba(79, 195, 247, 0.4)' 
                    : '0 8px 16px rgba(0, 0, 0, 0.2)',
                  background: btn.gradient || undefined
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ fontSize: '1.1em' }}>{btn.icon}</span>
                {btn.text}
              </Box>
            </Button>
          </Grid>
        ))}
      </Grid>

      {/* Modern 3D Visualization */}
      {showViz && (
        <Paper 
          sx={{ 
            p: 0, 
            mb: 4, 
            borderRadius: 4,
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0d1421 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <Box 
            sx={{ 
              p: 3, 
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: 'white', 
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #4fc3f7, #9c27b0)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5
                  }}
                >
                  � Advanced Analytics Visualization
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  Interactive 3D representation of your grievance data with real-time statistics
                </Typography>
              </Box>
              <Chip 
                label="🚀 2025 Design" 
                sx={{ 
                  backgroundColor: 'rgba(76, 195, 247, 0.2)',
                  color: '#4fc3f7',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }} 
              />
            </Box>
          </Box>
          <Box sx={{ height: '500px', position: 'relative' }}>
            <GrievanceViz />
          </Box>
        </Paper>
      )}

      {/* Deadline Tracking */}
      {showDeadlines && (
        <Box sx={{ mb: 4 }}>
          <DeadlineTracking />
        </Box>
      )}

      {/* Dashboard Content Grid */}
      <Grid container spacing={3}>
        {/* Recent Grievances */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, pb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    📋 Recent Grievances
                  </Typography>
                  <Button 
                    component={RouterLink} 
                    to="/grievances"
                    size="small"
                    sx={{ textTransform: 'none' }}
                  >
                    View All →
                  </Button>
                </Box>
              </Box>
              <List sx={{ pt: 0 }}>
                {recentGrievances.map((grievance, index) => (
                  <Box key={grievance.id}>
                    <ListItem sx={{ px: 3, py: 2 }}>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                            {grievance.type}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {grievance.status} • {new Date(grievance.submission_date).toLocaleDateString()}
                            </Typography>
                            {grievance.priority && (
                              <Chip 
                                label={grievance.priority} 
                                size="small" 
                                color={grievance.priority === 'Critical' ? 'error' : grievance.priority === 'High' ? 'warning' : 'default'}
                                sx={{ mt: 1, fontSize: '0.75rem' }}
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentGrievances.length - 1 && <Divider sx={{ mx: 3 }} />}
                  </Box>
                ))}
                {recentGrievances.length === 0 && (
                  <ListItem sx={{ px: 3, py: 4, textAlign: 'center' }}>
                    <ListItemText 
                      primary={
                        <Typography color="text.secondary">
                          No recent grievances
                        </Typography>
                      } 
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Deadlines */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, pb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  ⏰ Upcoming Deadlines
                </Typography>
              </Box>
              <List sx={{ pt: 0 }}>
                {upcomingDeadlines.map((deadline, index) => {
                  const daysLeft = Math.ceil((new Date(deadline.deadline_date) - new Date()) / (1000 * 60 * 60 * 24));
                  const isOverdue = daysLeft < 0;
                  const isUrgent = daysLeft <= 2 && daysLeft >= 0;
                  
                  return (
                    <Box key={deadline.id}>
                      <ListItem sx={{ px: 3, py: 2 }}>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                              Grievance #{deadline.grievance_id}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Due: {new Date(deadline.deadline_date).toLocaleDateString()}
                              </Typography>
                              <Chip 
                                label={
                                  isOverdue 
                                    ? 'OVERDUE' 
                                    : isUrgent 
                                      ? `${daysLeft} day${daysLeft > 1 ? 's' : ''} left` 
                                      : `${daysLeft} days left`
                                }
                                size="small"
                                color={isOverdue ? 'error' : isUrgent ? 'warning' : 'success'}
                                sx={{ mt: 1, fontSize: '0.75rem' }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < upcomingDeadlines.length - 1 && <Divider sx={{ mx: 3 }} />}
                    </Box>
                  );
                })}
                {upcomingDeadlines.length === 0 && (
                  <ListItem sx={{ px: 3, py: 4, textAlign: 'center' }}>
                    <ListItemText 
                      primary={
                        <Typography color="text.secondary">
                          No upcoming deadlines
                        </Typography>
                      } 
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Notifications */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, pb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    🔔 Recent Notifications
                  </Typography>
                  <Button 
                    component={RouterLink} 
                    to="/notifications"
                    size="small"
                    sx={{ textTransform: 'none' }}
                  >
                    View All →
                  </Button>
                </Box>
              </Box>
              <List sx={{ pt: 0 }}>
                {recentNotifications.map((notification, index) => (
                  <Box key={notification.id}>
                    <ListItem sx={{ px: 3, py: 2 }}>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                            {notification.message}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {new Date(notification.date_sent).toLocaleDateString()}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < recentNotifications.length - 1 && <Divider sx={{ mx: 3 }} />}
                  </Box>
                ))}
                {recentNotifications.length === 0 && (
                  <ListItem sx={{ px: 3, py: 4, textAlign: 'center' }}>
                    <ListItemText 
                      primary={
                        <Typography color="text.secondary">
                          No recent notifications
                        </Typography>
                      } 
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
