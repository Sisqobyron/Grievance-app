const { getAllGrievances } = require('./models/grievanceModel');

async function testCoordinatorSystem() {
  console.log('Testing coordinator system...');
  
  // Check if there are any coordinators
  const db = require('./models/db');
  const coordinators = await new Promise((resolve, reject) => {
    db.all('SELECT * FROM coordinators', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
  
  console.log('Coordinators in system:', coordinators.length);
  
  // Check grievances
  const grievances = await new Promise((resolve, reject) => {
    getAllGrievances((err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
  
  console.log('Total grievances:', grievances.length);
  
  // Check if any grievances are assigned to coordinators
  const assignedGrievances = grievances.filter(g => g.assigned_to);
  console.log('Assigned grievances:', assignedGrievances.length);
  
  if (assignedGrievances.length > 0) {
    console.log('Sample assigned grievance:', assignedGrievances[0]);
  }
  
  // Check users who could be coordinators
  const users = await new Promise((resolve, reject) => {
    db.all('SELECT id, name, email, role FROM users WHERE role = ?', ['staff'], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
  
  console.log('Staff users:', users.length);
  coordinators.forEach(coord => {
    const user = users.find(u => u.id === coord.user_id);
    console.log(`Coordinator ${coord.id}: ${user ? user.name : 'User not found'} (${coord.department})`);
  });
  
  // Test coordinator dashboard endpoint
  console.log('\nTesting coordinator dashboard endpoint...');
  const { getCoordinatorDashboard } = require('./controllers/coordinatorController');
  
  // Test for coordinator ID 1
  const coordinatorId = 1;
  const req = { params: { id: coordinatorId } };
  const res = {
    json: (data) => {
      console.log('Dashboard data for coordinator 1:', JSON.stringify(data, null, 2));
    },
    status: (code) => ({
      json: (data) => {
        console.log('Error response:', code, data);
      }
    })
  };
  
  await getCoordinatorDashboard(req, res);
}

testCoordinatorSystem().catch(console.error);
