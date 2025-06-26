import React, { useState, useEffect } from 'react';
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
  Skeleton
} from '@mui/material';
import {
  Assignment,
  Person,
  Schedule,
  Work,
  Add,
  Edit,
  Delete
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../config/axios';
import { toast } from 'react-toastify';

const StatCard = ({ title, value, icon, color, subtitle }) => (
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

const CoordinatorDashboard = () => {
  const [coordinators, setCoordinators] = useState([]);
  const [stats, setStats] = useState({
    totalCoordinators: 0,
    activeAssignments: 0,
    avgWorkload: 0,
    departmentCoverage: 0
  });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoordinator, setEditingCoordinator] = useState(null);  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    specialization: '',
    maxWorkload: 10,
    isActive: true
  });

  const departments = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'History',
    'Economics',
    'Psychology',
    'Engineering'
  ];

  useEffect(() => {
    fetchCoordinators();
    fetchStats();
  }, []);
  const fetchCoordinators = async () => {
    try {
      const response = await api.get('/api/coordinators');
      setCoordinators(response.data);
    } catch (error) {
      console.error('Error fetching coordinators:', error);
      toast.error('Failed to fetch coordinators');
    }
  };
  const fetchStats = async () => {
    try {
      const [coordResponse, assignmentResponse] = await Promise.all([
        api.get('/api/coordinators'),
        api.get('/api/coordinators/assignments')
      ]);

      const coordinators = coordResponse.data;
      const assignments = assignmentResponse.data;

      const totalCoordinators = coordinators.length;
      const activeCoordinators = coordinators.filter(c => c.is_active).length;
      const activeAssignments = assignments.filter(a => a.is_active).length;
      const avgWorkload = activeCoordinators > 0 
        ? (activeAssignments / activeCoordinators).toFixed(1)
        : 0;
      
      const coveredDepartments = new Set(coordinators.map(c => c.department)).size;
      const departmentCoverage = ((coveredDepartments / departments.length) * 100).toFixed(0);

      setStats({
        totalCoordinators: activeCoordinators,
        activeAssignments,
        avgWorkload,
        departmentCoverage: `${departmentCoverage}%`
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoordinator = async () => {
    try {
      await api.post('/api/coordinators', formData);
      toast.success('Coordinator created successfully');
      setDialogOpen(false);
      fetchCoordinators();
      fetchStats();
      resetForm();
    } catch (error) {
      console.error('Error creating coordinator:', error);
      toast.error('Failed to create coordinator');
    }
  };

  const handleUpdateCoordinator = async () => {
    try {
      await api.put(`/api/coordinators/${editingCoordinator.id}`, formData);
      toast.success('Coordinator updated successfully');
      setDialogOpen(false);
      setEditingCoordinator(null);
      fetchCoordinators();
      fetchStats();
      resetForm();
    } catch (error) {
      console.error('Error updating coordinator:', error);
      toast.error('Failed to update coordinator');
    }
  };

  const handleDeleteCoordinator = async (id) => {
    if (window.confirm('Are you sure you want to delete this coordinator?')) {
      try {
        await api.delete(`/api/coordinators/${id}`);
        toast.success('Coordinator deleted successfully');
        fetchCoordinators();
        fetchStats();
      } catch (error) {
        console.error('Error deleting coordinator:', error);
        toast.error('Failed to delete coordinator');
      }
    }
  };
  const openEditDialog = (coordinator) => {
    setEditingCoordinator(coordinator);
    setFormData({
      name: coordinator.name,
      email: coordinator.email,
      department: coordinator.department,
      specialization: coordinator.specialization || '',
      maxWorkload: coordinator.max_workload,
      isActive: coordinator.is_active
    });
    setDialogOpen(true);
  };
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      department: '',
      specialization: '',
      maxWorkload: 10,
      isActive: true
    });
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
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Coordinators"
            value={stats.totalCoordinators}
            icon={<Person sx={{ fontSize: 40, color: '#2563eb' }} />}
            color="#2563eb"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Assignments"
            value={stats.activeAssignments}
            icon={<Assignment sx={{ fontSize: 40, color: '#059669' }} />}
            color="#059669"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Workload"
            value={stats.avgWorkload}
            icon={<Work sx={{ fontSize: 40, color: '#dc2626' }} />}
            color="#dc2626"
            subtitle="cases per coordinator"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Department Coverage"
            value={stats.departmentCoverage}
            icon={<Schedule sx={{ fontSize: 40, color: '#7c3aed' }} />}
            color="#7c3aed"
          />
        </Grid>
      </Grid>

      {/* Coordinators Table */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Coordinator Management</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
          >
            Add Coordinator
          </Button>
        </Box>

        <TableContainer>
          <Table>            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell>Workload</TableCell>
                <TableCell>Max Capacity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>              {coordinators.map((coordinator) => (
                <TableRow key={coordinator.id}>
                  <TableCell>{coordinator.name}</TableCell>
                  <TableCell>{coordinator.email}</TableCell>
                  <TableCell>{coordinator.department}</TableCell>
                  <TableCell>{coordinator.specialization || 'General'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {coordinator.current_workload || 0}/{coordinator.max_workload}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={((coordinator.current_workload || 0) / coordinator.max_workload) * 100}
                        sx={{ width: 100, height: 8, borderRadius: 4 }}
                        color={
                          ((coordinator.current_workload || 0) / coordinator.max_workload) > 0.8
                            ? 'error'
                            : ((coordinator.current_workload || 0) / coordinator.max_workload) > 0.6
                            ? 'warning'
                            : 'primary'
                        }
                      />
                    </Box>
                  </TableCell>
                  <TableCell>{coordinator.max_workload}</TableCell>
                  <TableCell>
                    <Chip
                      label={coordinator.is_active ? 'Active' : 'Inactive'}
                      color={coordinator.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => openEditDialog(coordinator)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteCoordinator(coordinator.id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {coordinators.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No coordinators found. Add a coordinator to get started.
          </Alert>
        )}
      </Paper>

      {/* Add/Edit Coordinator Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCoordinator ? 'Edit Coordinator' : 'Add New Coordinator'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Grid>            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  label="Department"
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Specialization"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g., Academic Disputes, Financial Aid, etc."
                helperText="Area of expertise or focus"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Workload"
                type="number"
                value={formData.maxWorkload}
                onChange={(e) => setFormData({ ...formData, maxWorkload: parseInt(e.target.value) })}
                inputProps={{ min: 1, max: 50 }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value })}
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
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={editingCoordinator ? handleUpdateCoordinator : handleCreateCoordinator}
            disabled={!formData.name || !formData.email || !formData.department}
          >
            {editingCoordinator ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CoordinatorDashboard;
