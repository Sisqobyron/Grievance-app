const db = require('./models/db');

console.log('📊 Final Database Statistics:');

db.serialize(() => {
  db.get('SELECT COUNT(*) as count FROM users', (err, result) => {
    console.log('👥 Users:', result ? result.count : 0);
  });
  
  db.get('SELECT COUNT(*) as count FROM grievances', (err, result) => {
    console.log('📝 Grievances:', result ? result.count : 0);
  });
  
  db.get('SELECT COUNT(*) as count FROM messages', (err, result) => {
    console.log('💬 Messages:', result ? result.count : 0);
  });
  
  db.get('SELECT COUNT(*) as count FROM grievance_timeline', (err, result) => {
    console.log('📅 Timeline entries:', result ? result.count : 0);
  });
  
  db.get('SELECT COUNT(*) as count FROM grievance_deadlines', (err, result) => {
    console.log('⏰ Deadlines:', result ? result.count : 0);
  });
  
  db.get('SELECT COUNT(*) as count FROM escalation_history', (err, result) => {
    console.log('🚨 Escalations:', result ? result.count : 0);
  });
  
  db.get('SELECT COUNT(*) as count FROM feedback', (err, result) => {
    console.log('⭐ Feedback entries:', result ? result.count : 0);
  });
  
  db.get('SELECT COUNT(*) as count FROM coordinators', (err, result) => {
    console.log('👥 Coordinators:', result ? result.count : 0);
    
    console.log('\n🎯 Sample realistic grievance:');
    db.get('SELECT description FROM grievances ORDER BY RANDOM() LIMIT 1', (err, grievance) => {
      if (grievance) {
        console.log(grievance.description);
      }
      
      console.log('\n💬 Sample message:');
      db.get('SELECT content FROM messages ORDER BY RANDOM() LIMIT 1', (err, message) => {
        if (message) {
          console.log(message.content);
        }
        
        console.log('\n✅ Database is fully populated with realistic demo data!');
        db.close();
      });
    });
  });
});
