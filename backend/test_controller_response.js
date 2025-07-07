const db = require('./models/db');
const grievanceController = require('./controllers/grievanceController');

// Mock response object for testing
function createMockResponse() {
  let responseData = null;
  let statusCode = 200;
  
  return {
    json: (data) => {
      responseData = data;
      console.log('Response data:', JSON.stringify(data, null, 2));
      console.log('Is grievances an array?', Array.isArray(data.grievances));
      return this;
    },
    status: (code) => {
      statusCode = code;
      return this;
    },
    getResponseData: () => responseData,
    getStatusCode: () => statusCode
  };
}

async function testControllerResponse() {
  console.log('🧪 Testing Controller Response Format');
  console.log('===================================');

  try {
    // Get a staff user
    const staffUser = await new Promise((resolve, reject) => {
      db.get(`
        SELECT u.id, u.name, u.email, s.department, u.role
        FROM users u
        JOIN staff s ON u.id = s.user_id
        WHERE u.role = 'staff'
        LIMIT 1
      `, (err, row) => err ? reject(err) : resolve(row));
    });

    if (!staffUser) {
      console.log('❌ No staff user found');
      return;
    }

    console.log(`\n👤 Testing with: ${staffUser.name} (${staffUser.department})`);

    // Mock request object
    const mockReq = {
      user: staffUser,
      staffDepartment: staffUser.department
    };

    // Mock response object
    const mockRes = createMockResponse();

    // Test the controller
    console.log('\n📝 Calling getGrievancesByDepartment controller...');
    
    await new Promise((resolve) => {
      // Wrap the controller call to handle async callback
      const originalJson = mockRes.json;
      mockRes.json = (data) => {
        originalJson.call(mockRes, data);
        resolve();
        return mockRes;
      };
      
      grievanceController.getGrievancesByDepartment(mockReq, mockRes);
    });

    console.log('\n✅ Controller test completed');

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    db.close();
  }
}

testControllerResponse().catch(console.error);
