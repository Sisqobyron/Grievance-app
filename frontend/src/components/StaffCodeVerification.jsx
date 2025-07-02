import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { Lock as LockIcon, Security as SecurityIcon } from '@mui/icons-material';

const StaffCodeVerification = ({ open, onClose, onSuccess }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Please enter the staff access code');
      return;
    }

    if (code !== '2030') {
      setError('Invalid staff access code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Mark staff as verified in localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      userData.staffVerified = true;
      localStorage.setItem('user', JSON.stringify(userData));
      
      setCode('');
      onSuccess();
      onClose();
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setCode('');
      setError('');
      onClose();
    }
  };

  const handleLogout = () => {
    // Clear user data and redirect to login
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
          <SecurityIcon sx={{ mr: 1, color: 'warning.main' }} />
          <Typography variant="h6">
            Staff Access Verification
          </Typography>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LockIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
            <Typography variant="body1" color="textSecondary">
              As a staff member, you need to enter the staff access code to proceed to the dashboard.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            type="password"
            label="Staff Access Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter your staff access code"
            autoFocus
            disabled={loading}
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 10 }}
          />

          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'center' }}>
            Contact your administrator if you don't have the access code.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
          <Button 
            onClick={handleLogout}
            color="error"
            disabled={loading}
          >
            Logout
          </Button>
          <Box>
            <Button 
              onClick={handleClose}
              disabled={loading}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !code.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <LockIcon />}
            >
              Verify Code
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default StaffCodeVerification;
