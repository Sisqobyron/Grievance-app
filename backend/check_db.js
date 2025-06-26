const db = require('./models/db');

console.log('Checking database tables...');
db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, tables) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Tables:', tables.map(t => t.name));
  }
  
  // Check if grievance_timeline table exists and its structure
  db.all('PRAGMA table_info(grievance_timeline)', (err, columns) => {
    if (err) {
      console.error('Error checking timeline table:', err);
    } else {
      console.log('Timeline table columns:', columns);
    }
    
    // Check existing timeline entries
    db.all('SELECT * FROM grievance_timeline LIMIT 5', (err, rows) => {
      if (err) {
        console.error('Error querying timeline:', err);
      } else {
        console.log('Timeline entries:', rows.length);
        if (rows.length > 0) {
          console.log('Sample entry:', rows[0]);
        }
      }
      process.exit(0);
    });
  });
});
