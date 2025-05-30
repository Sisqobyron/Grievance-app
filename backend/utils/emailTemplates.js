// Modern Email Templates for Student Grievance System
// Beautiful, responsive HTML email templates

const baseTemplate = (content, title = "Student Grievance System") => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px 0;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 400;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin: 16px 0;
        }
        
        .status-submitted { background: #dbeafe; color: #1e40af; }
        .status-progress { background: #fef3c7; color: #d97706; }
        .status-resolved { background: #d1fae5; color: #059669; }
        .status-rejected { background: #fee2e2; color: #dc2626; }
        
        .priority-urgent { background: #fee2e2; color: #dc2626; }
        .priority-high { background: #fef3c7; color: #d97706; }
        .priority-medium { background: #dbeafe; color: #1e40af; }
        .priority-low { background: #f3f4f6; color: #6b7280; }
        
        .info-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .info-row:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }
        
        .info-label {
            font-weight: 600;
            color: #374151;
            font-size: 14px;
        }
        
        .info-value {
            color: #6b7280;
            font-size: 14px;
            text-align: right;
            max-width: 300px;
        }
        
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }
        
        .button-secondary {
            background: #f8fafc;
            color: #374151;
            border: 2px solid #e2e8f0;
        }
        
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer p {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 10px;
        }
        
        .social-links {
            margin-top: 20px;
        }
        
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #9ca3af;
            text-decoration: none;
        }
        
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
            margin: 30px 0;
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 0 10px;
            }
            
            .header, .content, .footer {
                padding: 30px 20px;
            }
            
            .info-row {
                flex-direction: column;
                gap: 8px;
            }
            
            .info-value {
                text-align: left;
                max-width: none;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🎓 Student Grievance System</h1>
            <p>Educational Excellence & Student Support</p>
        </div>
        
        <div class="content">
            ${content}
        </div>
        
        <div class="footer">
            <p>© 2025 Student Grievance System. All rights reserved.</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
            <div class="divider"></div>
            <p style="font-size: 12px; color: #9ca3af;">
                If you have any questions, please contact our support team at 
                <a href="mailto:support@studentgrievance.edu" style="color: #667eea;">support@studentgrievance.edu</a>
            </p>
        </div>
    </div>
</body>
</html>
`;

// Template for grievance submission confirmation
const grievanceSubmittedTemplate = (grievanceData) => {
    const content = `
        <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px; font-weight: 600;">
            ✅ Grievance Submitted Successfully
        </h2>
        
        <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">
            Dear ${grievanceData.studentName || 'Student'},
        </p>
        
        <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">
            Your grievance has been successfully submitted and is now being reviewed by our administrative team. 
            We take all student concerns seriously and will address your issue promptly.
        </p>
        
        <div class="info-card">
            <div class="info-row">
                <span class="info-label">Grievance ID</span>
                <span class="info-value" style="font-weight: 600; color: #1f2937;">#${grievanceData.id}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Category</span>
                <span class="info-value">${grievanceData.type}</span>
            </div>
            ${grievanceData.subcategory ? `
            <div class="info-row">
                <span class="info-label">Subcategory</span>
                <span class="info-value">${grievanceData.subcategory}</span>
            </div>
            ` : ''}
            <div class="info-row">
                <span class="info-label">Priority Level</span>
                <span class="info-value">
                    <span class="status-badge priority-${grievanceData.priority_level?.toLowerCase()}">${grievanceData.priority_level}</span>
                </span>
            </div>
            <div class="info-row">
                <span class="info-label">Submission Date</span>
                <span class="info-value">${new Date(grievanceData.submission_date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Current Status</span>
                <span class="info-value">
                    <span class="status-badge status-submitted">Submitted</span>
                </span>
            </div>
        </div>
        
        <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #0c4a6e; margin-bottom: 8px; font-size: 16px;">📋 Your Grievance Description:</h4>
            <p style="color: #0c4a6e; font-style: italic; line-height: 1.6;">"${grievanceData.description}"</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5173/grievances" class="button">
                📊 Track Your Grievance
            </a>
        </div>
        
        <div style="background: #fffbeb; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h4 style="color: #92400e; margin-bottom: 12px; font-size: 16px;">⏰ What Happens Next?</h4>
            <ul style="color: #92400e; padding-left: 20px; line-height: 1.8;">
                <li>Your grievance will be reviewed within 24-48 hours</li>
                <li>You'll receive updates via email and in-app notifications</li>
                <li>Our team may request additional information if needed</li>
                <li>Final resolution typically takes 3-7 business days</li>
            </ul>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
            If you need immediate assistance or have urgent concerns, please contact our support team directly.
        </p>
    `;
    
    return baseTemplate(content, "Grievance Submitted - Student Grievance System");
};

// Template for status update notifications
const statusUpdateTemplate = (grievanceData, newStatus, studentName) => {
    const statusColors = {
        'Submitted': 'submitted',
        'In Progress': 'progress', 
        'Resolved': 'resolved',
        'Rejected': 'rejected'
    };
    
    const statusEmojis = {
        'Submitted': '📝',
        'In Progress': '⚡', 
        'Resolved': '✅',
        'Rejected': '❌'
    };
    
    const content = `
        <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px; font-weight: 600;">
            ${statusEmojis[newStatus] || '📋'} Grievance Status Updated
        </h2>
        
        <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">
            Dear ${studentName || 'Student'},
        </p>
        
        <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">
            We wanted to update you on the status of your grievance. Our team has been working diligently to address your concerns.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 12px; display: inline-block;">
                <h3 style="font-size: 18px; margin-bottom: 8px;">Grievance #${grievanceData.id}</h3>
                <span class="status-badge status-${statusColors[newStatus]}" style="background: rgba(255,255,255,0.2); color: white; font-size: 16px;">
                    ${newStatus}
                </span>
            </div>
        </div>
        
        <div class="info-card">
            <div class="info-row">
                <span class="info-label">Category</span>
                <span class="info-value">${grievanceData.type}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Updated On</span>
                <span class="info-value">${new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</span>
            </div>
        </div>
        
        ${newStatus === 'In Progress' ? `
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #92400e; margin-bottom: 8px; font-size: 16px;">🔄 Under Review</h4>
            <p style="color: #92400e; line-height: 1.6;">Your grievance is currently being investigated by our administrative team. We'll keep you updated on our progress.</p>
        </div>
        ` : ''}
        
        ${newStatus === 'Resolved' ? `
        <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #065f46; margin-bottom: 8px; font-size: 16px;">🎉 Resolved!</h4>
            <p style="color: #065f46; line-height: 1.6;">Great news! Your grievance has been successfully resolved. Please check the system for detailed resolution notes and any follow-up actions.</p>
        </div>
        ` : ''}
        
        ${newStatus === 'Rejected' ? `
        <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #991b1b; margin-bottom: 8px; font-size: 16px;">❌ Not Approved</h4>
            <p style="color: #991b1b; line-height: 1.6;">After careful review, we were unable to approve this grievance request. Please check the system for detailed feedback and consider resubmitting with additional information.</p>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5173/grievances" class="button">
                📱 View Details
            </a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
            Thank you for using the Student Grievance System. Your feedback helps us improve our services.
        </p>
    `;
    
    return baseTemplate(content, `Grievance #${grievanceData.id} - ${newStatus}`);
};

// Template for new message notifications
const newMessageTemplate = (grievanceData, senderName, messagePreview, recipientName) => {
    const content = `
        <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px; font-weight: 600;">
            💬 New Message Received
        </h2>
        
        <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">
            Dear ${recipientName || 'User'},
        </p>
        
        <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">
            You have received a new message regarding your grievance. Here are the details:
        </p>
        
        <div class="info-card">
            <div class="info-row">
                <span class="info-label">Grievance ID</span>
                <span class="info-value" style="font-weight: 600; color: #1f2937;">#${grievanceData.id}</span>
            </div>
            <div class="info-row">
                <span class="info-label">From</span>
                <span class="info-value">${senderName}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Category</span>
                <span class="info-value">${grievanceData.type}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Received</span>
                <span class="info-value">${new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</span>
            </div>
        </div>
        
        <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #0c4a6e; margin-bottom: 8px; font-size: 16px;">💬 Message Preview:</h4>
            <p style="color: #0c4a6e; font-style: italic; line-height: 1.6;">"${messagePreview}"</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5173/grievances" class="button">
                💬 Read Full Message
            </a>
        </div>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h4 style="color: #374151; margin-bottom: 12px; font-size: 16px;">💡 Quick Tips:</h4>
            <ul style="color: #6b7280; padding-left: 20px; line-height: 1.8;">
                <li>Reply promptly to help resolve your grievance faster</li>
                <li>Provide clear and detailed responses</li>
                <li>Attach relevant documents if requested</li>
            </ul>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
            Please log in to the system to read the full message and respond accordingly.
        </p>
    `;
    
    return baseTemplate(content, `New Message - Grievance #${grievanceData.id}`);
};

// Template for staff notification about new grievances
const staffNotificationTemplate = (grievanceData, studentName) => {
    const content = `
        <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px; font-weight: 600;">
            🚨 New Grievance Submitted
        </h2>
        
        <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">
            Dear Staff Member,
        </p>
        
        <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">
            A new grievance has been submitted and requires your attention. Please review the details below and take appropriate action.
        </p>
        
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px; border-radius: 12px; margin: 24px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="font-size: 18px; margin-bottom: 4px;">Grievance #${grievanceData.id}</h3>
                    <p style="opacity: 0.9;">Submitted by ${studentName}</p>
                </div>
                <span class="status-badge priority-${grievanceData.priority_level?.toLowerCase()}" style="background: rgba(255,255,255,0.2); color: white;">
                    ${grievanceData.priority_level} Priority
                </span>
            </div>
        </div>
        
        <div class="info-card">
            <div class="info-row">
                <span class="info-label">Student</span>
                <span class="info-value">${studentName}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Category</span>
                <span class="info-value">${grievanceData.type}</span>
            </div>
            ${grievanceData.subcategory ? `
            <div class="info-row">
                <span class="info-label">Subcategory</span>
                <span class="info-value">${grievanceData.subcategory}</span>
            </div>
            ` : ''}
            <div class="info-row">
                <span class="info-label">Priority</span>
                <span class="info-value">
                    <span class="status-badge priority-${grievanceData.priority_level?.toLowerCase()}">${grievanceData.priority_level}</span>
                </span>
            </div>
            <div class="info-row">
                <span class="info-label">Submitted</span>
                <span class="info-value">${new Date(grievanceData.submission_date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</span>
            </div>
            ${grievanceData.file_path ? `
            <div class="info-row">
                <span class="info-label">Attachment</span>
                <span class="info-value">📎 File attached</span>
            </div>
            ` : ''}
        </div>
        
        <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #0c4a6e; margin-bottom: 8px; font-size: 16px;">📝 Grievance Description:</h4>
            <p style="color: #0c4a6e; line-height: 1.6;">"${grievanceData.description}"</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5173/staff-dashboard" class="button">
                🎯 Review Grievance
            </a>
        </div>
        
        ${grievanceData.priority_level === 'Urgent' ? `
        <div style="background: #fee2e2; border: 1px solid #ef4444; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h4 style="color: #991b1b; margin-bottom: 12px; font-size: 16px;">⚠️ Urgent Action Required</h4>
            <p style="color: #991b1b; line-height: 1.6;">This grievance has been marked as urgent priority. Please review and respond within 24 hours.</p>
        </div>
        ` : ''}
        
        <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
            Please ensure timely review and response to maintain high service standards.
        </p>
    `;
    
    return baseTemplate(content, `New Urgent Grievance #${grievanceData.id} - Action Required`);
};

// Welcome email template for new registrations
const welcomeTemplate = (userData) => {
    const content = `
        <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px; font-weight: 600;">
            🎉 Welcome to Student Grievance System
        </h2>
        
        <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">
            Dear ${userData.full_name || userData.email},
        </p>
        
        <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">
            Welcome to the Student Grievance System! Your account has been successfully created, and you can now submit and track grievances online.
        </p>
        
        <div class="info-card">
            <div class="info-row">
                <span class="info-label">Account Type</span>
                <span class="info-value" style="text-transform: capitalize; font-weight: 600;">${userData.role}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-value">${userData.email}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Registration Date</span>
                <span class="info-value">${new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                })}</span>
            </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5173/login" class="button">
                🚀 Get Started
            </a>
        </div>
        
        <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #0c4a6e; margin-bottom: 12px; font-size: 16px;">🌟 Platform Features:</h4>
            <ul style="color: #0c4a6e; padding-left: 20px; line-height: 1.8;">
                <li>Submit grievances with file attachments</li>
                <li>Real-time status tracking and updates</li>
                <li>Direct messaging with administrative staff</li>
                <li>Email and in-app notifications</li>
                <li>Comprehensive grievance history</li>
            </ul>
        </div>
        
        <div style="background: #fffbeb; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h4 style="color: #92400e; margin-bottom: 12px; font-size: 16px;">💡 Getting Started Tips:</h4>
            <ul style="color: #92400e; padding-left: 20px; line-height: 1.8;">
                <li>Log in using your registered email and password</li>
                <li>Complete your profile for better communication</li>
                <li>Familiarize yourself with the grievance categories</li>
                <li>Keep track of your submission reference numbers</li>
            </ul>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
            If you have any questions or need assistance, our support team is here to help!
        </p>
    `;
    
    return baseTemplate(content, "Welcome to Student Grievance System");
};

module.exports = {
    grievanceSubmittedTemplate,
    statusUpdateTemplate,
    newMessageTemplate,
    staffNotificationTemplate,
    welcomeTemplate
};
