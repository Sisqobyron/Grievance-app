const timelineModel = require('./models/timelineModel');

console.log('Testing timeline model directly...');

const testEntry = {
  grievance_id: 9,
  action_type: 'created',
  action_description: 'Test timeline entry',
  performed_by: 5,
  metadata: {
    test: true
  }
};

timelineModel.addTimelineEntry(testEntry, (err, result) => {
  if (err) {
    console.error('Error adding timeline entry:', err);
  } else {
    console.log('✅ Timeline entry created:', result);
  }
  
  // Now try to fetch it
  timelineModel.getGrievanceTimeline(9, (err, timeline) => {
    if (err) {
      console.error('Error fetching timeline:', err);
    } else {
      console.log('Timeline for grievance 9:', timeline);
    }
    process.exit(0);
  });
});
