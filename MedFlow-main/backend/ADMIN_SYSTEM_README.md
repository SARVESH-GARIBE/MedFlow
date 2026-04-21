# MedFlow Role-Based Admin Management System

## Overview

MedFlow now includes a comprehensive role-based admin management system with area-based access control and user verification workflows.

## User Roles

### 1. Super Admin
- **Full system access** - Can manage all users, roles, and areas
- **Create admin users** with area assignments
- **Global dashboard** access
- **No area restrictions**

### 2. Admin
- **Area-restricted access** - Can only manage users in their assigned city/area
- **User verification** and rejection capabilities
- **Dashboard access** limited to their area
- **Cannot create other admins** or change user roles

### 3. Doctor
- **Medical professional** role
- **Requires verification** before account activation
- **Can manage appointments** and patient interactions
- **Profile management** with specialization details

### 4. Patient
- **Standard user** role
- **Auto-verified** upon registration
- **Can book appointments** and access medical services
- **Basic profile management**

## Key Features

### 🔐 Role-Based Access Control
- **Hierarchical permissions** (super_admin > admin > doctor > patient)
- **Area-based restrictions** for admin users
- **Middleware protection** on all admin routes

### 📍 Area-Based Management
- **City and area assignments** for admin users
- **Geographic restrictions** on user management
- **Scalable for multi-city operations**

### ✅ User Verification System
- **Document verification** for doctors
- **Masked document IDs** for privacy
- **Verification status tracking**
- **Rejection with reasons**

## API Endpoints

### Authentication
```http
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/profile
PUT  /api/v1/auth/profile
```

### Admin Management (Protected Routes)
```http
GET  /api/v1/admin/dashboard     # Dashboard stats
GET  /api/v1/admin/users         # List users (paginated)
GET  /api/v1/admin/users/:id     # Get user details
PUT  /api/v1/admin/users/:id/role # Update role/area (super_admin only)
PUT  /api/v1/admin/users/:id/verify # Verify user
PUT  /api/v1/admin/users/:id/reject # Reject user
POST /api/v1/admin/users         # Create admin (super_admin only)
```

## Usage Examples

### 1. Create Super Admin
```bash
# Run migration script to create initial super admin
node scripts/migrateUsers.js
```

**Default Super Admin:**
- Email: `admin@medflow.com`
- Password: `admin123`

### 2. Create Area Admin
```javascript
// POST /api/v1/admin/users (super_admin only)
{
  "name": "City Admin",
  "email": "admin@pune.com",
  "password": "admin123",
  "role": "admin",
  "assignedArea": {
    "city": "Pune",
    "area": "All Areas"
  }
}
```

### 3. Register Doctor
```javascript
// POST /api/v1/auth/register
{
  "name": "Dr. John Doe",
  "email": "doctor@example.com",
  "password": "password123",
  "role": "doctor",
  "city": "Pune",
  "area": "Koregaon Park"
}
```

### 4. Verify Doctor (Admin Only)
```javascript
// PUT /api/v1/admin/users/:doctorId/verify
{
  "isVerified": true,
  "documentType": "medical_license",
  "documentIdMasked": "****1234"
}
```

## Middleware Usage

### Protect Routes
```javascript
import { protect, authorize, authorizeArea } from '../middlewares/authMiddleware.js';

// Require authentication
router.use(protect);

// Require specific roles
router.use(authorize('super_admin', 'admin'));

// Require area access
router.use(authorizeArea());
```

### Verification Requirements
```javascript
import { requireVerification } from '../middlewares/authMiddleware.js';

// Require verified account
router.use(requireVerification());
```

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['super_admin', 'admin', 'doctor', 'patient'],
  assignedArea: {
    city: String,
    area: String
  },
  verification: {
    documentType: String,
    documentIdMasked: String,
    isVerified: Boolean
  },
  // ... other fields based on role
}
```

## Migration

To migrate existing Patient and Doctor data to the new User model:

```bash
cd backend
node scripts/migrateUsers.js
```

This will:
- Migrate all existing patients and doctors
- Create a default super admin account
- Preserve all existing data and relationships

## Security Features

- **Password hashing** with bcrypt
- **JWT token authentication** with role encoding
- **Area-based access control** preventing unauthorized data access
- **Document verification** workflow for doctors
- **Role hierarchy** preventing privilege escalation
- **Request validation** and sanitization

## Best Practices

1. **Always use middleware** for route protection
2. **Validate area access** before data operations
3. **Log admin actions** for audit trails
4. **Use masked document IDs** for privacy compliance
5. **Regular security audits** of admin accounts
6. **Implement rate limiting** on admin endpoints

## Troubleshooting

### Common Issues

1. **403 Forbidden**: Check user role and area assignments
2. **Area Restriction**: Admin trying to access data outside their area
3. **Verification Required**: Doctor account not yet verified
4. **Role Change Failed**: Only super_admin can change roles

### Debug Mode
Set `NODE_ENV=development` to see detailed error messages in API responses.

## Production Deployment

1. **Set environment variables**:
   ```env
   JWT_SECRET=your_secure_secret_key
   MONGODB_URI=your_mongodb_connection_string
   NODE_ENV=production
   ```

2. **Run migration** before deployment:
   ```bash
   node scripts/migrateUsers.js
   ```

3. **Create initial super admin** and area admins

4. **Configure CORS** for your frontend domain

## Support

For issues with the admin system:
1. Check middleware logs for authorization failures
2. Verify user roles and area assignments in database
3. Ensure JWT tokens include correct role information
4. Test with different user roles to isolate issues