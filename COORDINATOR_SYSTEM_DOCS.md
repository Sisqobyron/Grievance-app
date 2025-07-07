# Coordinator System Documentation

## 🎯 Purpose

The **Coordinator System** is designed to handle complex grievances that require specialized attention and management. Coordinators are enhanced staff members with additional capabilities and responsibilities.

## 👥 User Roles Hierarchy

```
Student → Staff → Coordinator → Admin
```

1. **Students**: Submit grievances, view their own cases
2. **Staff**: Basic grievance management for their department
3. **Coordinators**: Specialized staff with enhanced capabilities
4. **Admin**: Full system management

## 🔧 How Coordinators Work

### What Makes Someone a Coordinator?
- Must be a **Staff member** first
- Has a **Coordinator Profile** created by an admin
- Gets assigned to a specific **department**
- Has a **specialization** (e.g., "Academic Grievances", "Financial Issues")
- Has a **workload limit** (max concurrent cases)

### Automatic Assignment System
When a grievance is submitted:
1. System finds coordinators in the **same department** as the student
2. Checks each coordinator's **current workload**
3. Assigns to coordinator with **lowest active cases**
4. Only assigns if coordinator has **available capacity**

### Coordinator Capabilities
- **Advanced Grievance Management**: Handle complex cases
- **Escalation Powers**: Can escalate to higher authorities
- **Deadline Management**: Set and track custom deadlines
- **Workload Monitoring**: Track active cases vs. capacity
- **Department Specialization**: Focus on specific types of issues

## 📱 User Interfaces

### 1. Admin Dashboard (`/admin`)
- **Purpose**: Full system administration
- **Access**: Admins only
- **Features**: 
  - Manage all users (students, staff, coordinators, admins)
  - View all grievances with filtering
  - System statistics and analytics

### 2. Coordinator Management (`/coordinator`)
- **Purpose**: Administrative interface for managing coordinator profiles
- **Access**: Admins only
- **Features**:
  - Create new coordinator profiles
  - Edit coordinator details (department, specialization, workload)
  - Monitor coordinator statistics
  - View assignment distribution

### 3. Coordinator Workspace (`/coordinator-workspace`)
- **Purpose**: Individual coordinator's work environment
- **Access**: Staff members who have coordinator profiles
- **Features**:
  - View assigned grievances
  - Manage personal workload
  - Track deadlines and escalations
  - Case management tools

### 4. Staff Dashboard (`/`)
- **Purpose**: Basic staff grievance management
- **Access**: All staff members (including coordinators)
- **Features**:
  - View department grievances
  - Basic status updates
  - Submit grievances for other users

## 🚀 Navigation Logic

The system intelligently shows navigation options based on:

1. **User Role** (student/staff/admin)
2. **Coordinator Status** (whether staff member is also a coordinator)

### Navigation Rules:
- **Students**: Dashboard, Submit Grievance, My Grievances, Notifications, Feedback
- **Staff**: All student options + Escalation, Deadlines
- **Coordinators**: All staff options + Coordinator Workspace
- **Admins**: Admin Panel + Coordinator Management + all other features

## 🔄 Workflow Example

1. **Student submits grievance** → System checks student's department
2. **Auto-assignment** → Finds available coordinator in same department
3. **Coordinator receives case** → Views in Coordinator Workspace
4. **Coordinator manages case** → Updates status, sets deadlines
5. **Escalation if needed** → Coordinator escalates to higher authority
6. **Resolution** → Case closed, student notified

## 🛠️ Technical Implementation

### Database Tables:
- `users` - Base user information
- `staff` - Staff-specific data
- `coordinators` - Coordinator profiles
- `grievance_assignments` - Tracks grievance-to-coordinator assignments
- `grievances` - Grievance data with assignment info

### API Endpoints:
- `GET /api/coordinators` - List all coordinators
- `POST /api/coordinators/register` - Create coordinator profile
- `GET /api/coordinators/user/:userId` - Check if user is coordinator
- `GET /api/coordinators/:id/workload` - Get coordinator workload
- `POST /api/coordinators/assign` - Manual assignment
- `POST /api/coordinators/auto-assign` - Automatic assignment

## 🎯 Key Benefits

1. **Workload Distribution**: Prevents coordinator overload
2. **Specialization**: Coordinators can focus on their expertise
3. **Automatic Efficiency**: Reduces manual assignment work
4. **Scalability**: Easy to add more coordinators as needed
5. **Accountability**: Clear tracking of who handles what

## 🔧 Current Status

✅ **Working Features**:
- Coordinator profile creation
- Automatic assignment logic
- Workload tracking
- Admin management interface

🚧 **Needs Improvement**:
- Coordinator workspace UI could be enhanced
- More sophisticated assignment algorithms
- Better coordinator performance metrics

## 💡 Future Enhancements

1. **Smart Assignment**: Consider specialization matching
2. **Performance Metrics**: Track resolution times per coordinator
3. **Coordinator Chat**: Direct communication between coordinators
4. **Mobile App**: Coordinator mobile interface
5. **AI Integration**: Suggest optimal assignments based on case type
