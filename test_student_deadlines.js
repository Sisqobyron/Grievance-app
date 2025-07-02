// Test student deadline filtering
const axios = require('axios');

async function testStudentDeadlines() {
  try {
    console.log('Testing student deadline filtering...');
    
    // Create a token for a student user (Cindy Abingseh with ID 3)
    const testStudentUser = {
      id: 3,
      role: 'student',
      email: 'cindyabingseh@gmail.com'
    };
    
    const token = Buffer.from(JSON.stringify(testStudentUser)).toString('base64');
    
    console.log('\n1. Testing with student user (should see only their deadlines):');
    const studentResponse = await axios.get('http://127.0.0.1:5000/api/deadlines/upcoming', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Student deadlines:', JSON.stringify(studentResponse.data, null, 2));
    
    // Now test with staff user
    const testStaffUser = {
      id: 1,
      role: 'staff',
      email: 'kabaad2020@gmail.com'
    };
    
    const staffToken = Buffer.from(JSON.stringify(testStaffUser)).toString('base64');
    
    console.log('\n2. Testing with staff user (should see all deadlines):');
    const staffResponse = await axios.get('http://127.0.0.1:5000/api/deadlines/upcoming', {
      headers: {
        'Authorization': `Bearer ${staffToken}`
      }
    });
    
    console.log('Staff deadlines:', JSON.stringify(staffResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error testing deadline filtering:', error.response?.data || error.message);
  }
}

testStudentDeadlines();
