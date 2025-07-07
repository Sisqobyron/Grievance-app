const db = require('./models/db');

// Get all table names
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('All tables in database:');
  tables.forEach(table => {
    console.log('- ' + table.name);
  });
  
  // Check specific tables we're interested in
  const tablesToCheck = ['grievance_deadlines', 'grievance_timeline', 'escalation_history'];
  
  console.log('\nChecking specific table structures:');
  
  let completed = 0;
  const total = tablesToCheck.length;
  
  tablesToCheck.forEach(tableName => {
    db.all(`PRAGMA table_info(${tableName})`, (err, cols) => {
      if (err || cols.length === 0) {
        console.log(`\n❌ ${tableName} table doesn't exist`);
      } else {
        console.log(`\n✅ ${tableName} table exists with columns:`);
        cols.forEach(col => {
          console.log(`   - ${col.name} (${col.type})`);
        });
      }
      
      completed++;
      if (completed === total) {
        process.exit(0);
      }
    });
  });
});
