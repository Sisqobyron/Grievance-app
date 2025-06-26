const axios = require('axios');

const testCompleteTimeline = async () => {
  try {
    console.log('🚀 Testing Complete Timeline Functionality...');
    
    // Create a unique test student
    const timestamp = Date.now();
    const studentData = {
      name: `Test Student ${timestamp}`,
      email: `test.student.${timestamp}@university.edu`,
      password: 'password123',
      role: 'student',
      student_id: `ST${timestamp}`,
      department: 'Computer Science',
      year: 3
    };
    
    console.log('📝 Creating test student...');
    const userResponse = await axios.post('http://localhost:5000/api/users/register', studentData);
    console.log('✅ Student created:', userResponse.data.user.name);
    
    // Submit a test grievance
    const grievanceData = {
      student_id: userResponse.data.user.id,
      type: 'Academic',
      subcategory: 'Grade Appeal',
      description: 'Test grievance for complete timeline functionality',
      priority_level: 'Medium'
    };
    
    console.log('📋 Submitting test grievance...');
    const grievanceResponse = await axios.post('http://localhost:5000/api/grievances/submit', grievanceData);
    console.log('✅ Grievance submitted:', grievanceResponse.data.grievanceId);
    
    const grievanceId = grievanceResponse.data.grievanceId;
    
    // Wait a moment for timeline entries to be created
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Fetch timeline for the grievance
    console.log('📊 Fetching timeline...');
    const timelineResponse = await axios.get(`http://localhost:5000/api/timeline/${grievanceId}`);
    console.log('✅ Timeline entries found:', timelineResponse.data.length);
    
    if (timelineResponse.data.length > 0) {
      console.log('Timeline details:');
      timelineResponse.data.forEach((entry, index) => {
        console.log(`  ${index + 1}. ${entry.activity_type}: ${entry.description}`);
        console.log(`     Timestamp: ${entry.timestamp}`);
        if (entry.metadata) {
          console.log(`     Metadata:`, entry.metadata);
        }
        console.log('');
      });
    } else {
      console.log('⚠️ No timeline entries found - investigating...');
    }
    
    // Test status update to generate more timeline entries
    console.log('🔄 Testing status update...');
    await axios.put(`http://localhost:5000/api/grievances/${grievanceId}/status`, {
      status: 'Under Review'
    });
    
    // Wait and fetch timeline again
    await new Promise(resolve => setTimeout(resolve, 1000));
    const updatedTimelineResponse = await axios.get(`http://localhost:5000/api/timeline/${grievanceId}`);
    console.log('✅ Updated timeline entries:', updatedTimelineResponse.data.length);
    
    console.log('🎉 Complete timeline test completed!');
    
  } catch (error) {
    console.error('❌ Error testing timeline:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
};

testCompleteTimeline();
