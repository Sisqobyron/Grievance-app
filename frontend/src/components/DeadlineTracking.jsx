import React, { useState, useEffect, useCallback } from 'react';
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
  Paper,  Alert,
  Skeleton,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import {
  Schedule,
  Warning,
  CheckCircle,
  Error,
  Edit
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';

// Create motion variant of TableRow
const MotionTableRow = motion(TableRow);

const DeadlineTracking = ({ grievanceId = null }) => {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState(null);
  const [extensionData, setExtensionData] = useState({
    newDate: '',
    reason: ''
  });  const fetchDeadlines = useCallback(async () => {
    try {
      const url = grievanceId 
        ? `http://localhost:5000/api/deadlines/grievance/${grievanceId}`
        : 'http://localhost:5000/api/deadlines';
      
      const response = await axios.get(url);
      setDeadlines(response.data);
    } catch (error) {
      console.error('Error fetching deadlines:', error);
      toast.error('Failed to fetch deadlines');
    } finally {
      setLoading(false);
    }
  }, [grievanceId]);

  useEffect(() => {
    fetchDeadlines();
  }, [fetchDeadlines]);

  const getDeadlineStatus = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline.deadline_date);
    const timeDiff = deadlineDate - now;
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (deadline.is_completed) {
      return { status: 'completed', color: 'success', label: 'Completed' };
    } else if (timeDiff < 0) {
      return { status: 'overdue', color: 'error', label: 'Overdue' };
    } else if (hoursDiff <= 24) {
      return { status: 'critical', color: 'error', label: 'Critical' };
    } else if (hoursDiff <= 72) {
      return { status: 'warning', color: 'warning', label: 'Due Soon' };
    } else {
      return { status: 'normal', color: 'info', label: 'On Track' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status.status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'overdue':
        return <Error color="error" />;
      case 'critical':
        return <Warning color="error" />;
      case 'warning':
        return <Warning color="warning" />;
      default:
        return <Schedule color="info" />;
    }
  };

  const formatTimeRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline.deadline_date);
    const timeDiff = deadlineDate - now;
    
    if (deadline.is_completed) {
      return 'Completed';
    }
    
    if (timeDiff < 0) {
      const overdue = Math.abs(timeDiff);
      const days = Math.floor(overdue / (1000 * 60 * 60 * 24));
      const hours = Math.floor((overdue % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return `Overdue by ${days}d ${hours}h`;
    }
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else {
      return `${hours}h remaining`;
    }
  };

  const handleExtendDeadline = async () => {
    try {
      await axios.put(`http://localhost:5000/api/deadlines/${selectedDeadline.id}/extend`, {
        newDate: extensionData.newDate,
        reason: extensionData.reason
      });
      
      toast.success('Deadline extended successfully');
      setDialogOpen(false);
      setSelectedDeadline(null);
      setExtensionData({ newDate: '', reason: '' });
      fetchDeadlines();
    } catch (error) {
      console.error('Error extending deadline:', error);
      toast.error('Failed to extend deadline');
    }
  };

  const markAsCompleted = async (deadlineId) => {
    try {
      await axios.put(`http://localhost:5000/api/deadlines/${deadlineId}/complete`);
      toast.success('Deadline marked as completed');
      fetchDeadlines();
    } catch (error) {
      console.error('Error marking deadline as completed:', error);
      toast.error('Failed to mark deadline as completed');
    }
  };

  const openExtensionDialog = (deadline) => {
    setSelectedDeadline(deadline);
    setExtensionData({
      newDate: '',
      reason: ''
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <Box>
        <Grid container spacing={2}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} key={item}>
              <Card>
                <CardContent>
                  <Skeleton width="100%" height={60} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const overdueDeadlines = deadlines.filter(d => getDeadlineStatus(d).status === 'overdue').length;
  const criticalDeadlines = deadlines.filter(d => getDeadlineStatus(d).status === 'critical').length;
  const completedDeadlines = deadlines.filter(d => d.is_completed).length;

  return (
    <Box>
      {/* Summary Cards */}
      {!grievanceId && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Error color="error" />
                  <Box>
                    <Typography variant="h6" color="error">
                      {overdueDeadlines}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Overdue
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Warning color="warning" />
                  <Box>
                    <Typography variant="h6" color="warning.main">
                      {criticalDeadlines}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Critical
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircle color="success" />
                  <Box>
                    <Typography variant="h6" color="success.main">
                      {completedDeadlines}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Completed
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Schedule color="info" />
                  <Box>
                    <Typography variant="h6" color="info.main">
                      {deadlines.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Deadlines Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {grievanceId ? `Deadlines for Grievance #${grievanceId}` : 'All Deadlines'}
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>Grievance ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell>Time Remaining</TableCell>
                <TableCell>Coordinator</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>            <TableBody>              {deadlines.map((deadline) => {
                const status = getDeadlineStatus(deadline);
                return (
                  <MotionTableRow
                    key={deadline.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    sx={{
                      backgroundColor: status.status === 'overdue' ? 'error.light' + '10' : 
                                     status.status === 'critical' ? 'warning.light' + '10' : 'transparent'
                    }}
                  >
                    <TableCell>
                      <Tooltip title={status.label}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(status)}
                          <Chip
                            label={status.label}
                            color={status.color}
                            size="small"
                          />
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell>#{deadline.grievance_id}</TableCell>
                    <TableCell>{deadline.deadline_type}</TableCell>
                    <TableCell>{deadline.description}</TableCell>
                    <TableCell>
                      {new Date(deadline.deadline_date).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={status.status === 'overdue' ? 'error' : 
                               status.status === 'critical' ? 'warning.main' : 'textPrimary'}
                      >
                        {formatTimeRemaining(deadline)}
                      </Typography>
                    </TableCell>
                    <TableCell>{deadline.coordinator_name || 'Unassigned'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {!deadline.is_completed && (
                          <>
                            <Tooltip title="Extend Deadline">
                              <IconButton
                                size="small"
                                onClick={() => openExtensionDialog(deadline)}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Mark Complete">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => markAsCompleted(deadline.id)}
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                          </>                        )}                    </Box>
                    </TableCell>
                  </MotionTableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {deadlines.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No deadlines found.
          </Alert>
        )}
      </Paper>

      {/* Extension Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Extend Deadline</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Deadline Date"
                type="datetime-local"
                value={extensionData.newDate}
                onChange={(e) => setExtensionData({ ...extensionData, newDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason for Extension"
                multiline
                rows={3}
                value={extensionData.reason}
                onChange={(e) => setExtensionData({ ...extensionData, reason: e.target.value })}
                placeholder="Please provide a reason for the deadline extension..."
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleExtendDeadline}
            disabled={!extensionData.newDate || !extensionData.reason}
          >
            Extend Deadline
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeadlineTracking;
