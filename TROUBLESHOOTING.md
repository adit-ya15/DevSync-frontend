# Troubleshooting Guide - DevSync Authentication

## Common Issues & Solutions

### 1. **Signup Page Not Showing Verification Link in Email**

**Symptoms:**
- User signs up but doesn't receive verification email
- Email is sent but verification link is broken

**Solutions:**
- Check backend `emailService.js` is configured correctly
- Verify email credentials (Gmail, SendGrid, etc.) are set in `.env`
- Check `BACKEND_URL` in `.env` matches actual backend URL
- Look at backend logs for email service errors
- Try logging in directly to check email service account

**Code to check (Backend):**
```javascript
const verifyLink = `${process.env.BACKEND_URL}/auth/verify-email/${verificationToken}`;
// Must be valid URL that a user can click
```

---

### 2. **"Invalid Token" Error on Password Reset**

**Symptoms:**
- Reset password link from email doesn't work
- Getting 403 "Invalid or Expired Token" error

**Solutions:**
- Token expires after 1 hour (check backend setting)
- Request new reset email if token is old
- Check if token in URL matches database record
- Verify backend is hashing token correctly
- Check `BACKEND_URL` is correct in reset link

**Code to fix (SignupSuccess or VerificationFailed):**
```jsx
// Re-request password reset email
const handleResendEmail = async () => {
  try {
    const response = await axios.post(
      BASE_URL + "/forgot-password",  // NOT resend-verification
      { email: email.trim() },
      { withCredentials: true }
    );
    toast.success("New reset link sent!");
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};
```

---

### 3. **Email Not Auto-Redirecting After Verification**

**Symptoms:**
- Click email verification link
- See success message but not redirected
- Stay on `/email-verified` page

**Solution:**
This is expected behavior! The page shows success message and redirects after 3 seconds.
If you want immediate redirect:

Edit `EmailVerified.jsx`:
```jsx
useEffect(() => {
  // Redirect immediately instead of 3 seconds
  navigate("/login");
}, [navigate]);
```

---

### 4. **"Already Verified" Error on Resend**

**Symptoms:**
- User already verified email
- Clicking resend gives "Already verified" error

**Solution:**
This is correct behavior. User shouldn't resend if already verified.
Redirect verified users to login:

Edit `SignupSuccess.jsx`:
```jsx
const handleResendEmail = async () => {
  try {
    const response = await axios.post(
      BASE_URL + "/resend-verification",
      { email: email.trim() },
      { withCredentials: true }
    );
    
    if (response.data.message.includes("Already verified")) {
      navigate("/login");  // Already verified, go to login
    } else {
      toast.success("Email resent!");
    }
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};
```

---

### 5. **Resend Email Rate Limiting**

**Symptoms:**
- Getting "Please wait before requesting another email" error
- Can't resend verification within 2 minutes

**Solution:**
This is a security feature. Rate limit is ~2 minutes between resends.
Backend code checks:
```javascript
if (user.verificationTokenExpires > Date.now() - 120000) {
  // Can't resend within 2 minutes
}
```

**For testing:**
- Wait 2+ minutes before resending
- Change rate limit in backend if needed

---

### 6. **Forgot Password Link Not Working**

**Symptoms:**
- Click "Forgot?" on login
- ForgotPassword page doesn't exist or shows 404

**Solution:**
Make sure route is added in `App.jsx`:
```jsx
<Route path="/forgot-password" element={<ForgotPassword />} />
```

Verify import is at top:
```jsx
import ForgotPassword from "./pages/ForgotPassword"
```

---

### 7. **Password Reset Shows "Invalid or Expired Token"**

**Symptoms:**
- Copy reset link from email
- Paste in browser → Invalid Token error
- But link looks correct

**Solutions:**
1. **Token expired (>1 hour old)**
   - Request new password reset from login page

2. **Token not matching database**
   - Check backend is using same token from email
   - Verify no spaces in URL

3. **Session issue**
   - Try incognito/private window
   - Clear browser cookies

4. **URL encoding issue**
   - If token contains special characters, verify encoding

**Test with curl:**
```bash
curl -X POST "http://localhost:5000/api/reset-password/yourtoken" \
  -H "Content-Type: application/json" \
  -d '{"password":"newpassword"}'
```

---

### 8. **Google/GitHub OAuth Not Working**

**Symptoms:**
- Click Google/GitHub button
- Error: "Invalid Client ID" or blank page

**Solutions:**

**For Google OAuth:**
1. Check `VITE_GOOGLE_CLIENT_ID` in `.env`
2. Verify in `.env`:
```env
VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here
```
3. Reload app (Vite caches env variables)
4. Check Google Console for correct domains
5. Verify redirect URIs in Google Console include:
   - http://localhost:3000 (dev)
   - https://yourdomain.com (production)

**For GitHub OAuth:**
1. Check backend `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
2. Verify GitHub App settings:
   - Authorization callback URL: http://localhost:5000/api/auth/github/callback
   - Homepage URL: http://localhost:3000
3. Verify backend redirects correctly:
```javascript
// Should redirect to: https://devsyncapp.in
res.redirect("https://devsyncapp.in")
```

---

### 9. **Form Not Submitting / Button Disabled**

**Symptoms:**
- Enter form data and click submit
- Button seems disabled or nothing happens
- Loading spinner keeps spinning

**Solutions:**
1. Check browser console for JavaScript errors
2. Verify API endpoint URLs:
```javascript
// In each page, check BASE_URL
console.log(BASE_URL); // Should be http://localhost:5000/api
```
3. Check network tab in DevTools:
   - Should see POST/GET requests
   - Check response status (should be 2xx for success)

4. Common issues:
```javascript
// Wrong: Forgot to add withCredentials
axios.post(url, data) // ❌

// Correct: Include credentials for cookies
axios.post(url, data, { withCredentials: true }) // ✅
```

---

### 10. **Users Redirect to Login Immediately After Login**

**Symptoms:**
- Enter credentials
- "Welcome back!" toast shows
- But redirected back to login page

**Solutions:**
1. **User not verified** (if required)
   - Backend checks: `user.isVerified === true`
   - Solution: Verify email first

2. **Token not being set/cleared**
   - Check cookies in DevTools
   - Backend should set `httpOnly` cookie
   - Frontend shouldn't manually manage JWT

3. **Profile endpoint failing**
```javascript
// In Login.jsx, this fails:
const profileRes = await axios.get(
  BASE_URL + "/profile/view", 
  { withCredentials: true }
);
// Check if /profile/view endpoint exists and returns user data
```

4. **Redux not updating**
   - Check userSlice dispatches addUser
   - Check redux DevTools extension

---

### 11. **"Email already exists" on signup**

**Symptoms:**
- New user tries to sign up with existing email
- Getting email duplicated error

**Solution:**
This is intended behavior. User can:
1. Use different email
2. Use "Forgot Password" if they have existing account
3. Contact support to recover account

---

### 12. **Password Too Short Error**

**Symptoms:**
- Entering "123456" (6 characters)
- Getting "Password must be at least X characters"

**Solutions:**
Version 1: Your backend requires > 6 characters
```javascript
if (password.length < 6) {
  newErrors.password = "Password must be at least 6 characters";
}
```

Change validation message or requirements to match backend.

---

### 13. **Email Verification Link 404 After Redirect**

**Symptoms:**
- Backend redirects to frontend URL after email verification
- Getting 404 on `/email-verified`

**Solution:**
Routes might not be registered. Check `App.jsx`:
```jsx
<Route path="/email-verified" element={<EmailVerified />} />
<Route path="/verification-failed" element={<VerificationFailed />} />
<Route path="/verification-error" element={<VerificationFailed />} />
```

All three routes should exist.

---

### 14. **CORS Errors**

**Symptoms:**
- Error: "Access to XMLHttpRequest from origin blocked by CORS policy"

**Solution:**
Backend needs CORS headers. Check backend:
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

---

## Debug Checklist

Before reporting issues, verify:

- [ ] Backend is running and accessible
- [ ] Frontend `.env` has correct API URL
- [ ] Email service is configured (check logs)
- [ ] All routes exist in `App.jsx`
- [ ] All components imported correctly
- [ ] Redux userSlice has `addUser` and `removeUser`
- [ ] Cookies are enabled in browser
- [ ] Check browser console for errors
- [ ] Check network tab for failed requests
- [ ] Check backend API logs for errors
- [ ] Try incognito window to bypass cache
- [ ] Clear browser cache if stuck

## Getting Help

If issue persists:
1. Check backend logs for errors
2. Check browser DevTools Network tab
3. Verify API responses match expected format
4. Check environment variables are set
5. Review backend API code for changes
