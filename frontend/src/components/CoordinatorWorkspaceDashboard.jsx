import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  LinearProgress,
  Alert,
  Skeleton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Badge,
  Avatar
} from '@mui/material';
import {
  Assignment,
  Schedule,
  Warning,
  CheckCircle,
  Message,
  Visibility,
  TrendingUp,
  AccessTime,
  Person,
  PriorityHigh,
  Update,
  Send,
  Timeline as TimelineIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h3" sx={{ color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'}>
                {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}% from last week
              </Typography>
            )}
          </Box>
          <Box sx={{
            p: 1.5,
            borderRadius: '12px',
            bgcolor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

const getStatusColor = (status) => {
  switch (status) {
    case 'Submitted':
      return 'info';
    case 'In Progress':
      return 'warning';
    case 'Resolved':
      return 'success';
    case 'Rejected':
      return 'error';
    default:
      return 'default';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Urgent':
      return 'error';
    case 'High':
      return 'warning';
    case 'Medium':
      return 'info';
    case 'Low':
      return 'success';
    default:
      return 'default';
  }
};

const CoordinatorWorkspaceDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [assignedGrievances, setAssignedGrievances] = useState([]);
  const [coordinatorStats, setCoordinatorStats] = useState({
    totalAssigned: 0,
    inProgress: 0,
    resolved: 0,
    overdue: 0,
    avgResolutionTime: 0,
    workloadCapacity: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [statusUpdateDialog, setStatusUpdateDialog] = useState(false);
  const [messageDialog, setMessageDialog] = useState(false);  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const fetchCoordinatorData = useCallback(async () => {
    try {
      // Get coordinator info and stats
      const response = await axios.get(`http://localhost:5000/api/coordinators/profile/${user.id}`);
      const coordinatorData = response.data;
      
      setCoordinatorStats({
        totalAssigned: coordinatorData.total_assigned || 0,
        inProgress: coordinatorData.in_progress || 0,
        resolved: coordinatorData.resolved || 0,
        overdue: coordinatorData.overdue || 0,
        avgResolutionTime: coordinatorData.avg_resolution_time || 0,
        workloadCapacity: Math.round((coordinatorData.total_assigned / coordinatorData.max_workload) * 100)
      });
    } catch (error) {
      console.error('Error fetching coordinator data:', error);
    }
  }, [user.id]);

  const fetchAssignedGrievances = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/coordinators/${user.id}/grievances`);
      setAssignedGrievances(response.data);
    } catch (error) {
      console.error('Error fetching assigned grievances:', error);
      toast.error('Failed to fetch assigned grievances');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  const fetchRecentActivity = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/coordinators/${user.id}/activity`);
      setRecentActivity(response.data);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  }, [user.id]);

  const fetchUpcomingDeadlines = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/coordinators/${user.id}/deadlines`);
      setUpcomingDeadlines(response.data);
    } catch (error) {
      console.error('Error fetching deadlines:', error);
    }
  }, [user.id]);

  const handleStatusUpdate = async () => {
    try {
      await axios.put(`http://localhost:5000/api/grievances/${selectedGrievance.id}/status`, {
        status: newStatus,
        comment: statusComment,
        updated_by: user.id
      });
      
      toast.success('Status updated successfully');
      setStatusUpdateDialog(false);
      setNewStatus('');
      setStatusComment('');
      fetchAssignedGrievances();
      fetchCoordinatorData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleSendMessage = async () => {
    try {
      await axios.post(`http://localhost:5000/api/messages`, {
        grievance_id: selectedGrievance.id,
        sender_id: user.id,
        receiver_id: selectedGrievance.student_id,
        content: newMessage
      });
      
      toast.success('Message sent successfully');
      setMessageDialog(false);
      setNewMessage('');
      fetchRecentActivity();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const openStatusDialog = (grievance) => {
    setSelectedGrievance(grievance);
    setNewStatus(grievance.status);
    setStatusUpdateDialog(true);
  };

  const openMessageDialog = (grievance) => {
    setSelectedGrievance(grievance);
    setMessageDialog(true);
  };

  // useEffect to fetch data when component mounts
  useEffect(() => {
    fetchCoordinatorData();
    fetchAssignedGrievances();
    fetchRecentActivity();
    fetchUpcomingDeadlines();
  }, [fetchCoordinatorData, fetchAssignedGrievances, fetchRecentActivity, fetchUpcomingDeadlines]);

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  if (loading) {
    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Card>
                <CardContent>
                  <Skeleton width="60%" height={24} />
                  <Skeleton width="40%" height={48} sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          <DashboardIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Coordinator Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Welcome back, {user.name}! Here's your current workload and activities.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Assigned Cases"
            value={coordinatorStats.totalAssigned}
            icon={<Assignment sx={{ fontSize: 40, color: '#2563eb' }} />}
            color="#2563eb"
            subtitle={`${coordinatorStats.workloadCapacity}% capacity`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Progress"
            value={coordinatorStats.inProgress}
            icon={<Schedule sx={{ fontSize: 40, color: '#f59e0b' }} />}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Resolved This Week"
            value={coordinatorStats.resolved}
            icon={<CheckCircle sx={{ fontSize: 40, color: '#10b981' }} />}
            color="#10b981"
            trend={5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Overdue Cases"
            value={coordinatorStats.overdue}
            icon={<Warning sx={{ fontSize: 40, color: '#ef4444' }} />}
            color="#ef4444"
            subtitle={coordinatorStats.overdue > 0 ? 'Needs attention' : 'All on track'}
          />
        </Grid>
      </Grid>

      {/* Workload Capacity Warning */}
      {coordinatorStats.workloadCapacity > 80 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6">
            High Workload Alert: You're at {coordinatorStats.workloadCapacity}% capacity
          </Typography>
          <Typography variant="body2">
            Consider requesting case redistribution or escalating urgent matters.
          </Typography>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="My Cases" icon={<Assignment />} />
          <Tab label="Recent Activity" icon={<TimelineIcon />} />
          <Tab label="Deadlines" icon={<AccessTime />} />
        </Tabs>

        {/* My Cases Tab */}
        <TabPanel value={activeTab} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Days Open</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignedGrievances.map((grievance) => {
                  const daysOpen = Math.ceil((new Date() - new Date(grievance.submission_date)) / (1000 * 60 * 60 * 24));
                  const isOverdue = daysOpen > 7 && grievance.status !== 'Resolved';
                  
                  return (
                    <TableRow 
                      key={grievance.id} 
                      sx={{ bgcolor: isOverdue ? 'error.light' : 'inherit' }}
                    >
                      <TableCell>#{grievance.id}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                            {grievance.student_name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">{grievance.student_name}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {grievance.student_email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{grievance.type}</TableCell>
                      <TableCell>
                        <Chip
                          label={grievance.priority_level}
                          color={getPriorityColor(grievance.priority_level)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={grievance.status}
                          color={getStatusColor(grievance.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(grievance.submission_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          color={isOverdue ? 'error.main' : 'textPrimary'}
                        >
                          {daysOpen} days
                          {isOverdue && ' (Overdue)'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            startIcon={<Update />}
                            onClick={() => openStatusDialog(grievance)}
                            variant="outlined"
                          >
                            Update
                          </Button>
                          <Button
                            size="small"
                            startIcon={<Message />}
                            onClick={() => openMessageDialog(grievance)}
                            variant="outlined"
                            color="primary"
                          >
                            Message
                          </Button>
                          <IconButton
                            size="small"
                            onClick={() => {
                              // Open detailed view
                              setSelectedGrievance(grievance);
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          {assignedGrievances.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No cases currently assigned to you.
            </Alert>
          )}
        </TabPanel>

        {/* Recent Activity Tab */}
        <TabPanel value={activeTab} index={1}>
          <List>
            {recentActivity.map((activity, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemIcon>
                    <TimelineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.action_description}
                    secondary={`Grievance #${activity.grievance_id} • ${new Date(activity.performed_at).toLocaleString()}`}
                  />
                </ListItem>
                {index < recentActivity.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
          
          {recentActivity.length === 0 && (
            <Alert severity="info">
              No recent activity to display.
            </Alert>
          )}
        </TabPanel>

        {/* Deadlines Tab */}
        <TabPanel value={activeTab} index={2}>
          <List>
            {upcomingDeadlines.map((deadline, index) => {
              const daysUntilDeadline = Math.ceil((new Date(deadline.deadline_date) - new Date()) / (1000 * 60 * 60 * 24));
              const isUrgent = daysUntilDeadline <= 2;
              const isOverdue = daysUntilDeadline < 0;
              
              return (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <AccessTime color={isOverdue ? 'error' : isUrgent ? 'warning' : 'primary'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Grievance #${deadline.grievance_id} - ${deadline.deadline_type}`}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            Due: {new Date(deadline.deadline_date).toLocaleDateString()}
                          </Typography>
                          <Chip
                            label={
                              isOverdue 
                                ? `${Math.abs(daysUntilDeadline)} days overdue` 
                                : `${daysUntilDeadline} days remaining`
                            }
                            size="small"
                            color={isOverdue ? 'error' : isUrgent ? 'warning' : 'success'}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < upcomingDeadlines.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
          
          {upcomingDeadlines.length === 0 && (
            <Alert severity="success">
              All deadlines are up to date!
            </Alert>
          )}
        </TabPanel>
      </Paper>

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateDialog} onClose={() => setStatusUpdateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Grievance Status</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="New Status"
            >
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Under Review">Under Review</MenuItem>
              <MenuItem value="Resolved">Resolved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
              <MenuItem value="Escalated">Escalated</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Status Update Comment"
            value={statusComment}
            onChange={(e) => setStatusComment(e.target.value)}
            placeholder="Add a comment about this status change..."
            helperText="This comment will be visible to the student and added to the grievance timeline."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusUpdateDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleStatusUpdate}
            disabled={!newStatus}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={messageDialog} onClose={() => setMessageDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Message to Student</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message to the student..."
            helperText="This message will be sent to the student and they will receive an email notification."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            startIcon={<Send />}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CoordinatorWorkspaceDashboard;
