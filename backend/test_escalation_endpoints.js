const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/escalation';

async function testEscalationEndpoints() {
  console.log('🧪 Testing Escalation Endpoints...\n');

  try {
    // Test 1: Get escalation rules
    console.log('1. Testing GET /api/escalation/rules');
    const rulesResponse = await axios.get(`${BASE_URL}/rules`);
    console.log('✅ Rules endpoint working. Response:', rulesResponse.data);
    console.log('   Rules count:', rulesResponse.data.length);

    // Test 2: Get escalation history  
    console.log('\n2. Testing GET /api/escalation/history');
    const historyResponse = await axios.get(`${BASE_URL}/history`);
    console.log('✅ History endpoint working. Response:', historyResponse.data);
    console.log('   History count:', historyResponse.data.length);

    // Test 3: Get escalation metrics
    console.log('\n3. Testing GET /api/escalation/metrics');
    const metricsResponse = await axios.get(`${BASE_URL}/metrics`);
    console.log('✅ Metrics endpoint working. Response:', metricsResponse.data);

    // Test 4: Create a test escalation rule
    console.log('\n4. Testing POST /api/escalation/rules');
    const testRule = {
      rule_name: 'Test Auto-Escalation Rule',
      grievance_type: 'Academic',
      priority_level: 'High',
      trigger_condition: 'time_exceeded',
      trigger_value: 2, // 2 days
      escalation_action: 'notify_supervisor',
      escalation_target: 'Academic Supervisor'
    };

    const createRuleResponse = await axios.post(`${BASE_URL}/rules`, testRule);
    console.log('✅ Create rule endpoint working. Response:', createRuleResponse.data);

    // Test 5: Get rules again to see the new rule
    console.log('\n5. Testing GET /api/escalation/rules (after creating rule)');
    const updatedRulesResponse = await axios.get(`${BASE_URL}/rules`);
    console.log('✅ Rules endpoint working. Response:', updatedRulesResponse.data);
    console.log('   Rules count:', updatedRulesResponse.data.length);

    console.log('\n🎉 All escalation endpoints are working correctly!');

  } catch (error) {
    console.error('❌ Error testing endpoints:', error.response?.data || error.message);
  }
}

// Run the tests
testEscalationEndpoints();
