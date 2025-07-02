const http = require('http');

// Test with potentially missing fields that might cause the error
const testCases = [
  {
    name: 'Missing program field',
    data: {
      name: 'Test Student',
      email: 'student1@test.com',
      password: 'password123',
      role: 'student',
      department: 'Computer Science',
      // program: 'BSc', // Missing
      matricule: 'CS003',
      level: 'Year 1'
    }
  },
  {
    name: 'Missing matricule field',
    data: {
      name: 'Test Student 2',
      email: 'student2@test.com',
      password: 'password123',
      role: 'student',
      department: 'Computer Science',
      program: 'BSc',
      // matricule: 'CS004', // Missing
      level: 'Year 1'
    }
  },
  {
    name: 'Empty values',
    data: {
      name: '',
      email: 'student3@test.com',
      password: 'password123',
      role: 'student',
      department: 'Computer Science',
      program: 'BSc',
      matricule: 'CS005',
      level: 'Year 1'
    }
  }
];

function testRegistration(testCase) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(testCase.data);

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
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`\n=== ${testCase.name} ===`);
        console.log(`Status: ${res.statusCode}`);
        try {
          const response = JSON.parse(data);
          console.log('Response:', response);
        } catch (error) {
          console.log('Raw response:', data);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error(`${testCase.name} - Request error:`, error);
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('Running registration error tests...\n');
  
  for (const testCase of testCases) {
    await testRegistration(testCase);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between tests
  }
}

runTests();
