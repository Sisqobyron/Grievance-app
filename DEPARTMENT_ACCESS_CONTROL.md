# Department-Based Access Control Implementation

## Overview
Staff members can now only view grievances from students in their own department. This ensures data privacy and proper access control within the university system.

## Implementation Details

### 1. Authentication & Authorization
- **Route Protection**: All department-sensitive routes now require authentication
- **Role Verification**: Staff role is verified before granting access to department data
- **Admin Override**: Admin users can access grievances from all departments

### 2. Middleware Components

#### `authMiddleware.js`
- Validates user authentication tokens
- Adds user information to request object
- Rejects unauthorized requests

#### `departmentAccessMiddleware.js` (NEW)
- **Purpose**: Ensures staff can only access their department's data
- **Features**:
  - Verifies staff role and retrieves department information
  - Adds `req.staffDepartment` for use in controllers
  - Admin users bypass department restrictions
  - Provides detailed error messages for access violations

#### `grievanceDepartmentAccess` (NEW)
- **Purpose**: Protects individual grievance access by department
- **Features**:
  - Checks if specific grievance belongs to staff's department
  - Blocks cross-department grievance viewing
  - Provides clear error messages with department information

### 3. Database Queries

#### Department-Based Grievance Retrieval
```sql
SELECT 
  g.*,
  u.name as student_name,
  s.department,
  s.program,
  s.level
FROM grievances g
JOIN students s ON g.student_id = s.user_id
JOIN users u ON s.user_id = u.id
WHERE s.department = ?
ORDER BY g.submission_date DESC
```

#### Cross-Department Access Verification
```sql
SELECT 
  g.id,
  s.department
FROM grievances g
JOIN students s ON g.student_id = s.user_id
WHERE g.id = ?
```

### 4. API Endpoints

#### Protected Routes
- `GET /api/grievances/department` - Staff department grievances
- `GET /api/grievances/staff/department` - Alternative staff endpoint
- `GET /api/grievances/:id` - Individual grievance (department-restricted)

#### Response Format
```json
{
  "department": "Engineering",
  "staffMember": "Dr. John Smith",
  "count": 15,
  "grievances": [...]
}
```

### 5. Error Handling

#### Authentication Errors
- **401**: Missing or invalid authentication token
- **403**: Insufficient permissions (non-staff role)
- **404**: Staff profile not found

#### Department Access Errors
```json
{
  "message": "Access denied. This grievance belongs to a different department.",
  "yourDepartment": "Engineering",
  "grievanceDepartment": "Computer Science"
}
```

### 6. Security Features

#### Department Isolation
- **Engineering Staff**: Can only see Engineering student grievances
- **Business Staff**: Can only see Business student grievances  
- **Computer Science Staff**: Can only see Computer Science student grievances

#### Admin Access
- **Full Access**: Admin users can view grievances from all departments
- **Override**: Admin role bypasses all department restrictions

#### Audit Trail
- All department access attempts are logged
- Failed access attempts include department information
- Success logs show staff member and department accessed

### 7. Testing

#### Automated Tests
- `test_department_access.js`: Database-level access verification
- `test_department_api.js`: API endpoint access testing

#### Test Scenarios
1. **Valid Access**: Staff viewing own department grievances
2. **Cross-Department Block**: Staff blocked from other departments
3. **Individual Grievance**: Department-based single grievance access
4. **Admin Override**: Admin access to all departments
5. **Authentication Failure**: Proper error handling

### 8. Frontend Integration

#### API Calls
```javascript
// Staff accessing department grievances
const response = await fetch('/api/grievances/department', {
  headers: {
    'Authorization': `Bearer ${userToken}`
  }
});
```

#### Error Handling
```javascript
if (response.status === 403) {
  // Show department access denied message
  showError('You can only view grievances from your department');
}
```

## Configuration

### Environment Variables
- Authentication is currently using base64 encoding for demo purposes
- Production should implement JWT tokens with proper signing

### Database Requirements
- Staff must have department information in the `staff` table
- Students must have department information in the `students` table
- Proper foreign key relationships between users, staff, students, and grievances

## Security Benefits

1. **Data Privacy**: Staff cannot access student data from other departments
2. **Access Control**: Clear role-based permissions with department boundaries
3. **Audit Trail**: All access attempts are logged for security monitoring
4. **Error Transparency**: Clear error messages help users understand access restrictions
5. **Admin Flexibility**: Administrative users maintain full system access

## Usage Examples

### Staff Login and Department Access
1. Staff member logs in with department credentials
2. System identifies their department from staff profile
3. API calls automatically filter to show only their department's grievances
4. Attempts to access other departments are blocked with clear error messages

### Cross-Department Collaboration
- For cases requiring cross-department collaboration, admin users can facilitate
- Grievances can be escalated to admin level for multi-department issues
- Department boundaries maintain data security while allowing proper workflow
