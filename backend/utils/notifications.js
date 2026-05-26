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

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailFrom = process.env.EMAIL_FROM || emailUser || 'no-reply@student-grievance-system.local';
const emailEnabled = Boolean(emailUser && emailPass);

// Enhanced transporter setup with better configuration
const transporter = emailEnabled
  ? nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT || 587),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: emailUser,
        pass: emailPass
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      }
    })
  : null;

// Test email connectivity
const testConnection = () => {
  if (!transporter) {
    console.warn('Email service is disabled. Set EMAIL_USER and EMAIL_PASS to enable email delivery.');
    return;
  }

  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email service connection failed:', error);
    } else if (success) {
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
        address: emailFrom
      },
      to: user.email,
      subject: subject,
      html: htmlContent,
      text: textContent
    };

    if (!transporter) {
      callback && callback(null, { skipped: true, reason: 'email-disabled' });
      return;
    }

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
  
  userModel.findUserByEmail(process.env.STAFF_NOTIFICATION_EMAIL || '', (lookupErr, staffUser) => {
    if (lookupErr || !staffUser) {
      callback && callback(null, { skipped: true, reason: 'staff-recipient-not-configured' });
      return;
    }

    storeAndSendEmail(staffUser.id, subject, htmlContent, textContent, callback);
  });
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

// Generic email sending function (for forwarding grievances to external recipients)
exports.sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: `"Student Grievance System" <${emailFrom}>`,
      to: to,
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML if no text provided
    };

    if (!transporter) {
      return { skipped: true, reason: 'email-disabled' };
    }

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
};

// Initialize email service
testConnection();
