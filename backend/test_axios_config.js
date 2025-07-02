// Simple test to verify axios configuration
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Test the exact same call that frontend makes
async function testAxiosCall() {
  try {
    console.log('Testing axios call to:', API_BASE_URL + '/api/feedback');
    
    const response = await api.post('/api/feedback', {
      grievanceId: 1,
      rating: 4,
      comment: 'Test from axios',
      category: 'general'
    });
    
    console.log('Success! Status:', response.status);
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAxiosCall();
