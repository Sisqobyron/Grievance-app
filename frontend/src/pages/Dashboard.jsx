import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
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
  CircularProgress
} from '@mui/material';
import GrievanceViz from '../components/GrievanceViz';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalGrievances: 0,
    resolvedGrievances: 0,
    pendingGrievances: 0
  });
  const [recentGrievances, setRecentGrievances] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showViz, setShowViz] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch grievances
      const grievancesUrl = user.role === 'student'
        ? `http://localhost:5000/api/grievances/student/${user.id}`
        : 'http://localhost:5000/api/grievances';
      const grievancesResponse = await axios.get(grievancesUrl);
      const grievances = grievancesResponse.data;

      // Calculate stats
      const resolved = grievances.filter(g => g.status === 'Resolved').length;
      const total = grievances.length;
      setStats({
        totalGrievances: total,
        resolvedGrievances: resolved,
        pendingGrievances: total - resolved
      });

      // Get recent grievances
      setRecentGrievances(grievances.slice(0, 5));

      // Fetch notifications
      const notificationsResponse = await axios.get(
        `http://localhost:5000/api/notifications/${user.id}`
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
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
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
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Resolved
                </Typography>
                <Typography variant="h3" color="success.main">
                  {stats.resolvedGrievances}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
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
        </Grid>

        {/* Recent Activities */}
        <Grid container spacing={3}>
          {/* Recent Grievances */}
          <Grid item xs={12} md={6}>
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
                        secondary={`Status: ${grievance.status} | ${new Date(
                          grievance.submission_date
                        ).toLocaleDateString()}`}
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

          {/* Recent Notifications */}
          <Grid item xs={12} md={6}>
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
