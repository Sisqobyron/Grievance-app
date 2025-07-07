const db = require('./models/db');

// Check table structure
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('Tables in database:');
  tables.forEach(table => {
    console.log('- ' + table.name);
  });
  
  // Check students table structure
  db.all('PRAGMA table_info(students)', (err, columns) => {
    if (err) {
      console.error('Error checking students table:', err);
      return;
    }
    
    console.log('\nStudents table columns:');
    columns.forEach(col => {
      console.log('- ' + col.name + ' (' + col.type + ')');
    });
    
    // Check other key tables
    ['staff', 'coordinators', 'grievances'].forEach(tableName => {
      db.all(`PRAGMA table_info(${tableName})`, (err, cols) => {
        if (err) {
          console.log(`${tableName} table doesn't exist or error:`, err.message);
        } else {
          console.log(`\n${tableName} table columns:`);
          cols.forEach(col => {
            console.log('- ' + col.name + ' (' + col.type + ')');
          });
        }
      });
    });
    
    setTimeout(() => process.exit(0), 1000);
  });
});
