const axios = require('axios');

const testGrievanceTimeline = async () => {
  try {
    console.log('🚀 Testing Grievance Timeline...');
    
    // First, let's create a test user (student)
    const studentData = {
      name: 'Test Student',
      email: 'test.student@university.edu',
      password: 'password123',
      role: 'student',
      student_id: 'ST001',
      department: 'Computer Science',
      year: 3
    };
    
    console.log('📝 Creating test student...');
    const userResponse = await axios.post('http://localhost:5000/api/users/register', studentData);
    console.log('✅ Student created:', userResponse.data);
    
    // Submit a test grievance
    const grievanceData = {
      student_id: userResponse.data.user.id,
      type: 'Academic',
      subcategory: 'Grade Appeal',
      description: 'Test grievance for timeline functionality',
      priority_level: 'Medium'
    };
    
    console.log('📋 Submitting test grievance...');
    const grievanceResponse = await axios.post('http://localhost:5000/api/grievances/submit', grievanceData);
    console.log('✅ Grievance submitted:', grievanceResponse.data);
    
    const grievanceId = grievanceResponse.data.grievanceId;
    
    // Wait a moment for timeline entries to be created
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fetch timeline for the grievance
    console.log('📊 Fetching timeline...');
    const timelineResponse = await axios.get(`http://localhost:5000/api/timeline/${grievanceId}`);
    console.log('✅ Timeline data:', JSON.stringify(timelineResponse.data, null, 2));
    
    console.log('🎉 Timeline test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing timeline:', error.response?.data || error.message);
  }
};

testGrievanceTimeline();
