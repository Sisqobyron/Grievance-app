const axios = require('axios');

async function testApiSubmission() {
  try {
    console.log('Testing API grievance submission...');
    
    const grievanceData = {
      student_id: '1',
      type: 'Academic',
      subcategory: 'Grading',
      description: 'Test API grievance submission with timeline',
      priority_level: 'High'
    };

    const response = await axios.post('http://localhost:5000/api/grievances/submit', grievanceData);
    
    console.log('✅ API Submission successful:', response.data);
    
    // Wait a moment for timeline processing
    setTimeout(async () => {
      try {
        const timelineResponse = await axios.get(`http://localhost:5000/api/timeline/${response.data.grievanceId}`);
        console.log('📅 Timeline entries:', timelineResponse.data);
      } catch (timelineErr) {
        console.error('❌ Error fetching timeline:', timelineErr.response?.data || timelineErr.message);
      }
    }, 2000);
    
  } catch (error) {
    console.error('❌ Submission failed:', error.response?.data || error.message);
  }
}

testApiSubmission();
