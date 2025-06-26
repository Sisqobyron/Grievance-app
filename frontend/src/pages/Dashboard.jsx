import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
  LinearProgress
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
  const { user } = useAuth();  const [stats, setStats] = useState({
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
      const grievancesUrl = user.role === 'student'
        ? `/api/grievances/student/${user.id}`
        : '/api/grievances';
      const grievancesResponse = await api.get(grievancesUrl);
      const grievances = grievancesResponse.data;

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
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user.name}!
        </Typography>

        {/* 3D Visualization Toggle */}
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mb: 3 }}
          onClick={() => setShowViz(!showViz)}
        >
          {showViz ? 'Hide' : 'Show'} 3D Statistics
        </Button>

        {/* 3D Visualization */}
        {showViz && (
          <Paper sx={{ p: 2, mb: 4, height: '500px', bgcolor: '#1a1a1a' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
              Grievance Statistics Visualization
            </Typography>
            <GrievanceViz />
          </Paper>
        )}        {/* Enhanced Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Grievances
                </Typography>
                <Typography variant="h3">
                  {stats.totalGrievances}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Resolved
                </Typography>
                <Typography variant="h3" color="success.main">
                  {stats.resolvedGrievances}
                </Typography>
                {stats.totalGrievances > 0 && (
                  <LinearProgress 
                    variant="determinate" 
                    value={(stats.resolvedGrievances / stats.totalGrievances) * 100}
                    color="success"
                    sx={{ mt: 1 }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending
                </Typography>
                <Typography variant="h3" color="warning.main">
                  {stats.pendingGrievances}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: stats.overdueGrievances > 0 ? 'error.light' : 'background.paper' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <WarningIcon sx={{ mr: 1, fontSize: 20 }} />
                  Overdue
                </Typography>
                <Typography variant="h3" color={stats.overdueGrievances > 0 ? 'error.main' : 'text.primary'}>
                  {stats.overdueGrievances}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Critical Alerts */}
        {stats.criticalGrievances > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6">
              {stats.criticalGrievances} Critical Grievance{stats.criticalGrievances > 1 ? 's' : ''} Require Immediate Attention
            </Typography>
          </Alert>
        )}

        {/* Quick Actions */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              fullWidth
              startIcon={<TimeIcon />}
              onClick={() => setShowDeadlines(!showDeadlines)}
            >
              {showDeadlines ? 'Hide' : 'Show'} Deadlines
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              fullWidth
              startIcon={<TrendingIcon />}
              onClick={() => setShowViz(!showViz)}
            >
              {showViz ? 'Hide' : 'Show'} Analytics
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="contained" 
              fullWidth
              component={RouterLink}
              to="/submit-grievance"
              startIcon={<AssignmentIcon />}
            >
              Submit New
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="contained" 
              fullWidth
              component={RouterLink}
              to="/grievances"
              color="secondary"
            >
              View All
            </Button>
          </Grid>
        </Grid>

        {/* Deadline Tracking Component */}
        {showDeadlines && (
          <Box sx={{ mb: 4 }}>
            <DeadlineTracking />
          </Box>
        )}        {/* Recent Activities */}
        <Grid container spacing={3}>
          {/* Recent Grievances */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Recent Grievances</Typography>
                <Button component={RouterLink} to="/grievances">
                  View All
                </Button>
              </Box>
              <List>
                {recentGrievances.map((grievance, index) => (
                  <div key={grievance.id}>
                    <ListItem>
                      <ListItemText
                        primary={grievance.type}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              Status: {grievance.status} | {new Date(grievance.submission_date).toLocaleDateString()}
                            </Typography>
                            {grievance.priority && (
                              <Chip 
                                label={grievance.priority} 
                                size="small" 
                                color={grievance.priority === 'Critical' ? 'error' : grievance.priority === 'High' ? 'warning' : 'default'}
                                sx={{ mt: 0.5 }}
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentGrievances.length - 1 && <Divider />}
                  </div>
                ))}
                {recentGrievances.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No recent grievances" />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>

          {/* Upcoming Deadlines */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  <TimeIcon sx={{ mr: 1 }} />
                  Upcoming Deadlines
                </Typography>
              </Box>
              <List>
                {upcomingDeadlines.map((deadline, index) => {
                  const daysLeft = Math.ceil((new Date(deadline.deadline_date) - new Date()) / (1000 * 60 * 60 * 24));
                  const isOverdue = daysLeft < 0;
                  const isUrgent = daysLeft <= 2 && daysLeft >= 0;
                  
                  return (
                    <div key={deadline.id}>
                      <ListItem>
                        <ListItemText
                          primary={`Grievance #${deadline.grievance_id}`}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                Due: {new Date(deadline.deadline_date).toLocaleDateString()}
                              </Typography>
                              <Chip 
                                label={isOverdue ? 'OVERDUE' : isUrgent ? `${daysLeft} day${daysLeft > 1 ? 's' : ''} left` : `${daysLeft} days left`}
                                size="small"
                                color={isOverdue ? 'error' : isUrgent ? 'warning' : 'success'}
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < upcomingDeadlines.length - 1 && <Divider />}
                    </div>
                  );
                })}
                {upcomingDeadlines.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No upcoming deadlines" />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>          {/* Recent Notifications */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Recent Notifications</Typography>
                <Button component={RouterLink} to="/notifications">
                  View All
                </Button>
              </Box>
              <List>
                {recentNotifications.map((notification, index) => (
                  <div key={notification.id}>
                    <ListItem>
                      <ListItemText
                        primary={notification.message}
                        secondary={new Date(notification.date_sent).toLocaleDateString()}
                      />
                    </ListItem>
                    {index < recentNotifications.length - 1 && <Divider />}
                  </div>
                ))}
                {recentNotifications.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No recent notifications" />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
