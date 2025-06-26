const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/escalation';

async function testFullEscalationFlow() {
  console.log('🧪 Testing Complete Escalation Flow...\n');

  try {
    // Test 1: Get initial state
    console.log('1. Getting initial metrics and rules...');
    const [metricsResponse, rulesResponse, historyResponse] = await Promise.all([
      axios.get(`${BASE_URL}/metrics`),
      axios.get(`${BASE_URL}/rules`),
      axios.get(`${BASE_URL}/history`)
    ]);

    console.log('✅ Initial state:');
    console.log('   - Rules:', rulesResponse.data.length);
    console.log('   - Active Rules:', metricsResponse.data.activeRules);
    console.log('   - History entries:', historyResponse.data.length);

    // Test 2: Create a new escalation rule
    console.log('\n2. Creating a new escalation rule...');
    const newRule = {
      rule_name: 'Priority Escalation Rule',
      grievance_type: 'Administrative',
      priority_level: 'Medium',
      trigger_condition: 'time_exceeded',
      trigger_value: 3,
      escalation_action: 'escalate_priority',
      escalation_target: 'Department Head'
    };

    const createResponse = await axios.post(`${BASE_URL}/rules`, newRule);
    console.log('✅ Rule created:', createResponse.data.rule.rule_name);

    // Test 3: Check updated metrics
    console.log('\n3. Checking updated metrics...');
    const updatedMetrics = await axios.get(`${BASE_URL}/metrics`);
    console.log('✅ Updated active rules:', updatedMetrics.data.activeRules);

    // Test 4: Test rule status toggle
    const rulesAfterCreation = await axios.get(`${BASE_URL}/rules`);
    const latestRule = rulesAfterCreation.data[rulesAfterCreation.data.length - 1];
    
    console.log('\n4. Testing rule status toggle...');
    await axios.put(`${BASE_URL}/rules/${latestRule.id}/status`, { is_active: false });
    console.log('✅ Rule deactivated');

    const metricsAfterDeactivation = await axios.get(`${BASE_URL}/metrics`);
    console.log('   Active rules after deactivation:', metricsAfterDeactivation.data.activeRules);

    // Reactivate
    await axios.put(`${BASE_URL}/rules/${latestRule.id}/status`, { is_active: true });
    console.log('✅ Rule reactivated');

    // Test 5: Final state check
    console.log('\n5. Final state check...');
    const finalState = await Promise.all([
      axios.get(`${BASE_URL}/metrics`),
      axios.get(`${BASE_URL}/rules`),
      axios.get(`${BASE_URL}/history`)
    ]);

    console.log('✅ Final state:');
    console.log('   - Total Rules:', finalState[1].data.length);
    console.log('   - Active Rules:', finalState[0].data.activeRules);
    console.log('   - History entries:', finalState[2].data.length);

    console.log('\n🎉 Complete escalation flow test PASSED!');
    console.log('\n📊 Summary of working endpoints:');
    console.log('   ✅ GET /api/escalation/rules');
    console.log('   ✅ GET /api/escalation/history');
    console.log('   ✅ GET /api/escalation/metrics');
    console.log('   ✅ POST /api/escalation/rules');
    console.log('   ✅ PUT /api/escalation/rules/:id/status');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

// Run the comprehensive test
testFullEscalationFlow();
