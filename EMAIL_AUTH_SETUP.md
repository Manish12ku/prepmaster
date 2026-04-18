# Email/Password Authentication Setup

## Firebase Console Configuration

To enable email/password authentication, you need to configure it in your Firebase Console:

### Steps:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **mock-test81**
3. Navigate to **Authentication** in the left sidebar
4. Click on the **Sign-in method** tab
5. Find **Email/Password** in the "Sign-in providers" section
6. Click on it and toggle the switch to **Enable**
7. Click **Save**

### What's Been Implemented:

✅ **Sign Up with Email/Password**
- Collects user's full name, email, and password
- Creates Firebase authentication account
- Syncs user data with backend database
- Default role: student (unless email matches super admin)

✅ **Login with Email/Password**
- Authenticates existing users
- Syncs user session with backend
- Redirects to appropriate dashboard based on role

✅ **Error Handling**
- Email already in use
- Invalid credentials
- Weak password (less than 6 characters)
- User not found

### Features:

1. **Three Authentication Modes:**
   - Login (email/password)
   - Sign Up (name + email/password)
   - Phone OTP (existing)

2. **User Flow:**
   - New users sign up with name, email, and password
   - Returning users login with email and password
   - User data automatically synced to backend
   - Role assigned based on email (super admin for specific email)

3. **UI Improvements:**
   - Tab-based navigation between Login/Sign Up/Phone
   - Clean, modern form design
   - Proper validation and error messages
   - Loading states

### Testing:

1. **Sign Up:**
   - Click "Sign Up" tab
   - Enter your name
   - Enter email address
   - Enter password (min 6 characters)
   - Click "Sign Up"

2. **Login:**
   - Click "Login" tab
   - Enter registered email
   - Enter password
   - Click "Login"

### Notes:

- Password must be at least 6 characters (Firebase requirement)
- Email must be valid format
- Name is required for sign-up only
- Existing Google and Phone authentication still work
- All users default to "student" role unless email matches super admin email
