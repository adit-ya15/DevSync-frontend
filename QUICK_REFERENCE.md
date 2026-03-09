# DevSync Authentication - Quick Reference Card

## 📱 Pages at a Glance

| Page | URL | Purpose | File |
|------|-----|---------|------|
| Login/Signup | `/login` | User authentication | `Login.jsx` |
| Forgot Password | `/forgot-password` | Request password reset | `ForgotPassword.jsx` |
| Reset Password | `/reset-password/:token` | Change forgotten password | `ResetPassword.jsx` |
| Email Verified | `/email-verified` | Confirm email verification | `EmailVerified.jsx` |
| Verification Failed | `/verification-failed` | Handle expired verification | `VerificationFailed.jsx` |
| Signup Success | `/signup-success` | Post-signup confirmation | `SignupSuccess.jsx` |

## 🔑 Key Imports for Your Components

```javascript
// For navigation
import { useNavigate } from 'react-router-dom';

// For API calls
import axios from 'axios';
import { BASE_URL } from '../constants/commonData';

// For Redux
import { useDispatch, useSelector } from 'react-redux';
import { addUser, removeUser } from '../redux/userSlice';

// For notifications
import toast from 'react-hot-toast';

// For images
import logo from '../assests/images/logo.png';
```

## 🚀 Common Implementation Patterns

### Pattern 1: Protected Route Component
```jsx
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectRoute = ({ element }) => {
  const user = useSelector(state => state.user);
  return user ? element : <Navigate to="/login" />;
};

// In App.jsx:
<Route path="/profile" element={<ProtectRoute element={<Profile />} />} />
```

### Pattern 2: Logout Function
```jsx
const handleLogout = async () => {
  try {
    await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
    dispatch(removeUser());
    navigate("/login");
    toast.success("Logged out successfully");
  } catch (error) {
    toast.error("Logout failed");
  }
};
```

### Pattern 3: Form Validation
```jsx
const validate = () => {
  const newErrors = {};
  
  if (!email.trim()) {
    newErrors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    newErrors.email = "Invalid email format";
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### Pattern 4: API Error Handling
```jsx
catch (error) {
  const msg = 
    error?.response?.data?.message || 
    error?.response?.data || 
    "Something went wrong. Please try again.";
  const errorMsg = typeof msg === "string" ? msg : "Server error";
  
  setApiError(errorMsg);
  toast.error(errorMsg);
}
```

## 🎨 CSS Classes Quick Guide

```css
/* Layout */
.login-page              /* Main container - use on page wrapper */
.login-card              /* Form card container */
.login-glow              /* Background gradient effect */

/* Typography */
.login-title             /* Large page title */
.login-subtitle          /* Smaller subtitle text */
.login-field             /* Form field wrapper */
.login-label             /* Field label */
.login-error             /* Error message text */

/* Inputs */
.login-input             /* Text/email/password input */
.login-input-error       /* Error state for input */
.login-password-wrapper  /* Password input container */
.login-password-toggle   /* Show/hide password button */

/* Buttons */
.login-btn               /* Primary submit button */
.login-btn-secondary     /* Secondary/cancel button */
.login-forgot            /* Forgot password link */

/* Messages */
.login-error-toast       /* Error notification box */
```

## 📧 Email Verification Flow

```
1. User signs up
   ↓
2. POST /api/signup
   ↓
3. Server sends email with: /auth/verify-email/{token}
   ↓
4. User clicks link
   ↓
5. Browser goes to: /email-verified (frontend redirects)
   ↓
6. GET /api/verify-email/{token} (backend auto-calls)
   ↓
7. Success page shown
   ↓
8. User can now log in
```

## 🔐 Password Reset Flow

```
1. User clicks "Forgot?" on login
   ↓
2. Navigate to /forgot-password
   ↓
3. User enters email
   ↓
4. POST /api/forgot-password with email
   ↓
5. Server sends email with: /reset-password/{token}
   ↓
6. User clicks link
   ↓
7. Browser goes to: /reset-password/{token}
   ↓
8. User enters new password
   ↓
9. POST /api/reset-password/{token} with password
   ↓
10. Success message
    ↓
11. Redirect to /login
    ↓
12. User logs in with new password
```

## 🔄 OAuth Flow

### Google
```
1. User clicks Google button
   ↓
2. GoogleLogin component shows Google selector
   ↓
3. User selects account
   ↓
4. Google returns credential token
   ↓
5. handleGoogleLogin(credentialResponse)
   ↓
6. POST /api/auth/google/callback with credential
   ↓
7. Backend verifies token and creates/logs in user
   ↓
8. Success → Redirect to home
```

### GitHub
```
1. User clicks GitHub button
   ↓
2. Redirect to /api/auth/github
   ↓
3. Backend redirects to GitHub auth page
   ↓
4. User authorizes
   ↓
5. GitHub redirects to /api/auth/github/callback
   ↓
6. Backend creates/logs in user
   ↓
7. Success → Redirect to https://devsyncapp.in
```

## 📝 Environment Variables

```env
# Backend URL (in constants/commonData.js or your config)
VITE_BACKEND_URL=http://localhost:5000/api

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# GitHub OAuth (backend only)
REACT_APP_GITHUB_CLIENT_ID=your_github_client_id
```

## 🧪 Quick Testing Commands

```bash
# Test signup API
curl -X POST http://localhost:5000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Test login API
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }' \
  -c cookies.txt

# Test with cookies
curl -X GET http://localhost:5000/api/profile/view \
  -b cookies.txt
```

## 🚨 Error Codes Reference

| Error | Status | Cause | Solution |
|-------|--------|-------|----------|
| Email already exists | 400 | Signup with existing email | Use different email or login |
| Invalid credentials | 401 | Wrong password or email | Check credentials |
| Email not verified | 403 | Trying to login before verification | Verify email first |
| Invalid token | 403 | Expired or wrong reset token | Request new reset link |
| User not found | 404 | No account with that email | Create new account |
| Server error | 500 | Backend issue | Check server logs |

## 📍 State Management

### Redux User Slice
```javascript
// Actions available:
dispatch(addUser(userData))    // Set logged-in user
dispatch(removeUser())          // Clear user (logout)

// Access user:
const user = useSelector(state => state.user)
```

### Loading State Pattern
```jsx
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setIsLoading(true);
  try {
    // API call
  } finally {
    setIsLoading(false); // Always clear loading
  }
};

// In button:
<button disabled={isLoading}>
  {isLoading ? "Loading..." : "Submit"}
</button>
```

## 🎯 Best Practices

✅ **Do:**
- Always use `withCredentials: true` for auth requests
- Validate emails on both client and server
- Show specific error messages
- Use FormData for file uploads if needed
- Handle token expiration gracefully
- Show loading states during requests
- Use toast notifications for feedback

❌ **Don't:**
- Store JWT in localStorage (use httpOnly cookies)
- Send sensitive data in URLs (except reset token)
- Check if user is logged in only on frontend
- Make multiple simultaneous auth requests
- Show passwords as plain text
- Cache auth responses

## 🔍 Quick Debug Tips

```javascript
// Check if user is logged in
console.log(useSelector(state => state.user));

// Check API URL
console.log(BASE_URL);

// Test API endpoint
fetch(`${BASE_URL}/profile/view`, { credentials: 'include' })
  .then(r => r.json())
  .then(console.log)

// Check cookies
console.log(document.cookie);

// Network debugging
// Open DevTools → Network tab → see all requests/responses
```

## 📚 Related Files

- `LOGIN.css` - Styling for all auth pages
- `userSlice.js` - Redux state management
- `authAPI.js` - API helper (optional)
- `commonData.js` - Configuration constants
- `emailService.js` - Email sending (backend)

## 🆘 Need Help?

1. **Check** - TROUBLESHOOTING.md for common issues
2. **Read** - AUTH_FLOW.md for detailed documentation  
3. **Review** - AUTHENTICATION_SETUP.md for integration examples
4. **Test** - Backend API separately with curl
5. **Debug** - Browser DevTools → Network & Console tabs

---

**Last Updated:** March 2026
**Version:** 1.0.0
**Status:** Production Ready ✅
