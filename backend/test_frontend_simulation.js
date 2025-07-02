const http = require('http');

// Simulate exactly what the frontend sends, including auth header
function testFrontendRequest() {
  const postData = JSON.stringify({
    grievanceId: 1,
    rating: 5,
    comment: 'Great service!',
    category: 'general'
  });

  // Simulate the auth header that frontend sends
  const mockUser = { id: 1, email: 'test@example.com', role: 'student' };
  const authHeader = `Bearer ${Buffer.from(JSON.stringify(mockUser)).toString('base64')}`;

  const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/feedback',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('Simulating frontend request...');
  console.log('Data being sent:', JSON.parse(postData));
  console.log('Auth header:', authHeader);

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`\nStatus: ${res.statusCode}`);
      try {
        const response = JSON.parse(data);
        console.log('Response:', response);
      } catch (error) {
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error);
  });

  req.write(postData);
  req.end();
}

testFrontendRequest();
