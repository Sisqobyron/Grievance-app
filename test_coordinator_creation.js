const axios = require('axios');

async function testCoordinatorCreation() {
  try {
    console.log('Testing coordinator creation...');
    
    const testData = {
      name: "Test Coordinator",
      email: "test@coordinator.com",
      department: "Computer Science",
      maxWorkload: 15
    };
    
    console.log('Sending data:', testData);
    
    const response = await axios.post('http://localhost:5000/api/coordinators', testData);
    
    console.log('Success!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('Error occurred:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error data:', error.response.data);
    } else {
      console.error('Error message:', error.message);
    }
  }
}

testCoordinatorCreation();
