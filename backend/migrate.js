const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./sgs.db');

console.log('Starting database migration...');

db.serialize(() => {
  // Add subcategory column if it doesn't exist
  db.run(`ALTER TABLE grievances ADD COLUMN subcategory TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding subcategory column:', err);
    } else {
      console.log('✓ Subcategory column added/verified');
    }
  });

  // Add additional_data column if it doesn't exist  
  db.run(`ALTER TABLE grievances ADD COLUMN additional_data TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding additional_data column:', err);
    } else {
      console.log('✓ Additional_data column added/verified');
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('Migration completed successfully!');
  }
});
