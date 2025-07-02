const axios = require('axios');

async function testFeedbackStats() {
  try {
    // Test general feedback stats
    const response = await axios.get('http://localhost:3001/api/feedback/stats');
    console.log('General feedback stats:', JSON.stringify(response.data, null, 2));
    
    // Test feedback stats for a specific grievance (using ID 1 as an example)
    const grievanceResponse = await axios.get('http://localhost:3001/api/feedback/stats/1');
    console.log('Grievance feedback stats:', JSON.stringify(grievanceResponse.data, null, 2));
  } catch (error) {
    console.error('Error testing feedback stats:', error.response?.data || error.message);
  }
}

testFeedbackStats();
