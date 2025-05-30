// Email Template Testing Script
// Test all beautiful email templates in the Student Grievance System

const notifier = require('./utils/notifications');

// Test data for demonstrations
const testStudent = {
  id: 1,
  name: 'John Doe',
  email: 'student@test.com',
  role: 'student'
};

const testStaff = {
  id: 2,
  name: 'Dr. Jane Smith', 
  email: 'staff@test.com',
  role: 'staff'
};

const testGrievance = {
  id: 'GRV001',
  type: 'Academic Issues',
  subcategory: 'Grade Dispute',
  description: 'I believe there was an error in my final grade calculation for Computer Science 101. I would like this to be reviewed.',
  priority_level: 'High',
  submission_date: new Date().toISOString(),
  file_path: null,
  studentName: 'John Doe'
};

const testMessage = {
  content: 'Thank you for submitting your grievance. We have reviewed your case and would like to schedule a meeting to discuss this further. Please let us know your availability.',
  preview: 'Thank you for submitting your grievance. We have reviewed your case and would like to schedule...'
};

console.log('🎯 Starting Email Template Tests...\n');

// Test 1: Grievance Submission Confirmation
console.log('📝 Testing Grievance Submission Email...');
notifier.sendGrievanceSubmissionEmail(testStudent.id, testGrievance, (err, info) => {
  if (err) {
    console.error('❌ Grievance submission email failed:', err);
  } else {
    console.log('✅ Grievance submission email sent successfully');
  }
});

// Test 2: Staff Notification
setTimeout(() => {
  console.log('\n🚨 Testing Staff Notification Email...');
  notifier.sendStaffNotificationEmail(testGrievance, testStudent.name, (err, info) => {
    if (err) {
      console.error('❌ Staff notification email failed:', err);
    } else {
      console.log('✅ Staff notification email sent successfully');
    }
  });
}, 2000);

// Test 3: Status Update Notification
setTimeout(() => {
  console.log('\n📋 Testing Status Update Email...');
  notifier.sendStatusUpdateEmail(testStudent.id, testGrievance, 'In Progress', testStudent.name, (err, info) => {
    if (err) {
      console.error('❌ Status update email failed:', err);
    } else {
      console.log('✅ Status update email sent successfully');
    }
  });
}, 4000);

// Test 4: New Message Notification
setTimeout(() => {
  console.log('\n💬 Testing New Message Email...');
  notifier.sendNewMessageEmail(
    testStudent.id, 
    testGrievance, 
    testStaff.name, 
    testMessage.preview, 
    testStudent.name, 
    (err, info) => {
      if (err) {
        console.error('❌ New message email failed:', err);
      } else {
        console.log('✅ New message email sent successfully');
      }
    }
  );
}, 6000);

// Test 5: Welcome Email for Student Registration
setTimeout(() => {
  console.log('\n🎉 Testing Welcome Email (Student)...');
  const studentData = {
    full_name: testStudent.name,
    email: testStudent.email,
    role: testStudent.role
  };
  
  notifier.sendWelcomeEmail(testStudent.id, studentData, (err, info) => {
    if (err) {
      console.error('❌ Welcome email (student) failed:', err);
    } else {
      console.log('✅ Welcome email (student) sent successfully');
    }
  });
}, 8000);

// Test 6: Welcome Email for Staff Registration
setTimeout(() => {
  console.log('\n🎉 Testing Welcome Email (Staff)...');
  const staffData = {
    full_name: testStaff.name,
    email: testStaff.email,
    role: testStaff.role
  };
  
  notifier.sendWelcomeEmail(testStaff.id, staffData, (err, info) => {
    if (err) {
      console.error('❌ Welcome email (staff) failed:', err);
    } else {
      console.log('✅ Welcome email (staff) sent successfully');
    }
  });
}, 10000);

// Test 7: Status Resolution Email
setTimeout(() => {
  console.log('\n🎉 Testing Resolution Email...');
  notifier.sendStatusUpdateEmail(testStudent.id, testGrievance, 'Resolved', testStudent.name, (err, info) => {
    if (err) {
      console.error('❌ Resolution email failed:', err);
    } else {
      console.log('✅ Resolution email sent successfully');
    }
  });
}, 12000);

// Test 8: Urgent Priority Staff Notification
setTimeout(() => {
  console.log('\n⚠️ Testing Urgent Priority Notification...');
  const urgentGrievance = {
    ...testGrievance,
    id: 'GRV002',
    priority_level: 'Urgent',
    type: 'Safety Concerns',
    description: 'There is a serious safety hazard in the chemistry lab that needs immediate attention.'
  };
  
  notifier.sendStaffNotificationEmail(urgentGrievance, testStudent.name, (err, info) => {
    if (err) {
      console.error('❌ Urgent priority email failed:', err);
    } else {
      console.log('✅ Urgent priority email sent successfully');
    }
  });
}, 14000);

// Summary message
setTimeout(() => {
  console.log('\n🏁 Email Template Testing Complete!');
  console.log('\n📧 Check your email inbox to view the beautiful templates.');
  console.log('📱 All templates are mobile-responsive and feature modern design.');
  console.log('🎨 Templates include proper styling, gradients, and professional layout.');
  console.log('\n💡 Tips:');
  console.log('   • Check spam folder if emails are not in inbox');
  console.log('   • Templates work best in modern email clients');
  console.log('   • All emails include both HTML and text versions');
  console.log('   • Notification data is also stored in the database');
  
  process.exit(0);
}, 16000);
