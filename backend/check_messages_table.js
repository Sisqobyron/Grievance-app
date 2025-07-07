const db = require('./models/db');

db.all('PRAGMA table_info(messages)', (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('messages table columns:');
    rows.forEach(row => {
      console.log(`- ${row.name} (${row.type})`);
    });
  }
  db.close();
});
