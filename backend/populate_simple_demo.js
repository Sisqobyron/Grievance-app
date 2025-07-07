const db = require('./models/db');

// Demo data arrays
const departments = ['Computer Science', 'Engineering', 'Mathematics', 'Physics', 'Chemistry', 'Biology'];
const grievanceTypes = ['Academic', 'Financial', 'Infrastructure', 'Harassment', 'Discrimination', 'Administrative'];
const statuses = ['Submitted', 'In Progress', 'Under Review', 'Escalated', 'Resolved', 'Rejected'];
const priorities = ['Low', 'Medium', 'High', 'Urgent'];

const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Mary'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateEmail(firstName, lastName, suffix = '') {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${suffix}@university.edu`;
}

async function clearData() {
  console.log('Clearing existing demo data...');
  
  const tables = ['grievance_timeline', 'notifications', 'feedback', 'messages', 
                 'escalation_history', 'grievance_deadlines', 'grievances', 
                 'coordinators', 'staff', 'students'];
  
  for (const table of tables) {
    try {
      await new Promise((resolve, reject) => {
        db.run(`DELETE FROM ${table}`, (err) => {
          if (err && !err.message.includes('no such table')) {
            console.log(`Note: Could not clear ${table}: ${err.message}`);
          }
          resolve();
        });
      });
    } catch (error) {
      // Ignore table not found errors
    }
  }
  
  // Clear demo users
  await new Promise((resolve) => {
    db.run('DELETE FROM users WHERE email LIKE "%@university.edu"', resolve);
  });
}

async function populateUsers() {
  console.log('Creating users...');
  
  const users = [
    { name: 'System Administrator', email: 'admin@university.edu', role: 'admin' },
    { name: 'Super Admin', email: 'superadmin@university.edu', role: 'admin' }
  ];

  // Add staff users
  for (let i = 0; i < 15; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    users.push({
      name: `${firstName} ${lastName}`,
      email: generateEmail(firstName, lastName, `staff${i}`),
      role: 'staff'
    });
  }

  // Add student users
  for (let i = 0; i < 50; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    users.push({
      name: `${firstName} ${lastName}`,
      email: generateEmail(firstName, lastName, `stu${i}`),
      role: 'student'
    });
  }

  for (const user of users) {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [user.name, user.email, 'demo123', user.role],
        (err) => err ? reject(err) : resolve()
      );
    });
  }

  console.log(`Created ${users.length} users`);
}

async function populateStudents() {
  console.log('Creating student profiles...');
  
  const students = await new Promise((resolve, reject) => {
    db.all('SELECT id FROM users WHERE role = "student"', (err, rows) => {
      err ? reject(err) : resolve(rows);
    });
  });

  for (const student of students) {
    const department = getRandomElement(departments);
    const matricule = `STU${String(student.id).padStart(6, '0')}`;

    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO students (user_id, matricule, department, program, level) VALUES (?, ?, ?, ?, ?)',
        [student.id, matricule, department, 'Bachelor', '300'],
        (err) => err ? reject(err) : resolve()
      );
    });
  }

  console.log(`Created ${students.length} student profiles`);
}

async function populateStaff() {
  console.log('Creating staff profiles...');
  
  const staff = await new Promise((resolve, reject) => {
    db.all('SELECT id FROM users WHERE role = "staff"', (err, rows) => {
      err ? reject(err) : resolve(rows);
    });
  });

  for (const staffMember of staff) {
    const department = getRandomElement(departments);

    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO staff (user_id, department) VALUES (?, ?)',
        [staffMember.id, department],
        (err) => err ? reject(err) : resolve()
      );
    });
  }

  console.log(`Created ${staff.length} staff profiles`);
}

async function populateCoordinators() {
  console.log('Creating coordinators...');
  
  const staff = await new Promise((resolve, reject) => {
    db.all('SELECT user_id, department FROM staff LIMIT 8', (err, rows) => {
      err ? reject(err) : resolve(rows);
    });
  });

  for (const staffMember of staff) {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO coordinators (user_id, department, specialization, max_concurrent_cases) VALUES (?, ?, ?, ?)',
        [staffMember.user_id, staffMember.department, 'General', 15],
        (err) => err ? reject(err) : resolve()
      );
    });
  }

  console.log(`Created ${staff.length} coordinators`);
}

async function populateGrievances() {
  console.log('Creating grievances...');
  
  const students = await new Promise((resolve, reject) => {
    db.all('SELECT user_id FROM students', (err, rows) => {
      err ? reject(err) : resolve(rows);
    });
  });

  for (let i = 0; i < 75; i++) {
    const student = getRandomElement(students);
    const type = getRandomElement(grievanceTypes);
    const status = getRandomElement(statuses);
    const priority = getRandomElement(priorities);
    const description = `Sample grievance description for ${type} issue`;
    
    const submissionDate = new Date();
    submissionDate.setDate(submissionDate.getDate() - Math.floor(Math.random() * 60));

    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO grievances (student_id, type, description, status, priority_level, submission_date) VALUES (?, ?, ?, ?, ?, ?)',
        [student.user_id, type, description, status, priority, submissionDate.toISOString()],
        (err) => err ? reject(err) : resolve()
      );
    });
  }

  console.log('Created 75 grievances');
}

async function assignGrievances() {
  console.log('Assigning grievances to coordinators...');
  
  const coordinators = await new Promise((resolve, reject) => {
    db.all('SELECT id, department FROM coordinators', (err, rows) => {
      err ? reject(err) : resolve(rows);
    });
  });

  const grievances = await new Promise((resolve, reject) => {
    db.all(`
      SELECT g.id, s.department 
      FROM grievances g 
      JOIN students s ON g.student_id = s.user_id 
      WHERE g.status NOT IN ('Resolved', 'Rejected')
    `, (err, rows) => {
      err ? reject(err) : resolve(rows);
    });
  });

  for (const grievance of grievances) {
    const deptCoordinators = coordinators.filter(c => c.department === grievance.department);
    
    if (deptCoordinators.length > 0) {
      const coordinator = getRandomElement(deptCoordinators);
      
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO grievance_assignments (grievance_id, coordinator_id, assigned_at, assigned_by, is_active) VALUES (?, ?, ?, 1, 1)',
          [grievance.id, coordinator.id, new Date().toISOString()],
          (err) => err ? reject(err) : resolve()
        );
      });
    }
  }

  console.log('Assigned grievances to coordinators');
}

async function populateMessages() {
  console.log('Creating messages...');
  
  const grievances = await new Promise((resolve, reject) => {
    db.all(`
      SELECT g.id, g.student_id, c.user_id as coordinator_user_id
      FROM grievances g 
      JOIN grievance_assignments ga ON g.id = ga.grievance_id
      JOIN coordinators c ON ga.coordinator_id = c.id 
      WHERE ga.is_active = 1
      LIMIT 30
    `, (err, rows) => {
      err ? reject(err) : resolve(rows);
    });
  });

  for (const grievance of grievances) {
    const messageDate = new Date();
    messageDate.setDate(messageDate.getDate() - Math.floor(Math.random() * 14));

    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO messages (grievance_id, sender_id, receiver_id, content, created_at) VALUES (?, ?, ?, ?, ?)',
        [grievance.id, grievance.coordinator_user_id, grievance.student_id, 'Thank you for your grievance submission.', messageDate.toISOString()],
        (err) => err ? reject(err) : resolve()
      );
    });
  }

  console.log('Created messages');
}

async function populateFeedback() {
  console.log('Creating feedback...');
  
  const resolvedGrievances = await new Promise((resolve, reject) => {
    db.all('SELECT id, student_id FROM grievances WHERE status = "Resolved"', (err, rows) => {
      err ? reject(err) : resolve(rows);
    });
  });

  for (const grievance of resolvedGrievances) {
    const rating = Math.floor(Math.random() * 5) + 1;
    const feedbackDate = new Date();

    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO feedback (grievance_id, user_id, rating, comments, submitted_at) VALUES (?, ?, ?, ?, ?)',
        [grievance.id, grievance.student_id, rating, 'Good service', feedbackDate.toISOString()],
        (err) => err ? reject(err) : resolve()
      );
    });
  }

  console.log(`Created feedback for ${resolvedGrievances.length} grievances`);
}

async function main() {
  try {
    console.log('🚀 Starting database population...\n');
    
    await clearData();
    await populateUsers();
    await populateStudents();
    await populateStaff();
    await populateCoordinators();
    await populateGrievances();
    await assignGrievances();
    await populateMessages();
    await populateFeedback();

    console.log('\n✅ Database population completed!');
    console.log('\n📊 Summary:');
    console.log('- Users: 67 (2 admins, 15 staff, 50 students)');
    console.log('- Coordinators: 8 across different departments');
    console.log('- Grievances: 75 with realistic distribution');
    console.log('- Messages and feedback included');
    
    console.log('\n📝 Demo login credentials:');
    console.log('Admin: admin@university.edu / demo123');
    console.log('Any staff/student email / demo123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    db.close();
  }
}

main();
