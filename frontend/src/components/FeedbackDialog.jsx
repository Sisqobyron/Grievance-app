import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Rating,
  TextField,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { Feedback as FeedbackIcon, Send as SendIcon } from '@mui/icons-material';

const FeedbackDialog = ({ open, onClose, grievanceId, onFeedbackSubmitted }) => {
  const [feedback, setFeedback] = useState({
    rating: 0,
    comment: '',
    category: 'resolution'
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleSubmit = async () => {
    if (feedback.rating === 0) {
      setAlert({ message: 'Please provide a rating', severity: 'warning' });
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
          ...feedback
        })
      });

      if (response.ok) {
        setAlert({ message: 'Feedback submitted successfully!', severity: 'success' });
        setTimeout(() => {
          onClose();
          if (onFeedbackSubmitted) onFeedbackSubmitted();
          setFeedback({ rating: 0, comment: '', category: 'resolution' });
          setAlert(null);
        }, 1500);
      } else {
        setAlert({ message: 'Error submitting feedback', severity: 'error' });
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setAlert({ message: 'Error submitting feedback', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <FeedbackIcon sx={{ mr: 1 }} />
          Rate Your Experience
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {alert && (
          <Alert severity={alert.severity} sx={{ mb: 2 }}>
            {alert.message}
          </Alert>
        )}
        
        <Box sx={{ pt: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            How satisfied are you with the resolution of your grievance?
          </Typography>
          
          <Rating
            value={feedback.rating}
            onChange={(e, newValue) => setFeedback({ ...feedback, rating: newValue })}
            size="large"
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comments (Optional)"
            placeholder="Share your thoughts about how your grievance was handled..."
            value={feedback.comment}
            onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || feedback.rating === 0}
          startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
        >
          Submit Feedback
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackDialog;
