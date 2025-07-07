const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./sgs.db');

console.log('Creating default admin user...');

// Default admin credentials
const defaultAdmin = {
  name: 'System Administrator',
  email: 'admin@sgs.com',
  password: 'Admin123!',
  role: 'admin'
};

db.serialize(() => {
  // First check if admin already exists
  db.get("SELECT * FROM users WHERE email = ?", [defaultAdmin.email], (err, row) => {
    if (err) {
      console.error('Error checking for existing admin:', err);
      return;
    }
    
    if (row) {
      console.log('⚠️  Admin user already exists with email:', defaultAdmin.email);
      console.log('📧 Email:', defaultAdmin.email);
      console.log('🔑 Password:', defaultAdmin.password);
      console.log('👤 Role:', defaultAdmin.role);
      db.close();
      return;
    }
    
    // Create the admin user
    db.run(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [defaultAdmin.name, defaultAdmin.email, defaultAdmin.password, defaultAdmin.role],
      function(err) {
        if (err) {
          console.error('Error creating admin user:', err);
          return;
        }
        
        console.log('✅ Default admin user created successfully!');
        console.log('');
        console.log('🔐 ADMIN CREDENTIALS:');
        console.log('├── Email:    ', defaultAdmin.email);
        console.log('├── Password: ', defaultAdmin.password);
        console.log('├── Role:     ', defaultAdmin.role);
        console.log('└── User ID:  ', this.lastID);
        console.log('');
        console.log('🚀 You can now login with these credentials!');
        console.log('💡 Access the admin panel at: http://localhost:5174/admin');
        console.log('');
        console.log('⚠️  IMPORTANT: Please change the default password after first login!');
        
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
          }
          console.log('Database connection closed.');
        });
      }
    );
  });
});
