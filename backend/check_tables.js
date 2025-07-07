const db = require('./models/db');

// Check if specific tables exist
const checkTables = ['deadlines', 'escalations', 'timeline', 'feedback'];

console.log('Checking table existence...\n');

checkTables.forEach(tableName => {
  db.all(`PRAGMA table_info(${tableName})`, (err, cols) => {
    if (err || cols.length === 0) {
      console.log(`❌ ${tableName} table doesn't exist`);
    } else {
      console.log(`✅ ${tableName} table exists with columns:`);
      cols.forEach(col => {
        console.log(`   - ${col.name} (${col.type})`);
      });
      console.log('');
    }
  });
});

setTimeout(() => process.exit(0), 2000);
