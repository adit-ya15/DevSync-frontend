import React, { useEffect, useState, useRef, useCallback } from 'react';
import './Login.css';
import logo from '../assests/images/logo.png';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../constants/commonData';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

/* ── Floating code symbols for the left panel ── */
const CODE_SYMBOLS = ['</>', '{ }', '=>', 'fn()', '[ ]', '&&', ':::', '...', '===', '++', 'npm', 'git'];

const Login = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(store => store.user);

    // Interactive state
    const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeout = useRef(null);
    const stageRef = useRef(null);

    useEffect(() => {
        if (user) {
            return navigate("/");
        }
        axios.get(BASE_URL + "/profile/view", { withCredentials: true })
            .then((res) => {
                dispatch(addUser(res.data));
                navigate("/");
            })
            .catch(() => { });
    }, []);

    // Mouse tracking for the stage
    const handleMouseMove = useCallback((e) => {
        if (!stageRef.current) return;
        const rect = stageRef.current.getBoundingClientRect();
        setMousePos({
            x: (e.clientX - rect.left) / rect.width,
            y: (e.clientY - rect.top) / rect.height,
        });
    }, []);

    // Typing detection
    const handleAnyInput = useCallback(() => {
        setIsTyping(true);
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setIsTyping(false), 800);
    }, []);

    const validate = () => {
        const newErrors = {};
        const trimmedEmail = email.trim();
        if (!isLogin) {
            if (!firstName.trim()) newErrors.firstName = "First name is required";
            if (!lastName.trim()) newErrors.lastName = "Last name is required";
        }
        if (!trimmedEmail) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            newErrors.email = "Please enter a valid email";
        }
        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Minimum 6 characters";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFieldChange = (setter, field) => (e) => {
        setter(e.target.value);
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
        if (apiError) setApiError("");
        handleAnyInput();
    };

    const handleLogin = async () => {
        if (!validate()) return;
        setIsLoading(true);
        setApiError("");
        try {
            await axios.post(BASE_URL + "/login", { email: email.trim(), password }, { withCredentials: true });
            const profileRes = await axios.get(BASE_URL + "/profile/view", { withCredentials: true });
            dispatch(addUser(profileRes.data));
            toast.success('Welcome back!');
            navigate("/");
        } catch (error) {
            const msg = error?.response?.data?.message || error?.response?.data || (error?.response?.status === 401 ? "Invalid email or password" : "Something went wrong.");
            const errorMsg = typeof msg === "string" ? msg : "Something went wrong.";
            setApiError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            setIsLoading(true);
            await axios.post(BASE_URL + "/auth/google/callback", { credential: credentialResponse.credential }, { withCredentials: true });
            const profileRes = await axios.get(BASE_URL + "/profile/view", { withCredentials: true });
            dispatch(addUser(profileRes.data));
            toast.success('Welcome back!');
            navigate("/");
        } catch (error) {
            const msg = error?.response?.data?.message || error?.response?.data || "Google login failed.";
            const errorMsg = typeof msg === "string" ? msg : "Google login failed.";
            setApiError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async () => {
        if (!validate()) return;
        setIsLoading(true);
        setApiError("");
        try {
            await axios.post(BASE_URL + "/signup", { email: email.trim(), password, firstName, lastName }, { withCredentials: true });
            toast.success('Account created! Please verify your email.');
            navigate("/signup-success");
        } catch (error) {
            const msg = error?.response?.data?.message || error?.response?.data || "Something went wrong.";
            const errorMsg = typeof msg === "string" ? msg : "Something went wrong.";
            setApiError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            if (isLogin) handleLogin();
            else handleSignUp();
        }
    };

    // Eye follow calculation
    const eyeStyle = (offsetX = 0) => {
        const dx = (mousePos.x - 0.5) * 6 + offsetX;
        const dy = (mousePos.y - 0.5) * 4;
        return { transform: `translate(${dx}px, ${dy}px)` };
    };

    return (
        <div className="login-split-page">
            {/* ═══ LEFT: Interactive Stage ═══ */}
            <div
                className="login-stage"
                ref={stageRef}
                onMouseMove={handleMouseMove}
            >
                {/* Ambient gradient blobs */}
                <div className="login-blob login-blob-1" style={{
                    transform: `translate(${(mousePos.x - 0.5) * -30}px, ${(mousePos.y - 0.5) * -20}px)`
                }} />
                <div className="login-blob login-blob-2" style={{
                    transform: `translate(${(mousePos.x - 0.5) * 20}px, ${(mousePos.y - 0.5) * 30}px)`
                }} />

                {/* Floating code symbols */}
                <div className="login-particles">
                    {CODE_SYMBOLS.map((sym, i) => (
                        <span
                            key={i}
                            className="login-particle"
                            style={{
                                '--i': i,
                                '--total': CODE_SYMBOLS.length,
                                transform: `translate(${(mousePos.x - 0.5) * (10 + i * 3)}px, ${(mousePos.y - 0.5) * (8 + i * 2)}px)`,
                            }}
                        >
                            {sym}
                        </span>
                    ))}
                </div>

                {/* ── Developer Mascot ── */}
                <div className="mascot" style={{
                    transform: `translate(${(mousePos.x - 0.5) * -8}px, ${(mousePos.y - 0.5) * -6}px)`
                }}>
                    <div className="mascot-head">
                        <div className="mascot-hair" />
                        <div className="mascot-face">
                            <div className="mascot-eye mascot-eye-left">
                                <div className="mascot-pupil" style={eyeStyle(-1)} />
                            </div>
                            <div className="mascot-eye mascot-eye-right">
                                <div className="mascot-pupil" style={eyeStyle(1)} />
                            </div>
                            <div className={`mascot-mouth ${isTyping ? 'talking' : ''}`} />
                        </div>
                        <div className="mascot-glasses" />
                    </div>
                    <div className="mascot-body">
                        <div className="mascot-shirt" />
                        <div className={`mascot-hands ${isTyping ? 'typing' : ''}`}>
                            <span className="mascot-hand mascot-hand-l" />
                            <span className="mascot-hand mascot-hand-r" />
                        </div>
                        <div className="mascot-laptop">
                            <div className="mascot-screen">
                                <span className="mascot-code-line" />
                                <span className="mascot-code-line short" />
                                <span className="mascot-code-line" />
                                {isTyping && <span className="mascot-cursor" />}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Brand text */}
                <div className="login-stage-brand">
                    <h1 className="login-stage-title">Dev<span>Sync</span></h1>
                    <p className="login-stage-tagline">Where developers find their perfect match.</p>
                </div>
            </div>

            {/* ═══ RIGHT: Form ═══ */}
            <div className="login-form-side">
                <div className="login-form-inner">
                    <div className="login-form-header">
                        <img src={logo} alt="DevSync" className="login-form-logo" />
                        <h2 className="login-form-title">{isLogin ? 'Welcome back' : 'Create account'}</h2>
                        <p className="login-form-subtitle">
                            {isLogin ? 'Sign in to continue your developer journey' : 'Join the developer community today'}
                        </p>
                    </div>

                    {apiError && (
                        <div className="login-error-toast">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                            <span>{apiError}</span>
                        </div>
                    )}

                    {!isLogin && (
                        <div className="login-field-row">
                            <div className="login-field">
                                <label className="login-field-label">First Name</label>
                                <input type="text" placeholder="John" value={firstName} onChange={handleFieldChange(setFirstName, 'firstName')} onKeyDown={handleKeyDown} className={`login-input ${errors.firstName ? 'login-input-error' : ''}`} />
                                {errors.firstName && <p className="login-field-error">{errors.firstName}</p>}
                            </div>
                            <div className="login-field">
                                <label className="login-field-label">Last Name</label>
                                <input type="text" placeholder="Doe" value={lastName} onChange={handleFieldChange(setLastName, 'lastName')} onKeyDown={handleKeyDown} className={`login-input ${errors.lastName ? 'login-input-error' : ''}`} />
                                {errors.lastName && <p className="login-field-error">{errors.lastName}</p>}
                            </div>
                        </div>
                    )}

                    <div className="login-field">
                        <label className="login-field-label">Email</label>
                        <input type="email" placeholder="you@example.com" value={email} onChange={handleFieldChange(setEmail, 'email')} onKeyDown={handleKeyDown} className={`login-input ${errors.email ? 'login-input-error' : ''}`} />
                        {errors.email && <p className="login-field-error">{errors.email}</p>}
                    </div>

                    <div className="login-field">
                        <label className="login-field-label">Password</label>
                        <input type="password" placeholder="••••••••" value={password} onChange={handleFieldChange(setPassword, 'password')} onKeyDown={handleKeyDown} className={`login-input ${errors.password ? 'login-input-error' : ''}`} />
                        {errors.password && <p className="login-field-error">{errors.password}</p>}
                    </div>

                    {isLogin && (
                        <div className="login-extras">
                            <label className="login-remember"><input type="checkbox" /> Remember me</label>
                            <button type="button" onClick={() => navigate("/forgot-password")} className="login-forgot">Forgot?</button>
                        </div>
                    )}

                    <button className="login-submit-btn" onClick={isLogin ? handleLogin : handleSignUp} disabled={isLoading}>
                        {isLoading ? (
                            <span className="login-btn-loading">
                                <span className="login-spinner" />
                                {isLogin ? 'Signing in…' : 'Creating account…'}
                            </span>
                        ) : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>

                    <div className="login-divider">
                        <div className="login-divider-line" />
                        <span className="login-divider-text">or continue with</span>
                        <div className="login-divider-line" />
                    </div>

                    <div className="login-social-row">
                        <button className="login-social-btn" onClick={() => { window.location.href = "https://devsyncapp.in/api/auth/github"; }}>
                            <svg fill="currentColor" viewBox="0 0 24 24" width="20" height="20"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                            GitHub
                        </button>
                        <GoogleLogin onSuccess={handleGoogleLogin} onError={() => console.log("Login failed")} />
                    </div>

                    <p className="login-footer">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                        <span onClick={() => { setIsLogin(!isLogin); setErrors({}); setApiError(''); }}>{isLogin ? 'Sign up' : 'Sign in'}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
