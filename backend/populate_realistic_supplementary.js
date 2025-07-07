const db = require('./models/db');

// Realistic timeline actions
const realisticTimelineActions = [
  {
    action_type: 'status_changed',
    descriptions: [
      'Grievance received and initial review completed',
      'Assigned to department coordinator for investigation',
      'Investigation initiated - gathering relevant documentation',
      'Interviews scheduled with involved parties',
      'Evidence review in progress',
      'Department head consultation requested',
      'Preliminary findings documented',
      'Resolution proposal under review',
      'Final decision reached and documented',
      'Case status updated to resolved'
    ]
  },
  {
    action_type: 'message_sent',
    descriptions: [
      'Initial acknowledgment sent to student',
      'Request for additional information sent',
      'Update provided to student on investigation progress',
      'Clarification requested from department',
      'Resolution proposal shared with student',
      'Final outcome communicated to all parties'
    ]
  },
  {
    action_type: 'escalated',
    descriptions: [
      'Case escalated to department head due to complexity',
      'Escalated to Dean\'s office for policy clarification',
      'Legal consultation requested for sensitive matter',
      'External mediation services engaged',
      'Title IX office notified of harassment complaint',
      'Disability services consulted for accommodation request'
    ]
  },
  {
    action_type: 'deadline_set',
    descriptions: [
      'Initial response deadline established',
      'Investigation completion deadline set',
      'Final resolution deadline determined',
      'Follow-up deadline scheduled'
    ]
  },
  {
    action_type: 'assigned',
    descriptions: [
      'Case assigned to specialized coordinator',
      'Reassigned to senior coordinator for complex review',
      'Additional expert assigned to investigation team'
    ]
  }
];

// Realistic escalation scenarios
const realisticEscalations = [
  {
    reason: 'Deadline exceeded without response',
    outcome: 'resolved',
    notes: 'Case reassigned to senior coordinator, resolved within 48 hours'
  },
  {
    reason: 'Student dissatisfied with initial resolution',
    outcome: 'pending',
    notes: 'Department head review scheduled for next week'
  },
  {
    reason: 'Policy interpretation required',
    outcome: 'resolved',
    notes: 'Academic affairs clarified policy application, case resolved favorably'
  },
  {
    reason: 'Complex harassment allegation',
    outcome: 'resolved',
    notes: 'Investigation conducted by specialized team, appropriate action taken'
  },
  {
    reason: 'Financial aid dispute requires dean approval',
    outcome: 'pending',
    notes: 'Awaiting dean review of financial aid appeal'
  },
  {
    reason: 'Grade appeal requires faculty committee review',
    outcome: 'resolved',
    notes: 'Faculty committee upheld original grade after thorough review'
  }
];

// Helper functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function createRealisticTimeline() {
  console.log('📅 Creating realistic timeline entries...');
  
  const grievances = await new Promise((resolve, reject) => {
    db.all(`
      SELECT g.id, g.submission_date, ga.coordinator_id, ga.assigned_at
      FROM grievances g 
      LEFT JOIN grievance_assignments ga ON g.id = ga.grievance_id
      WHERE ga.is_active = 1 OR ga.is_active IS NULL
    `, (err, rows) => err ? reject(err) : resolve(rows));
  });

  let timelineCount = 0;

  for (const grievance of grievances) {
    const submissionDate = new Date(grievance.submission_date);
    const numEntries = Math.floor(Math.random() * 8) + 3; // 3-10 timeline entries
    
    for (let i = 0; i < numEntries; i++) {
      const actionCategory = getRandomElement(realisticTimelineActions);
      const description = getRandomElement(actionCategory.descriptions);
      
      // Space out timeline entries realistically
      const actionDate = new Date(submissionDate);
      actionDate.setDate(actionDate.getDate() + (i * Math.floor(Math.random() * 3)) + 1);
      
      const performedBy = grievance.coordinator_id || Math.floor(Math.random() * 8) + 81; // Staff member
      
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO grievance_timeline 
          (grievance_id, action_type, action_description, performed_by, performed_at) 
          VALUES (?, ?, ?, ?, ?)
        `, [
          grievance.id,
          actionCategory.action_type,
          description,
          performedBy,
          actionDate.toISOString()
        ], (err) => err ? reject(err) : resolve());
      });
      
      timelineCount++;
    }
  }

  console.log(`Created ${timelineCount} realistic timeline entries`);
}

async function createRealisticDeadlines() {
  console.log('⏰ Creating realistic deadlines...');
  
  const grievances = await new Promise((resolve, reject) => {
    db.all(`
      SELECT g.id, g.submission_date, ga.assigned_at, ga.coordinator_id
      FROM grievances g 
      JOIN grievance_assignments ga ON g.id = ga.grievance_id
      WHERE ga.is_active = 1
    `, (err, rows) => err ? reject(err) : resolve(rows));
  });

  let deadlineCount = 0;

  for (const grievance of grievances) {
    const assignedDate = new Date(grievance.assigned_at);
    
    // Initial response deadline (3-5 business days)
    const initialDeadline = new Date(assignedDate);
    initialDeadline.setDate(initialDeadline.getDate() + Math.floor(Math.random() * 3) + 3);
    
    const initialMet = Math.random() > 0.25; // 75% meet initial deadline
    const metDate = initialMet ? getRandomDate(assignedDate, initialDeadline) : null;
    
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO grievance_deadlines 
        (grievance_id, deadline_type, deadline_date, notes, is_met, met_at, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        grievance.id,
        'initial_response',
        initialDeadline.toISOString(),
        'Initial response and case assessment',
        initialMet ? 1 : 0,
        metDate ? metDate.toISOString() : null,
        grievance.coordinator_id
      ], (err) => err ? reject(err) : resolve());
    });
    
    deadlineCount++;
    
    // Investigation deadline (10-15 business days)
    if (Math.random() > 0.3) { // 70% get investigation deadlines
      const investigationDeadline = new Date(assignedDate);
      investigationDeadline.setDate(investigationDeadline.getDate() + Math.floor(Math.random() * 6) + 10);
      
      const investigationMet = Math.random() > 0.35; // 65% meet investigation deadline
      const invMetDate = investigationMet ? getRandomDate(initialDeadline, investigationDeadline) : null;
      
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO grievance_deadlines 
          (grievance_id, deadline_type, deadline_date, notes, is_met, met_at, created_by) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          grievance.id,
          'investigation',
          investigationDeadline.toISOString(),
          'Complete investigation and gather all evidence',
          investigationMet ? 1 : 0,
          invMetDate ? invMetDate.toISOString() : null,
          grievance.coordinator_id
        ], (err) => err ? reject(err) : resolve());
      });
      
      deadlineCount++;
    }
    
    // Resolution deadline (20-30 business days)
    if (Math.random() > 0.4) { // 60% get resolution deadlines
      const resolutionDeadline = new Date(assignedDate);
      resolutionDeadline.setDate(resolutionDeadline.getDate() + Math.floor(Math.random() * 11) + 20);
      
      const resolutionMet = Math.random() > 0.4; // 60% meet resolution deadline
      const resMetDate = resolutionMet ? getRandomDate(new Date(assignedDate.getTime() + 14*24*60*60*1000), resolutionDeadline) : null;
      
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO grievance_deadlines 
          (grievance_id, deadline_type, deadline_date, notes, is_met, met_at, created_by) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          grievance.id,
          'resolution',
          resolutionDeadline.toISOString(),
          'Final resolution and case closure',
          resolutionMet ? 1 : 0,
          resMetDate ? resMetDate.toISOString() : null,
          grievance.coordinator_id
        ], (err) => err ? reject(err) : resolve());
      });
      
      deadlineCount++;
    }
  }

  console.log(`Created ${deadlineCount} realistic deadlines`);
}

async function createRealisticEscalations() {
  console.log('🚨 Creating realistic escalations...');
  
  const grievances = await new Promise((resolve, reject) => {
    db.all(`
      SELECT g.id, g.submission_date, g.type, g.priority_level, ga.coordinator_id
      FROM grievances g 
      JOIN grievance_assignments ga ON g.id = ga.grievance_id
      WHERE ga.is_active = 1
    `, (err, rows) => err ? reject(err) : resolve(rows));
  });

  // Escalate about 25% of grievances
  const grievancesToEscalate = grievances
    .filter(() => Math.random() > 0.75)
    .slice(0, Math.floor(grievances.length * 0.25));

  for (const grievance of grievancesToEscalate) {
    const escalation = getRandomElement(realisticEscalations);
    
    // Determine escalation target based on grievance type
    let escalatedTo = 1; // Default to admin
    if (grievance.type === 'Academic') {
      escalatedTo = Math.floor(Math.random() * 5) + 81; // Academic staff
    } else if (grievance.type === 'Harassment') {
      escalatedTo = 1; // Always to admin for harassment
    }
    
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO escalation_history 
        (grievance_id, trigger_reason, escalation_action, previous_assignee, new_assignee, notes, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        grievance.id,
        escalation.reason,
        'escalate_priority',
        grievance.coordinator_id,
        escalatedTo,
        escalation.notes,
        grievance.coordinator_id
      ], (err) => err ? reject(err) : resolve());
    });
  }

  console.log(`Created ${grievancesToEscalate.length} realistic escalations`);
}

async function createRealisticNotifications() {
  console.log('🔔 Creating realistic notifications...');
  
  const students = await new Promise((resolve, reject) => {
    db.all('SELECT user_id FROM students ORDER BY RANDOM() LIMIT 40', (err, rows) => {
      err ? reject(err) : resolve(rows);
    });
  });

  const notificationTypes = [
    {
      message: 'Your grievance has been received and assigned to a coordinator. You will receive an initial response within 3-5 business days.',
      type: 'acknowledgment'
    },
    {
      message: 'An update has been posted to your grievance case. Please log in to view the latest information.',
      type: 'update'
    },
    {
      message: 'Your coordinator has requested additional information for your grievance. Please respond at your earliest convenience.',
      type: 'information_request'
    },
    {
      message: 'Your grievance has been resolved. Please review the resolution and provide feedback on your experience.',
      type: 'resolution'
    },
    {
      message: 'A deadline is approaching for your grievance case. Please check for any required actions.',
      type: 'deadline_reminder'
    },
    {
      message: 'Your grievance has been escalated for additional review. You will be contacted within 5 business days.',
      type: 'escalation'
    }
  ];

  for (const student of students) {
    const numNotifications = Math.floor(Math.random() * 4) + 1; // 1-4 notifications per student
    
    for (let i = 0; i < numNotifications; i++) {
      const notification = getRandomElement(notificationTypes);
      const notificationDate = getRandomDate(new Date(2024, 8, 1), new Date());
      const isRead = Math.random() > 0.4; // 60% read rate
      
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO notifications 
          (user_id, message, date_sent, status) 
          VALUES (?, ?, ?, ?)
        `, [
          student.user_id,
          notification.message,
          notificationDate.toISOString(),
          isRead ? 'read' : 'unread'
        ], (err) => err ? reject(err) : resolve());
      });
    }
  }

  console.log(`Created notifications for ${students.length} students`);
}

async function main() {
  console.log('🚀 Adding realistic supplementary data...');

  try {
    await createRealisticTimeline();
    await createRealisticDeadlines();
    await createRealisticEscalations();
    await createRealisticNotifications();

    console.log('✅ Realistic supplementary data completed!');
    console.log('📊 Additional realistic data:');
    console.log('- Timeline entries with authentic actions and descriptions');
    console.log('- Deadlines with realistic timeframes and completion rates');
    console.log('- Escalations with appropriate reasons and outcomes');
    console.log('- Notifications reflecting real student communication needs');

  } catch (error) {
    console.error('❌ Error creating supplementary data:', error);
  } finally {
    db.close();
  }
}

// Run the realistic supplementary script
main();
