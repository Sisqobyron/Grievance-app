const axios = require('axios');

const baseURL = 'http://localhost:5000';

// Test admin functionality
async function testAdminFeatures() {
  console.log('🧪 Testing Admin Features...\n');
  
  try {
    // Test admin user creation
    console.log('1. Testing admin user registration...');
    const adminData = {
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'AdminPass123!',
      role: 'admin',
      department: 'Administration'
    };
    
    try {
      const registerResponse = await axios.post(`${baseURL}/api/users/register`, adminData);
      console.log('✅ Admin user created successfully:', registerResponse.data.message);
    } catch (err) {
      if (err.response?.data?.message?.includes('Email already exists')) {
        console.log('ℹ️ Admin user already exists, continuing...');
      } else {
        console.error('❌ Admin registration failed:', err.response?.data?.message || err.message);
      }
    }
    
    // Test admin login
    console.log('\n2. Testing admin login...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'admin@test.com',
      password: 'AdminPass123!'
    });
    console.log('✅ Admin login successful:', loginResponse.data.user.role);
    
    // Test admin dashboard data
    console.log('\n3. Testing admin dashboard data...');
    const dashboardResponse = await axios.get(`${baseURL}/api/admin/dashboard`);
    console.log('✅ Admin dashboard data:', {
      totalUsers: dashboardResponse.data.userStats?.reduce((sum, stat) => sum + stat.count, 0) || 0,
      totalGrievances: dashboardResponse.data.grievanceStats?.reduce((sum, stat) => sum + stat.count, 0) || 0,
      recentUsersCount: dashboardResponse.data.recentUsers?.length || 0
    });
    
    // Test get all users
    console.log('\n4. Testing get all users...');
    const usersResponse = await axios.get(`${baseURL}/api/admin/users`);
    console.log('✅ Retrieved users:', usersResponse.data.length);
    
    // Test user role filtering
    console.log('\n5. Testing user role filtering...');
    const studentsResponse = await axios.get(`${baseURL}/api/admin/users/role/student`);
    console.log('✅ Retrieved students:', studentsResponse.data.length);
    
    const staffResponse = await axios.get(`${baseURL}/api/admin/users/role/staff`);
    console.log('✅ Retrieved staff:', staffResponse.data.length);
    
    const adminResponse = await axios.get(`${baseURL}/api/admin/users/role/admin`);
    console.log('✅ Retrieved admins:', adminResponse.data.length);
    
    // Test get all grievances (admin can see all)
    console.log('\n6. Testing get all grievances...');
    const grievancesResponse = await axios.get(`${baseURL}/api/admin/grievances`);
    console.log('✅ Retrieved grievances:', grievancesResponse.data.length);
    
    // Test grievance filtering by category
    console.log('\n7. Testing grievance filtering by category...');
    const academicGrievances = await axios.get(`${baseURL}/api/admin/grievances/category/Academic`);
    console.log('✅ Academic grievances:', academicGrievances.data.length);
    
    // Test grievance filtering by status
    console.log('\n8. Testing grievance filtering by status...');
    const submittedGrievances = await axios.get(`${baseURL}/api/admin/grievances/status/Submitted`);
    console.log('✅ Submitted grievances:', submittedGrievances.data.length);
    
    // Test grievance filtering by priority
    console.log('\n9. Testing grievance filtering by priority...');
    const highPriorityGrievances = await axios.get(`${baseURL}/api/admin/grievances/priority/High`);
    console.log('✅ High priority grievances:', highPriorityGrievances.data.length);
    
    // Test user search
    console.log('\n10. Testing user search...');
    const searchResponse = await axios.get(`${baseURL}/api/admin/users/search?query=admin`);
    console.log('✅ Search results:', searchResponse.data.length);
    
    // Test user statistics
    console.log('\n11. Testing user statistics...');
    const statsResponse = await axios.get(`${baseURL}/api/admin/stats/users`);
    console.log('✅ User statistics:', statsResponse.data);
    
    console.log('\n🎉 All admin tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Admin test failed:', error.response?.data?.message || error.message);
  }
}

testAdminFeatures();
