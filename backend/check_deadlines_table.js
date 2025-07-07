const db = require('./models/db');

db.all('PRAGMA table_info(grievance_deadlines)', (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('grievance_deadlines table columns:');
    rows.forEach(row => {
      console.log(`- ${row.name} (${row.type})`);
    });
  }
  db.close();
});
