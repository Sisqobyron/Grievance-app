const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testDepartmentAPIAccess() {
  console.log('🧪 Testing Department API Access Control');
  console.log('======================================');

  try {
    // First, get some staff users to test with
    const db = require('./models/db');
    
    const staffUsers = await new Promise((resolve, reject) => {
      db.all(`
        SELECT u.id, u.name, u.email, s.department, u.role
        FROM users u
        JOIN staff s ON u.id = s.user_id
        WHERE u.role = 'staff'
        LIMIT 3
      `, (err, rows) => err ? reject(err) : resolve(rows));
    });

    console.log('\n📋 Testing with staff members:');
    staffUsers.forEach(staff => {
      console.log(`  - ${staff.name} (${staff.department})`);
    });

    // Test each staff member's access
    for (const staff of staffUsers) {
      console.log(`\n👤 Testing access for ${staff.name} (${staff.department}):`);
      
      // Create a simple auth token (base64 encoded user info)
      const authToken = Buffer.from(JSON.stringify({
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role
      })).toString('base64');

      try {
        // Test department grievances endpoint
        const response = await axios.get(`${API_BASE}/grievances/department`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        console.log(`  ✅ Successfully accessed department grievances`);
        console.log(`  📊 Found ${response.data.count} grievances in ${response.data.department}`);
        
        if (response.data.grievances.length > 0) {
          console.log(`  📝 Sample grievance: #${response.data.grievances[0].id} - ${response.data.grievances[0].type}`);
        }

      } catch (error) {
        console.log(`  ❌ Error accessing grievances: ${error.response?.data?.message || error.message}`);
      }

      // Test accessing a specific grievance from their department
      try {
        const deptGrievances = await new Promise((resolve, reject) => {
          db.all(`
            SELECT g.id
            FROM grievances g
            JOIN students s ON g.student_id = s.user_id
            WHERE s.department = ?
            LIMIT 1
          `, [staff.department], (err, rows) => err ? reject(err) : resolve(rows));
        });

        if (deptGrievances.length > 0) {
          const grievanceId = deptGrievances[0].id;
          const response = await axios.get(`${API_BASE}/grievances/${grievanceId}`, {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          console.log(`  ✅ Successfully accessed own department grievance #${grievanceId}`);
        }

      } catch (error) {
        console.log(`  ❌ Error accessing specific grievance: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test cross-department access (should fail)
    if (staffUsers.length >= 2) {
      console.log(`\n🚫 Testing cross-department access (should fail):`);
      
      const staff1 = staffUsers[0];
      const staff2 = staffUsers[1];
      
      if (staff1.department !== staff2.department) {
        // Get a grievance from staff2's department
        const otherDeptGrievances = await new Promise((resolve, reject) => {
          db.all(`
            SELECT g.id
            FROM grievances g
            JOIN students s ON g.student_id = s.user_id
            WHERE s.department = ?
            LIMIT 1
          `, [staff2.department], (err, rows) => err ? reject(err) : resolve(rows));
        });

        if (otherDeptGrievances.length > 0) {
          const grievanceId = otherDeptGrievances[0].id;
          const authToken = Buffer.from(JSON.stringify({
            id: staff1.id,
            name: staff1.name,
            email: staff1.email,
            role: staff1.role
          })).toString('base64');

          try {
            await axios.get(`${API_BASE}/grievances/${grievanceId}`, {
              headers: {
                'Authorization': `Bearer ${authToken}`
              }
            });
            console.log(`  ❌ ERROR: ${staff1.name} was able to access ${staff2.department} grievance #${grievanceId}`);
          } catch (error) {
            if (error.response?.status === 403) {
              console.log(`  ✅ Correctly blocked: ${staff1.name} (${staff1.department}) cannot access ${staff2.department} grievance #${grievanceId}`);
            } else {
              console.log(`  ⚠️ Unexpected error: ${error.response?.data?.message || error.message}`);
            }
          }
        }
      }
    }

    db.close();

  } catch (error) {
    console.error('Test setup error:', error);
  }
}

// Note: This test requires the backend server to be running on localhost:5000
console.log('⚠️  Make sure the backend server is running on localhost:5000 before running this test');
console.log('📝 Run: npm start or node server.js in the backend directory\n');

testDepartmentAPIAccess().catch(console.error);
