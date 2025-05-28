const grievanceModel = require('../models/grievanceModel');
const notifier = require('../utils/notifications');

exports.submitGrievance = (req, res) => {
  const { student_id, type, description, priority_level } = req.body;
  const file_path = req.file ? req.file.path : null;
  const submission_date = new Date().toISOString();

  const grievance = {
    student_id,
    type,
    description,
    file_path,
    submission_date,
    priority_level
  };

  grievanceModel.createGrievance(grievance, (err, newGrievance) => {
    if (err) return res.status(500).json({ message: 'Could not submit grievance', error: err });
    res.status(201).json({ message: 'Grievance submitted successfully', grievance: newGrievance });
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

  grievanceModel.updateGrievanceStatus(id, status, (err, updated) => {
    if (err) return res.status(500).json({ message: 'Error updating grievance', error: err });
    res.json({ message: 'Grievance status updated', updated });
  });
};

exports.submitGrievance = (req, res) => {
    const { student_id, type, description, priority_level } = req.body;
    const file_path = req.file ? req.file.path : null;
    const submission_date = new Date().toISOString();
  
    const grievance = {
      student_id,
      type,
      description,
      file_path,
      submission_date,
      priority_level
    };
  
    grievanceModel.createGrievance(grievance, (err, newGrievance) => {
      if (err) return res.status(500).json({ message: 'Could not submit grievance', error: err });
  
      // Trigger notification
      notifier.sendNotification(student_id, 'Your grievance has been successfully submitted.');
  
      res.status(201).json({ message: 'Grievance submitted successfully', grievance: newGrievance });
    });
  };

exports.getAllGrievances = (req, res) => {
  grievanceModel.getAllGrievances((err, grievances) => {
    if (err) return res.status(500).json({ message: 'Error retrieving grievances', error: err });
    res.json(grievances);
  });
};
