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

// Get grievances by department (for staff)
exports.getGrievancesByDepartment = (req, res) => {
  // The departmentAccessMiddleware has already verified the user and set req.staffDepartment
  const department = req.staffDepartment;
  
  console.log(`Fetching grievances for ${department} department (requested by ${req.user.name})`);
  
  // Get grievances for this department
  grievanceModel.getGrievancesByDepartment(department, (err, grievances) => {
    if (err) {
      console.error('Error retrieving department grievances:', err);
      return res.status(500).json({ message: 'Error retrieving grievances', error: err });
    }
    
    console.log(`Found ${grievances.length} grievances for ${department} department`);
    res.json({
      department: department,
      staffMember: req.user.name,
      count: grievances.length,
      grievances: grievances
    });
  });
};

exports.getGrievanceStats = (req, res) => {
  // Get all grievances to calculate statistics
  grievanceModel.getAllGrievances((err, grievances) => {
    if (err) return res.status(500).json({ message: 'Error retrieving grievance statistics', error: err });
    
    // Calculate various statistics
    const total = grievances.length;
    const resolved = grievances.filter(g => g.status === 'Resolved').length;
    const pending = grievances.filter(g => g.status === 'Pending' || g.status === 'In Progress').length;
    const rejected = grievances.filter(g => g.status === 'Rejected').length;
    
    // Priority distribution
    const priorityStats = {
      Low: grievances.filter(g => g.priority_level === 'Low').length,
      Medium: grievances.filter(g => g.priority_level === 'Medium').length,
      High: grievances.filter(g => g.priority_level === 'High').length,
      Urgent: grievances.filter(g => g.priority_level === 'Urgent').length
    };
    
    // Category distribution
    const categoryStats = {};
    grievances.forEach(g => {
      categoryStats[g.type] = (categoryStats[g.type] || 0) + 1;
    });
    
    // Monthly trends (last 12 months)
    const monthlyStats = {};
    const currentDate = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      monthlyStats[monthKey] = 0;
    }
    
    grievances.forEach(g => {
      const monthKey = g.submission_date.slice(0, 7);
      if (monthlyStats.hasOwnProperty(monthKey)) {
        monthlyStats[monthKey]++;
      }
    });
    
    // Resolution time analysis (for resolved grievances)
    const resolvedGrievances = grievances.filter(g => g.status === 'Resolved');
    let avgResolutionTime = 0;
    if (resolvedGrievances.length > 0) {
      const totalResolutionTime = resolvedGrievances.reduce((sum, g) => {
        if (g.resolution_date) {
          const submissionDate = new Date(g.submission_date);
          const resolutionDate = new Date(g.resolution_date);
          const diffDays = Math.ceil((resolutionDate - submissionDate) / (1000 * 60 * 60 * 24));
          return sum + diffDays;
        }
        return sum;
      }, 0);
      avgResolutionTime = Math.round(totalResolutionTime / resolvedGrievances.length);
    }
    
    const stats = {
      overview: {
        total,
        resolved,
        pending,
        rejected,
        resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
        avgResolutionTime
      },
      priorities: priorityStats,
      categories: categoryStats,
      monthly: monthlyStats,
      lastUpdated: new Date().toISOString()
    };
    
    res.json(stats);
  });
};

// Forward grievance to lecturer/department
exports.forwardGrievance = async (req, res) => {
  try {
    const { 
      grievanceId, 
      recipientEmail, 
      recipientName, 
      subject, 
      customMessage, 
      priority = 'normal' 
    } = req.body;
    
    const staffId = req.user.id;
    
    // Validate required fields
    if (!grievanceId || !recipientEmail || !recipientName || !customMessage) {
      return res.status(400).json({ 
        message: 'Missing required fields: grievanceId, recipientEmail, recipientName, or customMessage' 
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Get grievance details
    grievanceModel.getGrievanceById(grievanceId, async (err, grievance) => {
      if (err) {
        console.error('Error fetching grievance:', err);
        return res.status(500).json({ message: 'Error fetching grievance details' });
      }
      
      if (!grievance) {
        return res.status(404).json({ message: 'Grievance not found' });
      }        // Get student details
        userModel.findUserById(grievance.student_id, async (userErr, student) => {
          if (userErr) {
            console.error('Error fetching student:', userErr);
            return res.status(500).json({ message: 'Error fetching student details' });
          }
          
          // Get staff details
          userModel.findUserById(staffId, async (staffErr, staff) => {
          if (staffErr) {
            console.error('Error fetching staff:', staffErr);
            return res.status(500).json({ message: 'Error fetching staff details' });
          }
          
          // Prepare email content
          const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
              <div style="background: linear-gradient(135deg, #4fc3f7, #29b6f6); padding: 20px; border-radius: 10px 10px 0 0; color: white; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">🎓 Student Grievance Management System</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Grievance Forwarded for Resolution</p>
              </div>
              
              <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                  <h3 style="color: #856404; margin: 0 0 10px 0;">⚠️ Priority: ${priority.toUpperCase()}</h3>
                  <p style="color: #856404; margin: 0; font-size: 14px;">This grievance has been forwarded to you for resolution.</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                  <h3 style="color: #333; border-bottom: 2px solid #4fc3f7; padding-bottom: 10px;">📋 Grievance Details</h3>
                  <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr style="background: #f8f9fa;">
                      <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold; width: 30%;">Grievance ID</td>
                      <td style="padding: 10px; border: 1px solid #dee2e6;">#${grievance.id}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Type</td>
                      <td style="padding: 10px; border: 1px solid #dee2e6;">${grievance.type}</td>
                    </tr>
                    <tr style="background: #f8f9fa;">
                      <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Subcategory</td>
                      <td style="padding: 10px; border: 1px solid #dee2e6;">${grievance.subcategory || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Priority</td>
                      <td style="padding: 10px; border: 1px solid #dee2e6;">
                        <span style="background: ${grievance.priority_level === 'High' || grievance.priority_level === 'Urgent' ? '#ff4444' : grievance.priority_level === 'Medium' ? '#ff9800' : '#4caf50'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${grievance.priority_level}</span>
                      </td>
                    </tr>
                    <tr style="background: #f8f9fa;">
                      <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Status</td>
                      <td style="padding: 10px; border: 1px solid #dee2e6;">${grievance.status}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Submitted On</td>
                      <td style="padding: 10px; border: 1px solid #dee2e6;">${new Date(grievance.submission_date).toLocaleDateString()}</td>
                    </tr>
                  </table>
                </div>
                
                <div style="margin-bottom: 20px;">
                  <h3 style="color: #333; border-bottom: 2px solid #4fc3f7; padding-bottom: 10px;">👤 Student Information</h3>
                  <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr style="background: #f8f9fa;">
                      <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold; width: 30%;">Name</td>
                      <td style="padding: 10px; border: 1px solid #dee2e6;">${student.name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Email</td>
                      <td style="padding: 10px; border: 1px solid #dee2e6;">${student.email}</td>
                    </tr>
                    <tr style="background: #f8f9fa;">
                      <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Department</td>
                      <td style="padding: 10px; border: 1px solid #dee2e6;">${student.department || 'N/A'}</td>
                    </tr>
                  </table>
                </div>
                
                <div style="margin-bottom: 20px;">
                  <h3 style="color: #333; border-bottom: 2px solid #4fc3f7; padding-bottom: 10px;">📄 Grievance Description</h3>
                  <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #4fc3f7; margin-top: 15px;">
                    <p style="margin: 0; line-height: 1.6; color: #333;">${grievance.description}</p>
                  </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                  <h3 style="color: #333; border-bottom: 2px solid #4fc3f7; padding-bottom: 10px;">💬 Message from Staff</h3>
                  <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3; margin-top: 15px;">
                    <p style="margin: 0; line-height: 1.6; color: #333;">${customMessage}</p>
                    <p style="margin: 15px 0 0 0; font-size: 14px; color: #666;">
                      <strong>Forwarded by:</strong> ${staff.name} (${staff.email})
                    </p>
                  </div>
                </div>
                
                <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #155724; margin: 0 0 15px 0;">📞 Next Steps</h3>
                  <ul style="color: #155724; margin: 0; padding-left: 20px;">
                    <li>Please review the grievance details above</li>
                    <li>Take appropriate action to resolve the issue</li>
                    <li>Contact the student directly if needed: ${student.email}</li>
                    <li>Update the staff member on the resolution: ${staff.email}</li>
                    <li>Document any actions taken for future reference</li>
                  </ul>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                  <p style="color: #666; font-size: 14px; margin: 0;">
                    This email was automatically generated by the Student Grievance Management System<br>
                    For support, please contact the administration office.
                  </p>
                </div>
              </div>
            </div>
          `;
          
          // Send email using the notification system
          try {
            await notifier.sendEmail({
              to: recipientEmail,
              subject: subject || `Grievance #${grievance.id} - ${grievance.type} - Action Required`,
              html: emailContent
            });
            
            // Log the forwarding action in timeline
            const timelineEntry = {
              grievance_id: grievanceId,
              action_type: 'forwarded',
              action_description: `Grievance forwarded to ${recipientName} (${recipientEmail}) for resolution`,
              performed_by: staffId,
              metadata: {
                recipient_email: recipientEmail,
                recipient_name: recipientName,
                priority: priority,
                forwarded_by: staff.name
              }
            };
            
            timelineModel.addTimelineEntry(timelineEntry, (timelineErr) => {
              if (timelineErr) {
                console.error('Error adding timeline entry:', timelineErr);
              }
            });
            
            res.json({ 
              message: 'Grievance successfully forwarded',
              recipientName,
              recipientEmail,
              grievanceId
            });
            
          } catch (emailErr) {
            console.error('Error sending email:', emailErr);
            res.status(500).json({ 
              message: 'Failed to send email. Please check the recipient email address.' 
            });
          }
        });
      });
    });
    
  } catch (error) {
    console.error('Error in forwardGrievance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
