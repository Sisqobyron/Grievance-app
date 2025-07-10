import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Skeleton,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  Warning,
  Schedule,
  Assignment,
  Add,
  Edit,
  Delete,
  PlayArrow,
  Stop,
  Visibility
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../config/axios';
import { toast } from 'react-toastify';

const EscalationManagement = () => {
  const [escalationRules, setEscalationRules] = useState([]);
  const [escalationHistory, setEscalationHistory] = useState([]);
  const [metrics, setMetrics] = useState({
    totalEscalations: 0,
    activeRules: 0,
    avgResolutionTime: 0,
    escalationRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);  const [ruleFormData, setRuleFormData] = useState({
    name: '',
    triggerType: '',
    triggerValue: '',
    condition: '',
    action: '',
    escalationTarget: '',
    isActive: true
  });
  const triggerTypes = [
    'time_exceeded',
    'status_unchanged', 
    'deadline_missed',
    'manual'
  ];

  const conditions = [
    'greater_than',
    'less_than',
    'equal_to',
    'not_equal_to'
  ];
  const actions = [
    'reassign',
    'notify_supervisor',
    'escalate_priority',
    'auto_resolve'
  ];

  useEffect(() => {
    fetchEscalationData();
  }, []);

  const fetchEscalationData = async () => {
    try {
      const [rulesResponse, historyResponse, metricsResponse] = await Promise.all([
        api.get('/api/escalation/rules'),
        api.get('/api/escalation/history'),
        api.get('/api/escalation/metrics')
      ]);

      setEscalationRules(rulesResponse.data);
      setEscalationHistory(historyResponse.data);
      setMetrics(metricsResponse.data);
    } catch (error) {
      console.error('Error fetching escalation data:', error);
      toast.error('Failed to fetch escalation data');
    } finally {
      setLoading(false);
    }
  };
  const handleCreateRule = async () => {
    try {
      // Transform camelCase form data to snake_case for API
      const apiData = {
        rule_name: ruleFormData.name,
        grievance_type: null, // Not used in current form
        priority_level: null, // Not used in current form  
        trigger_condition: ruleFormData.triggerType,
        trigger_value: parseInt(ruleFormData.triggerValue) || null,
        escalation_action: ruleFormData.action,
        escalation_target: ruleFormData.escalationTarget || 'System'
      };

      await api.post('/api/escalation/rules', apiData);
      toast.success('Escalation rule created successfully');
      setRuleDialogOpen(false);
      fetchEscalationData();
      resetForm();
    } catch (error) {
      console.error('Error creating escalation rule:', error);
      toast.error('Failed to create escalation rule');
    }
  };
  const handleUpdateRule = async () => {
    try {
      // Transform camelCase form data to snake_case for API
      const apiData = {
        rule_name: ruleFormData.name,
        grievance_type: null, // Not used in current form
        priority_level: null, // Not used in current form
        trigger_condition: ruleFormData.triggerType,
        trigger_value: parseInt(ruleFormData.triggerValue) || null,
        escalation_action: ruleFormData.action,
        escalation_target: ruleFormData.escalationTarget || 'System'
      };

      await api.put(`/api/escalation/rules/${editingRule.id}`, apiData);
      toast.success('Escalation rule updated successfully');
      setRuleDialogOpen(false);
      setEditingRule(null);
      fetchEscalationData();
      resetForm();
    } catch (error) {
      console.error('Error updating escalation rule:', error);
      toast.error('Failed to update escalation rule');
    }
  };

  const handleDeleteRule = async (id) => {
    if (window.confirm('Are you sure you want to delete this escalation rule?')) {
      try {
        await api.delete(`/api/escalation/rules/${id}`);
        toast.success('Escalation rule deleted successfully');
        fetchEscalationData();
      } catch (error) {
        console.error('Error deleting escalation rule:', error);
        toast.error('Failed to delete escalation rule');
      }
    }
  };
  const toggleRuleStatus = async (id, isActive) => {
    try {
      await api.put(`/api/escalation/rules/${id}/status`, { is_active: !isActive });
      toast.success(`Rule ${!isActive ? 'activated' : 'deactivated'} successfully`);
      fetchEscalationData();
    } catch (error) {
      console.error('Error toggling rule status:', error);
      toast.error('Failed to toggle rule status');
    }
  };
  const openEditDialog = (rule) => {
    setEditingRule(rule);
    setRuleFormData({
      name: rule.rule_name,
      triggerType: rule.trigger_condition,
      triggerValue: rule.trigger_value,
      condition: rule.trigger_condition,
      action: rule.escalation_action,
      escalationTarget: rule.escalation_target,
      isActive: rule.is_active
    });
    setRuleDialogOpen(true);
  };
  const resetForm = () => {
    setRuleFormData({
      name: '',
      triggerType: '',
      triggerValue: '',
      condition: '',
      action: '',
      escalationTarget: '',
      isActive: true
    });
  };

  const getEscalationPriority = (escalation) => {
    switch (escalation.severity) {
      case 'high':
        return { color: 'error', label: 'High' };
      case 'medium':
        return { color: 'warning', label: 'Medium' };
      case 'low':
        return { color: 'info', label: 'Low' };
      default:
        return { color: 'default', label: 'Unknown' };
    }
  };

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
        <Paper sx={{ p: 3 }}>
          <Skeleton width={300} height={32} sx={{ mb: 2 }} />
          <Skeleton width="100%" height={200} />
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Escalations
                    </Typography>
                    <Typography variant="h4" color="error.main">
                      {metrics.totalEscalations}
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 40, color: 'error.main' }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Active Rules
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {metrics.activeRules}
                    </Typography>
                  </Box>
                  <Assignment sx={{ fontSize: 40, color: 'warning.main' }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Avg Resolution Time
                    </Typography>
                    <Typography variant="h4" color="info.main">
                      {metrics.avgResolutionTime}h
                    </Typography>
                  </Box>
                  <Schedule sx={{ fontSize: 40, color: 'info.main' }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Escalation Rate
                    </Typography>
                    <Typography variant="h4" color="secondary.main">
                      {metrics.escalationRate}%
                    </Typography>
                  </Box>
                  <Warning sx={{ fontSize: 40, color: 'secondary.main' }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Escalation Rules */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Escalation Rules</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              resetForm();
              setRuleDialogOpen(true);
            }}
          >
            Add Rule
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Trigger Type</TableCell>
                <TableCell>Condition</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>            <TableBody>
              {escalationRules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>{rule.rule_name}</TableCell>
                  <TableCell>
                    <Chip
                      label={rule.trigger_condition?.replace('_', ' ') || 'N/A'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {rule.trigger_condition} {rule.trigger_value}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={rule.escalation_action?.replace('_', ' ') || 'N/A'}
                      size="small"
                      color="info"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={rule.is_active ? 'Active' : 'Inactive'}
                      color={rule.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title={rule.is_active ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          size="small"
                          onClick={() => toggleRuleStatus(rule.id, rule.is_active)}
                          color={rule.is_active ? 'error' : 'success'}
                        >
                          {rule.is_active ? <Stop /> : <PlayArrow />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => openEditDialog(rule)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteRule(rule.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {escalationRules.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No escalation rules found. Create a rule to get started.
          </Alert>
        )}
      </Paper>

      {/* Escalation History */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Escalations
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Grievance ID</TableCell>
                <TableCell>Triggered By</TableCell>
                <TableCell>Action Taken</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {escalationHistory.map((escalation) => {
                const priority = getEscalationPriority(escalation);
                return (
                  <TableRow key={escalation.id}>
                    <TableCell>#{escalation.grievance_id}</TableCell>
                    <TableCell>{escalation.triggered_by}</TableCell>
                    <TableCell>{escalation.action_taken}</TableCell>
                    <TableCell>
                      <Chip
                        label={priority.label}
                        color={priority.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(escalation.escalated_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={escalation.resolved_at ? 'Resolved' : 'Active'}
                        color={escalation.resolved_at ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {escalationHistory.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No escalation history found.
          </Alert>
        )}
      </Paper>

      {/* Add/Edit Rule Dialog */}
      <Dialog open={ruleDialogOpen} onClose={() => setRuleDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRule ? 'Edit Escalation Rule' : 'Add New Escalation Rule'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Rule Name"
                value={ruleFormData.name}
                onChange={(e) => setRuleFormData({ ...ruleFormData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Trigger Type</InputLabel>
                <Select
                  value={ruleFormData.triggerType}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, triggerType: e.target.value })}
                  label="Trigger Type"
                >
                  {triggerTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.replace('_', ' ').toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Trigger Value"
                value={ruleFormData.triggerValue}
                onChange={(e) => setRuleFormData({ ...ruleFormData, triggerValue: e.target.value })}
                placeholder="e.g., 24 (hours), 5 (cases), urgent"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Condition</InputLabel>
                <Select
                  value={ruleFormData.condition}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, condition: e.target.value })}
                  label="Condition"
                >
                  {conditions.map((condition) => (
                    <MenuItem key={condition} value={condition}>
                      {condition.replace('_', ' ').toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Action</InputLabel>
                <Select
                  value={ruleFormData.action}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, action: e.target.value })}
                  label="Action"
                >
                  {actions.map((action) => (
                    <MenuItem key={action} value={action}>
                      {action.replace('_', ' ').toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={ruleFormData.isActive}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, isActive: e.target.value })}
                  label="Status"
                >
                  <MenuItem value={true}>Active</MenuItem>
                  <MenuItem value={false}>Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRuleDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={editingRule ? handleUpdateRule : handleCreateRule}
            disabled={!ruleFormData.name || !ruleFormData.triggerType || !ruleFormData.condition || !ruleFormData.action}
          >
            {editingRule ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EscalationManagement;
