const http = require('http');

const postData = JSON.stringify({
  name: 'Test User 2',
  email: 'test2@example.com',
  password: 'password123',
  role: 'student',
  department: 'Computer Science',
  program: 'BSc',
  matricule: 'CS002',
  level: 'Year 1'
});

const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/users/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
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
  console.error('Request error:', error);
});

req.write(postData);
req.end();
