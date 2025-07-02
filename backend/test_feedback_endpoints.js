const http = require('http');

// Test all feedback endpoints
const testEndpoints = [
  {
    name: 'Test Health Check',
    method: 'GET',
    path: '/health',
    data: null
  },
  {
    name: 'Submit Feedback',
    method: 'POST', 
    path: '/api/feedback',
    data: {
      grievanceId: 1,
      rating: 5,
      comment: 'Great service!',
      category: 'general'
    }
  },
  {
    name: 'Get Feedback for Grievance',
    method: 'GET',
    path: '/api/feedback/grievance/1',
    data: null
  },
  {
    name: 'Get Feedback Stats for Grievance',
    method: 'GET',
    path: '/api/feedback/stats/1',
    data: null
  },
  {
    name: 'Get All Feedback Stats',
    method: 'GET',  
    path: '/api/feedback/stats',
    data: null
  }
];

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const postData = endpoint.data ? JSON.stringify(endpoint.data) : null;
    
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`\n=== ${endpoint.name} ===`);
        console.log(`${endpoint.method} ${endpoint.path}`);
        console.log(`Status: ${res.statusCode}`);
        
        try {
          const response = JSON.parse(data);
          console.log('Response:', JSON.stringify(response, null, 2));
        } catch (error) {
          console.log('Raw response:', data.substring(0, 200) + (data.length > 200 ? '...' : ''));
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`\n=== ${endpoint.name} ===`);
      console.error('Request error:', error.message);
      resolve();
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('Testing Backend Feedback Endpoints...\n');
  
  for (const endpoint of testEndpoints) {
    await testEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
  }
  
  console.log('\n=== Test Complete ===');
}

runTests();
