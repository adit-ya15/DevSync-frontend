# DevSync Frontend - Authentication Features Guide

## Overview
This document describes all the authentication features implemented in the DevSync frontend application based on the backend API routes.

## Features Implemented

### 1. **Sign Up (Registration)**
**Page:** `Login.jsx` (Toggle mode)
- Users can create a new account with:
  - First Name
  - Last Name
  - Email
  - Password (min 6 characters)
- Email validation on client side
- After successful signup, user is redirected to SignupSuccess page

**File:** `src/pages/Login.jsx`

### 2. **Email Verification**
**Flow:**
1. User signs up → receives verification email
2. User clicks verification link in email → redirected to `email-verified` URL
3. Backend verifies token and marks user as verified
4. Frontend shows EmailVerified page with success message

**Pages:**
- `src/pages/EmailVerified.jsx` - Success page after email verification
- `src/pages/SignupSuccess.jsx` - Page shown after signup with option to resend verification
- `src/pages/VerificationFailed.jsx` - Page for expired/invalid tokens

### 3. **Login**
**Page:** `Login.jsx` (Default mode)
- Email and password validation
- Supports both email/password and OAuth logins
- After successful login, user is redirected to home page
- User profile is loaded from `/profile/view` endpoint

**File:** `src/pages/Login.jsx`

### 4. **Forgot Password**
**Flow:**
1. User clicks "Forgot?" link on login page
2. Navigated to ForgotPassword page
3. User enters their email
4. Backend sends password reset email with token
5. User receives reset link in email

**File:** `src/pages/ForgotPassword.jsx`

### 5. **Reset Password**
**Flow:**
1. User clicks reset link from email
2. Redirected to ResetPassword page with token in URL
3. User enters new password and confirms it
4. Backend validates token expiry and resets password
5. Success message and redirect to login

**File:** `src/pages/ResetPassword.jsx`

### 6. **Google OAuth Login**
**Integration:**
- Uses `@react-oauth/google` package
- Google credential is sent to backend `/auth/google/callback`
- User is automatically created if doesn't exist
- User is logged in and redirected to home page

**File:** `src/pages/Login.jsx` (handleGoogleLogin function)

### 7. **GitHub OAuth Login**
**Flow:**
1. User clicks GitHub button on login page
2. Redirected to GitHub authorization page
3. Backend handles OAuth flow and creates/logs in user
4. User is redirected to app homepage

**File:** `src/pages/Login.jsx` (GitHub button click handler)

### 8. **Resend Verification Email**
**Flow:**
1. User can request new verification email on SignupSuccess or VerificationFailed pages
2. Email is resent with new token
3. Rate limiting: Cannot resend within 2 minutes

**Files:**
- `src/pages/SignupSuccess.jsx`
- `src/pages/VerificationFailed.jsx`

### 9. **Logout**
**Flow:**
1. User clicks logout button in navbar/menu
2. Backend clears authentication cookie
3. User is redirected to login page

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/signup` | POST | Create new account |
| `/api/login` | POST | User login |
| `/api/verify-email/:token` | GET | Verify email with token |
| `/api/resend-verification` | POST | Request new verification email |
| `/api/forgot-password` | POST | Request password reset |
| `/api/reset-password/:token` | POST | Reset password with token |
| `/api/auth/google/callback` | POST | Google OAuth callback |
| `/api/auth/github` | GET | GitHub OAuth redirect |
| `/api/auth/github/callback` | GET | GitHub OAuth callback |
| `/api/logout` | POST | User logout |
| `/api/profile/view` | GET | Get current user profile |

## File Structure

```
src/pages/
├── Login.jsx                 # Login & Signup forms
├── ForgotPassword.jsx        # Forgot password page
├── ResetPassword.jsx         # Reset password page
├── EmailVerified.jsx         # Email verification success
├── VerificationFailed.jsx    # Email verification failed/expired
├── SignupSuccess.jsx         # Post-signup confirmation

src/utils/
├── authAPI.js                # Auth API helper functions

src/redux/
├── userSlice.js              # User state management
```

## Route Configuration

Routes added to `App.jsx`:

```jsx
<Route path="/login" element={<Login />} />
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPassword />} />
<Route path="/email-verified" element={<EmailVerified />} />
<Route path="/verification-failed" element={<VerificationFailed />} />
<Route path="/verification-error" element={<VerificationFailed />} />
<Route path="/signup-success" element={<SignupSuccess />} />
```

## Environment Variables Needed

```env
VITE_BACKEND_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GITHUB_CLIENT_ID=your_github_client_id
```

## CSS Classes

All pages use Login.css for consistent styling. New CSS classes added:

- `.login-btn` - Primary button
- `.login-btn-secondary` - Secondary button
- `.login-title` - Page title
- `.login-subtitle` - Page subtitle
- `.login-label` - Form label
- `.login-error` - Error message text
- `.login-password-wrapper` - Password input wrapper
- `.login-password-toggle` - Show/hide password button

## Usage Example

### Implementing Logout

```jsx
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { removeUser } from '../redux/userSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <button onClick={handleLogout}>Logout</button>
  );
};
```

## Error Handling

All pages implement comprehensive error handling:
- Client-side validation with real-time error messages
- API error messages displayed in toast notifications
- Field-level error highlighting
- Generic server error handling

## Testing the Features

1. **Sign Up Flow:** Go to `/login`, toggle to signup, fill form, check email for verification link
2. **Email Verification:** Click verification link from email, should see success page
3. **Login:** Use verified email and password to login
4. **Forgot Password:** Click "Forgot?" on login, enter email, check email for reset link
5. **Reset Password:** Click reset link, enter new password, login with new password
6. **OAuth:** Click Google or GitHub button to test OAuth login

## Next Steps

To enhance security and user experience, consider:

1. **Add password strength indicator** on signup/reset password pages
2. **Implement two-factor authentication** for additional security
3. **Add email verification reminder** if user tries to access protected routes
4. **Implement session timeout** with auto-redirect to login
5. **Add "Remember me" functionality** to persist login state
6. **Implement CSRF protection** for POST requests
7. **Add rate limiting** on frontend for repeated failed attempts
