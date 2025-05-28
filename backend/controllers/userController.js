const userModel = require('../models/userModel');
const studentModel = require('../models/studentModel');
const staffModel = require('../models/staffModel');

exports.registerUser = (req, res) => {
  const { name, email, password, role } = req.body;
  const userDetails = { name, email, password, role };

  userModel.createUser(userDetails, (err, newUser) => {
    if (err) return res.status(500).json({ message: 'Could not create user', error: err });

    const user_id = newUser.id;

    if (role === 'student') {
      const { department, program, matricule, level } = req.body;
      const studentDetails = { user_id, department, program, matricule, level };

      studentModel.createStudent(studentDetails, (err) => {
        if (err) return res.status(500).json({ message: 'Could not create student details', error: err });
        res.status(201).json({ message: 'Student registered successfully', user: newUser });
      });

    } else if (role === 'staff') {
      const { department } = req.body;
      const staffDetails = { user_id, department };

      staffModel.createStaff(staffDetails, (err) => {
        if (err) return res.status(500).json({ message: 'Could not create staff details', error: err });
        res.status(201).json({ message: 'Staff registered successfully', user: newUser });
      });

    } else {
      res.status(400).json({ message: 'Invalid role specified' });
    }
  });
};
