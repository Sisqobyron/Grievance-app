const axios = require('axios');

async function testCoordinatorAssignment() {
  try {
    console.log('Testing coordinator assignment timeline...');
    
    // First, let's create a new grievance to test assignment
    const grievanceData = {
      student_id: '1',
      type: 'Administrative',
      subcategory: 'Fee Issues',
      description: 'Test coordinator assignment functionality',
      priority_level: 'Medium'
    };

    console.log('Creating new grievance for assignment test...');
    const createResponse = await axios.post('http://localhost:5000/api/grievances/submit', grievanceData);
    const grievanceId = createResponse.data.grievanceId;
    console.log(`✅ Created grievance ID: ${grievanceId}`);
    
    // Wait a moment for creation to complete
    setTimeout(async () => {
      try {
        // Check initial timeline
        const initialTimeline = await axios.get(`http://localhost:5000/api/timeline/${grievanceId}`);
        console.log('📅 Initial timeline entries:', initialTimeline.data.length);
        
        // Now check if coordinator assignment happened automatically
        setTimeout(async () => {
          const finalTimeline = await axios.get(`http://localhost:5000/api/timeline/${grievanceId}`);
          console.log('📅 Final timeline entries:', finalTimeline.data);
          
          // Check for assignment entries
          const assignmentEntries = finalTimeline.data.filter(entry => entry.activity_type === 'assigned');
          if (assignmentEntries.length > 0) {
            console.log('✅ Coordinator assignment timeline entry found!', assignmentEntries[0]);
          } else {
            console.log('ℹ️ No coordinator assignment timeline entry found (may be due to no available coordinators)');
          }
          
        }, 2000);
        
      } catch (timelineErr) {
        console.error('❌ Error fetching timeline:', timelineErr.response?.data || timelineErr.message);
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCoordinatorAssignment();
