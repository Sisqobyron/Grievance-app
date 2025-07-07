const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testGrievanceEndpoints() {
  console.log('🧪 Testing Grievance API Endpoints');
  console.log('=================================');

  try {
    // Get a staff user to test with
    const db = require('./models/db');
    
    const staffUser = await new Promise((resolve, reject) => {
      db.get(`
        SELECT u.id, u.name, u.email, s.department, u.role
        FROM users u
        JOIN staff s ON u.id = s.user_id
        WHERE u.role = 'staff'
        LIMIT 1
      `, (err, row) => err ? reject(err) : resolve(row));
    });

    if (!staffUser) {
      console.log('❌ No staff user found in database');
      return;
    }

    console.log(`\n👤 Testing with staff user: ${staffUser.name} (${staffUser.department})`);
    
    // Create auth token
    const authToken = Buffer.from(JSON.stringify({
      id: staffUser.id,
      name: staffUser.name,
      email: staffUser.email,
      role: staffUser.role
    })).toString('base64');

    // Test staff department endpoint
    try {
      const response = await axios.get(`${API_BASE}/grievances/department`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      console.log('\n✅ Staff Department Endpoint Response:');
      console.log('Response Type:', typeof response.data);
      console.log('Has grievances property:', !!response.data.grievances);
      console.log('Grievances is array:', Array.isArray(response.data.grievances));
      console.log('Response structure:', Object.keys(response.data));
      
      if (response.data.grievances) {
        console.log('Grievances count:', response.data.grievances.length);
        if (response.data.grievances.length > 0) {
          console.log('Sample grievance keys:', Object.keys(response.data.grievances[0]));
        }
      }

    } catch (error) {
      console.log('❌ Error testing staff endpoint:', error.response?.data?.message || error.message);
    }

    // Test admin endpoint for comparison
    try {
      const adminResponse = await axios.get(`${API_BASE}/grievances`);
      
      console.log('\n✅ Admin Endpoint Response:');
      console.log('Response Type:', typeof adminResponse.data);
      console.log('Is array:', Array.isArray(adminResponse.data));
      console.log('Count:', adminResponse.data.length);
      
    } catch (error) {
      console.log('❌ Error testing admin endpoint:', error.message);
    }

    db.close();

  } catch (error) {
    console.error('Test setup error:', error);
  }
}

testGrievanceEndpoints().catch(console.error);
