// Quick test to check if the backend API is working
const axios = require('axios');

async function testSubmitGrievance() {
  try {
    const formData = new FormData();
    formData.append('student_id', '1');
    formData.append('type', 'Academic');
    formData.append('subcategory', 'Grading');
    formData.append('description', 'Test grievance submission');
    formData.append('priority_level', 'Medium');

    console.log('Testing grievance submission...');
    
    const response = await axios.post('http://localhost:5000/api/grievances/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('✅ Submission successful:', response.data);
  } catch (error) {
    console.error('❌ Submission failed:', error.response?.data || error.message);
  }
}

testSubmitGrievance();
