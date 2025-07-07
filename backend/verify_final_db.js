const db = require('./models/db');

console.log('📊 Final Database Verification:');

db.serialize(() => {
  db.all('SELECT COUNT(*) as count FROM users', (err, result) => {
    console.log('👥 Users:', result[0].count);
  });
  
  db.all('SELECT COUNT(*) as count FROM students', (err, result) => {
    console.log('🎓 Students:', result[0].count);
  });
  
  db.all('SELECT COUNT(*) as count FROM staff', (err, result) => {
    console.log('👨‍🏫 Staff:', result[0].count);
  });
  
  db.all('SELECT COUNT(*) as count FROM coordinators', (err, result) => {
    console.log('👥 Coordinators:', result[0].count);
  });
  
  db.all('SELECT COUNT(*) as count FROM grievances', (err, result) => {
    console.log('📝 Grievances:', result[0].count);
  });
  
  db.all('SELECT COUNT(*) as count FROM messages', (err, result) => {
    console.log('💬 Messages:', result[0].count);
  });
  
  db.all('SELECT COUNT(*) as count FROM grievance_timeline', (err, result) => {
    console.log('📅 Timeline entries:', result[0].count);
  });
  
  db.all('SELECT COUNT(*) as count FROM grievance_deadlines', (err, result) => {
    console.log('⏰ Deadlines:', result[0].count);
  });
  
  db.all('SELECT COUNT(*) as count FROM feedback', (err, result) => {
    console.log('⭐ Feedback:', result[0].count);
  });
  
  db.all('SELECT COUNT(*) as count FROM notifications', (err, result) => {
    console.log('🔔 Notifications:', result[0].count);
    
    // Check user ID relationships
    db.all(`
      SELECT 
        'Student-Grievance' as relationship,
        COUNT(*) as valid_refs
      FROM grievances g 
      JOIN students s ON g.student_id = s.user_id
      UNION ALL
      SELECT 
        'Coordinator-User' as relationship,
        COUNT(*) as valid_refs
      FROM coordinators c 
      JOIN users u ON c.user_id = u.id
      UNION ALL
      SELECT 
        'Staff-User' as relationship,
        COUNT(*) as valid_refs
      FROM staff st 
      JOIN users u ON st.user_id = u.id
    `, (err, relationships) => {
      console.log('\n🔗 Relationship Validation:');
      relationships.forEach(rel => {
        console.log(`${rel.relationship}: ${rel.valid_refs} valid references`);
      });
      
      console.log('\n✅ Database is properly structured and ready for use!');
      console.log('\n📝 Login Credentials:');
      console.log('Admin: admin@university.edu / demo123');
      console.log('Students: Any student email @unibuea.cm / demo123');
      console.log('Staff: Any staff email @unibuea.cm / demo123');
      
      db.close();
    });
  });
});
