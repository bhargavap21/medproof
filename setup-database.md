# MedProof Database Setup Guide

## Quick Start with Supabase

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Note your project URL and API keys from the project settings

### 2. Run the Database Schema

1. In your Supabase project dashboard, go to the SQL Editor
2. Copy and paste the entire contents of `database/schema.sql`
3. Click "Run" to execute the schema

### 3. Configure Environment Variables

Create `.env` files in both frontend and backend directories:

**Frontend (.env):**
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

**Backend (.env):**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
PORT=3001
NODE_ENV=development
```

### 4. Test the Authentication System

1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `cd frontend && npm start`
3. Navigate to the application - you should see the login/registration forms
4. Create a new account using the registration form

### 5. Create a Hospital Admin

To access the admin dashboard, you'll need to manually set a user as a hospital admin:

1. In Supabase dashboard, go to Table Editor
2. Find your user in the `user_profiles` table
3. Update the `role` field to `hospital_admin`
4. Set the `hospital_id` to one of the existing hospital UUIDs from the `hospitals` table

### 6. Test the Complete Workflow

1. **As a regular user**: Register for research access
2. **As a hospital admin**: Approve/reject applications in the admin dashboard
3. **Verify permissions**: Check that role-based access control is working

## Database Schema Overview

### Key Tables

- **hospitals**: Hospital institutions in the network
- **user_profiles**: Extended user profiles with roles and hospital associations
- **researcher_applications**: Applications from researchers to join hospitals
- **hospital_authorizations**: Active authorizations for researchers
- **medical_studies**: Medical research studies with privacy-preserving proofs
- **authorization_audit_log**: Audit trail for all authorization actions

### User Roles

- **public**: Default role for new users
- **researcher**: Authorized to submit studies and view aggregated data
- **hospital_admin**: Can approve/reject applications and manage researchers
- **super_admin**: Full system access

### Security Features

- **Row Level Security (RLS)**: Automatically enforced data isolation
- **Hospital-specific isolation**: Users can only see data from their hospital
- **Permission-based access**: Different roles have different capabilities
- **Audit logging**: All authorization actions are logged

## Troubleshooting

### Common Issues

1. **Authentication errors**: Check that environment variables are set correctly
2. **Permission denied**: Ensure RLS policies are properly configured
3. **Database connection**: Verify Supabase URL and keys are correct

### Debug Mode

Set `NODE_ENV=development` to enable additional logging and error details.

### Support

If you encounter issues, check the browser console and server logs for detailed error messages.