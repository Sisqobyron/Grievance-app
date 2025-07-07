const axios = require('axios');

const baseURL = 'http://127.0.0.1:5000';

async function testCoordinatorSystem() {
  console.log('🧪 Testing Coordinator System...\n');
  
  try {
    // Step 1: Create a staff user first
    console.log('1. Creating a staff user...');
    const staffData = {
      name: 'John Coordinator',
      email: 'john.coordinator@test.com',
      password: 'StaffPass123!',
      role: 'staff',
      department: 'Computer Science'
    };
    
    let userId;
    try {
      const userResponse = await axios.post(`${baseURL}/api/users/register`, staffData);
      userId = userResponse.data.user.id;
      console.log('✅ Staff user created with ID:', userId);
    } catch (err) {
      if (err.response?.data?.message?.includes('Email already exists')) {
        // Get existing user
        const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
          email: 'john.coordinator@test.com',
          password: 'StaffPass123!'
        });
        userId = loginResponse.data.user.id;
        console.log('ℹ️ Using existing staff user with ID:', userId);
      } else {
        throw err;
      }
    }
    
    // Step 2: Create coordinator profile
    console.log('\n2. Creating coordinator profile...');
    const coordinatorData = {
      user_id: userId,
      department: 'Computer Science',
      specialization: 'Academic Grievances',
      max_concurrent_cases: 15
    };
    
    try {
      const coordResponse = await axios.post(`${baseURL}/api/coordinators/register`, coordinatorData);
      console.log('✅ Coordinator profile created:', coordResponse.data.message);
    } catch (err) {
      console.log('ℹ️ Coordinator might already exist:', err.response?.data?.message);
    }
    
    // Step 3: Test get all coordinators
    console.log('\n3. Fetching all coordinators...');
    const allCoords = await axios.get(`${baseURL}/api/coordinators`);
    console.log('✅ Retrieved coordinators:', allCoords.data.length);
    
    // Step 4: Test coordinator by user ID
    console.log('\n4. Testing get coordinator by user ID...');
    try {
      const coordByUser = await axios.get(`${baseURL}/api/coordinators/user/${userId}`);
      console.log('✅ Found coordinator for user:', coordByUser.data.name);
    } catch (err) {
      console.log('❌ No coordinator found for user:', err.response?.data?.message);
    }
    
    // Step 5: Test coordinator dashboard
    console.log('\n5. Testing coordinator dashboard...');
    if (allCoords.data.length > 0) {
      const coordId = allCoords.data[0].id;
      try {
        const dashboard = await axios.get(`${baseURL}/api/coordinators/${coordId}/dashboard`);
        console.log('✅ Coordinator dashboard data retrieved');
      } catch (err) {
        console.log('❌ Dashboard failed:', err.response?.data?.message);
      }
    }
    
    // Step 6: Test assignments
    console.log('\n6. Testing assignments...');
    try {
      const assignments = await axios.get(`${baseURL}/api/coordinators/assignments`);
      console.log('✅ Retrieved assignments:', assignments.data.length);
    } catch (err) {
      console.log('❌ Assignments failed:', err.response?.data?.message);
    }
    
    // Step 7: Test workload
    console.log('\n7. Testing workload calculation...');
    if (allCoords.data.length > 0) {
      const coordId = allCoords.data[0].id;
      try {
        const workload = await axios.get(`${baseURL}/api/coordinators/${coordId}/workload`);
        console.log('✅ Workload data:', workload.data);
      } catch (err) {
        console.log('❌ Workload failed:', err.response?.data?.message);
      }
    }
    
    console.log('\n🎉 Coordinator system test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testCoordinatorSystem();
