import React, { useState, useEffect, useCallback } from 'react';
import api from '../config/axios';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Rating,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tab,
  Tabs,
  Divider,
  Avatar,
  Stack
} from '@mui/material';
import {
  Feedback as FeedbackIcon,
  Star as StarIcon,
  Comment as CommentIcon,
  Send as SendIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';


const FeedbackSystem = ({ grievanceId, userRole, onFeedbackSubmitted }) => {
  const { user } = useAuth(); // Get user from context if not provided
  const effectiveUserRole = userRole || user?.role;
  const effectiveUserId = user?.id;
  
  console.log('FeedbackSystem props:', { 
    grievanceId, 
    userRole: effectiveUserRole,
    userId: effectiveUserId 
  });
  
  const [activeTab, setActiveTab] = useState(0);
  const [feedback, setFeedback] = useState([]);
  const [userGrievances, setUserGrievances] = useState([]);
  const [selectedGrievanceId, setSelectedGrievanceId] = useState(grievanceId || '');
  const [newFeedback, setNewFeedback] = useState({
    rating: 0,
    comment: '',
    category: 'general'
  });
  const [feedbackStats, setFeedbackStats] = useState({
    averageRating: 0,
    totalFeedback: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [alert, setAlert] = useState(null);

  const feedbackCategories = [
    { value: 'general', label: 'General Experience' },
    { value: 'communication', label: 'Communication' },
    { value: 'resolution', label: 'Resolution Quality' },
    { value: 'timeline', label: 'Timeline' },
    { value: 'staff', label: 'Staff Behavior' }
  ];

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const fetchUserGrievances = useCallback(async () => {
    try {
      if (!effectiveUserId) {
        showAlert('Please log in to view your grievances', 'error');
        return;
      }

      let url;
      if (effectiveUserRole === 'student') {
        url = `/api/grievances/student/${effectiveUserId}`;
      } else if (effectiveUserRole === 'staff') {
        url = `/api/grievances/department`;
      } else {
        url = `/api/grievances`;
      }
      
      const response = await api.get(url);
      
      // Handle different response formats
      if (effectiveUserRole === 'staff' && response.data.grievances) {
        setUserGrievances(response.data.grievances);
      } else {
        setUserGrievances(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching user grievances:', error);
      showAlert('Error loading your grievances', 'error');
    }
  }, [effectiveUserId, effectiveUserRole]);

  const fetchFeedback = useCallback(async () => {
    const targetGrievanceId = selectedGrievanceId || grievanceId;
    if (!targetGrievanceId) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/api/feedback/grievance/${targetGrievanceId}`);
      setFeedback(response.data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      showAlert('Error loading feedback', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedGrievanceId, grievanceId]);

  const fetchFeedbackStats = useCallback(async () => {
    const targetGrievanceId = selectedGrievanceId || grievanceId;
    if (!targetGrievanceId) return;
    
    try {
      const response = await api.get(`/api/feedback/stats/${targetGrievanceId}`);
      setFeedbackStats(response.data);
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
    }
  }, [selectedGrievanceId, grievanceId]);

  useEffect(() => {
    if (effectiveUserId) {
      if (grievanceId) {
        setSelectedGrievanceId(grievanceId);
        fetchFeedback();
        fetchFeedbackStats();
      } else {
        // Fetch user's grievances for dropdown selection
        fetchUserGrievances();
      }
    }
  }, [grievanceId, effectiveUserId, fetchFeedback, fetchFeedbackStats, fetchUserGrievances]);

  // Early return if user is not available (after all hooks)
  if (!effectiveUserRole || !effectiveUserId) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          Loading user information...
        </Typography>
      </Box>
    );
  }

  const handleSubmitFeedback = async () => {
    if (newFeedback.rating === 0) {
      showAlert('Please provide a rating', 'warning');
      return;
    }

    const targetGrievanceId = selectedGrievanceId || grievanceId;
    console.log('Current grievanceId:', targetGrievanceId, 'Type:', typeof targetGrievanceId);

    if (!targetGrievanceId || targetGrievanceId === undefined || targetGrievanceId === null || targetGrievanceId === '') {
      showAlert('Please select a grievance to provide feedback for.', 'error');
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        grievanceId: parseInt(targetGrievanceId) || targetGrievanceId,
        rating: newFeedback.rating,
        comment: newFeedback.comment,
        category: newFeedback.category
      };
      
      console.log('Submitting feedback with data:', submitData);

      await api.post('/api/feedback', submitData);

      showAlert('Feedback submitted successfully!', 'success');
      setNewFeedback({ rating: 0, comment: '', category: 'general' });
      setShowSubmissionForm(false);
      fetchFeedback();
      fetchFeedbackStats();
      if (onFeedbackSubmitted) onFeedbackSubmitted();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      if (error.response?.data?.message) {
        showAlert(`Error: ${error.response.data.message}`, 'error');
      } else {
        showAlert('Error submitting feedback', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'warning';
    return 'error';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const FeedbackStatsTab = () => (
    <div>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h6" color="textSecondary">
              Average Rating
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
              <Typography variant="h3" sx={{ mr: 1 }}>
                {(feedbackStats.averageRating || 0).toFixed(1)}
              </Typography>
              <StarIcon color="warning" sx={{ fontSize: 40 }} />
            </Box>
            <Rating
              value={feedbackStats.averageRating || 0}
              readOnly
              precision={0.1}
              sx={{ mt: 1 }}
            />
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h6" color="textSecondary">
              Total Feedback
            </Typography>
            <Typography variant="h3" sx={{ mt: 1, color: 'primary.main' }}>
              {feedbackStats.totalFeedback}
            </Typography>
            <CommentIcon color="primary" sx={{ fontSize: 40, mt: 1 }} />
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
              Rating Distribution
            </Typography>
            {[5, 4, 3, 2, 1].map((rating) => (
              <Box key={rating} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ mr: 1, width: 20 }}>
                  {rating}
                </Typography>
                <StarIcon sx={{ fontSize: 16, mr: 1, color: 'warning.main' }} />
                <Box
                  sx={{
                    flexGrow: 1,
                    height: 8,
                    backgroundColor: 'grey.200',
                    borderRadius: 4,
                    mr: 1
                  }}
                >
                  <Box
                    sx={{
                      width: `${feedbackStats.totalFeedback > 0 ? ((feedbackStats.ratingDistribution[rating] || 0) / feedbackStats.totalFeedback) * 100 : 0}%`,
                      height: '100%',
                      backgroundColor: 'warning.main',
                      borderRadius: 4
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ width: 30 }}>
                  {feedbackStats.ratingDistribution[rating] || 0}
                </Typography>
              </Box>
            ))}
          </Card>
        </Grid>
      </Grid>
    </div>
  );

  const FeedbackListTab = () => (
    <div>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {feedback.map((item) => (
            <div key={item.id}>
              <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <FeedbackIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {item.user_name || 'Anonymous'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatDate(item.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Rating value={item.rating} readOnly size="small" />
                        <Chip 
                          label={feedbackCategories.find(c => c.value === item.category)?.label || item.category}
                          size="small"
                          color={getRatingColor(item.rating)}
                          variant="outlined"
                        />
                      </Stack>
                    </Box>
                    
                    {item.comment && (
                      <Typography variant="body2" sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        "{item.comment}"
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          
          {feedback.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <FeedbackIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                No feedback yet
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Be the first to share your experience!
              </Typography>
            </Box>
          )}
        </List>
      )}
    </div>
  );

  return (
    <Box>
      {alert && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
              <FeedbackIcon sx={{ mr: 1 }} />
              Feedback System
            </Typography>
            
            {userRole !== 'admin' && (
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={() => setShowSubmissionForm(true)}
                sx={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #0097A7 90%)',
                  }
                }}
              >
                Submit Feedback
              </Button>
            )}
          </Box>

          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab 
              icon={<AnalyticsIcon />} 
              label="Statistics" 
              iconPosition="start"
            />
            <Tab 
              icon={<CommentIcon />} 
              label="All Feedback" 
              iconPosition="start"
            />
          </Tabs>

          <Divider sx={{ mb: 3 }} />

          {activeTab === 0 ? <FeedbackStatsTab /> : <FeedbackListTab />}
        </CardContent>
      </Card>

      {/* Feedback Submission Dialog */}
      <Dialog 
        open={showSubmissionForm} 
        onClose={() => setShowSubmissionForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <FeedbackIcon sx={{ mr: 1 }} />
            Submit Your Feedback
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {!grievanceId && (
              <>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Select a grievance to provide feedback for:
                </Typography>
                <TextField
                  select
                  fullWidth
                  label="Select Grievance"
                  value={selectedGrievanceId}
                  onChange={(e) => {
                    setSelectedGrievanceId(e.target.value);
                    // Fetch feedback for the selected grievance
                    if (e.target.value) {
                      fetchFeedback();
                      fetchFeedbackStats();
                    }
                  }}
                  SelectProps={{ native: true }}
                  sx={{ mb: 3 }}
                >
                  <option value="">-- Select a Grievance --</option>
                  {userGrievances.map((grievance) => (
                    <option key={grievance.id} value={grievance.id}>
                      #{grievance.id} - {grievance.type} ({grievance.status})
                    </option>
                  ))}
                </TextField>
              </>
            )}
            
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              How would you rate your experience?
            </Typography>
            <Rating
              value={newFeedback.rating}
              onChange={(e, newValue) => setNewFeedback({ ...newFeedback, rating: newValue })}
              size="large"
              sx={{ mb: 3 }}
            />

            <TextField
              select
              fullWidth
              label="Feedback Category"
              value={newFeedback.category}
              onChange={(e) => setNewFeedback({ ...newFeedback, category: e.target.value })}
              SelectProps={{ native: true }}
              sx={{ mb: 3 }}
            >
              {feedbackCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </TextField>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Comments (Optional)"
              placeholder="Share your thoughts about the grievance handling process..."
              value={newFeedback.comment}
              onChange={(e) => setNewFeedback({ ...newFeedback, comment: e.target.value })}
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowSubmissionForm(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitFeedback}
            disabled={loading || newFeedback.rating === 0 || (!grievanceId && !selectedGrievanceId)}
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          >
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbackSystem;
