import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Chip,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Email as EmailIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Send as SendIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../config/axios';

export default function ForwardGrievanceModal({ open, onClose, grievance, onSuccess }) {
  const [formData, setFormData] = useState({
    recipientEmail: '',
    recipientName: '',
    subject: '',
    customMessage: '',
    priority: 'normal'
  });
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (open && grievance) {
      // Auto-generate subject line
      const subject = `Grievance #${grievance.id} - ${grievance.type} - Action Required`;
      setFormData(prev => ({
        ...prev,
        subject: subject
      }));
    }
  }, [open, grievance]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.recipientEmail.trim()) {
      newErrors.recipientEmail = 'Recipient email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recipientEmail)) {
      newErrors.recipientEmail = 'Please enter a valid email address';
    }

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = 'Recipient name is required';
    }

    if (!formData.customMessage.trim()) {
      newErrors.customMessage = 'Please add a message explaining the situation';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before sending');
      return;
    }

    setSending(true);
    try {
      const payload = {
        grievanceId: grievance.id,
        recipientEmail: formData.recipientEmail.trim(),
        recipientName: formData.recipientName.trim(),
        subject: formData.subject.trim(),
        customMessage: formData.customMessage.trim(),
        priority: formData.priority
      };

      await api.post('/api/grievances/forward', payload);
      
      toast.success(`Grievance successfully forwarded to ${formData.recipientName}`);
      onSuccess && onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error forwarding grievance:', error);
      toast.error(error.response?.data?.message || 'Failed to forward grievance');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setFormData({
      recipientEmail: '',
      recipientName: '',
      subject: '',
      customMessage: '',
      priority: 'normal'
    });
    setErrors({});
    setSending(false);
    onClose();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': case 'Urgent': return 'error';
      case 'Medium': return 'warning';
      default: return 'success';
    }
  };

  if (!grievance) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'white', // Fixed solid white background
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box 
            sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              color: 'primary.main'
            }}
          >
            <EmailIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Forward Grievance to Lecturer/Department
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Send grievance details for resolution and follow-up
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        {/* Grievance Summary */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: 'rgba(33, 150, 243, 0.08)', border: '1px solid rgba(33, 150, 243, 0.12)' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentIcon fontSize="small" />
            Grievance Summary
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">ID</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>#{grievance.id}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Type</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{grievance.type}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Status</Typography>
              <Chip 
                label={grievance.status} 
                size="small" 
                color={grievance.status === 'Resolved' ? 'success' : 'warning'}
              />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Priority</Typography>
              <Chip 
                label={grievance.priority_level} 
                size="small" 
                color={getPriorityColor(grievance.priority_level)}
              />
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Description</Typography>
          <Typography variant="body2" sx={{ 
            p: 2, 
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
            borderRadius: 1,
            maxHeight: '100px',
            overflow: 'auto',
            border: '1px solid rgba(0, 0, 0, 0.06)'
          }}>
            {grievance.description}
          </Typography>
        </Paper>

        {/* Forward Form */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              fullWidth
              label="Recipient Email"
              type="email"
              value={formData.recipientEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, recipientEmail: e.target.value }))}
              error={!!errors.recipientEmail}
              helperText={errors.recipientEmail || "Email of the lecturer or department head"}
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            
            <TextField
              fullWidth
              label="Recipient Name"
              value={formData.recipientName}
              onChange={(e) => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
              error={!!errors.recipientName}
              helperText={errors.recipientName || "Name of the person or department"}
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Box>

          <TextField
            fullWidth
            label="Subject"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            helperText="Email subject line (auto-generated, you can modify)"
          />

          <TextField
            fullWidth
            label="Your Message"
            multiline
            rows={4}
            value={formData.customMessage}
            onChange={(e) => setFormData(prev => ({ ...prev, customMessage: e.target.value }))}
            error={!!errors.customMessage}
            helperText={errors.customMessage || "Explain the situation and what action is needed"}
            placeholder="Dear [Recipient Name],

I am forwarding this grievance for your attention and resolution. Please review the details above and take appropriate action.

Your prompt response would be greatly appreciated.

Best regards,
[Your Name]"
          />

          <TextField
            fullWidth
            select
            label="Priority Level"
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
            SelectProps={{ native: true }}
            helperText="How urgent is this matter?"
          >
            <option value="low">Low - No rush</option>
            <option value="normal">Normal - Standard timeline</option>
            <option value="high">High - Needs prompt attention</option>
            <option value="urgent">Urgent - Immediate action required</option>
          </TextField>
        </Box>

        {formData.recipientEmail && formData.recipientName && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              📧 The email will be sent to <strong>{formData.recipientName}</strong> at <strong>{formData.recipientEmail}</strong>
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={handleClose} 
          disabled={sending}
          startIcon={<CloseIcon />}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={sending}
          startIcon={sending ? <CircularProgress size={16} /> : <SendIcon />}
          sx={{ 
            minWidth: '120px',
            background: 'linear-gradient(135deg, #4fc3f7, #29b6f6)',
            '&:hover': {
              background: 'linear-gradient(135deg, #29b6f6, #0288d1)',
            }
          }}
        >
          {sending ? 'Sending...' : 'Send Email'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
