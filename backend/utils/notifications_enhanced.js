// Enhanced Email Notification System for Student Grievance System
// Beautiful, modern email templates with comprehensive functionality

const nodemailer = require('nodemailer');
const notificationModel = require('../models/notificationModel');
const userModel = require('../models/userModel');
const {
  grievanceSubmittedTemplate,
  statusUpdateTemplate,
  newMessageTemplate,
  staffNotificationTemplate,
  welcomeTemplate
} = require('./emailTemplates');

// Enhanced transporter setup with better configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'byronbright2k21@gmail.com',
    pass: 'omzq nzql dhph czmn'
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test email connectivity
const testConnection = () => {
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email service connection failed:', error);
    } else {
      console.log('✅ Email service ready for sending messages');
    }
  });
};

// Enhanced notification storage and email sending
const storeAndSendEmail = (userId, subject, htmlContent, textContent, callback) => {
  // Store notification in database
  notificationModel.saveNotification(userId, textContent, (err, saved) => {
    if (err) {
      console.error('❌ DB Notification Error:', err);
    } else {
      console.log('✅ Notification stored:', saved);
    }
  });

  // Send email
  userModel.findUserById(userId, (err, user) => {
    if (err || !user) {
      console.error('❌ User lookup failed:', err);
      return callback && callback(err);
    }

    const mailOptions = {
      from: {
        name: 'Student Grievance System',
        address: 'byronbright2k21@gmail.com'
      },
      to: user.email,
      subject: subject,
      html: htmlContent,
      text: textContent
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ Email Error:', error);
        return callback && callback(error);
      }
      console.log('✅ Email sent successfully:', info.response);
      callback && callback(null, info);
    });
  });
};

// 1. Send grievance submission confirmation email to student
exports.sendGrievanceSubmissionEmail = (studentId, grievanceData, callback) => {
  const htmlContent = grievanceSubmittedTemplate(grievanceData);
  const subject = `✅ Grievance #${grievanceData.id} Submitted Successfully`;
  const textContent = `Your grievance has been submitted successfully. Reference ID: ${grievanceData.id}`;
  
  storeAndSendEmail(studentId, subject, htmlContent, textContent, callback);
};

// 2. Send staff notification for new grievances
exports.sendStaffNotificationEmail = (grievanceData, studentName, callback) => {
  const htmlContent = staffNotificationTemplate(grievanceData, studentName);
  const subject = `🚨 New ${grievanceData.priority_level} Priority Grievance #${grievanceData.id}`;
  const textContent = `New grievance submitted by ${studentName}. ID: ${grievanceData.id}, Category: ${grievanceData.type}`;
  
  // Send to staff user (assuming staff user ID is 1, you may need to adjust this)
  storeAndSendEmail(1, subject, htmlContent, textContent, callback);
};

// 3. Send status update notification to student
exports.sendStatusUpdateEmail = (studentId, grievanceData, newStatus, studentName, callback) => {
  const htmlContent = statusUpdateTemplate(grievanceData, newStatus, studentName);
  const subject = `📋 Grievance #${grievanceData.id} Status Updated: ${newStatus}`;
  const textContent = `Your grievance #${grievanceData.id} status has been updated to: ${newStatus}`;
  
  storeAndSendEmail(studentId, subject, htmlContent, textContent, callback);
};

// 4. Send new message notification
exports.sendNewMessageEmail = (recipientId, grievanceData, senderName, messagePreview, recipientName, callback) => {
  const htmlContent = newMessageTemplate(grievanceData, senderName, messagePreview, recipientName);
  const subject = `💬 New Message - Grievance #${grievanceData.id}`;
  const textContent = `You have a new message from ${senderName} regarding grievance #${grievanceData.id}`;
  
  storeAndSendEmail(recipientId, subject, htmlContent, textContent, callback);
};

// 5. Send welcome email for new user registration
exports.sendWelcomeEmail = (userId, userData, callback) => {
  const htmlContent = welcomeTemplate(userData);
  const subject = `🎉 Welcome to Student Grievance System`;
  const textContent = `Welcome to the Student Grievance System! Your account has been created successfully.`;
  
  storeAndSendEmail(userId, subject, htmlContent, textContent, callback);
};

// Legacy function for backward compatibility
exports.sendNotification = (user_id, message, callback) => {
  const subject = 'Student Grievance System Notification';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1f2937;">Notification</h2>
      <p style="color: #4b5563; line-height: 1.6;">${message}</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #9ca3af;">Student Grievance System</p>
    </div>
  `;
  
  storeAndSendEmail(user_id, subject, htmlContent, message, callback);
};

// Initialize email service
testConnection();
