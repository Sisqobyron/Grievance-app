// Database configuration that works for both development and production
const sqlite3 = require('sqlite3');
const path = require('path');

// Database configuration
const DB_CONFIG = {
  development: {
    type: 'sqlite',
    database: path.join(__dirname, '../sgs.db')
  },
  production: {
    type: 'sqlite',
    database: process.env.DATABASE_URL || path.join(__dirname, '../sgs.db')
  }
};

const environment = process.env.NODE_ENV || 'development';
const config = DB_CONFIG[environment];

// Initialize database connection
let db;

if (config.type === 'sqlite') {
  db = new sqlite3.Database(config.database, (err) => {
    if (err) {
      console.error('❌ SQLite connection error:', err.message);
      process.exit(1);
    } else {
      console.log(`✅ Connected to SQLite database: ${config.database}`);
      
      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON');
    }
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
      process.exit(0);
    });
  }
});

module.exports = db;
