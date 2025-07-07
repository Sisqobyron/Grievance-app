const db = require('./models/db');

db.serialize(() => {
  db.all('PRAGMA table_info(grievance_assignments)', (err, rows) => {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('grievance_assignments table columns:');
      rows.forEach(row => {
        console.log(`- ${row.name} (${row.type})`);
      });
    }
    db.close();
  });
});
