// Test the department-specific grievances endpoint
const axios = require('axios');

async function testDepartmentGrievances() {
  try {
    // First login as a staff member to get a token
    console.log('Testing department-specific grievances endpoint...');
    
    // For testing, let's manually create a token for a staff user
    // In a real scenario, you'd login first to get the token
    const testStaffUser = {
      id: 1, // Staff user with ID 1 (Engineering department)
      role: 'staff',
      email: 'kabaad2020@gmail.com'
    };
    
    // Create a basic auth token (base64 encoded user data)
    const token = Buffer.from(JSON.stringify(testStaffUser)).toString('base64');
    
    const response = await axios.get('http://127.0.0.1:5000/api/grievances/department', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Department grievances response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('Error testing department grievances:', error.response?.data || error.message);
  }
}

testDepartmentGrievances();
