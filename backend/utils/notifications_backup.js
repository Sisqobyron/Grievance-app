const nodemailer = require('nodemailer');
const notificationModel = require('../models/notificationModel');
const userModel = require('../models/userModel');

// Transporter setup with direct Gmail credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'byronbright2k21@gmail.com',     // Your email
    pass: 'omzq nzql dhph czmn'      // App password
  }
});

// Send and store notification
exports.sendNotification = (user_id, message) => {
  const date = new Date().toISOString();

  // Store in DB
  notificationModel.saveNotification(user_id, message, (err, saved) => {
    if (err) console.error('DB Notification Error:', err);
    else console.log('[NOTIF STORED]', saved);
  });

  // Lookup user email
  userModel.findUserById(user_id, (err, user) => {
    if (err || !user) return console.error('User lookup failed:', err);

    // Send email
    const mailOptions = {
      from: 'byronbright2k21@gmail.com',
      to: user.email,
      subject: 'STUDENT GRIEVANCE SYSTEM NOTIFICATION',
      html: `<h1>Notification</h1><p>${message}</p>`,
      text: message
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) return console.error('Email Error:', error);
      console.log('[EMAIL SENT]', info.response);
    });
  });
};
