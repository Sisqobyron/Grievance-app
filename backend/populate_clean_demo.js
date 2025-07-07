const db = require('./models/db');

// Cameroonian names
const firstNames = [
  'Abanda', 'Achu', 'Akum', 'Ambe', 'Angu', 'Ashu', 'Atanga', 'Ayuk', 'Bakia', 'Bate',
  'Bertha', 'Bih', 'Bobga', 'Che', 'Chi', 'Divine', 'Ejong', 'Elias', 'Elvis', 'Emmanuel',
  'Epie', 'Ernest', 'Esther', 'Eta', 'Eyong', 'Fai', 'Fanny', 'Felix', 'Florence', 'Foncha',
  'Fru', 'George', 'Grace', 'Hilda', 'Ibrahim', 'Innocent', 'Irene', 'Jacqueline', 'Jane', 'Janet',
  'Jerome', 'John', 'Joseph', 'Joyce', 'Judith', 'Julius', 'Karen', 'Kenneth', 'Kevin', 'Lawrence',
  'Lydia', 'Magdalene', 'Margaret', 'Marie', 'Martin', 'Mary', 'Maureen', 'Michael', 'Moses', 'Nancy',
  'Ndip', 'Neba', 'Nfor', 'Ngala', 'Ngam', 'Nkeng', 'Noella', 'Nsoh', 'Patrick', 'Paul',
  'Peter', 'Philippa', 'Precious', 'Regina', 'Robert', 'Roland', 'Rose', 'Samuel', 'Sandra', 'Sarah',
  'Stephen', 'Susan', 'Sylvia', 'Takang', 'Tanga', 'Tawah', 'Theresa', 'Thomas', 'Valentine', 'Veronica',
  'Victor', 'Vincent', 'Vivian', 'Walters', 'William', 'Yengo', 'Yongabi', 'Zang', 'Zelda', 'Zita'
];

const lastNames = [
  'Abanda', 'Abeng', 'Achu', 'Agbor', 'Akum', 'Ambe', 'Angu', 'Ashu', 'Atanga', 'Ayuk',
  'Bakia', 'Bate', 'Bih', 'Bobga', 'Che', 'Chi', 'Doh', 'Ebai', 'Ejong', 'Elung',
  'Epie', 'Eta', 'Eyong', 'Fai', 'Foncha', 'Fru', 'Gwei', 'Jua', 'Kah', 'Kang',
  'Kashie', 'Kum', 'Makia', 'Manka', 'Mbah', 'Mbam', 'Mbeng', 'Mbua', 'Mbu', 'Memba',
  'Mendi', 'Mengang', 'Mfon', 'Momo', 'Ndip', 'Neba', 'Nfor', 'Ngala', 'Ngam', 'Nkeng',
  'Nkongho', 'Nsoh', 'Ntui', 'Oben', 'Ojong', 'Okoro', 'Sama', 'Shey', 'Takang', 'Tanga',
  'Tawah', 'Tiku', 'Timah', 'Toh', 'Wase', 'Yengo', 'Yongabi', 'Zang', 'Zeh', 'Zofoa'
];

// Departments
const departments = ['Engineering', 'Business', 'Computer Science'];
const levels = ['100', '200', '300', '400', '500'];

// Realistic grievances
const grievanceTemplates = [
  {
    type: 'Academic',
    subcategory: 'Grade Appeal',
    descriptions: [
      "My continuous assessment grade in Mathematics 205 was recorded as 45%, but when I calculated my score based on my assignments and tests, I should have received 65%. I've attempted to contact the lecturer three times but haven't received a response.",
      "I received a D on my final project in Computer Science 301, but I believe there was an error in grading. The rubric stated that my implementation met all requirements, yet I lost major points for 'incomplete functionality' without specific feedback.",
      "My thermodynamics calculations were marked wrong on the exam, but I've verified them using multiple methods and textbooks. The professor refuses to review the grading despite clear mathematical errors.",
      "The group project grade in Business Administration 280 doesn't reflect my individual contribution. Two team members didn't participate at all, but we all received the same failing grade."
    ]
  },
  {
    type: 'Financial',
    subcategory: 'Fee Disputes',
    descriptions: [
      "I was charged 50,000 FCFA for laboratory fees in Chemistry 151, but I dropped the course during the add/drop period. The bursar's office says the fee is non-refundable, but the academic calendar states lab fees are refundable during the first two weeks.",
      "My scholarship payment was reduced mid-semester without notification, causing a 350,000 FCFA balance on my account. I haven't changed my course load or family financial situation.",
      "I was charged twice for my meal plan - once when I registered and once when the system was updated. Despite providing receipts showing double payment of 180,000 FCFA, the dining services office insists I only paid once.",
      "I paid the technology fee of 25,000 FCFA for computer lab access, but the labs have been closed for maintenance for 3 weeks this semester."
    ]
  },
  {
    type: 'Infrastructure',
    subcategory: 'Facility Issues',
    descriptions: [
      "The ventilation system in the Engineering Building has been broken for two months. Classroom temperatures reach 40°C during the dry season, making it impossible to concentrate.",
      "The Computer Science lab has 40 students but only 20 working computers, forcing students to share machines during programming assignments and exams.",
      "The library's roof leaks extensively during the rainy season, damaging books and computers. Water pooling creates slip hazards.",
      "The Business lecture halls don't have functioning projectors, making it impossible for professors to show presentation slides or financial charts."
    ]
  },
  {
    type: 'Administrative',
    subcategory: 'Registration Issues',
    descriptions: [
      "The registration system enrolled me in French 101 instead of French 201, which I need for my major requirements. When I tried to correct this, I was told the higher-level course is full.",
      "My academic transcript shows I'm missing requirements that I've already completed. The transcript shows I passed Calculus II with grade 15/20, but the academic office says it's still needed.",
      "I've been trying to declare my minor in Economics for 4 months, but the paperwork keeps getting lost between departments.",
      "The student affairs office processed my course registration incorrectly, showing I'm enrolled in 4 courses when I'm actually taking 7."
    ]
  },
  {
    type: 'Housing',
    subcategory: 'Dormitory Issues',
    descriptions: [
      "My roommate in the University hostel plays loud music until 2 AM every night and has friends over making noise, despite multiple requests to keep it down.",
      "The water supply in our hostel block has been shut off for 6 days with no estimated repair time. We're unable to bathe, cook, or maintain basic hygiene.",
      "There's a severe water damage problem in my hostel room from leaking pipes that's creating mold and damaging my books and clothes.",
      "My assigned roommate has unauthorized guests staying overnight multiple times per week, making it impossible for me to study or sleep peacefully."
    ]
  }
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateEmail(firstName, lastName, role, index = '') {
  const domain = '@unibuea.cm';
  const suffix = index ? index : '';
  
  if (role === 'staff') {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${suffix}${domain}`;
  } else {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${suffix}${domain}`;
  }
}

async function clearDatabase() {
  console.log('🧹 Clearing database...');
  
  return new Promise((resolve) => {
    db.serialize(() => {
      const tables = [
        'grievance_timeline', 'notifications', 'feedback', 'messages', 
        'escalation_history', 'grievance_deadlines', 'grievance_assignments',
        'grievances', 'coordinators', 'staff', 'students', 'users'
      ];
      
      let completed = 0;
      const total = tables.length;
      
      tables.forEach(table => {
        db.run(`DELETE FROM ${table}`, (err) => {
          if (err && !err.message.includes('no such table')) {
            console.log(`Note: Could not clear ${table}: ${err.message}`);
          }
          completed++;
          if (completed === total) resolve();
        });
      });
    });
  });
}

async function createAdminUser() {
  console.log('👑 Creating admin user...');
  
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['System Administrator', 'admin@university.edu', 'demo123', 'admin'],
      function(err) {
        if (err) return reject(err);
        console.log('Created admin user with ID:', this.lastID);
        resolve(this.lastID);
      }
    );
  });
}

async function createUsers() {
  console.log('👥 Creating users...');
  
  const usedEmails = new Set();
  let userIdCounter = 2; // Start from 2 since admin is 1
  
  // Create 80 students
  const studentUsers = [];
  for (let i = 0; i < 80; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    let email = generateEmail(firstName, lastName, 'student', i);
    
    while (usedEmails.has(email)) {
      email = generateEmail(firstName, lastName, 'student', i + Math.floor(Math.random() * 100));
    }
    usedEmails.add(email);
    
    const userId = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [`${firstName} ${lastName}`, email, 'demo123', 'student'],
        function(err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
    
    studentUsers.push({ userId, name: `${firstName} ${lastName}`, email });
  }
  
  // Create 20 staff
  const staffUsers = [];
  for (let i = 0; i < 20; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    let email = generateEmail(firstName, lastName, 'staff', i);
    
    while (usedEmails.has(email)) {
      email = generateEmail(firstName, lastName, 'staff', i + Math.floor(Math.random() * 100));
    }
    usedEmails.add(email);
    
    const userId = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [`Dr. ${firstName} ${lastName}`, email, 'demo123', 'staff'],
        function(err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
    
    staffUsers.push({ userId, name: `Dr. ${firstName} ${lastName}`, email });
  }
  
  console.log(`Created ${studentUsers.length} students and ${staffUsers.length} staff`);
  return { studentUsers, staffUsers };
}

async function createStudentProfiles(studentUsers) {
  console.log('🎓 Creating student profiles...');
  
  for (const student of studentUsers) {
    const department = getRandomElement(departments);
    const level = getRandomElement(levels);
    const matricule = `STU${String(student.userId).padStart(6, '0')}`;
    
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO students (user_id, department, program, matricule, level) VALUES (?, ?, ?, ?, ?)',
        [student.userId, department, `${department} Major`, matricule, level],
        (err) => err ? reject(err) : resolve()
      );
    });
  }
  
  console.log(`Created ${studentUsers.length} student profiles`);
}

async function createStaffProfiles(staffUsers) {
  console.log('👨‍🏫 Creating staff profiles...');
  
  for (const staff of staffUsers) {
    const department = getRandomElement(departments);
    
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO staff (user_id, department) VALUES (?, ?)',
        [staff.userId, department],
        (err) => err ? reject(err) : resolve()
      );
    });
  }
  
  console.log(`Created ${staffUsers.length} staff profiles`);
}

async function createCoordinators(staffUsers) {
  console.log('👥 Creating coordinators...');
  
  const specializations = ['Academic Issues', 'Student Conduct', 'Financial Affairs', 'Campus Life'];
  const coordinatorCount = Math.min(6, staffUsers.length);
  
  for (let i = 0; i < coordinatorCount; i++) {
    const staff = staffUsers[i];
    const department = getRandomElement(departments);
    const specialization = getRandomElement(specializations);
    
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO coordinators (user_id, department, specialization, max_concurrent_cases, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [staff.userId, department, specialization, Math.floor(Math.random() * 8) + 5, 1, new Date().toISOString()],
        (err) => err ? reject(err) : resolve()
      );
    });
  }
  
  console.log(`Created ${coordinatorCount} coordinators`);
}

async function createGrievances(studentUsers) {
  console.log('📝 Creating grievances...');
  
  const statuses = ['Submitted', 'In Progress', 'Under Review', 'Resolved', 'Escalated'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];
  let grievanceCount = 0;
  
  // Create many grievances
  for (let i = 0; i < 200; i++) {
    const student = getRandomElement(studentUsers);
    const template = getRandomElement(grievanceTemplates);
    const description = getRandomElement(template.descriptions);
    const submissionDate = getRandomDate(new Date(2024, 8, 1), new Date());
    const status = getRandomElement(statuses);
    const priority = getRandomElement(priorities);
    
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO grievances (student_id, type, subcategory, description, status, submission_date, priority_level) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [student.userId, template.type, template.subcategory, description, status, submissionDate.toISOString(), priority],
        (err) => err ? reject(err) : resolve()
      );
    });
    
    grievanceCount++;
  }
  
  console.log(`Created ${grievanceCount} grievances`);
  return grievanceCount;
}

async function assignGrievances() {
  console.log('🔗 Assigning grievances to coordinators...');
  
  // Get all grievances except 'Submitted' ones
  const grievances = await new Promise((resolve, reject) => {
    db.all('SELECT id FROM grievances WHERE status != "Submitted"', (err, rows) => {
      err ? reject(err) : resolve(rows);
    });
  });
  
  // Get all coordinators
  const coordinators = await new Promise((resolve, reject) => {
    db.all('SELECT id FROM coordinators WHERE is_active = 1', (err, rows) => {
      err ? reject(err) : resolve(rows);
    });
  });
  
  let assignedCount = 0;
  for (const grievance of grievances) {
    const coordinator = getRandomElement(coordinators);
    const assignedDate = getRandomDate(new Date(2024, 8, 1), new Date());
    
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO grievance_assignments (grievance_id, coordinator_id, assigned_at, assigned_by, is_active) VALUES (?, ?, ?, ?, ?)',
        [grievance.id, coordinator.id, assignedDate.toISOString(), 1, 1],
        (err) => err ? reject(err) : resolve()
      );
    });
    
    assignedCount++;
  }
  
  console.log(`Assigned ${assignedCount} grievances to coordinators`);
}

async function main() {
  console.log('🚀 Starting fresh database population...');
  
  try {
    await clearDatabase();
    await createAdminUser();
    const { studentUsers, staffUsers } = await createUsers();
    await createStudentProfiles(studentUsers);
    await createStaffProfiles(staffUsers);
    await createCoordinators(staffUsers);
    await createGrievances(studentUsers);
    await assignGrievances();
    
    console.log('✅ Database population completed successfully!');
    console.log('📊 Summary:');
    console.log('- Admin: 1 (admin@university.edu / demo123)');
    console.log('- Students: 80 with proper user_id references');
    console.log('- Staff: 20 with proper user_id references');
    console.log('- Coordinators: 6 coordinators');
    console.log('- Grievances: ~200 with correct student_id references');
    console.log('- All user ID relationships are properly managed');
    
  } catch (error) {
    console.error('❌ Error populating database:', error);
  } finally {
    db.close();
  }
}

// Run the population script
main();
