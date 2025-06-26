const axios = require('axios');

async function testStatusUpdate() {
  try {
    console.log('Testing status update with timeline...');
    
    // Update status of grievance 14
    const statusUpdateData = {
      status: 'In Progress'
    };

    const response = await axios.put('http://localhost:5000/api/grievances/14/status', statusUpdateData);
    
    console.log('✅ Status update successful:', response.data);
    
    // Wait a moment for timeline processing
    setTimeout(async () => {
      try {
        const timelineResponse = await axios.get('http://localhost:5000/api/timeline/14');
        console.log('📅 Timeline entries after status update:', timelineResponse.data);
      } catch (timelineErr) {
        console.error('❌ Error fetching timeline:', timelineErr.response?.data || timelineErr.message);
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ Status update failed:', error.response?.data || error.message);
  }
}

testStatusUpdate();
