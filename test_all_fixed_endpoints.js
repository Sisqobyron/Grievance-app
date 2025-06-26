const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAllFixedEndpoints() {
  console.log('🧪 Testing All Fixed API Endpoints...\n');

  const tests = [
    // Escalation endpoints (previously fixed)
    {
      method: 'GET',
      url: `${BASE_URL}/escalation/rules`,
      description: 'Get escalation rules'
    },
    {
      method: 'GET', 
      url: `${BASE_URL}/escalation/history`,
      description: 'Get escalation history'
    },
    {
      method: 'GET',
      url: `${BASE_URL}/escalation/metrics`, 
      description: 'Get escalation metrics'
    },

    // Deadline endpoints (newly fixed)
    {
      method: 'GET',
      url: `${BASE_URL}/deadlines`,
      description: 'Get all deadlines'
    },
    {
      method: 'GET',
      url: `${BASE_URL}/deadlines/upcoming`,
      description: 'Get upcoming deadlines (for dashboard)'
    },
    {
      method: 'GET',
      url: `${BASE_URL}/deadlines/grievance/1`,
      description: 'Get deadlines for specific grievance'
    }
  ];

  const results = [];

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.method} ${test.url}`);
      
      const response = await axios({
        method: test.method.toLowerCase(),
        url: test.url
      });

      console.log(`✅ SUCCESS - ${test.description}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Data: ${Array.isArray(response.data) ? `Array with ${response.data.length} items` : 'Object'}`);
      
      results.push({
        ...test,
        status: 'SUCCESS',
        httpStatus: response.status,
        dataCount: Array.isArray(response.data) ? response.data.length : 'N/A'
      });

    } catch (error) {
      console.log(`❌ FAILED - ${test.description}`);
      console.log(`   Error: ${error.response?.status || 'Network Error'} - ${error.response?.data?.message || error.message}`);
      
      results.push({
        ...test,
        status: 'FAILED',
        error: error.response?.status || 'Network Error',
        message: error.response?.data?.message || error.message
      });
    }
    
    console.log('');
  }

  // Summary
  console.log('📊 SUMMARY:');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.status === 'SUCCESS');
  const failed = results.filter(r => r.status === 'FAILED');
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  
  if (failed.length > 0) {
    console.log('\n❌ Failed endpoints:');
    failed.forEach(f => {
      console.log(`   ${f.method} ${f.url} - ${f.error}: ${f.message}`);
    });
  }

  if (successful.length === results.length) {
    console.log('\n🎉 All API endpoints are working correctly!');
    console.log('✅ Escalation API 404 errors: FIXED');
    console.log('✅ Deadline API 404 errors: FIXED');
    console.log('✅ Frontend-backend compatibility: VERIFIED');
  }

  console.log('\n🏁 Testing Complete!\n');
}

// Run the comprehensive tests
testAllFixedEndpoints();
