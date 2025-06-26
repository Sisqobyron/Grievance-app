const coordinatorModel = require('../models/coordinatorModel');
const deadlineModel = require('../models/deadlineModel');
const userModel = require('../models/userModel');
const notifier = require('../utils/notifications');

const coordinatorController = {
  // Register new coordinator
  registerCoordinator: (req, res) => {
    const { user_id, department, specialization, max_concurrent_cases } = req.body;
    
    const coordinatorData = {
      user_id,
      department,
      specialization,
      max_concurrent_cases: max_concurrent_cases || 10
    };
    
    coordinatorModel.createCoordinator(coordinatorData, (err, newCoordinator) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Could not register coordinator', 
          error: err 
        });
      }
      
      res.status(201).json({ 
        message: 'Coordinator registered successfully', 
        coordinator: newCoordinator 
      });
    });
  },

  // Get all coordinators
  getAllCoordinators: (req, res) => {
    coordinatorModel.getAllCoordinators((err, coordinators) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error retrieving coordinators', 
          error: err 
        });
      }
      
      res.json(coordinators);
    });
  },

  // Get coordinator dashboard data
  getCoordinatorDashboard: (req, res) => {
    const { coordinatorId } = req.params;
    
    const dashboardData = {};
    let completedRequests = 0;
    const totalRequests = 4;
    
    // Get coordinator details
    coordinatorModel.getCoordinatorById(coordinatorId, (err, coordinator) => {
      if (err) return res.status(500).json({ message: 'Error retrieving coordinator', error: err });
      
      dashboardData.coordinator = coordinator;
      completedRequests++;
      
      if (completedRequests === totalRequests) {
        res.json(dashboardData);
      }
    });
    
    // Get assigned grievances
    coordinatorModel.getCoordinatorGrievances(coordinatorId, (err, grievances) => {
      if (err) return res.status(500).json({ message: 'Error retrieving grievances', error: err });
      
      dashboardData.grievances = grievances;
      completedRequests++;
      
      if (completedRequests === totalRequests) {
        res.json(dashboardData);
      }
    });
    
    // Get upcoming deadlines
    deadlineModel.getUpcomingDeadlines(coordinatorId, (err, upcomingDeadlines) => {
      if (err) return res.status(500).json({ message: 'Error retrieving upcoming deadlines', error: err });
      
      dashboardData.upcomingDeadlines = upcomingDeadlines;
      completedRequests++;
      
      if (completedRequests === totalRequests) {
        res.json(dashboardData);
      }
    });
    
    // Get deadline statistics
    deadlineModel.getDeadlineStats(coordinatorId, (err, stats) => {
      if (err) return res.status(500).json({ message: 'Error retrieving deadline stats', error: err });
      
      dashboardData.deadlineStats = stats;
      completedRequests++;
      
      if (completedRequests === totalRequests) {
        res.json(dashboardData);
      }
    });
  },

  // Assign grievance to coordinator
  assignGrievance: (req, res) => {
    const { grievance_id, coordinator_id, notes } = req.body;
    const assigned_by = req.user ? req.user.id : 1; // Fallback for testing
    
    const assignmentData = {
      grievance_id,
      coordinator_id,
      assigned_by,
      notes
    };
    
    coordinatorModel.assignGrievance(assignmentData, (err, assignment) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error assigning grievance', 
          error: err 
        });
      }
      
      // Get coordinator and grievance details for notification
      coordinatorModel.getCoordinatorById(coordinator_id, (coordErr, coordinator) => {
        if (coordErr) {
          console.error('Error fetching coordinator for notification:', coordErr);
        } else {
          // Send assignment notification email
          const userData = {
            full_name: coordinator.name,
            email: coordinator.email,
            role: 'coordinator'
          };
          
          notifier.sendNotification(
            coordinator.user_id,
            `You have been assigned a new grievance #${grievance_id}. Please review and take appropriate action.`,
            (emailErr) => {
              if (emailErr) console.error('Error sending assignment notification:', emailErr);
            }
          );
        }
      });
      
      res.status(201).json({ 
        message: 'Grievance assigned successfully', 
        assignment 
      });
    });
  },

  // Auto-assign grievance based on workload and department
  autoAssignGrievance: (req, res) => {
    const { grievance_id, department, priority_level } = req.body;
    
    // Get coordinators by department
    coordinatorModel.getCoordinatorsByDepartment(department, (err, coordinators) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error retrieving coordinators', 
          error: err 
        });
      }
      
      if (coordinators.length === 0) {
        return res.status(404).json({ 
          message: 'No coordinators available for this department' 
        });
      }
      
      // Get workload for each coordinator
      let processedCoordinators = 0;
      const coordinatorWorkloads = [];
      
      coordinators.forEach((coordinator) => {
        coordinatorModel.getCoordinatorWorkload(coordinator.id, (workloadErr, workload) => {
          if (!workloadErr && workload) {
            coordinatorWorkloads.push({
              ...coordinator,
              ...workload
            });
          }
          
          processedCoordinators++;
          
          if (processedCoordinators === coordinators.length) {
            // Find coordinator with lowest workload and available capacity
            const availableCoordinators = coordinatorWorkloads.filter(c => c.available_capacity > 0);
            
            if (availableCoordinators.length === 0) {
              return res.status(400).json({ 
                message: 'All coordinators are at capacity' 
              });
            }
            
            // Sort by workload (ascending) and pick the one with least cases
            availableCoordinators.sort((a, b) => a.active_cases - b.active_cases);
            const selectedCoordinator = availableCoordinators[0];
            
            // Assign to selected coordinator
            const assignmentData = {
              grievance_id,
              coordinator_id: selectedCoordinator.id,
              assigned_by: req.user ? req.user.id : 1,
              notes: `Auto-assigned based on workload distribution`
            };
            
            coordinatorModel.assignGrievance(assignmentData, (assignErr, assignment) => {
              if (assignErr) {
                return res.status(500).json({ 
                  message: 'Error auto-assigning grievance', 
                  error: assignErr 
                });
              }
              
              res.status(201).json({ 
                message: 'Grievance auto-assigned successfully', 
                assignment,
                coordinator: selectedCoordinator
              });
            });
          }
        });
      });
    });
  },

  // Get coordinator workload
  getCoordinatorWorkload: (req, res) => {
    const { coordinatorId } = req.params;
    
    coordinatorModel.getCoordinatorWorkload(coordinatorId, (err, workload) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error retrieving workload', 
          error: err 
        });
      }
      
      res.json(workload);
    });
  },

  // Update coordinator status
  updateCoordinatorStatus: (req, res) => {
    const { coordinatorId } = req.params;
    const { is_active } = req.body;
    
    coordinatorModel.updateCoordinatorStatus(coordinatorId, is_active, (err) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error updating coordinator status', 
          error: err 
        });
      }
      
      res.json({ 
        message: 'Coordinator status updated successfully' 
      });
    });
  },

  // Get coordinators by department
  getCoordinatorsByDepartment: (req, res) => {
    const { department } = req.params;
    
    coordinatorModel.getCoordinatorsByDepartment(department, (err, coordinators) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error retrieving coordinators', 
          error: err 
        });
      }
      
      res.json(coordinators);
    });
  },

  // Get all assignments for coordinators
  getAllAssignments: (req, res) => {
    coordinatorModel.getAllAssignments((err, assignments) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error retrieving assignments', 
          error: err 
        });
      }
      
      res.json(assignments);
    });
  },
  // Create a new coordinator (complete user + coordinator creation)
  createCoordinator: (req, res) => {
    const { name, email, department, maxWorkload, specialization } = req.body;
      // First create the user account
    const userDetails = { 
      name, 
      email, 
      password: 'coordinator123', // Default password - should be changed on first login
      role: 'staff' 
    };

    userModel.createUser(userDetails, (userErr, newUser) => {
      if (userErr) {
        return res.status(500).json({ 
          message: 'Could not create user account', 
          error: userErr 
        });
      }

      // Then create the coordinator record
      const coordinatorData = {
        user_id: newUser.id,
        department,
        specialization: specialization || department, // Use department as default specialization
        max_concurrent_cases: maxWorkload || 10
      };

      coordinatorModel.createCoordinator(coordinatorData, (coordErr, newCoordinator) => {
        if (coordErr) {
          return res.status(500).json({ 
            message: 'Could not create coordinator profile', 
            error: coordErr 
          });
        }

        // Send welcome email
        const userData = {
          full_name: name,
          email: email,
          role: 'coordinator'
        };
        
        notifier.sendWelcomeEmail(newUser.id, userData, (emailErr) => {
          if (emailErr) console.error('Error sending welcome email:', emailErr);
        });

        res.status(201).json({ 
          message: 'Coordinator created successfully', 
          coordinator: { ...newCoordinator, name, email },
          user: newUser
        });
      });
    });
  },

  // Update coordinator details
  updateCoordinator: (req, res) => {
    const { coordinatorId } = req.params;
    const { department, specialization, max_concurrent_cases } = req.body;
    
    const updateData = {
      department,
      specialization,
      max_concurrent_cases
    };
    
    coordinatorModel.updateCoordinator(coordinatorId, updateData, (err, result) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error updating coordinator', 
          error: err 
        });
      }
      
      res.json({ 
        message: 'Coordinator updated successfully',
        coordinator: result
      });
    });
  },

  // Delete coordinator (soft delete by setting is_active to false)
  deleteCoordinator: (req, res) => {
    const { coordinatorId } = req.params;
    
    coordinatorModel.updateCoordinatorStatus(coordinatorId, false, (err) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error deleting coordinator', 
          error: err 
        });
      }
      
      res.json({ 
        message: 'Coordinator deleted successfully' 
      });
    });
  }
};

module.exports = coordinatorController;
