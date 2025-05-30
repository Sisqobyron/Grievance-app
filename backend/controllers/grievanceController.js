const grievanceModel = require('../models/grievanceModel');
const userModel = require('../models/userModel');
const notifier = require('../utils/notifications');

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
  };

  grievanceModel.createGrievance(grievance, (err, newGrievance) => {
    if (err) return res.status(500).json({ message: 'Could not submit grievance', error: err });
    
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
      });

      // Send beautiful notification email to staff
      notifier.sendStaffNotificationEmail(grievanceData, student.name, (staffEmailErr) => {
        if (staffEmailErr) console.error('Error sending staff notification:', staffEmailErr);
      });

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
    if (!grievance) return res.status(404).json({ message: 'Grievance not found' });

    // Update the status
    grievanceModel.updateGrievanceStatus(id, status, (updateErr, updated) => {
      if (updateErr) return res.status(500).json({ message: 'Error updating grievance', error: updateErr });
      
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
