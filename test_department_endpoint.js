const axios = require('axios');

async function testGrievancesDepartmentEndpoint() {
  console.log('🧪 Testing /api/grievances/department endpoint...\n');
  
  try {
    // First, login as a staff member to get proper token
    console.log('1. Logging in as staff...');
    const loginResponse = await axios.post('http://127.0.0.1:5000/api/auth/login', {
      email: 'john.coordinator@test.com',
      password: 'StaffPass123!'
    });
    
    const user = loginResponse.data.user;
    console.log('✅ Logged in as:', user.name, '- Role:', user.role);
    
    // Create auth token
    const token = Buffer.from(JSON.stringify(user)).toString('base64');
    console.log('📝 Auth token created');
    
    // Test the department endpoint
    console.log('\n2. Testing /api/grievances/department...');
    const grievancesResponse = await axios.get('http://127.0.0.1:5000/api/grievances/department', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Success! Retrieved grievances:', grievancesResponse.data.length);
    console.log('📊 First few grievances:');
    grievancesResponse.data.slice(0, 3).forEach((g, i) => {
      console.log(`   ${i+1}. ID: ${g.id}, Type: ${g.type}, Status: ${g.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error occurred:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
      console.error('URL:', error.config.url);
    } else {
      console.error('Message:', error.message);
    }
  }
}

testGrievancesDepartmentEndpoint();
