# Account Management System

## Overview
The AYCE Management System now includes a database-backed account management system. Only administrators can create, modify, and delete user accounts.

## Database Schema

### Accounts Table
```sql
CREATE TABLE "accounts" (
  "id" uuid PRIMARY KEY,
  "username" text UNIQUE NOT NULL,
  "password_hash" text NOT NULL,
  "role" user_role NOT NULL,  -- 'staff' or 'admin'
  "is_active" boolean DEFAULT true,
  "created_at" timestamptz DEFAULT NOW(),
  "updated_at" timestamptz DEFAULT NOW(),
  "created_by" uuid REFERENCES "accounts" ("id")
);
```

## Seed Accounts

Two default accounts are created during database initialization:

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: admin
- **Permissions**: Full access to all features + account management

### Staff Account
- **Username**: `staff`
- **Password**: `staff123`
- **Role**: staff
- **Permissions**: Access to dashboard, tables, menu, analytics (no account management)

## Password Security

- Passwords are hashed using SHA256 before storing
- In production, consider upgrading to bcrypt or argon2 for better security
- Password hashes are never exposed via API

## API Endpoints

### GET /api/accounts
- **Auth Required**: Yes (Admin only)
- **Description**: Retrieve all user accounts
- **Response**: Array of account objects

### POST /api/accounts
- **Auth Required**: Yes (Admin only)
- **Body**: `{ username, password, role }`
- **Description**: Create a new user account
- **Response**: `{ success: true, id }`

### PATCH /api/accounts
- **Auth Required**: Yes (Admin only)
- **Body**: `{ accountId, isActive }`
- **Description**: Activate or deactivate an account
- **Response**: `{ success: true }`

### DELETE /api/accounts
- **Auth Required**: Yes (Admin only)
- **Body**: `{ accountId }`
- **Description**: Permanently delete an account
- **Response**: `{ success: true }`
- **Note**: Cannot delete your own account

## Admin UI

Administrators can access the Account Management page at:
```
/staff/accounts
```

### Features:
- **View All Accounts**: See username, role, status, created by, and creation date
- **Add Account**: Create new staff or admin accounts
- **Activate/Deactivate**: Toggle account active status
- **Delete Account**: Permanently remove accounts (except your own)

## Database Initialization

To initialize the database with the accounts system:

```bash
# Option 1: Full setup with accounts
npm run db:setup

# Option 2: Manual initialization
psql -U ayce_user -d ayce_db -f init-scripts/AYCE.sql
psql -U ayce_user -d ayce_db -f init-scripts/seed-accounts.sql
psql -U ayce_user -d ayce_db -f init-scripts/sample-data.sql
```

## Security Notes

### Current Implementation (Development)
- SHA256 password hashing
- Simple session management
- No rate limiting

### Production Recommendations
1. **Upgrade Password Hashing**: Use bcrypt or argon2
2. **Session Storage**: Use Redis instead of in-memory
3. **Rate Limiting**: Implement login attempt limits
4. **Password Policy**: Enforce minimum length, complexity
5. **Two-Factor Authentication**: Add 2FA for admin accounts
6. **Audit Logging**: Track all account changes
7. **HTTPS Only**: Force secure connections
8. **Session Timeout**: Implement automatic logout

## Usage Example

### Creating a New Staff Account

1. Log in as admin
2. Navigate to "Account Management"
3. Click "Add Account"
4. Fill in:
   - Username: `newstaff`
   - Password: `secure123`
   - Role: Staff
5. Click "Add Account"

### Deactivating an Account

1. Find the account in the list
2. Click "Deactivate"
3. The account can no longer log in
4. Click "Activate" to restore access

## Troubleshooting

### Cannot Login with Default Accounts

1. Check database is running:
   ```bash
   docker ps
   ```

2. Verify accounts exist:
   ```bash
   psql -U ayce_user -d ayce_db -c "SELECT username, role FROM accounts;"
   ```

3. Re-run seed script:
   ```bash
   npm run db:setup
   ```

### Password Hash Verification

Admin password hash for "admin123":
```
240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
```

Staff password hash for "staff123":
```
c5e51e5995efae0cca275a1f671fd5b645f5338bb6936e5d30f7b5c0c9b5c4e9
```

## Migration from Old System

The system has been migrated from hardcoded users to database-backed accounts. The authentication flow now:

1. User submits credentials
2. System queries database for matching username
3. Compares password hash
4. Creates session if valid
5. Returns user object without sensitive data

## Files Modified/Created

### New Files:
- `init-scripts/seed-accounts.sql` - Seed admin/staff accounts
- `app/api/accounts/route.ts` - Account management API
- `app/staff/accounts/page.tsx` - Account management UI
- `scripts/init-db-with-accounts.js` - Database initialization script

### Modified Files:
- `init-scripts/AYCE.sql` - Added accounts table and user_role enum
- `lib/auth.ts` - Changed from hardcoded to database authentication
- `app/api/auth/login/route.ts` - Made authenticateUser async
- `app/components/Sidebar.tsx` - Added account management link for admins
- `package.json` - Added db:setup script
