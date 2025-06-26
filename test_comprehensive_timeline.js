const axios = require('axios');

async function comprehensiveTimelineTest() {
  try {
    console.log('🚀 Starting comprehensive timeline functionality test...\n');
    
    // Test 1: Create a new grievance
    console.log('📝 Test 1: Creating a new grievance...');
    const grievanceData = {
      student_id: '1',
      type: 'Academic',
      subcategory: 'Exam Issues',
      description: 'Comprehensive timeline test - exam scheduling conflict',
      priority_level: 'High'
    };

    const createResponse = await axios.post('http://localhost:5000/api/grievances/submit', grievanceData);
    const grievanceId = createResponse.data.grievanceId;
    console.log(`✅ Created grievance ID: ${grievanceId}\n`);
    
    // Wait for creation to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test 2: Check timeline after creation
    console.log('📅 Test 2: Checking timeline after grievance creation...');
    const timelineAfterCreate = await axios.get(`http://localhost:5000/api/timeline/${grievanceId}`);
    console.log(`✅ Timeline entries after creation: ${timelineAfterCreate.data.length}`);
    timelineAfterCreate.data.forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.activity_type}: ${entry.description} (${entry.timestamp})`);
    });
    console.log('');
    
    // Test 3: Update status to "In Progress"
    console.log('🔄 Test 3: Updating status to "In Progress"...');
    await axios.put(`http://localhost:5000/api/grievances/${grievanceId}/status`, { status: 'In Progress' });
    console.log('✅ Status updated to "In Progress"\n');
    
    // Wait for status update to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test 4: Check timeline after status update
    console.log('📅 Test 4: Checking timeline after status update...');
    const timelineAfterStatus = await axios.get(`http://localhost:5000/api/timeline/${grievanceId}`);
    console.log(`✅ Timeline entries after status update: ${timelineAfterStatus.data.length}`);
    timelineAfterStatus.data.forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.activity_type}: ${entry.description} (${entry.timestamp})`);
    });
    console.log('');
    
    // Test 5: Update status to "Resolved"
    console.log('🔄 Test 5: Updating status to "Resolved"...');
    await axios.put(`http://localhost:5000/api/grievances/${grievanceId}/status`, { status: 'Resolved' });
    console.log('✅ Status updated to "Resolved"\n');
    
    // Wait for status update to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test 6: Check final timeline
    console.log('📅 Test 6: Checking final timeline...');
    const finalTimeline = await axios.get(`http://localhost:5000/api/timeline/${grievanceId}`);
    console.log(`✅ Final timeline entries: ${finalTimeline.data.length}`);
    finalTimeline.data.forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.activity_type}: ${entry.description} (${entry.timestamp})`);
      if (entry.metadata) {
        const metadata = JSON.parse(entry.metadata);
        console.log(`      Metadata: ${JSON.stringify(metadata)}`);
      }
    });
    console.log('');
    
    // Test 7: Verify data integrity
    console.log('🔍 Test 7: Verifying data integrity...');
    const expectedEntries = ['created', 'status_changed', 'status_changed'];
    const actualTypes = finalTimeline.data.map(entry => entry.activity_type);
    
    if (JSON.stringify(expectedEntries) === JSON.stringify(actualTypes)) {
      console.log('✅ All expected timeline entries found!');
    } else {
      console.log('❌ Timeline entries mismatch:');
      console.log(`   Expected: ${expectedEntries.join(', ')}`);
      console.log(`   Actual: ${actualTypes.join(', ')}`);
    }
    
    console.log('\n🎉 Comprehensive timeline test completed successfully!');
    console.log(`📊 Final Summary: ${finalTimeline.data.length} timeline entries for grievance #${grievanceId}`);
    
  } catch (error) {
    console.error('❌ Comprehensive test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
  }
}

comprehensiveTimelineTest();
