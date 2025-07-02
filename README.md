# Student Grievance Management System

A comprehensive web-based application for managing student grievances with dedicated interfaces for students, staff, and administrators. Built with modern technologies including React, Node.js, and SQLite.

## 🚀 Features

### For Students
- **Grievance Submission**: Submit detailed grievances with category selection and file attachments
- **Real-time Tracking**: Monitor grievance status with interactive timeline visualization
- **Feedback System**: Provide feedback on resolved grievances with ratings and comments
- **Personal Dashboard**: View personal grievances, deadlines, and analytics
- **Modern Analytics**: 3D visualizations and glassmorphism design for grievance statistics
- **Deadline Management**: View personal deadlines and important dates

### For Staff
- **Department-Based Access**: Staff can only view grievances from their assigned department
- **Grievance Management**: Update status, add comments, and track progress
- **Forward Grievances**: Email grievance details to lecturers or other departments
- **Analytics Dashboard**: View department-specific statistics and trends
- **Escalation Management**: Handle escalated grievances with priority tracking
- **Coordinator Assignment**: Assign coordinators to specific grievances
- **Upcoming Deadlines**: Monitor and manage deadline compliance

### For Administrators
- **User Management**: Register and manage student and staff accounts
- **System Analytics**: Comprehensive reporting and data visualization
- **Deadline Configuration**: Set and manage system-wide deadlines
- **Notification System**: Automated email notifications for status updates
- **Database Management**: Full access to system data and configurations

## 🛠️ Technologies Used

### Frontend
- **React 19** - Modern UI framework
- **Vite** - Fast build tool and development server
- **Material-UI (MUI)** - Professional component library
- **Three.js** - 3D graphics and animations
- **React Three Fiber** - React renderer for Three.js
- **Framer Motion** - Smooth animations and transitions
- **Axios** - HTTP client for API communication
- **React Router** - Client-side routing
- **Formik & Yup** - Form handling and validation
- **React Toastify** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **SQLite3** - Lightweight database
- **Nodemailer** - Email service integration
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
├── backend/
│   ├── controllers/         # Business logic controllers
│   ├── models/             # Database models and queries
│   ├── routes/             # API route definitions
│   ├── middleware/         # Authentication and upload middleware
│   ├── utils/              # Utility functions and helpers
│   ├── config/             # Database configuration
│   ├── uploads/            # File upload directory
│   └── server.js           # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React context providers
│   │   ├── utils/          # Frontend utilities
│   │   └── App.jsx         # Main application component
│   ├── public/             # Static assets
│   └── index.html          # HTML template
└── Diagrams/               # System architecture diagrams
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/student-grievance-system.git
   cd student-grievance-system
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up Environment Variables**
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:5174
   
   # Email Configuration (Optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

5. **Initialize Database**
   ```bash
   cd backend
   node migrate.js
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on `http://localhost:5000`

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5174`

3. **Access the Application**
   - Open your browser and navigate to `http://localhost:5174`
   - Register as a student or use staff access code: `2030`

## 🔐 Authentication & Access Control

### Student Access
- Students can register with their university email
- Access to personal grievances and deadlines only
- Cannot view other students' data

### Staff Access
- Staff members use access code: `2030`
- Department-based access control
- Can only view grievances from their assigned department
- Additional privileges for grievance management

### Admin Access
- Full system access
- User management capabilities
- System configuration and analytics

## 📊 Key Features Deep Dive

### Grievance Submission
- **Category Selection**: Academic, Administrative, Facilities, etc.
- **Priority Levels**: High, Medium, Low (system-assigned)
- **File Attachments**: Support for document uploads
- **Semester Selection**: Comprehensive semester options
- **Real-time Validation**: Form validation with error handling

### Timeline Tracking
- **Interactive Timeline**: Visual representation of grievance progress
- **Status Updates**: Automatic logging of all status changes
- **Email Notifications**: Automated notifications for status updates
- **Progress Indicators**: Clear visual feedback on grievance status

### Forward Grievance Feature
- **Email Integration**: Send grievance details to external parties
- **Recipient Management**: Enter lecturer/department email addresses
- **Timeline Logging**: Track all forwarding actions
- **Modal Interface**: User-friendly popup for forwarding

### Modern Analytics Dashboard
- **3D Visualizations**: Interactive 3D charts and graphs
- **Glassmorphism Design**: Modern UI with glass-like effects
- **Real-time Data**: Live updates of grievance statistics
- **Department Filtering**: Staff see only relevant data

## 🗄️ Database Schema

The system uses SQLite3 with the following main tables:
- `students` - Student information and credentials
- `staff` - Staff information and department assignments
- `grievances` - Grievance details and status
- `coordinators` - Coordinator assignments
- `deadlines` - System deadlines and due dates
- `feedback` - Student feedback on resolved grievances
- `timeline` - Audit trail of all grievance activities
- `escalations` - Escalated grievance tracking

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/users/register` - Student registration
- `POST /api/users/staff/register` - Staff registration

### Grievances
- `GET /api/grievances` - List grievances (filtered by role)
- `POST /api/grievances` - Submit new grievance
- `PUT /api/grievances/:id` - Update grievance status
- `POST /api/grievances/forward` - Forward grievance via email

### Feedback
- `GET /api/feedback` - List available grievances for feedback
- `POST /api/feedback` - Submit feedback

### Deadlines
- `GET /api/deadlines` - Get deadlines (filtered by student)
- `POST /api/deadlines` - Create new deadline (staff only)

### Analytics
- `GET /api/stats` - Get system statistics
- `GET /api/timeline` - Get timeline data

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Aesthetics**: Clean, professional interface
- **Intuitive Navigation**: Clear menu structure and breadcrumbs
- **Accessibility**: ARIA labels and keyboard navigation support
- **Loading States**: Smooth loading animations and feedback
- **Error Handling**: User-friendly error messages and recovery options

## 🚀 Deployment

### Production Build

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start Production Server**
   ```bash
   cd backend
   npm start
   ```

### Environment Configuration
- Set `NODE_ENV=production`
- Configure `FRONTEND_URL` for your domain
- Set up email service credentials
- Configure database path for production

## 🧪 Testing

The system includes comprehensive test files:
- API endpoint testing
- Frontend component testing
- Database integration testing
- Email system testing
- Timeline functionality testing

Run tests with:
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Roadmap

- [ ] Mobile application development
- [ ] Advanced reporting and analytics
- [ ] Integration with university systems
- [ ] Multi-language support
- [ ] Advanced notification system
- [ ] Document management system
- [ ] Automated escalation rules
- [ ] API rate limiting and security enhancements

## 🐛 Known Issues

- Email notifications require proper SMTP configuration
- File uploads are limited to 10MB per file
- Some 3D visualizations may not work on older browsers

## 🔒 Security Features

- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration
- File upload restrictions
- Authentication middleware
- Role-based access control

## 📞 Support

For support, email support@university.edu or create an issue in the GitHub repository.

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- University IT Department for infrastructure support
- Student feedback for continuous improvement
- Open source community for excellent libraries and tools

---

**Built with ❤️ for better student experience**
