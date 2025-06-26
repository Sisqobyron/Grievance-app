const grievanceModel = require('../models/grievanceModel');
const userModel = require('../models/userModel');
const timelineModel = require('../models/timelineModel');
const notifier = require('../utils/notifications');
const deadlineController = require('./deadlineController');
const coordinatorModel = require('../models/coordinatorModel');

exports.submitGrievance = (req, res) => {
  const { student_id, type, subcategory, description, priority_level } = req.body;
  const file_path = req.file ? req.file.path : null;
  const submission_date = new Date().toISOString();

  // Extract additional dynamic fields (excluding the main fields)
  const excludeFields = ['student_id', 'type', 'subcategory', 'description', 'priority_level'];
  const additionalData = {};
  
  Object.keys(req.body).forEach(key => {
    if (!excludeFields.includes(key)) {
      additionalData[key] = req.body[key];
    }
  });

  const grievance = {
    student_id,
    type,
    subcategory,
    description,
    file_path,
    submission_date,
    priority_level,
    additional_data: JSON.stringify(additionalData)
  };  grievanceModel.createGrievance(grievance, (err, newGrievance) => {
    if (err) return res.status(500).json({ message: 'Could not submit grievance', error: err });
    
    console.log('✅ Grievance created successfully with ID:', newGrievance.id);
    
    // Create timeline entry for grievance submission
    const timelineEntry = {
      grievance_id: newGrievance.id,
      action_type: 'created',
      action_description: 'Grievance submitted to the system',
      performed_by: student_id,
      metadata: {
        type,
        priority_level,
        has_attachment: !!file_path
      }
    };
    
    console.log('🕐 Creating timeline entry:', timelineEntry);
    timelineModel.addTimelineEntry(timelineEntry, (timelineErr, timelineResult) => {
      if (timelineErr) {
        console.error('❌ Error creating timeline entry:', timelineErr);
      } else {
        console.log('✅ Timeline entry created successfully:', timelineResult);
      }
    });
    
    // Get student information for personalized emails
    userModel.findUserById(student_id, (userErr, student) => {
      if (userErr) {
        console.error('Error fetching student info:', userErr);
        return res.status(500).json({ message: 'Could not retrieve student information' });
      }

      const grievanceData = {
        id: newGrievance.id,
        type,
        subcategory,
        description,
        priority_level,
        submission_date,
        file_path,
        studentName: student.name
      };

      // Send beautiful confirmation email to student
      notifier.sendGrievanceSubmissionEmail(student_id, grievanceData, (emailErr) => {
        if (emailErr) console.error('Error sending confirmation email:', emailErr);
      });      // Send beautiful notification email to staff
      notifier.sendStaffNotificationEmail(grievanceData, student.name, (staffEmailErr) => {
        if (staffEmailErr) console.error('Error sending staff notification:', staffEmailErr);
      });

      // Create standard deadlines for the grievance
      deadlineController.createStandardDeadlines(newGrievance.id, priority_level, student_id);

      // Auto-assign to coordinator if department matches
      if (student.department) {
        coordinatorModel.getCoordinatorsByDepartment(student.department, (coordErr, coordinators) => {
          if (!coordErr && coordinators.length > 0) {
            // Auto-assign to coordinator with least workload
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
                  
                  if (availableCoordinators.length > 0) {
                    availableCoordinators.sort((a, b) => a.active_cases - b.active_cases);
                    const selectedCoordinator = availableCoordinators[0];
                    
                    const assignmentData = {
                      grievance_id: newGrievance.id,
                      coordinator_id: selectedCoordinator.id,
                      assigned_by: student_id,
                      notes: 'Auto-assigned based on department and workload'
                    };
                      coordinatorModel.assignGrievance(assignmentData, (assignErr) => {
                      if (!assignErr) {
                        console.log(`✅ Auto-assigned grievance #${newGrievance.id} to coordinator ${selectedCoordinator.name}`);
                        
                        // Create timeline entry for coordinator assignment
                        const assignmentTimelineEntry = {
                          grievance_id: newGrievance.id,
                          action_type: 'assigned',
                          action_description: `Assigned to coordinator: ${selectedCoordinator.name}`,
                          performed_by: student_id,
                          metadata: {
                            coordinator_id: selectedCoordinator.id,
                            coordinator_name: selectedCoordinator.name,
                            assignment_type: 'auto'
                          }
                        };
                        
                        timelineModel.addTimelineEntry(assignmentTimelineEntry, (assignTimelineErr) => {
                          if (assignTimelineErr) console.error('Error creating assignment timeline entry:', assignTimelineErr);
                        });
                      }
                    });
                  }
                }
              });
            });
          }
        });
      }

      res.status(201).json({ 
        message: 'Grievance submitted successfully', 
        grievanceId: newGrievance.id,
        grievance: newGrievance 
      });
    });
  });
};

exports.getGrievance = (req, res) => {
  const { id } = req.params;

  grievanceModel.getGrievanceById(id, (err, grievance) => {
    if (err) return res.status(500).json({ message: 'Error retrieving grievance', error: err });
    if (!grievance) return res.status(404).json({ message: 'Grievance not found' });
    res.json(grievance);
  });
};

exports.getGrievancesByStudent = (req, res) => {
  const { student_id } = req.params;

  grievanceModel.getGrievancesByStudent(student_id, (err, grievances) => {
    if (err) return res.status(500).json({ message: 'Error retrieving grievances', error: err });
    res.json(grievances);
  });
};

exports.updateStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // First get the grievance details
  grievanceModel.getGrievanceById(id, (getErr, grievance) => {
    if (getErr) return res.status(500).json({ message: 'Error retrieving grievance', error: getErr });
    if (!grievance) return res.status(404).json({ message: 'Grievance not found' });    // Update the status
    grievanceModel.updateGrievanceStatus(id, status, (updateErr, updated) => {
      if (updateErr) return res.status(500).json({ message: 'Error updating grievance', error: updateErr });
      
      // Create timeline entry for status change
      const statusTimelineEntry = {
        grievance_id: id,
        action_type: 'status_changed',
        action_description: `Status changed from "${grievance.status}" to "${status}"`,
        performed_by: req.user ? req.user.id : null,
        metadata: {
          from: grievance.status,
          to: status
        }
      };
      
      timelineModel.addTimelineEntry(statusTimelineEntry, (statusTimelineErr) => {
        if (statusTimelineErr) console.error('Error creating status timeline entry:', statusTimelineErr);
      });
      
      // Get student information for personalized email
      userModel.findUserById(grievance.student_id, (userErr, student) => {
        if (userErr) {
          console.error('Error fetching student info for status update:', userErr);
        } else {
          const grievanceData = {
            id: grievance.id,
            type: grievance.type,
            subcategory: grievance.subcategory,
            description: grievance.description,
            priority_level: grievance.priority_level,
            submission_date: grievance.submission_date
          };

          // Send beautiful status update email to student
          notifier.sendStatusUpdateEmail(
            grievance.student_id, 
            grievanceData, 
            status, 
            student.name, 
            (emailErr) => {
              if (emailErr) console.error('Error sending status update email:', emailErr);
            }
          );
        }
      });

      res.json({ message: 'Grievance status updated', updated });
    });
  });
};

exports.getAllGrievances = (req, res) => {
  grievanceModel.getAllGrievances((err, grievances) => {
    if (err) return res.status(500).json({ message: 'Error retrieving grievances', error: err });
    res.json(grievances);
  });
};
