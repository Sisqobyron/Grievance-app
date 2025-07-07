const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./sgs.db');

console.log('Updating database schema to support admin role...');

db.serialize(() => {
  // First, let's check the current schema
  db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
    if (err) {
      console.error('Error checking schema:', err);
      return;
    }
    
    console.log('Current users table schema:', row.sql);
    
    // Create a new table with the updated constraint
    db.run(`CREATE TABLE IF NOT EXISTS users_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'staff', 'admin'))
    )`, (err) => {
      if (err) {
        console.error('Error creating new users table:', err);
        return;
      }
      
      console.log('✓ New users table created with admin role support');
      
      // Copy data from old table to new table
      db.run(`INSERT INTO users_new SELECT * FROM users`, (err) => {
        if (err) {
          console.error('Error copying data:', err);
          return;
        }
        
        console.log('✓ Data copied to new table');
        
        // Drop old table and rename new table
        db.run(`DROP TABLE users`, (err) => {
          if (err) {
            console.error('Error dropping old table:', err);
            return;
          }
          
          db.run(`ALTER TABLE users_new RENAME TO users`, (err) => {
            if (err) {
              console.error('Error renaming table:', err);
              return;
            }
            
            console.log('✓ Database schema updated successfully!');
            console.log('✓ Admin role is now supported');
            
            // Close database connection
            db.close((err) => {
              if (err) {
                console.error('Error closing database:', err);
              }
              console.log('Database connection closed.');
              process.exit(0);
            });
          });
        });
      });
    });
  });
});
