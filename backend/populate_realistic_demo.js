const db = require('./models/db');

// Realistic student data with Cameroonian names
const realFirstNames = [
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

const realLastNames = [
  'Abanda', 'Abeng', 'Achu', 'Agbor', 'Akum', 'Ambe', 'Angu', 'Ashu', 'Atanga', 'Ayuk',
  'Bakia', 'Bate', 'Bih', 'Bobga', 'Che', 'Chi', 'Doh', 'Ebai', 'Ejong', 'Elung',
  'Epie', 'Eta', 'Eyong', 'Fai', 'Foncha', 'Fru', 'Gwei', 'Jua', 'Kah', 'Kang',
  'Kashie', 'Kum', 'Makia', 'Manka', 'Mbah', 'Mbam', 'Mbeng', 'Mbua', 'Mbu', 'Memba',
  'Mendi', 'Mengang', 'Mfon', 'Momo', 'Ndip', 'Neba', 'Nfor', 'Ngala', 'Ngam', 'Nkeng',
  'Nkongho', 'Nsoh', 'Ntui', 'Oben', 'Ojong', 'Okoro', 'Sama', 'Shey', 'Takang', 'Tanga',
  'Tawah', 'Tiku', 'Timah', 'Toh', 'Wase', 'Yengo', 'Yongabi', 'Zang', 'Zeh', 'Zofoa'
];

// Realistic grievance scenarios
const realGrievances = [
  {
    type: 'Academic',
    subcategory: 'Grade Appeal',
    descriptions: [
      "I received a D on my final project in Computer Science 301, but I believe there was an error in grading. The rubric stated that my implementation met all requirements, yet I lost major points for 'incomplete functionality' without specific feedback on what was missing.",
      "My continuous assessment grade in Mathematics 205 was recorded as 45%, but when I calculated my score based on my assignments and tests, I should have received 65%. I've attempted to contact the lecturer three times but haven't received a response.",
      "I submitted my term paper for History 340 on time to the department secretary, but it shows as 'not submitted' and I was given a zero. I have a receipt from the secretary confirming my submission and need this corrected immediately.",
      "The group project grade in Business Administration 280 doesn't reflect my individual contribution. Two team members didn't participate at all, but we all received the same failing grade. I have documented evidence of my work and emails showing their non-participation."
    ]
  },
  {
    type: 'Financial',
    subcategory: 'Fee Disputes',
    descriptions: [
      "I was charged 50,000 FCFA for laboratory fees in Chemistry 151, but I dropped the course during the add/drop period. The bursar's office says the fee is non-refundable, but the academic calendar states lab fees are refundable during the first two weeks.",
      "My scholarship payment was reduced mid-semester without notification, causing a 350,000 FCFA balance on my account. I haven't changed my course load or family financial situation, and the financial aid office can't explain why this happened.",
      "I paid the technology fee of 25,000 FCFA for computer lab access, but the labs have been closed for maintenance for 3 weeks this semester, severely impacting my ability to complete programming assignments.",
      "I was charged twice for my meal plan - once when I registered and once when the system was updated. Despite providing receipts showing double payment of 180,000 FCFA, the dining services office insists I only paid once."
    ]
  },
  {
    type: 'Infrastructure',
    subcategory: 'Facility Issues',
    descriptions: [
      "The ventilation system in the Engineering Building has been broken for two months. Classroom temperatures reach 40°C during the dry season, making it impossible to concentrate or take notes properly. Multiple maintenance requests have been ignored.",
      "The only elevator in the Science Building is frequently out of order, forcing students with disabilities to climb 4 flights of stairs to reach the physics laboratories. This violates accessibility standards and is particularly difficult during the rainy season.",
      "There are serious safety hazards in the Mechanical Engineering workshop - exposed electrical wires, broken safety equipment, and no fire extinguishers. Students are being asked to operate machinery in dangerous conditions.",
      "The library's roof leaks extensively during the rainy season, damaging books and computers. Water pooling creates slip hazards, and several students have fallen. The humid environment is also affecting students with respiratory conditions."
    ]
  },
  {
    type: 'Harassment',
    subcategory: 'Sexual Harassment',
    descriptions: [
      "Professor Williams in the Economics department has made repeated inappropriate comments about my appearance and has asked me to meet him privately outside of office hours. I'm uncomfortable attending his class and need this addressed immediately.",
      "A teaching assistant in my lab section has been sending me unwanted personal messages through the course messaging system, asking me out and making suggestive comments. I've asked him to stop but the behavior continues.",
      "During a study group, another student made explicit sexual comments and inappropriate physical contact despite my clear objections. This has created a hostile learning environment that's affecting my academic performance.",
      "A staff member in the registrar's office made unwelcome advances and inappropriate touching when I went to resolve a transcript issue. I feel unsafe returning to that office for necessary administrative tasks."
    ]
  },
  {
    type: 'Discrimination',
    subcategory: 'Racial Discrimination',
    descriptions: [
      "In my Political Science class, the professor consistently dismisses my contributions and makes assumptions about my background based on my race. Other students have noticed this pattern of discriminatory behavior.",
      "I was denied entry to a campus event by security despite having a valid student ID, while white students without IDs were allowed in. The security guard made racially insensitive comments about 'people like me' not belonging at university events.",
      "My advisor in the Engineering department has repeatedly steered me away from advanced courses, suggesting I might be 'more comfortable' in easier tracks, despite my strong academic record. This appears to be based on racial stereotypes.",
      "During a career fair, multiple employers skipped over me or gave shorter, less engaged conversations compared to white students with similar qualifications. One recruiter made a comment about 'cultural fit' that seemed racially motivated."
    ]
  },
  {
    type: 'Administrative',
    subcategory: 'Registration Issues',
    descriptions: [
      "The registration system enrolled me in French 101 instead of French 201, which I need for my Linguistics major requirements. When I tried to correct this, I was told the higher-level course is full, but the system should have prevented this enrollment error.",
      "My academic transcript shows I'm missing requirements that I've already completed. The transcript shows I passed Calculus II with grade 15/20, but the academic office says it's still needed for my Engineering program completion.",
      "I've been trying to declare my minor in Economics for 4 months, but the paperwork keeps getting lost between the Faculty of Arts and Faculty of Social Sciences. Each faculty claims the other is responsible, and I'm approaching final year without this resolved.",
      "The student affairs office processed my course registration incorrectly, showing I'm enrolled in 4 courses when I'm actually taking 7. This affects my student status and eligibility for financial aid, and could impact my ability to graduate on time."
    ]
  },
  {
    type: 'Housing',
    subcategory: 'Dormitory Issues',
    descriptions: [
      "My roommate in the University hostel plays loud music until 2 AM every night and has friends over making noise, despite multiple requests to keep it down. The hostel warden has been notified but says they can't do anything without 'formal written complaints' from multiple residents.",
      "The water supply in our hostel block has been shut off for 6 days with no estimated repair time. We're unable to bathe, cook, or maintain basic hygiene, and alternative accommodation hasn't been provided despite our requests.",
      "There's a severe water damage problem in my hostel room from leaking pipes that's creating mold and damaging my books and clothes. Maintenance says it's 'not urgent enough' for immediate action, but the conditions are becoming uninhabitable.",
      "My assigned roommate has unauthorized guests staying overnight multiple times per week, making it impossible for me to study or sleep peacefully. The hostel administration says this doesn't violate occupancy rules, despite the clear disruption to my academic work."
    ]
  },
  {
    type: 'Technology',
    subcategory: 'System Access',
    descriptions: [
      "I've been locked out of the student portal for 2 weeks due to a 'system error' that IT claims they're working on. I can't access grades, register for next semester, or view my financial aid status.",
      "The campus WiFi doesn't work in 60% of the library, forcing students to compete for the few areas with connectivity. This severely limits our ability to research and complete online assignments.",
      "My student email account was hacked and used to send spam, resulting in my account being suspended. IT restored it but now I can't access Canvas or other educational platforms that use email authentication.",
      "The online exam system crashed during my final in Statistics 301, losing my progress after 45 minutes of work. The professor says I have to retake the entire exam, which seems unfair given the technical failure."
    ]
  },
  {
    type: 'Health',
    subcategory: 'Mental Health',
    descriptions: [
      "I've been trying to schedule a counseling appointment for anxiety and depression for 6 weeks, but the earliest availability is 3 months away. My academic performance is suffering and I need immediate support.",
      "The campus counseling center scheduled me for only 3 sessions total, saying they have limited resources. My therapist recommended ongoing treatment, but the center says they can't accommodate long-term therapy needs.",
      "During a mental health crisis, I was told by campus security to 'just calm down' and was threatened with disciplinary action instead of being connected with appropriate counseling resources.",
      "I requested accommodations for my anxiety disorder through the disability services office 8 weeks ago but haven't heard back. Meanwhile, I'm struggling with timed exams and public speaking requirements."
    ]
  },
  {
    type: 'Academic',
    subcategory: 'Engineering Issues',
    descriptions: [
      "The Materials Science laboratory equipment has been broken for 3 weeks, preventing us from completing our required experiments for the semester. The instructor says we still need to submit the lab reports despite not being able to collect data.",
      "My Civil Engineering design project was rejected because the software license expired and I couldn't complete the structural analysis. The department should have renewed the AutoCAD license before the deadline.",
      "In Mechanical Engineering 340, the professor changed the final project requirements 2 weeks before the due date, requiring specialized equipment that isn't available in our workshop. This creates an impossible situation for students.",
      "The Electrical Engineering lab safety protocols are not being followed. Students are working with high voltage without proper supervision, and several near-miss incidents have occurred that weren't reported.",
      "My thermodynamics calculations were marked wrong on the exam, but I've verified them using multiple methods and textbooks. The professor refuses to review the grading despite clear mathematical errors."
    ]
  },
  {
    type: 'Academic',
    subcategory: 'Business Issues',
    descriptions: [
      "The Business Ethics course syllabus promised guest speakers from industry, but none have appeared this semester. We're paying full tuition for a substandard experience that doesn't match what was advertised.",
      "My Marketing 350 group project partner plagiarized their entire section from online sources, but the professor gave us both zero credit. I should not be penalized for another student's academic dishonesty.",
      "The Financial Accounting professor consistently arrives 20 minutes late to class and ends early, reducing our 3-credit course to barely 2 hours of instruction per week. This affects our learning and value for money.",
      "For Business Statistics, we were told to use Excel for analysis, but the computers in the business lab don't have the required add-ins installed. The IT department says it's not their responsibility to update business software.",
      "My entrepreneurship business plan was stolen by another student who submitted it as their own work. Despite providing evidence of my original drafts and research, the professor claims he can't determine who created it first."
    ]
  },
  {
    type: 'Academic',
    subcategory: 'Computer Science Issues',
    descriptions: [
      "The Computer Networks lab requires us to configure actual servers, but the university's equipment is from 2010 and doesn't support current networking protocols. We're learning outdated technology that won't help in the job market.",
      "My Database Systems project was corrupted when the university server crashed, and there are no backups. I lost 6 weeks of work and the professor expects me to recreate everything in the remaining 2 weeks of the semester.",
      "The Programming Languages course was supposed to cover Python, Java, and C++, but the instructor only knows COBOL and FORTRAN. We're not learning relevant modern programming skills despite the course description.",
      "During the Software Engineering final exam, the coding environment crashed repeatedly, preventing students from completing their programming tasks. The exam wasn't rescheduled despite the technical failures affecting everyone.",
      "The Computer Graphics course requires expensive software licenses that students must purchase individually, costing over 100,000 FCFA. This wasn't mentioned during registration and creates a financial barrier to course completion."
    ]
  },
  {
    type: 'Infrastructure',
    subcategory: 'Engineering Facilities',
    descriptions: [
      "The Engineering workshop's power supply is unstable, causing voltage fluctuations that damage student projects and expensive equipment. Three students have lost their final projects due to electrical surges.",
      "The structural testing laboratory has a leaking roof that drips water onto sensitive measurement equipment. During the rainy season, we can't conduct accurate tests, delaying all our coursework.",
      "The Chemical Engineering fume hoods aren't working properly, exposing students to toxic vapors during laboratory sessions. This creates serious health risks that the department continues to ignore.",
      "The Engineering building's internet connection is so slow that we can't download CAD software updates or access online engineering databases required for our research projects."
    ]
  },
  {
    type: 'Infrastructure',
    subcategory: 'Business Facilities',
    descriptions: [
      "The Business lecture halls don't have functioning projectors, making it impossible for professors to show presentation slides or financial charts essential for our courses.",
      "The Business library's computers are infected with malware that redirects financial websites to fake pages, making it dangerous to conduct online business research or access legitimate financial databases.",
      "The conference room used for business presentations has terrible acoustics and no microphone system, making it difficult for classmates and visiting industry professionals to hear student presentations.",
      "Air conditioning in the Business building has been broken for 2 months during the hottest season, with temperatures reaching unbearable levels that make concentration and professional presentations impossible."
    ]
  },
  {
    type: 'Infrastructure',
    subcategory: 'Computer Science Facilities',
    descriptions: [
      "The Computer Science lab has 30 students but only 15 working computers, forcing students to share machines during programming assignments and exams, which compromises the integrity of individual assessments.",
      "The server room housing our student projects flooded during the last rainy season, destroying months of programming work. No backup system was in place despite repeated student requests for data protection.",
      "The network switches in the CS building overheat regularly, causing internet outages that prevent students from accessing online coding platforms and submitting assignments on time.",
      "The programming lab's keyboards and mice are in terrible condition, with many keys not working. This makes coding assignments extremely difficult and slows down our learning process significantly."
    ]
  }
];

// Realistic coordinator messages
const coordinatorMessages = [
  "Thank you for submitting your grievance. I've reviewed the initial details and will begin investigating this matter within the next 2 business days.",
  "I've contacted the relevant department regarding your concern. Could you please provide any additional documentation or evidence that might support your case?",
  "I understand this situation has been frustrating for you. I'm working with the department head to find a resolution and will update you by Friday.",
  "Based on my investigation, it appears there may have been a misunderstanding. I'd like to schedule a meeting with you and the other party to discuss this further.",
  "I've escalated your case to the Dean's office as it requires higher-level authority to resolve. You should expect to hear from them within 5 business days.",
  "Good news - I've been able to resolve the administrative error you reported. The correction has been processed and should be reflected in your records within 24 hours.",
  "I need to gather some additional information before proceeding. Could you please clarify the specific dates and times when these incidents occurred?",
  "I've spoken with all relevant parties and have a proposed resolution. Please let me know if you'd like to schedule a time to discuss this solution.",
  "Your case has been complicated by policy changes that occurred mid-semester. I'm working with the administration to determine how these changes apply to your situation.",
  "I apologize for the delay in my response. I've been waiting for information from the legal department before proceeding with your harassment complaint."
];

// Realistic student responses
const studentResponses = [
  "Thank you for looking into this. I have additional email evidence that I can forward to support my case.",
  "I appreciate your quick response. Yes, I'm available to meet this week to discuss the situation further.",
  "This has been ongoing for months and I'm frustrated that it's taking so long to resolve. When can I expect a final decision?",
  "I don't agree with the proposed resolution. Can we explore other options or escalate this to a higher authority?",
  "Thank you for the update. I'll gather the additional documentation you requested and send it by tomorrow.",
  "I'm concerned about potential retaliation if I proceed with this complaint. What protections are in place for students who file grievances?",
  "The situation has actually gotten worse since I filed the complaint. I need more immediate intervention.",
  "I understand the process takes time, but this is affecting my ability to complete my coursework. Is there any interim solution available?",
  "Could you please clarify what specific evidence would be most helpful for my case?",
  "I've been contacted by the other party mentioned in my complaint. Should I continue those conversations or direct them to you?"
];

// Realistic feedback comments
const feedbackComments = [
  "The coordinator was very professional and kept me informed throughout the process.",
  "It took longer than expected to resolve, but I'm satisfied with the final outcome.",
  "I felt heard and supported during a difficult situation. Thank you for taking my concerns seriously.",
  "The resolution didn't fully address my concerns, but I appreciate the effort made.",
  "Excellent communication and follow-up. The coordinator went above and beyond to help.",
  "The process was confusing and I wasn't sure what was happening for several weeks.",
  "Very thorough investigation and fair resolution. I would recommend this process to other students.",
  "While the outcome wasn't what I hoped for, the process was transparent and well-handled.",
  "The coordinator was empathetic and understanding of my situation.",
  "I wish the process had been faster, but I understand these things take time to investigate properly."
];

// Helper functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateRealisticEmail(firstName, lastName, isStaff = false, index = '') {
  const domain = '@unibuea.cm';  // University of Buea domain
  const suffix = index ? index : '';
  
  if (isStaff) {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${suffix}${domain}`;
  } else {
    // Students often have numbers or different formats
    const formats = [
      `${firstName.toLowerCase()}.${lastName.toLowerCase()}${suffix}${domain}`,
      `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}${domain}`,
      `${firstName.toLowerCase()}${suffix}${domain}`,
      `${firstName.toLowerCase()}.${lastName.charAt(0).toLowerCase()}${suffix}${domain}`
    ];
    return getRandomElement(formats);
  }
}

async function clearAllData() {
  console.log('🧹 Clearing existing data...');
  
  return new Promise((resolve) => {
    db.serialize(() => {
      const tables = [
        'grievance_timeline', 'notifications', 'feedback', 'messages', 
        'escalation_history', 'grievance_deadlines', 'grievance_assignments',
        'grievances', 'coordinators', 'staff', 'students'
      ];
      
      let completed = 0;
      const total = tables.length + 1; // +1 for users table
      
      tables.forEach(table => {
        db.run(`DELETE FROM ${table}`, (err) => {
          completed++;
          if (completed === total) resolve();
        });
      });
      
      // Keep admin users, clear demo users
      db.run('DELETE FROM users WHERE email LIKE "%@university.edu"', (err) => {
        completed++;
        if (completed === total) resolve();
      });
    });
  });
}

async function createRealisticUsers() {
  console.log('👥 Creating realistic users...');
  
  // Create diverse student users
  const students = [];
  const usedEmails = new Set();
  
  for (let i = 0; i < 80; i++) {
    const firstName = getRandomElement(realFirstNames);
    const lastName = getRandomElement(realLastNames);
    let email = generateRealisticEmail(firstName, lastName, false, i);
    
    // Ensure unique emails
    while (usedEmails.has(email)) {
      email = generateRealisticEmail(firstName, lastName, false, i + Math.floor(Math.random() * 1000));
    }
    usedEmails.add(email);
    
    students.push({
      name: `${firstName} ${lastName}`,
      email: email,
      role: 'student'
    });
  }
  
  // Create staff users
  const staff = [];
  for (let i = 0; i < 20; i++) {
    const firstName = getRandomElement(realFirstNames);
    const lastName = getRandomElement(realLastNames);
    let email = generateRealisticEmail(firstName, lastName, true, i);
    
    while (usedEmails.has(email)) {
      email = generateRealisticEmail(firstName, lastName, true, i + Math.floor(Math.random() * 100));
    }
    usedEmails.add(email);
    
    staff.push({
      name: `Dr. ${firstName} ${lastName}`,
      email: email,
      role: 'staff'
    });
  }
  
  // Insert all users
  const allUsers = [...students, ...staff];
  for (const user of allUsers) {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [user.name, user.email, 'demo123', user.role],
        (err) => err ? reject(err) : resolve()
      );
    });
  }
  
  console.log(`Created ${allUsers.length} realistic users (${students.length} students, ${staff.length} staff)`);
  return { students, staff };
}

async function createStudentProfiles(students) {
  console.log('🎓 Creating student profiles...');
  
  const departments = ['Engineering', 'Business', 'Computer Science'];
  const levels = ['100', '200', '300', '400', '500'];
  
  for (let i = 0; i < students.length; i++) {
    const department = getRandomElement(departments);
    const level = getRandomElement(levels);
    
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO students (user_id, department, program, matricule, level) VALUES (?, ?, ?, ?, ?)',
        [i + 1, department, `${department} Major`, `STU${String(i + 1).padStart(6, '0')}`, level],
        (err) => err ? reject(err) : resolve()
      );
    });
  }
  
  console.log(`Created ${students.length} student profiles`);
}

async function createStaffProfiles(staff, studentCount) {
  console.log('👨‍🏫 Creating staff profiles...');
  
  const departments = ['Engineering', 'Business', 'Computer Science'];
  
  for (let i = 0; i < staff.length; i++) {
    const department = getRandomElement(departments);
    
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO staff (user_id, department) VALUES (?, ?)',
        [studentCount + i + 1, department],
        (err) => err ? reject(err) : resolve()
      );
    });
  }
  
  console.log(`Created ${staff.length} staff profiles`);
}

async function createCoordinators(staff, studentCount) {
  console.log('👥 Creating coordinators...');
  
  const departments = ['Engineering', 'Business', 'Computer Science'];
  const specializations = ['Academic Issues', 'Student Conduct', 'Financial Affairs', 'Campus Life'];
  
  for (let i = 0; i < Math.min(8, staff.length); i++) {
    const department = departments[i] || getRandomElement(departments);
    const specialization = getRandomElement(specializations);
    
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO coordinators (user_id, department, specialization, max_concurrent_cases, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [studentCount + i + 1, department, specialization, Math.floor(Math.random() * 8) + 5, 1, new Date().toISOString()],
        (err) => err ? reject(err) : resolve()
      );
    });
  }
  
  console.log('Created 8 coordinators');
}

async function createRealisticGrievances(studentCount) {
  console.log('📝 Creating realistic grievances...');
  
  const statuses = ['Submitted', 'In Progress', 'Under Review', 'Resolved', 'Escalated'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];
  
  let grievanceCount = 0;
  
  for (const grievanceType of realGrievances) {
    const numGrievances = Math.floor(Math.random() * 15) + 8; // 8-22 per type (more grievances)
    
    for (let i = 0; i < numGrievances; i++) {
      const studentId = Math.floor(Math.random() * studentCount) + 1;
      const description = getRandomElement(grievanceType.descriptions);
      const submissionDate = getRandomDate(new Date(2024, 8, 1), new Date()); // From Sept 2024 to now
      const status = getRandomElement(statuses);
      const priority = getRandomElement(priorities);
      
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO grievances (student_id, type, subcategory, description, status, submission_date, priority_level) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [studentId, grievanceType.type, grievanceType.subcategory, description, status, submissionDate.toISOString(), priority],
          (err) => err ? reject(err) : resolve()
        );
      });
      
      grievanceCount++;
    }
  }
  
  console.log(`Created ${grievanceCount} realistic grievances`);
  return grievanceCount;
}

async function assignGrievancesToCoordinators() {
  console.log('🔗 Assigning grievances to coordinators...');
  
  const grievances = await new Promise((resolve, reject) => {
    db.all('SELECT id FROM grievances WHERE status != "Submitted"', (err, rows) => {
      err ? reject(err) : resolve(rows);
    });
  });
  
  const coordinators = await new Promise((resolve, reject) => {
    db.all('SELECT id FROM coordinators WHERE is_active = 1', (err, rows) => {
      err ? reject(err) : resolve(rows);
    });
  });
  
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
  }
  
  console.log(`Assigned ${grievances.length} grievances to coordinators`);
}

async function createRealisticMessages() {
  console.log('💬 Creating realistic messages...');
  
  const assignments = await new Promise((resolve, reject) => {
    db.all(`
      SELECT ga.grievance_id, ga.coordinator_id, g.student_id 
      FROM grievance_assignments ga 
      JOIN grievances g ON ga.grievance_id = g.id 
      WHERE ga.is_active = 1
    `, (err, rows) => err ? reject(err) : resolve(rows));
  });
  
  let messageCount = 0;
  
  for (const assignment of assignments) {
    const numMessages = Math.floor(Math.random() * 5) + 1; // 1-5 messages per grievance
    
    for (let i = 0; i < numMessages; i++) {
      const isFromCoordinator = Math.random() > 0.4; // 60% from coordinator
      const senderId = isFromCoordinator ? assignment.coordinator_id : assignment.student_id;
      const receiverId = isFromCoordinator ? assignment.student_id : assignment.coordinator_id;
      const content = isFromCoordinator ? getRandomElement(coordinatorMessages) : getRandomElement(studentResponses);
      const messageDate = getRandomDate(new Date(2024, 8, 1), new Date());
      
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO messages (grievance_id, sender_id, receiver_id, content, created_at) VALUES (?, ?, ?, ?, ?)',
          [assignment.grievance_id, senderId, receiverId, content, messageDate.toISOString()],
          (err) => err ? reject(err) : resolve()
        );
      });
      
      messageCount++;
    }
  }
  
  console.log(`Created ${messageCount} realistic messages`);
}

async function createRealisticFeedback() {
  console.log('⭐ Creating realistic feedback...');
  
  const resolvedGrievances = await new Promise((resolve, reject) => {
    db.all('SELECT id, student_id FROM grievances WHERE status = "Resolved"', (err, rows) => {
      err ? reject(err) : resolve(rows);
    });
  });
  
  for (const grievance of resolvedGrievances) {
    if (Math.random() > 0.3) { // 70% of resolved grievances get feedback
      const rating = Math.floor(Math.random() * 3) + 3; // 3-5 stars (mostly positive)
      const comment = getRandomElement(feedbackComments);
      
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO feedback (grievance_id, user_id, rating, comments, submitted_at) VALUES (?, ?, ?, ?, ?)',
          [grievance.id, grievance.student_id, rating, comment, new Date().toISOString()],
          (err) => err ? reject(err) : resolve()
        );
      });
    }
  }
  
  console.log(`Created feedback for ${Math.floor(resolvedGrievances.length * 0.7)} resolved grievances`);
}

async function main() {
  console.log('🚀 Starting realistic database population...');
  
  try {
    await clearAllData();
    
    const { students, staff } = await createRealisticUsers();
    await createStudentProfiles(students);
    await createStaffProfiles(staff, students.length);
    await createCoordinators(staff, students.length);
    
    const grievanceCount = await createRealisticGrievances(students.length);
    await assignGrievancesToCoordinators();
    await createRealisticMessages();
    await createRealisticFeedback();
    
    console.log('✅ Realistic database population completed!');
    console.log('📊 Summary:');
    console.log(`- Users: ${students.length + staff.length} (${students.length} students, ${staff.length} staff)`);
    console.log('- Coordinators: 8 across different departments');
    console.log(`- Grievances: ${grievanceCount} with realistic, diverse scenarios`);
    console.log('- Realistic messages, feedback, and assignments included');
    console.log('');
    console.log('📝 Demo login credentials:');
    console.log('Admin: admin@university.edu / demo123');
    console.log('Staff: Any staff email / demo123');
    console.log('Student: Any student email / demo123');
    
  } catch (error) {
    console.error('❌ Error populating database:', error);
  } finally {
    db.close();
  }
}

// Run the realistic population script
main();
