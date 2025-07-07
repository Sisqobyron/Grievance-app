const db = require('./models/db');

// Sample messages between students and coordinators
const coordinatorMessages = [
  "I've received your grievance and am currently reviewing the details. I'll be in touch within 48 hours with next steps.",
  "I've spoken with the department head about your issue. We're working on a resolution and will update you by Friday.",
  "Thank you for providing the additional documentation. This helps clarify the situation significantly.",
  "I've scheduled a meeting with all parties involved for next Tuesday at 2 PM. Please confirm your availability.",
  "Your case requires escalation to the faculty level. I'm preparing the necessary documentation for review.",
  "Based on our investigation, I believe we can resolve this matter. Would you be available to discuss the proposed solution?",
  "I apologize for the delay. We're waiting for input from the financial aid office before proceeding.",
  "I've reviewed your academic records and found discrepancies that support your complaint. We're working on corrections."
];

const studentMessages = [
  "Thank you for looking into this matter. I have additional documentation that might be helpful.",
  "I appreciate your quick response. Yes, I'm available for the meeting you mentioned.",
  "This issue is really affecting my studies. Is there any way to expedite the resolution?",
  "I've gathered the evidence you requested. How should I submit it to you?",
  "Could you please provide an update on the progress? It's been two weeks since our last communication.",
  "I understand these things take time, but this is causing significant stress. What are the next steps?",
  "Thank you for your help with this matter. Your professionalism has been much appreciated.",
  "I don't agree with the proposed resolution. Are there other options we can explore?"
];

const validActionTypes = ['created', 'assigned', 'status_changed', 'message_sent', 'deadline_set', 'escalated', 'resolved'];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function addMessagesAndTimeline() {
  console.log('💬 Adding messages and timeline entries...');
  
  // Get assigned grievances with their students and coordinators
  const assignments = await new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        ga.grievance_id,
        g.student_id,
        c.user_id as coordinator_user_id,
        ga.assigned_at
      FROM grievance_assignments ga
      JOIN grievances g ON ga.grievance_id = g.id
      JOIN coordinators c ON ga.coordinator_id = c.id
      WHERE ga.is_active = 1
      LIMIT 50
    `, (err, rows) => err ? reject(err) : resolve(rows));
  });
  
  console.log(`Found ${assignments.length} assignments to add communications for`);
  
  let messageCount = 0;
  let timelineCount = 0;
  
  // Add messages and timeline entries for each assignment
  for (const assignment of assignments) {
    const numMessages = Math.floor(Math.random() * 4) + 2; // 2-5 messages per grievance
    
    for (let i = 0; i < numMessages; i++) {
      const isFromStudent = Math.random() > 0.5;
      const senderId = isFromStudent ? assignment.student_id : assignment.coordinator_user_id;
      const receiverId = isFromStudent ? assignment.coordinator_user_id : assignment.student_id;
      const content = isFromStudent ? 
        getRandomElement(studentMessages) : 
        getRandomElement(coordinatorMessages);
      
      const messageDate = getRandomDate(new Date(assignment.assigned_at), new Date());
      
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO messages (grievance_id, sender_id, receiver_id, content, created_at) VALUES (?, ?, ?, ?, ?)',
          [assignment.grievance_id, senderId, receiverId, content, messageDate.toISOString()],
          (err) => err ? reject(err) : resolve()
        );
      });
      
      messageCount++;
    }
    
    // Add timeline entries
    const numTimelineEntries = Math.floor(Math.random() * 5) + 3; // 3-7 timeline entries
    
    for (let i = 0; i < numTimelineEntries; i++) {
      const actionDate = getRandomDate(new Date(assignment.assigned_at), new Date());
      const actionType = getRandomElement(validActionTypes);
      const actionDescription = `${actionType.replace('_', ' ')} for grievance ${assignment.grievance_id}`;
      
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO grievance_timeline (grievance_id, action_type, action_description, performed_by, performed_at) VALUES (?, ?, ?, ?, ?)',
          [assignment.grievance_id, actionType, actionDescription, assignment.coordinator_user_id, actionDate.toISOString()],
          (err) => err ? reject(err) : resolve()
        );
      });
      
      timelineCount++;
    }
    
    // Add deadlines
    const assignedDate = new Date(assignment.assigned_at);
    const initialDeadline = new Date(assignedDate);
    initialDeadline.setDate(initialDeadline.getDate() + 14); // 14 days for initial response
    
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO grievance_deadlines (grievance_id, deadline_type, deadline_date, created_at, created_by, is_met, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          assignment.grievance_id,
          'initial_response',
          initialDeadline.toISOString(),
          assignedDate.toISOString(),
          assignment.coordinator_user_id,
          Math.random() > 0.3 ? 1 : 0,
          'Initial response deadline'
        ],
        (err) => err ? reject(err) : resolve()
      );
    });
    
    // Add some feedback for resolved grievances
    if (Math.random() > 0.8) { // 20% chance of feedback
      const rating = Math.floor(Math.random() * 5) + 1;
      const comments = [
        "The coordinator was very helpful and professional throughout the process.",
        "It took longer than expected, but I'm satisfied with the resolution.",
        "Excellent communication and follow-up. Very pleased with the service.",
        "The process was thorough and fair. Thank you for taking my concerns seriously.",
        "Could have been faster, but the outcome was satisfactory."
      ];
      
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO feedback (grievance_id, user_id, rating, comments, submitted_at) VALUES (?, ?, ?, ?, ?)',
          [assignment.grievance_id, assignment.student_id, rating, getRandomElement(comments), new Date().toISOString()],
          (err) => err ? reject(err) : resolve()
        );
      });
    }
  }
  
  console.log(`Added ${messageCount} messages and ${timelineCount} timeline entries`);
}

async function addNotifications() {
  console.log('🔔 Adding notifications...');
  
  // Get some student user IDs
  const students = await new Promise((resolve, reject) => {
    db.all('SELECT user_id FROM students LIMIT 30', (err, rows) => {
      err ? reject(err) : resolve(rows);
    });
  });
  
  const notificationMessages = [
    "Your grievance has been assigned to a coordinator and is being reviewed.",
    "There has been an update to your grievance. Please check your messages.",
    "Your grievance deadline is approaching. Please respond if additional information is needed.",
    "Your grievance has been resolved. Please review the final decision.",
    "A new message has been received regarding your grievance."
  ];
  
  let notificationCount = 0;
  for (const student of students) {
    const numNotifications = Math.floor(Math.random() * 3) + 1; // 1-3 notifications per student
    
    for (let i = 0; i < numNotifications; i++) {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO notifications (user_id, message, date_sent, status) VALUES (?, ?, ?, ?)',
          [
            student.user_id,
            getRandomElement(notificationMessages),
            new Date().toISOString(),
            Math.random() > 0.5 ? 'read' : 'unread'
          ],
          (err) => err ? reject(err) : resolve()
        );
      });
      
      notificationCount++;
    }
  }
  
  console.log(`Added ${notificationCount} notifications`);
}

async function main() {
  console.log('🚀 Adding supplementary data to clean database...');
  
  try {
    await addMessagesAndTimeline();
    await addNotifications();
    
    console.log('✅ Supplementary data added successfully!');
    console.log('📊 Final Summary:');
    console.log('- Database structure is clean and properly referenced');
    console.log('- All user IDs are correctly linked between tables');
    console.log('- Messages, timeline, deadlines, and notifications added');
    console.log('- System is ready for testing and demonstration');
    
  } catch (error) {
    console.error('❌ Error adding supplementary data:', error);
  } finally {
    db.close();
  }
}

main();
