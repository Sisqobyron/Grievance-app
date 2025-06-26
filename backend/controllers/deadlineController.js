const deadlineModel = require('../models/deadlineModel');
const notifier = require('../utils/notifications');

const deadlineController = {
  // Create custom deadline
  createDeadline: (req, res) => {
    const { grievance_id, deadline_type, deadline_date, notes } = req.body;
    const created_by = req.user ? req.user.id : 1;
    
    const deadlineData = {
      grievance_id,
      deadline_type,
      deadline_date,
      created_by,
      notes
    };
    
    deadlineModel.createDeadline(deadlineData, (err, newDeadline) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Could not create deadline', 
          error: err 
        });
      }
      
      res.status(201).json({ 
        message: 'Deadline created successfully', 
        deadline: newDeadline 
      });
    });
  },

  // Get deadlines for grievance
  getGrievanceDeadlines: (req, res) => {
    const { grievanceId } = req.params;
    
    deadlineModel.getGrievanceDeadlines(grievanceId, (err, deadlines) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error retrieving deadlines', 
          error: err 
        });
      }
      
      res.json(deadlines);
    });
  },

  // Get upcoming deadlines for coordinator
  getUpcomingDeadlines: (req, res) => {
    const { coordinatorId } = req.params;
    
    deadlineModel.getUpcomingDeadlines(coordinatorId, (err, deadlines) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error retrieving upcoming deadlines', 
          error: err 
        });
      }
      
      res.json(deadlines);
    });
  },

  // Get overdue deadlines for coordinator
  getOverdueDeadlines: (req, res) => {
    const { coordinatorId } = req.params;
    
    deadlineModel.getOverdueDeadlines(coordinatorId, (err, deadlines) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error retrieving overdue deadlines', 
          error: err 
        });
      }
      
      res.json(deadlines);
    });
  },

  // Mark deadline as met
  markDeadlineMet: (req, res) => {
    const { deadlineId } = req.params;
    
    deadlineModel.markDeadlineMet(deadlineId, (err) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error marking deadline as met', 
          error: err 
        });
      }
      
      res.json({ 
        message: 'Deadline marked as met successfully' 
      });
    });
  },

  // Update deadline date
  updateDeadlineDate: (req, res) => {
    const { deadlineId } = req.params;
    const { deadline_date } = req.body;
    
    deadlineModel.updateDeadlineDate(deadlineId, deadline_date, (err) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error updating deadline date', 
          error: err 
        });
      }
      
      res.json({ 
        message: 'Deadline date updated successfully' 
      });
    });
  },

  // Get deadline statistics
  getDeadlineStats: (req, res) => {
    const { coordinatorId } = req.params;
    
    deadlineModel.getDeadlineStats(coordinatorId, (err, stats) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error retrieving deadline statistics', 
          error: err 
        });
      }
      
      res.json(stats);
    });
  },

  // Send deadline reminder notifications
  sendDeadlineReminders: (req, res) => {
    const { coordinatorId } = req.params;
    
    deadlineModel.getUpcomingDeadlines(coordinatorId, (err, deadlines) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error retrieving deadlines for reminders', 
          error: err 
        });
      }
      
      let remindersSent = 0;
      
      deadlines.forEach((deadline) => {
        const daysRemaining = Math.ceil(deadline.days_remaining);
        let reminderMessage = '';
        
        if (daysRemaining <= 0) {
          reminderMessage = `⚠️ OVERDUE: Deadline for grievance #${deadline.grievance_id} (${deadline.deadline_type}) was due ${Math.abs(daysRemaining)} days ago.`;
        } else if (daysRemaining === 1) {
          reminderMessage = `🚨 URGENT: Deadline for grievance #${deadline.grievance_id} (${deadline.deadline_type}) is due tomorrow!`;
        } else if (daysRemaining <= 3) {
          reminderMessage = `⏰ REMINDER: Deadline for grievance #${deadline.grievance_id} (${deadline.deadline_type}) is due in ${daysRemaining} days.`;
        }
        
        if (reminderMessage) {
          notifier.sendNotification(
            coordinatorId,
            reminderMessage,
            (notificationErr) => {
              if (notificationErr) {
                console.error('Error sending deadline reminder:', notificationErr);
              }
              remindersSent++;
            }
          );
        }
      });
      
      res.json({ 
        message: `${remindersSent} deadline reminders sent`,
        deadlines: deadlines.length
      });
    });
  },
  // Auto-create standard deadlines for new grievance
  createStandardDeadlines: (grievanceId, priorityLevel, createdBy) => {
    deadlineModel.createStandardDeadlines(grievanceId, priorityLevel, createdBy, (err, deadlines) => {
      if (err) {
        console.error('Error creating standard deadlines:', err);
      } else {
        console.log(`✅ Created ${deadlines.length} standard deadlines for grievance #${grievanceId}`);
      }
    });
  },
  // Get all deadlines
  getAllDeadlines: (req, res) => {
    deadlineModel.getAllDeadlines((err, deadlines) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error retrieving deadlines', 
          error: err 
        });
      }
      
      res.json(deadlines);
    });
  },
  // Extend deadline (frontend-compatible endpoint)
  extendDeadline: (req, res) => {
    const { deadlineId } = req.params;
    const { newDate, reason } = req.body;
    
    deadlineModel.updateDeadlineDate(deadlineId, newDate, (err) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error extending deadline', 
          error: err 
        });
      }
      
      res.json({ 
        message: 'Deadline extended successfully',
        newDate,
        reason 
      });
    });
  },

  // Get upcoming deadlines (general - for dashboard)
  getGeneralUpcomingDeadlines: (req, res) => {
    deadlineModel.getGeneralUpcomingDeadlines((err, deadlines) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error retrieving upcoming deadlines', 
          error: err 
        });
      }
      
      res.json(deadlines);
    });
  }
};

module.exports = deadlineController;
