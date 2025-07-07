import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  AdminPanelSettings as AdminIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../config/axios';
import { hierarchicalCategories } from '../utils/categoryData';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [grievanceFilter, setGrievanceFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [grievanceDetailOpen, setGrievanceDetailOpen] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState(null);

  // Fetch functions defined first
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/api/admin/users';
      
      if (roleFilter !== 'all') {
        url = `/api/admin/users/role/${roleFilter}`;
      }
      
      const response = await api.get(url);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  const fetchGrievances = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/api/admin/grievances';
      
      if (grievanceFilter !== 'all') {
        if (Object.keys(hierarchicalCategories).includes(grievanceFilter)) {
          url = `/api/admin/grievances/category/${grievanceFilter}`;
        } else if (['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Closed'].includes(grievanceFilter)) {
          url = `/api/admin/grievances/status/${grievanceFilter}`;
        } else if (['Low', 'Medium', 'High'].includes(grievanceFilter)) {
          url = `/api/admin/grievances/priority/${grievanceFilter}`;
        }
      }
      
      const response = await api.get(url);
      setGrievances(response.data);
    } catch (error) {
      console.error('Error fetching grievances:', error);
      toast.error('Failed to load grievances');
    } finally {
      setLoading(false);
    }
  }, [grievanceFilter]);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch users when tab changes
  useEffect(() => {
    if (activeTab === 0) {
      fetchUsers();
    } else if (activeTab === 1) {
      fetchGrievances();
    }
  }, [activeTab, fetchUsers, fetchGrievances]);

  const handleSearchUsers = async () => {
    if (!searchTerm.trim()) {
      fetchUsers();
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/users/search?query=${encodeURIComponent(searchTerm)}`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/api/admin/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleUpdateUser = async (updatedUser) => {
    try {
      await api.put(`/api/admin/users/${updatedUser.id}`, updatedUser);
      toast.success('User updated successfully');
      setEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.put(`/api/admin/users/${userId}/role`, { newRole });
      toast.success('User role updated successfully');
      fetchUsers();
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleViewGrievance = (grievance) => {
    setSelectedGrievance(grievance);
    setGrievanceDetailOpen(true);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'staff': return 'warning';
      case 'student': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return 'info';
      case 'Under Review': return 'warning';
      case 'In Progress': return 'primary';
      case 'Resolved': return 'success';
      case 'Closed': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
      default: return 'default';
    }
  };

  // Dashboard Overview Tab
  const DashboardOverview = () => (
    <Grid container spacing={3}>
      {/* Statistics Cards */}
      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" component="div" fontWeight="bold">
                  {dashboardData?.userStats?.reduce((sum, stat) => sum + stat.count, 0) || 0}
                </Typography>
                <Typography variant="body2">Total Users</Typography>
              </Box>
              <PeopleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" component="div" fontWeight="bold">
                  {dashboardData?.grievanceStats?.reduce((sum, stat) => sum + stat.count, 0) || 0}
                </Typography>
                <Typography variant="body2">Total Grievances</Typography>
              </Box>
              <AssignmentIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" component="div" fontWeight="bold">
                  {dashboardData?.userStats?.find(stat => stat.role === 'student')?.count || 0}
                </Typography>
                <Typography variant="body2">Students</Typography>
              </Box>
              <SchoolIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" component="div" fontWeight="bold">
                  {dashboardData?.userStats?.find(stat => stat.role === 'staff')?.count || 0}
                </Typography>
                <Typography variant="body2">Staff Members</Typography>
              </Box>
              <BusinessIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Users */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: '400px' }}>
          <Typography variant="h6" gutterBottom>
            Recent Users
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {dashboardData?.recentUsers?.map((user) => (
              <ListItem key={user.id}>
                <ListItemText
                  primary={user.name}
                  secondary={`${user.email} • ${user.role}`}
                />
                <ListItemSecondaryAction>
                  <Chip
                    label={user.role}
                    size="small"
                    color={getRoleColor(user.role)}
                    variant="outlined"
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>

      {/* Department Statistics */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: '400px' }}>
          <Typography variant="h6" gutterBottom>
            Department Distribution
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {dashboardData?.departmentStats?.map((dept) => (
              <ListItem key={dept.department}>
                <ListItemText
                  primary={dept.department}
                  secondary={`${dept.count} users`}
                />
                <ListItemSecondaryAction>
                  <Chip
                    label={dept.count}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>
    </Grid>
  );

  // User Management Tab
  const UserManagement = () => (
    <Box>
      {/* Search and Filter Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchUsers()}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSearchUsers}>
                    <SearchIcon />
                  </IconButton>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Role</InputLabel>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                label="Filter by Role"
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="student">Students</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="admin">Admins</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              onClick={fetchUsers}
              startIcon={<FilterIcon />}
              fullWidth
            >
              Apply Filter
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Additional Info</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.student_department || user.staff_department || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {user.role === 'student' && (
                      <Box>
                        <Typography variant="body2">{user.program}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.matricule} • {user.level}
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditUser(user)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteUser(user.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  // Grievance Management Tab
  const GrievanceManagement = () => (
    <Box>
      {/* Filter Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter Grievances</InputLabel>
              <Select
                value={grievanceFilter}
                onChange={(e) => setGrievanceFilter(e.target.value)}
                label="Filter Grievances"
              >
                <MenuItem value="all">All Grievances</MenuItem>
                
                {/* By Category */}
                <MenuItem disabled>─── By Category ───</MenuItem>
                {Object.keys(hierarchicalCategories).map(category => (
                  <MenuItem key={category} value={category}>
                    {hierarchicalCategories[category].icon} {hierarchicalCategories[category].label}
                  </MenuItem>
                ))}
                
                {/* By Status */}
                <MenuItem disabled>─── By Status ───</MenuItem>
                <MenuItem value="Submitted">Submitted</MenuItem>
                <MenuItem value="Under Review">Under Review</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Resolved">Resolved</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
                
                {/* By Priority */}
                <MenuItem disabled>─── By Priority ───</MenuItem>
                <MenuItem value="High">High Priority</MenuItem>
                <MenuItem value="Medium">Medium Priority</MenuItem>
                <MenuItem value="Low">Low Priority</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              onClick={fetchGrievances}
              startIcon={<FilterIcon />}
              fullWidth
            >
              Apply Filter
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Grievances Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              grievances.map((grievance) => (
                <TableRow key={grievance.id}>
                  <TableCell>#{grievance.id}</TableCell>
                  <TableCell>{grievance.student_name}</TableCell>
                  <TableCell>
                    <Chip
                      label={grievance.type}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={grievance.status}
                      color={getStatusColor(grievance.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={grievance.priority_level}
                      color={getPriorityColor(grievance.priority_level)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{grievance.department}</TableCell>
                  <TableCell>
                    {new Date(grievance.submission_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleViewGrievance(grievance)}
                      color="primary"
                    >
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AdminIcon color="primary" />
        Admin Dashboard
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab
            label={
              <Badge color="primary" badgeContent={dashboardData?.userStats?.reduce((sum, stat) => sum + stat.count, 0) || 0}>
                Dashboard
              </Badge>
            }
            icon={<TrendingUpIcon />}
          />
          <Tab
            label={
              <Badge color="secondary" badgeContent={users.length || 0}>
                Users
              </Badge>
            }
            icon={<PeopleIcon />}
          />
          <Tab
            label={
              <Badge color="error" badgeContent={grievances.length || 0}>
                Grievances
              </Badge>
            }
            icon={<AssignmentIcon />}
          />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && <DashboardOverview />}
        {activeTab === 1 && <UserManagement />}
        {activeTab === 2 && <GrievanceManagement />}
      </Box>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={selectedUser.name}
                    onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={selectedUser.role}
                      onChange={(e) => handleUpdateRole(selectedUser.id, e.target.value)}
                      label="Role"
                    >
                      <MenuItem value="student">Student</MenuItem>
                      <MenuItem value="staff">Staff</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => handleUpdateUser(selectedUser)} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Grievance Detail Dialog */}
      <Dialog open={grievanceDetailOpen} onClose={() => setGrievanceDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Grievance Details</DialogTitle>
        <DialogContent>
          {selectedGrievance && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Grievance ID
                  </Typography>
                  <Typography variant="body1">#{selectedGrievance.id}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Student
                  </Typography>
                  <Typography variant="body1">{selectedGrievance.student_name}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Category
                  </Typography>
                  <Chip label={selectedGrievance.type} size="small" variant="outlined" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedGrievance.status}
                    color={getStatusColor(selectedGrievance.status)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">{selectedGrievance.description}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Priority
                  </Typography>
                  <Chip
                    label={selectedGrievance.priority_level}
                    color={getPriorityColor(selectedGrievance.priority_level)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Department
                  </Typography>
                  <Typography variant="body1">{selectedGrievance.department}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Submission Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedGrievance.submission_date).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGrievanceDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
