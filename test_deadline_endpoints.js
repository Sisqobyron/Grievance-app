const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/deadlines';

async function testDeadlineEndpoints() {
  console.log('🧪 Testing Deadline API Endpoints...\n');

  try {
    // Test 1: GET /api/deadlines - Get all deadlines
    console.log('1. Testing GET /api/deadlines (get all deadlines)');
    try {
      const response = await axios.get(BASE_URL);
      console.log('✅ GET /api/deadlines - SUCCESS');
      console.log(`   Status: ${response.status}`);
      console.log(`   Data count: ${response.data.length}`);
      if (response.data.length > 0) {
        console.log(`   Sample deadline: ${JSON.stringify(response.data[0], null, 2)}`);
      }
    } catch (error) {
      console.log('❌ GET /api/deadlines - FAILED');
      console.log(`   Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: GET /api/deadlines/grievance/:grievanceId - Get deadlines for specific grievance
    console.log('2. Testing GET /api/deadlines/grievance/1 (get deadlines for grievance 1)');
    try {
      const response = await axios.get(`${BASE_URL}/grievance/1`);
      console.log('✅ GET /api/deadlines/grievance/1 - SUCCESS');
      console.log(`   Status: ${response.status}`);
      console.log(`   Data count: ${response.data.length}`);
      if (response.data.length > 0) {
        console.log(`   Sample deadline: ${JSON.stringify(response.data[0], null, 2)}`);
      }
    } catch (error) {
      console.log('❌ GET /api/deadlines/grievance/1 - FAILED');
      console.log(`   Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Test extend deadline endpoint
    console.log('3. Testing PUT /api/deadlines/1/extend (extend deadline)');
    try {
      const response = await axios.put(`${BASE_URL}/1/extend`, {
        newDate: '2025-06-15',
        reason: 'Test extension'
      });
      console.log('✅ PUT /api/deadlines/1/extend - SUCCESS');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      console.log('❌ PUT /api/deadlines/1/extend - FAILED');
      console.log(`   Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: Test complete deadline endpoint
    console.log('4. Testing PUT /api/deadlines/1/complete (mark deadline complete)');
    try {
      const response = await axios.put(`${BASE_URL}/1/complete`);
      console.log('✅ PUT /api/deadlines/1/complete - SUCCESS');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      console.log('❌ PUT /api/deadlines/1/complete - FAILED');
      console.log(`   Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

  } catch (error) {
    console.error('💥 Unexpected error during testing:', error.message);
  }

  console.log('\n🏁 Deadline API Testing Complete!\n');
}

// Run the tests
testDeadlineEndpoints();
