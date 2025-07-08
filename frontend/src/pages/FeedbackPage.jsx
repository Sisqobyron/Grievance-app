import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import FeedbackSystem from '../components/FeedbackSystem';
import { Box, Typography, Paper } from '@mui/material';

const FeedbackPage = () => {
  const { user } = useAuth();

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Feedback Management
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          View and manage feedback for grievances in your department.
        </Typography>
        
        <FeedbackSystem 
          userRole={user?.role}
          // grievanceId will be selected within the component
        />
      </Paper>
    </Box>
  );
};

export default FeedbackPage;
