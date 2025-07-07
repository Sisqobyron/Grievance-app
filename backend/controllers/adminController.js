const adminModel = require('../models/adminModel');
const grievanceModel = require('../models/grievanceModel');
const { hierarchicalCategories } = require('../utils/categoryData');

// Get all users with role-specific details
exports.getAllUsers = (req, res) => {
  adminModel.getAllUsers((err, users) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ message: 'Failed to fetch users' });
    }
    res.json(users);
  });
};

// Get users by role
exports.getUsersByRole = (req, res) => {
  const { role } = req.params;
  
  if (!['student', 'staff', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified' });
  }
  
  adminModel.getUsersByRole(role, (err, users) => {
    if (err) {
      console.error('Error fetching users by role:', err);
      return res.status(500).json({ message: 'Failed to fetch users by role' });
    }
    res.json(users);
  });
};

// Update user role
exports.updateUserRole = (req, res) => {
  const { userId } = req.params;
  const { newRole } = req.body;
  
  if (!['student', 'staff', 'admin'].includes(newRole)) {
    return res.status(400).json({ message: 'Invalid role specified' });
  }
  
  adminModel.updateUserRole(userId, newRole, (err) => {
    if (err) {
      console.error('Error updating user role:', err);
      return res.status(500).json({ message: 'Failed to update user role' });
    }
    res.json({ message: 'User role updated successfully' });
  });
};

// Delete user
exports.deleteUser = (req, res) => {
  const { userId } = req.params;
  
  adminModel.deleteUser(userId, (err, result) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ message: 'Failed to delete user' });
    }
    res.json({ message: 'User deleted successfully', result });
  });
};

// Get user statistics
exports.getUserStats = (req, res) => {
  adminModel.getUserStats((err, stats) => {
    if (err) {
      console.error('Error fetching user stats:', err);
      return res.status(500).json({ message: 'Failed to fetch user statistics' });
    }
    res.json(stats);
  });
};

// Search users
exports.searchUsers = (req, res) => {
  const { query } = req.query;
  
  if (!query || query.trim() === '') {
    return res.status(400).json({ message: 'Search query is required' });
  }
  
  adminModel.searchUsers(query, (err, users) => {
    if (err) {
      console.error('Error searching users:', err);
      return res.status(500).json({ message: 'Failed to search users' });
    }
    res.json(users);
  });
};

// Update user details
exports.updateUser = (req, res) => {
  const { userId } = req.params;
  const updates = req.body;
  
  adminModel.updateUser(userId, updates, (err) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ message: 'Failed to update user' });
    }
    res.json({ message: 'User updated successfully' });
  });
};

// Get admin dashboard data
exports.getAdminDashboardData = (req, res) => {
  adminModel.getAdminDashboardData((err, data) => {
    if (err) {
      console.error('Error fetching admin dashboard data:', err);
      return res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
    res.json(data);
  });
};

// Get all grievances (admin can see all)
exports.getAllGrievances = (req, res) => {
  grievanceModel.getAllGrievances((err, grievances) => {
    if (err) {
      console.error('Error fetching grievances:', err);
      return res.status(500).json({ message: 'Failed to fetch grievances' });
    }
    res.json(grievances);
  });
};

// Get grievances filtered by category
exports.getGrievancesByCategory = (req, res) => {
  const { category } = req.params;
  
  // Validate category exists
  if (!hierarchicalCategories[category]) {
    return res.status(400).json({ message: 'Invalid category specified' });
  }
  
  grievanceModel.getGrievancesByCategory(category, (err, grievances) => {
    if (err) {
      console.error('Error fetching grievances by category:', err);
      return res.status(500).json({ message: 'Failed to fetch grievances by category' });
    }
    res.json(grievances);
  });
};

// Get grievances filtered by status
exports.getGrievancesByStatus = (req, res) => {
  const { status } = req.params;
  
  const validStatuses = ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Closed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status specified' });
  }
  
  grievanceModel.getGrievancesByStatus(status, (err, grievances) => {
    if (err) {
      console.error('Error fetching grievances by status:', err);
      return res.status(500).json({ message: 'Failed to fetch grievances by status' });
    }
    res.json(grievances);
  });
};

// Get grievances filtered by department
exports.getGrievancesByDepartment = (req, res) => {
  const { department } = req.params;
  
  grievanceModel.getGrievancesByDepartment(department, (err, grievances) => {
    if (err) {
      console.error('Error fetching grievances by department:', err);
      return res.status(500).json({ message: 'Failed to fetch grievances by department' });
    }
    res.json(grievances);
  });
};

// Get grievances filtered by priority
exports.getGrievancesByPriority = (req, res) => {
  const { priority } = req.params;
  
  const validPriorities = ['Low', 'Medium', 'High'];
  if (!validPriorities.includes(priority)) {
    return res.status(400).json({ message: 'Invalid priority specified' });
  }
  
  grievanceModel.getGrievancesByPriority(priority, (err, grievances) => {
    if (err) {
      console.error('Error fetching grievances by priority:', err);
      return res.status(500).json({ message: 'Failed to fetch grievances by priority' });
    }
    res.json(grievances);
  });
};
