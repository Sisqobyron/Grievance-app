const userModel = require('../models/userModel');
const studentModel = require('../models/studentModel');
const staffModel = require('../models/staffModel');
const notifier = require('../utils/notifications');

exports.registerUser = (req, res) => {
  console.log('Registration request received:', req.body);
  
  // Remove confirmPassword from the request body as it's not needed for backend processing
  const { name, email, password, role } = req.body;
  
  // Validate required fields
  if (!name || !email || !password || !role) {
    console.log('Missing required fields');
    return res.status(400).json({ 
      message: 'Missing required fields', 
      required: ['name', 'email', 'password', 'role'] 
    });
  }
  
  const userDetails = { name, email, password, role };

  userModel.createUser(userDetails, (err, newUser) => {
    if (err) {
      console.error('Error creating user:', err);
      
      // Handle specific database constraint errors
      if (err.code === 'SQLITE_CONSTRAINT' || err.errno === 19) {
        if (err.message?.includes('users.email')) {
          return res.status(400).json({ message: 'Email already exists. Please use a different email address.' });
        }
        return res.status(400).json({ message: 'User with this information already exists. Please check your details.' });
      }
      
      return res.status(500).json({ message: 'Could not create user', error: err.message });
    }

    console.log('User created successfully:', newUser);
    const user_id = newUser.id;

    if (role === 'student') {
      const { department, program, matricule, level } = req.body;
      
      // Validate student-specific fields
      if (!department || !program || !matricule || !level) {
        console.log('Missing student fields');
        return res.status(400).json({ 
          message: 'Missing required student fields', 
          required: ['department', 'program', 'matricule', 'level'] 
        });
      }
      
      const studentDetails = { user_id, department, program, matricule, level };
      
      studentModel.createStudent(studentDetails, (err) => {
        if (err) {
          console.error('Error creating student:', err);
          
          // Handle specific database constraint errors
          if (err.code === 'SQLITE_CONSTRAINT' || err.errno === 19) {
            if (err.message?.includes('students.matricule')) {
              return res.status(400).json({ message: 'Matricule number already exists. Please use a different matricule number.' });
            }
            return res.status(400).json({ message: 'Student with this information already exists. Please check your details.' });
          }
          
          return res.status(500).json({ message: 'Could not create student details', error: err.message });
        }
        
        console.log('Student created successfully');
        
        // Send welcome email to new student
        const userData = {
          full_name: name,
          email: email,
          role: role
        };
        
        notifier.sendWelcomeEmail(user_id, userData, (emailErr) => {
          if (emailErr) console.error('Error sending welcome email:', emailErr);
        });
        
        res.status(201).json({ message: 'Student registered successfully', user: newUser });
      });

    } else if (role === 'staff') {
      const { department } = req.body;
      
      if (!department) {
        console.log('Missing staff department');
        return res.status(400).json({ 
          message: 'Missing required staff field', 
          required: ['department'] 
        });
      }
      
      const staffDetails = { user_id, department };
      
      staffModel.createStaff(staffDetails, (err) => {
        if (err) {
          console.error('Error creating staff:', err);
          return res.status(500).json({ message: 'Could not create staff details', error: err.message });
        }
        
        console.log('Staff created successfully');
        
        // Send welcome email to new staff member
        const userData = {
          full_name: name,
          email: email,
          role: role
        };
        
        notifier.sendWelcomeEmail(user_id, userData, (emailErr) => {
          if (emailErr) console.error('Error sending welcome email:', emailErr);
        });
        
        res.status(201).json({ message: 'Staff registered successfully', user: newUser });
      });

    } else {
      console.log('Invalid role:', role);
      res.status(400).json({ message: 'Invalid role specified' });
    }
  });
};
