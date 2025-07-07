const db = require('./models/db');

// Demo data arrays
const departments = ['Computer Science', 'Engineering', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Business', 'Law', 'Medicine', 'Education'];
const programs = {
  'Computer Science': ['Computer Science', 'Software Engineering', 'Information Technology', 'Cybersecurity'],
  'Engineering': ['Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Chemical Engineering'],
  'Mathematics': ['Mathematics', 'Statistics', 'Applied Mathematics'],
  'Physics': ['Physics', 'Applied Physics', 'Theoretical Physics'],
  'Chemistry': ['Chemistry', 'Biochemistry', 'Materials Science'],
  'Biology': ['Biology', 'Biotechnology', 'Molecular Biology'],
  'Business': ['Business Administration', 'Finance', 'Marketing', 'Economics'],
  'Law': ['Law', 'International Law', 'Criminal Law'],
  'Medicine': ['Medicine', 'Nursing', 'Pharmacy', 'Public Health'],
  'Education': ['Education', 'Educational Psychology', 'Curriculum Studies']
};

const grievanceTypes = ['Academic', 'Financial', 'Infrastructure', 'Harassment', 'Discrimination', 'Administrative', 'Disciplinary', 'Health', 'Housing', 'Technology'];
const subcategories = {
  'Academic': ['Grade Appeal', 'Course Content', 'Professor Conduct', 'Exam Issues', 'Assignment Problems'],
  'Financial': ['Fee Disputes', 'Scholarship Issues', 'Payment Problems', 'Refund Requests'],
  'Infrastructure': ['Facility Issues', 'Equipment Problems', 'Maintenance', 'Safety Concerns'],
  'Harassment': ['Sexual Harassment', 'Bullying', 'Verbal Abuse', 'Cyber Harassment'],
  'Discrimination': ['Racial Discrimination', 'Gender Discrimination', 'Religious Discrimination', 'Disability Discrimination'],
  'Administrative': ['Registration Issues', 'Documentation Problems', 'Policy Violations', 'Service Complaints'],
  'Disciplinary': ['Academic Misconduct', 'Behavioral Issues', 'Attendance Problems', 'Code of Conduct'],
  'Health': ['Medical Services', 'Mental Health', 'Health Insurance', 'Accessibility'],
  'Housing': ['Dormitory Issues', 'Roommate Problems', 'Housing Assignment', 'Maintenance'],
  'Technology': ['IT Support', 'System Access', 'Software Issues', 'Network Problems']
};

const statuses = ['Submitted', 'In Progress', 'Under Review', 'Escalated', 'Resolved', 'Rejected'];
const priorities = ['Low', 'Medium', 'High', 'Urgent'];
const levels = ['100', '200', '300', '400', 'Graduate', 'PhD'];

const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Mary', 'Christopher', 'Patricia', 'Daniel', 'Jennifer', 'Matthew', 'Linda', 'Anthony', 'Elizabeth', 'Mark', 'Barbara', 'Steven', 'Susan', 'Paul', 'Jessica', 'Andrew', 'Karen', 'Joshua', 'Nancy', 'Kenneth', 'Betty', 'Kevin', 'Helen', 'Brian', 'Sandra', 'George', 'Donna', 'Edward', 'Carol', 'Ronald', 'Ruth', 'Timothy', 'Sharon', 'Jason', 'Michelle', 'Jeffrey', 'Laura', 'Ryan', 'Sarah', 'Jacob', 'Kimberly', 'Gary', 'Deborah'];

const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

const grievanceDescriptions = [
  "The professor consistently arrives late to class and often cancels lectures without prior notice.",
  "The grading criteria for this course are unclear and seem to change arbitrarily.",
  "I was charged an unexpected fee that was not mentioned during registration.",
  "The air conditioning in the lecture hall has been broken for two weeks.",
  "I received inappropriate comments from a staff member during office hours.",
  "My scholarship payment has been delayed for over a month without explanation.",
  "The online learning platform frequently crashes during important deadlines.",
  "The laboratory equipment is outdated and poses safety risks to students.",
  "I was denied access to the library despite having valid student credentials.",
  "The course syllabus was changed mid-semester without student consultation.",
  "Discriminatory remarks were made during a class discussion.",
  "The dining hall food quality has significantly deteriorated this semester.",
  "My room assignment was changed without prior notification or consent.",
  "The registration system malfunctioned and I was enrolled in wrong courses.",
  "Parking spaces designated for students are being used by faculty members.",
  "The student health center has extremely long waiting times for appointments.",
  "I was falsely accused of academic dishonesty without proper investigation.",
  "The career counseling services are inadequate and unhelpful.",
  "Noise levels in the dormitory are disruptive to studying and sleeping.",
  "The campus WiFi is unreliable and affects online learning activities."
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateEmail(firstName, lastName, index = '') {
  const suffix = index ? index : '';
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${suffix}@university.edu`;
}

async function clearDemoData() {
  console.log('Clearing existing demo data...');
  
  return new Promise((resolve) => {
    db.serialize(() => {
      // Check if tables exist and clear them
      const tablesToClear = [
        'grievance_timeline', 'notifications', 'feedback', 'messages', 
        'escalation_history', 'grievance_deadlines', 'grievances', 'coordinators', 
        'staff', 'students'
      ];
      
      let completed = 0;
      const total = tablesToClear.length + 1; // +1 for users table
      
      tablesToClear.forEach(table => {
        db.run(`DELETE FROM ${table}`, (err) => {
          if (err && err.message.includes('no such table')) {
            // Table doesn't exist, that's fine
          } else if (err) {
            console.log(`Note: Could not clear ${table}: ${err.message}`);
          }
          completed++;
          if (completed === total) resolve();
        });
      });
      
      // Clear demo users (keep existing admin users)
      db.run('DELETE FROM users WHERE email LIKE "%@university.edu"', (err) => {
        if (err && err.message.includes('no such table')) {
          // Table doesn't exist, that's fine
        } else if (err) {
          console.log(`Note: Could not clear users: ${err.message}`);
        }
        completed++;
        if (completed === total) resolve();
      });
    });
  });
}

async function populateUsers() {
  console.log('Creating users...');
  
  // Create admin users
  const adminUsers = [
    { name: 'System Administrator', email: 'admin@university.edu', role: 'admin' },
    { name: 'Super Admin', email: 'superadmin@university.edu', role: 'admin' },
    { name: 'Dean of Students', email: 'dean@university.edu', role: 'admin' }
  ];

  // Create staff users
  const staffUsers = [];
  for (let i = 0; i < 25; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    staffUsers.push({
      name: `${firstName} ${lastName}`,
      email: generateEmail(firstName, lastName, `staff${i}`),
      role: 'staff'
    });
  }

  // Create student users
  const studentUsers = [];
  for (let i = 0; i < 100; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    studentUsers.push({
      name: `${firstName} ${lastName}`,
      email: generateEmail(firstName, lastName, `stu${i}`),
      role: 'student'
    });
  }

  const allUsers = [...adminUsers, ...staffUsers, ...studentUsers];
  const password = 'demo123'; // Plain text password for demo

  for (const user of allUsers) {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [user.name, user.email, password, user.role],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  console.log(`Created ${allUsers.length} users`);
}

async function populateStudents() {
  console.log('Creating student profiles...');
  
  // Get all student users
  const students = await new Promise((resolve, reject) => {
    db.all('SELECT id FROM users WHERE role = "student"', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  for (const student of students) {
    const department = getRandomElement(departments);
    const program = getRandomElement(programs[department]);
    const level = getRandomElement(levels);
    const matricule = `STU${String(student.id).padStart(6, '0')}`;

    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO students (user_id, matricule, department, program, level) VALUES (?, ?, ?, ?, ?)',
        [student.id, matricule, department, program, level],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  console.log(`Created ${students.length} student profiles`);
}

async function populateStaff() {
  console.log('Creating staff profiles...');
  
  // Get all staff users
  const staff = await new Promise((resolve, reject) => {
    db.all('SELECT id FROM users WHERE role = "staff"', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  for (const staffMember of staff) {
    const department = getRandomElement(departments);

    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO staff (user_id, department) VALUES (?, ?)',
        [staffMember.id, department],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  console.log(`Created ${staff.length} staff profiles`);
}

async function populateCoordinators() {
  console.log('Creating coordinators...');
  
  // Get some staff members to be coordinators
  const staff = await new Promise((resolve, reject) => {
    db.all('SELECT user_id, department FROM staff LIMIT 15', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  const specializations = [
    'Academic Appeals', 'Financial Disputes', 'Infrastructure Issues', 'Harassment Cases',
    'Discrimination Matters', 'Administrative Issues', 'Disciplinary Actions', 'Health Concerns',
    'Housing Problems', 'Technology Support', 'Student Welfare', 'Academic Integrity',
    'Accessibility Services', 'International Student Affairs', 'Graduate Student Affairs'
  ];

  for (let i = 0; i < staff.length; i++) {
    const staffMember = staff[i];
    const specialization = specializations[i] || getRandomElement(specializations);
    const maxCases = Math.floor(Math.random() * 20) + 10; // 10-30 cases

    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO coordinators (user_id, department, specialization, max_concurrent_cases) VALUES (?, ?, ?, ?)',
        [staffMember.user_id, staffMember.department, specialization, maxCases],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  console.log(`Created ${staff.length} coordinators`);
}

async function populateGrievances() {
  console.log('Creating grievances...');
  
  // Get all students
  const students = await new Promise((resolve, reject) => {
    db.all('SELECT user_id FROM students', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Create 150 grievances
  for (let i = 0; i < 150; i++) {
    const student = getRandomElement(students);
    const type = getRandomElement(grievanceTypes);
    const subcategory = getRandomElement(subcategories[type]);
    const description = getRandomElement(grievanceDescriptions);
    const priority = getRandomElement(priorities);
    const status = getRandomElement(statuses);
    
    // Create submission dates over the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const submissionDate = getRandomDate(sixMonthsAgo, new Date());

    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO grievances (student_id, type, subcategory, description, status, priority_level, submission_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [student.user_id, type, subcategory, description, status, priority, submissionDate.toISOString()],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  console.log('Created 150 grievances');
}

async function assignGrievancesToCoordinators() {
  console.log('Assigning grievances to coordinators...');
  
  // Get all coordinators
  const coordinators = await new Promise((resolve, reject) => {
    db.all('SELECT id, department, max_concurrent_cases FROM coordinators', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Get all grievances that are not resolved/rejected
  const assignableGrievances = await new Promise((resolve, reject) => {
    db.all(`
      SELECT g.id, s.department 
      FROM grievances g 
      JOIN students s ON g.student_id = s.user_id 
      WHERE g.status NOT IN ('Resolved', 'Rejected')
      ORDER BY RANDOM()
    `, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Assign grievances to coordinators
  for (const grievance of assignableGrievances) {
    // Find coordinators in the same department
    const departmentCoordinators = coordinators.filter(c => c.department === grievance.department);
    
    if (departmentCoordinators.length > 0) {
      // Randomly assign to one of the department coordinators
      const coordinator = getRandomElement(departmentCoordinators);
      
      // Update grievance with coordinator assignment
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE grievances SET assigned_to = ? WHERE id = ?',
          [coordinator.id, grievance.id],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
  }

async function populateDeadlines() {
  console.log('Creating deadlines...');
  
  // Get all grievances
  const allGrievances = await new Promise((resolve, reject) => {
    db.all('SELECT id, submission_date FROM grievances', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Get staff users to assign as creators
  const staff = await new Promise((resolve, reject) => {
    db.all('SELECT id FROM users WHERE role IN ("staff", "admin")', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  const deadlineTypes = ['Initial Review', 'Investigation', 'Resolution', 'Final Response', 'Follow-up'];

  for (const grievance of allGrievances) {
    const submissionDate = new Date(grievance.submission_date);
    
    // Create 1-2 deadlines per grievance
    const deadlineCount = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < deadlineCount; i++) {
      // Create deadline 1-4 weeks from submission
      const deadline = new Date(submissionDate);
      deadline.setDate(deadline.getDate() + Math.floor(Math.random() * 21) + 7);
      
      const deadlineType = getRandomElement(deadlineTypes);
      const creator = getRandomElement(staff);
      const isMet = Math.random() > 0.3; // 70% chance of being met
      const metAt = isMet ? new Date(deadline.getTime() - Math.random() * 86400000 * 3) : null; // Met within 3 days of deadline
      const notes = `${deadlineType} deadline for grievance processing`;

      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO grievance_deadlines (grievance_id, deadline_type, deadline_date, created_by, is_met, met_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [grievance.id, deadlineType, deadline.toISOString(), creator.id, isMet ? 1 : 0, metAt ? metAt.toISOString() : null, notes],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    }
  }

  console.log(`Created deadlines for ${allGrievances.length} grievances`);
}

async function populateTimeline() {
  console.log('Creating timeline entries...');
  
  // Get all grievances
  const timelineGrievances = await new Promise((resolve, reject) => {
    db.all('SELECT id, student_id, submission_date, status FROM grievances', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Get staff users for timeline actions
  const staff = await new Promise((resolve, reject) => {
    db.all('SELECT id FROM users WHERE role IN ("staff", "admin")', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  const actionTypes = ['submission', 'status_update', 'assignment', 'comment_added', 'file_uploaded', 'deadline_set', 'escalation'];
  const actionDescriptions = {
    'submission': 'Grievance submitted by student',
    'status_update': 'Status updated',
    'assignment': 'Assigned to coordinator',
    'comment_added': 'Comment added to case',
    'file_uploaded': 'Additional documentation uploaded',
    'deadline_set': 'Deadline established',
    'escalation': 'Case escalated to higher authority'
  };

  for (const grievance of timelineGrievances) {
    // Create 3-7 timeline entries per grievance
    const entryCount = Math.floor(Math.random() * 5) + 3;
    let currentDate = new Date(grievance.submission_date);
    
    // First entry is always submission
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO grievance_timeline (grievance_id, action_type, action_description, performed_by, performed_at) VALUES (?, ?, ?, ?, ?)',
        [grievance.id, 'submission', actionDescriptions['submission'], grievance.student_id, currentDate.toISOString()],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    
    // Add remaining timeline entries
    for (let i = 1; i < entryCount; i++) {
      const actionType = getRandomElement(actionTypes.filter(t => t !== 'submission'));
      const description = `${actionDescriptions[actionType]} - ${grievance.status}`;
      const performer = getRandomElement(staff);
      
      // Add some days between timeline entries
      currentDate.setDate(currentDate.getDate() + Math.floor(Math.random() * 3) + 1);

      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO grievance_timeline (grievance_id, action_type, action_description, performed_by, performed_at) VALUES (?, ?, ?, ?, ?)',
          [grievance.id, actionType, description, performer.id, currentDate.toISOString()],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    }
  }

  console.log('Created timeline entries for all grievances');
}

async function populateEscalations() {
  console.log('Creating escalation history...');
  
  // Get some grievances that could be escalated
  const escalationGrievances = await new Promise((resolve, reject) => {
    db.all(`
      SELECT g.id, g.student_id, g.status 
      FROM grievances g 
      ORDER BY RANDOM() 
      LIMIT 25
    `, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Get admin users for escalation
  const admins = await new Promise((resolve, reject) => {
    db.all('SELECT id FROM users WHERE role = "admin"', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Get staff users
  const staff = await new Promise((resolve, reject) => {
    db.all('SELECT id FROM users WHERE role = "staff"', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  const escalationActions = ['status_change', 'reassignment', 'priority_increase', 'admin_review'];
  const triggerReasons = [
    'Deadline exceeded',
    'Complex case requiring higher authority',
    'Student requested escalation',
    'Policy violation identified',
    'Multiple departments involved'
  ];

  for (let i = 0; i < Math.min(15, escalationGrievances.length); i++) {
    const grievance = escalationGrievances[i];
    const admin = getRandomElement(admins);
    const staffMember = getRandomElement(staff);
    const reason = getRandomElement(triggerReasons);
    const action = getRandomElement(escalationActions);
    
    const escalationDate = new Date();
    escalationDate.setDate(escalationDate.getDate() - Math.floor(Math.random() * 30));

    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO escalation_history (grievance_id, triggered_at, trigger_reason, escalation_action, previous_status, new_status, previous_assignee, new_assignee, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [grievance.id, escalationDate.toISOString(), reason, action, 'Submitted', grievance.status, staffMember.id, admin.id, admin.id],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  console.log('Created 15 escalation history entries');
}

async function populateMessages() {
  console.log('Creating messages...');
  
  // Get grievances with coordinators
  const messageGrievances = await new Promise((resolve, reject) => {
    db.all(`
      SELECT g.id, g.student_id, g.assigned_to, c.user_id as coordinator_user_id
      FROM grievances g 
      JOIN coordinators c ON g.assigned_to = c.id 
      WHERE g.assigned_to IS NOT NULL 
      LIMIT 50
    `, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  const messageTemplates = [
    'Thank you for submitting your grievance. We are reviewing your case.',
    'We need additional information to process your grievance. Please provide more details.',
    'Your grievance has been assigned to our team for investigation.',
    'We are working on resolving your issue and will update you soon.',
    'Can you please provide the date and time when this incident occurred?',
    'We have escalated your case to the appropriate department for further review.',
    'Your grievance has been resolved. Please check your student portal for details.',
    'We understand your concern and are taking immediate action.',
    'Please attend a meeting scheduled for next week to discuss your case.',
    'Additional documentation is required to proceed with your grievance.'
  ];

  for (const grievance of messageGrievances) {
    // Create 1-3 messages per grievance
    const messageCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < messageCount; i++) {
      const isFromCoordinator = Math.random() > 0.5;
      const senderId = isFromCoordinator ? grievance.coordinator_user_id : grievance.student_id;
      const receiverId = isFromCoordinator ? grievance.student_id : grievance.coordinator_user_id;
      const content = getRandomElement(messageTemplates);
      
      const messageDate = new Date();
      messageDate.setDate(messageDate.getDate() - Math.floor(Math.random() * 14));

      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO messages (grievance_id, sender_id, receiver_id, content, sent_at) VALUES (?, ?, ?, ?, ?)',
          [grievance.id, senderId, receiverId, content, messageDate.toISOString()],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    }
  }

  console.log('Created messages for communication');
}

async function populateFeedback() {
  console.log('Creating feedback...');
  
  // Get resolved grievances
  const resolvedGrievances = await new Promise((resolve, reject) => {
    db.all(`
      SELECT g.id, g.student_id
      FROM grievances g 
      WHERE g.status = 'Resolved'
    `, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  const feedbackComments = [
    'The issue was resolved quickly and professionally.',
    'I am satisfied with the outcome of my grievance.',
    'The coordinator was very helpful and understanding.',
    'The process took longer than expected but the result was fair.',
    'Excellent communication throughout the resolution process.',
    'Could have been handled more efficiently.',
    'Very professional service, thank you.',
    'The resolution exceeded my expectations.',
    'Good follow-up and clear explanations provided.',
    'Satisfied with the overall experience.'
  ];

  for (const grievance of resolvedGrievances) {
    const rating = Math.floor(Math.random() * 5) + 1; // 1-5 stars
    const comment = getRandomElement(feedbackComments);
    
    const feedbackDate = new Date();
    feedbackDate.setDate(feedbackDate.getDate() - Math.floor(Math.random() * 7));

    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO feedback (grievance_id, user_id, rating, comments, submitted_at) VALUES (?, ?, ?, ?, ?)',
        [grievance.id, grievance.student_id, rating, comment, feedbackDate.toISOString()],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  console.log(`Created feedback for ${resolvedGrievances.length} resolved grievances`);
}

async function populateNotifications() {
  console.log('Creating notifications...');
  
  // Get all users
  const users = await new Promise((resolve, reject) => {
    db.all('SELECT id, role FROM users', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  const notificationTypes = ['grievance_submitted', 'status_update', 'deadline_reminder', 'message_received', 'escalation_notice'];
  const notificationMessages = {
    'grievance_submitted': 'A new grievance has been submitted',
    'status_update': 'Your grievance status has been updated',
    'deadline_reminder': 'Deadline approaching for grievance resolution',
    'message_received': 'You have received a new message',
    'escalation_notice': 'A grievance has been escalated'
  };

  // Create notifications for users
  for (const user of users) {
    const notificationCount = Math.floor(Math.random() * 8) + 2; // 2-10 notifications per user
    
    for (let i = 0; i < notificationCount; i++) {
      const type = getRandomElement(notificationTypes);
      const message = notificationMessages[type];
      const isRead = Math.random() > 0.3; // 70% chance of being read
      
      const notificationDate = new Date();
      notificationDate.setDate(notificationDate.getDate() - Math.floor(Math.random() * 30));

      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO notifications (user_id, type, message, is_read, created_at) VALUES (?, ?, ?, ?, ?)',
          [user.id, type, message, isRead ? 1 : 0, notificationDate.toISOString()],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    }
  }

  console.log(`Created notifications for ${users.length} users`);
}

async function main() {
  try {
    console.log('🚀 Starting database population with demo data...\n');
    
    // Clear existing demo data
    await clearDemoData();

    await populateUsers();
    await populateStudents();
    await populateStaff();
    await populateCoordinators();
    await populateGrievances();
    await assignGrievancesToCoordinators();
    await populateDeadlines();
    await populateTimeline();
    await populateEscalations();
    await populateMessages();
    await populateFeedback();
    await populateNotifications();

    console.log('\n✅ Database population completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Users: 128 (3 admins, 25 staff, 100 students)');
    console.log('- Coordinators: 15 across different departments');
    console.log('- Grievances: 150 with realistic distribution');
    console.log('- Deadlines: Set for all grievances');
    console.log('- Timeline: Complete activity history');
    console.log('- Escalations: 15 escalation history entries');
    console.log('- Messages: Communication between students and coordinators');
    console.log('- Feedback: Ratings and comments for resolved cases');
    console.log('- Notifications: System alerts for all users');
    
    console.log('\n🎯 Your application is now ready for demonstration!');
    console.log('\n📝 Demo login credentials:');
    console.log('Admin: admin@university.edu / demo123');
    console.log('Staff: Any staff email / demo123');
    console.log('Student: Any student email / demo123');
    
  } catch (error) {
    console.error('❌ Error populating database:', error);
  } finally {
    db.close();
  }
}

// Run the population script
main();
