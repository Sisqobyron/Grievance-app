const axios = require('axios');

async function testTimelineDisplay() {
  try {
    console.log('🎨 Testing Timeline Component Data Format...\n');
    
    // Get timeline data for grievance 16 (our comprehensive test)
    const timelineResponse = await axios.get('http://localhost:5000/api/timeline/16');
    const timelineData = timelineResponse.data;
    
    console.log('📅 Raw Timeline Data:');
    console.log(JSON.stringify(timelineData, null, 2));
    console.log('');
    
    // Test data format for frontend Timeline component
    console.log('🧪 Testing Frontend Timeline Component Format:');
    
    const formatTimelineForDisplay = (entries) => {
      return entries.map(entry => ({
        id: entry.id,
        type: entry.activity_type,
        title: getTimelineTitle(entry.activity_type),
        description: entry.description,
        timestamp: new Date(entry.timestamp).toLocaleString(),
        user: entry.user_id ? `User ${entry.user_id}` : 'System',
        metadata: entry.metadata ? JSON.parse(entry.metadata) : null,
        icon: getTimelineIcon(entry.activity_type),
        color: getTimelineColor(entry.activity_type)
      }));
    };
    
    const getTimelineTitle = (activityType) => {
      const titles = {
        'created': 'Grievance Submitted',
        'status_changed': 'Status Updated',
        'assigned': 'Coordinator Assigned',
        'escalated': 'Escalated',
        'resolved': 'Resolved',
        'closed': 'Closed'
      };
      return titles[activityType] || activityType.replace('_', ' ').toUpperCase();
    };
    
    const getTimelineIcon = (activityType) => {
      const icons = {
        'created': '📝',
        'status_changed': '🔄',
        'assigned': '👤',
        'escalated': '⚠️',
        'resolved': '✅',
        'closed': '🔒'
      };
      return icons[activityType] || '📌';
    };
    
    const getTimelineColor = (activityType) => {
      const colors = {
        'created': 'primary',
        'status_changed': 'info',
        'assigned': 'success',
        'escalated': 'warning',
        'resolved': 'success',
        'closed': 'default'
      };
      return colors[activityType] || 'default';
    };
    
    const formattedTimeline = formatTimelineForDisplay(timelineData);
    
    console.log('✨ Formatted Timeline for Frontend:');
    formattedTimeline.forEach((item, index) => {
      console.log(`${index + 1}. ${item.icon} ${item.title}`);
      console.log(`   📝 ${item.description}`);
      console.log(`   🕐 ${item.timestamp}`);
      console.log(`   👤 ${item.user}`);
      if (item.metadata) {
        console.log(`   📊 Metadata: ${JSON.stringify(item.metadata)}`);
      }
      console.log('');
    });
    
    console.log('🎉 Timeline data format test completed successfully!');
    console.log(`📊 Total entries formatted: ${formattedTimeline.length}`);
    
  } catch (error) {
    console.error('❌ Timeline display test failed:', error.response?.data || error.message);
  }
}

testTimelineDisplay();
