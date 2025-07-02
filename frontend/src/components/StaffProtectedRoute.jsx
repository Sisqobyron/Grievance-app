import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StaffCodeVerification from './StaffCodeVerification';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';

const StaffProtectedRoute = ({ children }) => {
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const authContext = useAuth();
  const user = authContext?.user;

  useEffect(() => {
    if (user) {
      if (user.role === 'staff' && !user.staffVerified) {
        setShowVerification(true);
      }
      setLoading(false);
    } else if (authContext) {
      setLoading(false);
    }
  }, [user, authContext]);

  const handleVerificationSuccess = () => {
    setShowVerification(false);
  };

  const handleVerificationClose = () => {
    setShowVerification(false);
  };

  if (!authContext) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // If staff user is not verified, show verification dialog over content
  if (user && user.role === 'staff' && !user.staffVerified) {
    return (
      <>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '50vh',
          textAlign: 'center',
          p: 3
        }}>
          <LockIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Staff Verification Required
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Please verify your staff access code to continue.
          </Typography>
        </Box>
        <StaffCodeVerification 
          open={showVerification}
          onClose={handleVerificationClose}
          onSuccess={handleVerificationSuccess}
        />
      </>
    );
  }

  return children;
};

export default StaffProtectedRoute;
