const db = require('./models/db');

// Default admin credentials
const defaultAdmin = {
  name: 'System Administrator',
  email: 'admin@sgs.edu',
  password: 'admin123',
  role: 'admin'
};

// Function to create default admin
function createDefaultAdmin() {
  console.log('Creating default admin user...');
  
  // Check if admin already exists
  const checkSql = `SELECT * FROM users WHERE email = ? AND role = 'admin'`;
  
  db.get(checkSql, [defaultAdmin.email], (err, existingAdmin) => {
    if (err) {
      console.error('Error checking for existing admin:', err);
      return;
    }
    
    if (existingAdmin) {
      console.log('Admin user already exists with email:', defaultAdmin.email);
      console.log('Admin credentials:');
      console.log('Email:', defaultAdmin.email);
      console.log('Password:', defaultAdmin.password);
      return;
    }
    
    // Create new admin user
    const insertSql = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;
    
    db.run(insertSql, [defaultAdmin.name, defaultAdmin.email, defaultAdmin.password, defaultAdmin.role], function(err) {
      if (err) {
        console.error('Error creating admin user:', err);
        return;
      }
      
      console.log('✅ Default admin user created successfully!');
      console.log('');
      console.log('🔑 ADMIN CREDENTIALS:');
      console.log('================================');
      console.log('Email:', defaultAdmin.email);
      console.log('Password:', defaultAdmin.password);
      console.log('Role: admin');
      console.log('================================');
      console.log('');
      console.log('⚠️  IMPORTANT: Please change the default password after first login for security!');
      console.log('');
      console.log('Admin can now:');
      console.log('- View and manage all users');
      console.log('- Filter users by role (student, staff, admin)');
      console.log('- Search users by name or email');
      console.log('- Update user roles and delete users');
      console.log('- View all grievances with advanced filtering');
      console.log('- Filter grievances by category, status, priority, and department');
      console.log('- Access comprehensive dashboard analytics');
      
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
}

// Run the script
createDefaultAdmin();
