const db = require('./models/db');

// Function to get random element from array
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Function to get random date within a range
function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Valid action types for timeline
const validActionTypes = ['created', 'assigned', 'status_changed', 'message_sent', 'deadline_set', 'escalated', 'resolved'];

// Sample escalation reasons
const escalationReasons = [
  'No response within deadline',
  'Student dissatisfied with resolution',
  'Complex case requiring higher authority',
  'Department head review required',
  'Policy clarification needed',
  'Legal implications identified'
];

async function populateSupplementaryData() {
  console.log('🚀 Adding supplementary demo data...');

  try {
    // Get existing grievances with assignments
    const grievances = await new Promise((resolve, reject) => {
      db.all(`
        SELECT g.id, g.student_id, g.submission_date, ga.coordinator_id, ga.assigned_at
        FROM grievances g 
        JOIN grievance_assignments ga ON g.id = ga.grievance_id
        WHERE ga.is_active = 1
      `, (err, rows) => err ? reject(err) : resolve(rows));
    });

    console.log(`Found ${grievances.length} assigned grievances`);

    // Create deadlines for grievances
    console.log('Creating deadlines...');
    for (const grievance of grievances) {
      const assignedDate = new Date(grievance.assigned_at);
      const initialDeadline = new Date(assignedDate);
      initialDeadline.setDate(initialDeadline.getDate() + 14); // 14 days from assignment

      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO grievance_deadlines 
          (grievance_id, deadline_type, deadline_date, notes, is_met, created_at) 
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          grievance.id,
          'initial_response',
          initialDeadline.toISOString(),
          'Initial response to grievance',
          Math.random() > 0.3 ? 1 : 0, // 70% met deadlines
          assignedDate.toISOString()
        ], (err) => err ? reject(err) : resolve());
      });

      // Some grievances get final resolution deadlines
      if (Math.random() > 0.5) {
        const finalDeadline = new Date(assignedDate);
        finalDeadline.setDate(finalDeadline.getDate() + 30); // 30 days for final resolution

        await new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO grievance_deadlines 
            (grievance_id, deadline_type, deadline_date, notes, is_met, created_at) 
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            grievance.id,
            'resolution',
            finalDeadline.toISOString(),
            'Final resolution of grievance',
            Math.random() > 0.4 ? 1 : 0, // 60% met deadlines
            assignedDate.toISOString()
          ], (err) => err ? reject(err) : resolve());
        });
      }
    }

    // Create timeline entries
    console.log('Creating timeline entries...');
    for (const grievance of grievances) {
      const numEntries = Math.floor(Math.random() * 6) + 3; // 3-8 timeline entries
      const submissionDate = new Date(grievance.submission_date);
      
      for (let i = 0; i < numEntries; i++) {
        const actionDate = new Date(submissionDate);
        actionDate.setDate(actionDate.getDate() + (i * 2) + Math.floor(Math.random() * 3));
        
        await new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO grievance_timeline 
            (grievance_id, action_type, action_description, performed_by, performed_at, metadata) 
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            grievance.id,
            getRandomElement(validActionTypes),
            `Action performed on grievance ${grievance.id}`,
            grievance.coordinator_id,
            actionDate.toISOString(),
            `Timeline entry ${i + 1} for grievance ${grievance.id}`
          ], (err) => err ? reject(err) : resolve());
        });
      }
    }

    // Create some escalations
    console.log('Creating escalations...');
    const grievancesToEscalate = grievances.slice(0, Math.floor(grievances.length * 0.2)); // 20% escalated
    
    for (const grievance of grievancesToEscalate) {
      const escalationDate = new Date(grievance.submission_date);
      escalationDate.setDate(escalationDate.getDate() + Math.floor(Math.random() * 20) + 10);
      
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO escalation_history 
          (grievance_id, triggered_at, trigger_reason, escalation_action, previous_status, new_status, notes) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          grievance.id,
          escalationDate.toISOString(),
          getRandomElement(escalationReasons),
          'escalate_to_admin',
          'In Progress',
          'Escalated',
          'Escalated due to complexity or deadline missed'
        ], (err) => err ? reject(err) : resolve());
      });
    }

    // Create notifications
    console.log('Creating notifications...');
    for (const grievance of grievances.slice(0, 30)) { // First 30 grievances get notifications
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO notifications 
          (user_id, message, date_sent, status) 
          VALUES (?, ?, ?, ?)
        `, [
          grievance.student_id,
          `Your grievance #${grievance.id} has been assigned to a coordinator and is being reviewed.`,
          new Date().toISOString(),
          Math.random() > 0.5 ? 'read' : 'unread'
        ], (err) => err ? reject(err) : resolve());
      });
    }

    console.log('✅ Supplementary data population completed!');
    console.log('📊 Additional data created:');
    console.log(`- Deadlines: ${grievances.length * 1.5} (mix of initial and final)`);
    console.log(`- Timeline entries: ~${grievances.length * 5} across all grievances`);
    console.log(`- Escalations: ${grievancesToEscalate.length} cases escalated`);
    console.log('- Notifications: 30 student notifications');

  } catch (error) {
    console.error('❌ Error populating supplementary data:', error);
  } finally {
    db.close();
  }
}

// Run the supplementary population script
populateSupplementaryData();
