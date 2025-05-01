# Project Learnings

## Authentication Issues

1. **Password Validation in NextAuth.js**:
   - When using the Credentials provider in NextAuth.js, always implement proper password validation in the `authorize` callback.
   - The authorize callback should validate credentials using bcrypt to compare the provided password with the hashed password in the database.
   - Without this validation, users will authenticate based only on email match, which is a security risk.

2. **NextAuth Redirect Flow**:
   - Using `redirect: true` in the signIn function immediately redirects without allowing for error handling.
   - Better approach is to use `redirect: false`, capture the return value, and manually handle redirect on success.
   - This allows proper error handling and user feedback when authentication fails.

3. **Debugging NextAuth**:
   - Always check browser console for error messages from NextAuth.
   - The URL query parameters (like `?error=...`) can provide valuable information about what went wrong.
   - Creating a debug route can help inspect the state of users in the database.

4. **Password Hashing**:
   - Ensure passwords are properly hashed before storage during registration.
   - Verify that OAuth providers correctly create user records with appropriate role assignments.
   - Never store plain text passwords.

# Memory

## Database Connections
- The MongoDB connection should be imported from `@/database/mongo.config` using `import { connect } from '@/database/mongo.config'` rather than from `@/lib/mongodb`
- The connection is initialized with `connect()`, which is a function from the mongo.config file

## Date Handling
- When formatting dates with date-fns, always check if the date value exists before formatting to avoid "Invalid time value" errors
- Use fallback patterns like `someDate ? format(new Date(someDate), 'pattern') : fallbackValue`

## File Paths
- Images in the public folder should be referenced without the 'public' part in the path (e.g., use '/assets/images/image.png' not '/public/assets/images/image.png')
- Be careful with file extensions - using .jpg when file is .png or vice versa will cause images not to load

## Email Configuration
- For Gmail, use an App Password instead of your regular account password
- Generate an App Password from Google Account settings: Security > 2-Step Verification > App Passwords
- Store email credentials in environment variables (EMAIL_USER and EMAIL_PASSWORD)
- Use HTML email templates with inline CSS for better email client compatibility 