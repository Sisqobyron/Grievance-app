import React, { useState, useEffect } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';

const FeedbackSystem = ({ grievanceId, userRole, onFeedbackSubmitted }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [feedback, setFeedback] = useState([]);
  const [newFeedback, setNewFeedback] = useState({
    rating: 0,
    comment: '',
    category: 'general'
  });
  const [feedbackStats, setFeedbackStats] = useState({
    averageRating: 0,
    totalFeedback: 0,
    ratingDistribution: {}
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

  useEffect(() => {
    if (grievanceId) {
      fetchFeedback();
      fetchFeedbackStats();
    }
  }, [grievanceId]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/feedback/grievance/${grievanceId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFeedback(data);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      showAlert('Error loading feedback', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbackStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/feedback/stats/${grievanceId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFeedbackStats(data);
      }
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
    }
  };

  const handleSubmitFeedback = async () => {
    if (newFeedback.rating === 0) {
      showAlert('Please provide a rating', 'warning');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          grievanceId,
          ...newFeedback
        })
      });

      if (response.ok) {
        showAlert('Feedback submitted successfully!', 'success');
        setNewFeedback({ rating: 0, comment: '', category: 'general' });
        setShowSubmissionForm(false);
        fetchFeedback();
        fetchFeedbackStats();
        if (onFeedbackSubmitted) onFeedbackSubmitted();
      } else {
        showAlert('Error submitting feedback', 'error');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showAlert('Error submitting feedback', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, severity) => {
    setAlert({ message, severity });
    setTimeout(() => setAlert(null), 5000);
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h6" color="textSecondary">
              Average Rating
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
              <Typography variant="h3" sx={{ mr: 1 }}>
                {feedbackStats.averageRating.toFixed(1)}
              </Typography>
              <StarIcon color="warning" sx={{ fontSize: 40 }} />
            </Box>
            <Rating
              value={feedbackStats.averageRating}
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
                      width: `${((feedbackStats.ratingDistribution[rating] || 0) / feedbackStats.totalFeedback) * 100}%`,
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
    </motion.div>
  );

  const FeedbackListTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          <AnimatePresence>
            {feedback.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
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
              </motion.div>
            ))}
          </AnimatePresence>
          
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
    </motion.div>
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
            disabled={loading || newFeedback.rating === 0}
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
