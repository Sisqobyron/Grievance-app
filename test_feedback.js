const http = require('http');

// Test submitting feedback
const testSubmitFeedback = () => {
  const postData = JSON.stringify({
    grievanceId: 1, // Frontend sends grievanceId
    rating: 5,
    comment: 'Great service!', // Frontend sends comment
    category: 'general'
  });

  console.log('Data being sent to backend:', JSON.parse(postData));

  const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/feedback',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log('=== Submit Feedback Test ===');
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('Response:', response);
      } catch (error) {
        console.log('Raw response:', data);
      }
      console.log('');
      
      // Test getting feedback for grievance
      testGetFeedback();
    });
  });

  req.on('error', (error) => {
    console.error('Submit feedback error:', error);
  });

  req.write(postData);
  req.end();
};

// Test getting feedback for a grievance
const testGetFeedback = () => {
  const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/feedback/grievance/1',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log('=== Get Feedback Test ===');
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('Response:', response);
      } catch (error) {
        console.log('Raw response:', data);
      }
      console.log('');
      
      // Test getting feedback stats
      testGetFeedbackStats();
    });
  });

  req.on('error', (error) => {
    console.error('Get feedback error:', error);
  });

  req.end();
};

// Test getting feedback stats for a grievance
const testGetFeedbackStats = () => {
  const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/feedback/stats/1',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log('=== Get Feedback Stats Test ===');
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('Response:', response);
      } catch (error) {
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Get feedback stats error:', error);
  });

  req.end();
};

// Start the tests
console.log('Testing Feedback System API endpoints...\n');
testSubmitFeedback();
