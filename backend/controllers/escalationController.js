const escalationModel = require('../models/escalationModel');
const timelineModel = require('../models/timelineModel');
const coordinatorModel = require('../models/coordinatorModel');
const grievanceModel = require('../models/grievanceModel');
const notifier = require('../utils/notifications');

const escalationController = {
  // Create escalation rule
  createEscalationRule: (req, res) => {
    const ruleData = req.body;
    
    escalationModel.createEscalationRule(ruleData, (err, newRule) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Could not create escalation rule', 
          error: err 
        });
      }
      
      res.status(201).json({ 
        message: 'Escalation rule created successfully', 
        rule: newRule 
      });
    });
  },

  // Get all active escalation rules
  getActiveRules: (req, res) => {
    escalationModel.getActiveRules((err, rules) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error retrieving escalation rules', 
          error: err 
        });
      }
      
      res.json(rules);
    });
  },

  // Run escalation check (can be called manually or via cron)
  runEscalationCheck: (req, res) => {
    escalationModel.checkEscalationTriggers((err, triggeredGrievances) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error checking escalation triggers', 
          error: err 
        });
      }
      
      let processedEscalations = 0;
      const escalationResults = [];
      
      if (triggeredGrievances.length === 0) {
        return res.json({ 
          message: 'No escalations triggered', 
          escalations: [] 
        });
      }
      
      triggeredGrievances.forEach((grievance) => {
        this.executeEscalation(grievance, (escalationErr, result) => {
          if (escalationErr) {
            console.error('Escalation execution error:', escalationErr);
          } else {
            escalationResults.push(result);
          }
          
          processedEscalations++;
          
          if (processedEscalations === triggeredGrievances.length) {
            res.json({ 
              message: `Processed ${escalationResults.length} escalations`, 
              escalations: escalationResults 
            });
          }
        });
      });
    });
  },

  // Execute specific escalation action
  executeEscalation: (grievanceData, callback) => {
    const { 
      id: grievanceId, 
      status: currentStatus, 
      coordinator_id: currentCoordinator,
      escalation_action,
      escalation_target,
      rule_name 
    } = grievanceData;
    
    let escalationResult = {
      grievanceId,
      action: escalation_action,
      success: false,
      message: ''
    };
    
    switch (escalation_action) {
      case 'reassign':
        this.reassignGrievance(grievanceId, currentCoordinator, escalation_target, (err, result) => {
          if (err) {
            escalationResult.message = 'Failed to reassign grievance';
          } else {
            escalationResult.success = true;
            escalationResult.message = `Reassigned to ${result.newCoordinatorName}`;
          }
          callback(null, escalationResult);
        });
        break;
        
      case 'notify_supervisor':
        this.notifySupervisor(grievanceId, escalation_target, (err) => {
          if (err) {
            escalationResult.message = 'Failed to notify supervisor';
          } else {
            escalationResult.success = true;
            escalationResult.message = 'Supervisor notified successfully';
          }
          callback(null, escalationResult);
        });
        break;
        
      case 'escalate_priority':
        this.escalatePriority(grievanceId, currentStatus, (err) => {
          if (err) {
            escalationResult.message = 'Failed to escalate priority';
          } else {
            escalationResult.success = true;
            escalationResult.message = 'Priority escalated successfully';
          }
          callback(null, escalationResult);
        });
        break;
        
      default:
        escalationResult.message = 'Unknown escalation action';
        callback(null, escalationResult);
    }
    
    // Log the escalation attempt
    const escalationData = {
      grievance_id: grievanceId,
      trigger_reason: `Rule: ${rule_name}`,
      escalation_action,
      previous_status: currentStatus,
      new_status: currentStatus, // Will be updated by specific actions
      previous_assignee: currentCoordinator,
      notes: `Auto-escalation triggered by rule: ${rule_name}`,
      created_by: 1 // System user
    };
    
    escalationModel.logEscalation(escalationData, () => {});
    
    // Add timeline entry
    timelineModel.addTimelineEntry({
      grievance_id: grievanceId,
      action_type: 'escalated',
      action_description: `Escalation triggered: ${escalation_action}`,
      performed_by: 1, // System user
      metadata: { rule: rule_name, action: escalation_action }
    }, () => {});
  },

  // Reassign grievance to different coordinator
  reassignGrievance: (grievanceId, currentCoordinator, targetDepartment, callback) => {
    coordinatorModel.getCoordinatorsByDepartment(targetDepartment, (err, coordinators) => {
      if (err) return callback(err);
      
      if (coordinators.length === 0) {
        return callback(new Error('No coordinators available in target department'));
      }
      
      // Find coordinator with lowest workload
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
            const availableCoordinators = coordinatorWorkloads.filter(c => c.available_capacity > 0);
            
            if (availableCoordinators.length === 0) {
              return callback(new Error('All coordinators at capacity'));
            }
            
            availableCoordinators.sort((a, b) => a.active_cases - b.active_cases);
            const newCoordinator = availableCoordinators[0];
            
            const assignmentData = {
              grievance_id: grievanceId,
              coordinator_id: newCoordinator.id,
              assigned_by: 1, // System
              notes: 'Reassigned via escalation'
            };
            
            coordinatorModel.assignGrievance(assignmentData, (assignErr) => {
              if (assignErr) return callback(assignErr);
              
              callback(null, { 
                newCoordinatorId: newCoordinator.id,
                newCoordinatorName: newCoordinator.name 
              });
            });
          }
        });
      });
    });
  },

  // Notify supervisor about escalated grievance
  notifySupervisor: (grievanceId, supervisorRole, callback) => {
    // Get grievance details
    grievanceModel.getGrievanceById(grievanceId, (err, grievance) => {
      if (err) return callback(err);
      
      const notificationMessage = `⚠️ ESCALATED: Grievance #${grievanceId} requires supervisor attention. Type: ${grievance.type}, Priority: ${grievance.priority_level}`;
      
      // Send notification to supervisor (simplified - would typically query for actual supervisor)
      notifier.sendNotification(1, notificationMessage, callback);
    });
  },

  // Escalate priority level
  escalatePriority: (grievanceId, currentStatus, callback) => {
    const priorityEscalation = {
      'Low': 'Medium',
      'Medium': 'High', 
      'High': 'Urgent'
    };
    
    grievanceModel.getGrievanceById(grievanceId, (err, grievance) => {
      if (err) return callback(err);
      
      const newPriority = priorityEscalation[grievance.priority_level];
      
      if (!newPriority) {
        return callback(new Error('Priority already at maximum level'));
      }
      
      // Update priority (would need to add this method to grievanceModel)
      // For now, we'll just update status to indicate escalation
      grievanceModel.updateGrievanceStatus(grievanceId, 'In Progress - Escalated', (updateErr) => {
        if (updateErr) return callback(updateErr);
        
        // Add timeline entry
        timelineModel.addTimelineEntry({
          grievance_id: grievanceId,
          action_type: 'escalated',
          action_description: `Priority escalated from ${grievance.priority_level} to ${newPriority}`,
          performed_by: 1,
          metadata: { 
            old_priority: grievance.priority_level, 
            new_priority: newPriority 
          }
        }, callback);
      });
    });
  },
  // Get escalation history for grievance
  getEscalationHistory: (req, res) => {
    const { grievanceId } = req.params;
    
    escalationModel.getGrievanceEscalationHistory(grievanceId, (err, history) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error retrieving escalation history', 
          error: err 
        });
      }
      
      res.json(history);
    });
  },  // Get all escalation history (for management dashboard)
  getAllEscalationHistory: (req, res) => {
    const { limit = 50, offset = 0 } = req.query;
    
    escalationModel.getAllEscalationHistory(limit, offset, (err, history) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error retrieving escalation history', 
          error: err 
        });
      }
      
      res.json(history);
    });
  },

  // Get escalation metrics (for management dashboard)
  getEscalationMetrics: (req, res) => {
    const { timeframe = 30 } = req.query;
    
    escalationModel.getEscalationMetrics(timeframe, (err, metrics) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error retrieving escalation metrics', 
          error: err 
        });
      }
      
      res.json(metrics);
    });
  },

  // Get escalation statistics
  getEscalationStats: (req, res) => {
    const { timeframe } = req.query;
    
    escalationModel.getEscalationStats(timeframe || 30, (err, stats) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error retrieving escalation statistics', 
          error: err 
        });
      }
      
      res.json(stats);
    });
  },

  // Toggle rule status
  toggleRuleStatus: (req, res) => {
    const { ruleId } = req.params;
    const { is_active } = req.body;
    
    escalationModel.updateRuleStatus(ruleId, is_active, (err) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error updating rule status', 
          error: err 
        });
      }
      
      res.json({ 
        message: 'Rule status updated successfully' 
      });
    });
  }
};

module.exports = escalationController;
