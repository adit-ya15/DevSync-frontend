import React, { useEffect, useState } from 'react';
import './Login.css';
import heroImg from '../assests/images/devsync_login_hero.png';
import logo from '../assests/images/logo.png';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../constants/commonData';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});        // per-field errors
    const [apiError, setApiError] = useState("");     // server / network error
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(store => store.user);

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

    // ── Validate fields ──
    const validate = () => {
        const newErrors = {};
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Clear per-field error when user starts typing
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
        if (apiError) setApiError("");
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
        if (apiError) setApiError("");
    };

    const handleLogin = async () => {
        if (!validate()) return;

        setIsLoading(true);
        setApiError("");

        try {
            await axios.post(BASE_URL + "/login", {
                email: email.trim(),
                password
            }, { withCredentials: true });

            const profileRes = await axios.get(BASE_URL + "/profile/view", { withCredentials: true });
            dispatch(addUser(profileRes.data));
            navigate("/");
        } catch (error) {
            const msg =
                error?.response?.data?.message ||
                error?.response?.data ||
                (error?.response?.status === 401
                    ? "Invalid email or password"
                    : "Something went wrong. Please try again.");
            setApiError(typeof msg === "string" ? msg : "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Allow Enter key to submit
    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleLogin();
    };

    return (
        <div className="min-h-screen flex font-[Inter,sans-serif] text-white relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1035 50%, #0f0f1e 100%)' }}>

            <div className="login-blob login-blob-1" />
            <div className="login-blob login-blob-2" />
            <div className="login-blob login-blob-3" />

            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
                <img src={heroImg} alt="DevSync hero" className="absolute inset-0 w-full h-full object-cover" />
                <div className="login-hero-overlay absolute inset-0" />

                <div className="relative z-10 max-w-md login-fade-in login-hero-text">
                    <img src={logo} alt="DevSync logo" className="w-16 h-16 mb-6 rounded-xl" />
                    <h1 className="text-4xl font-bold mb-3 leading-tight">Find Your Perfect<br />Dev Match</h1>
                    <p className="text-lg text-white/70 mb-8">
                        Swipe, connect, and build amazing things with developers who complement your skills.
                    </p>

                    <ul className="space-y-4">
                        {[
                            { icon: '🤝', text: 'Skill-based matching' },
                            { icon: '💬', text: 'Real-time collaboration' },
                            { icon: '🚀', text: 'Ship projects faster' },
                        ].map((f, i) => (
                            <li key={i} className="flex items-center gap-3 text-white/80">
                                <span className="text-2xl">{f.icon}</span>
                                <span className="text-base">{f.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 relative z-10">
                <div className="login-glass rounded-3xl w-full max-w-md p-8 sm:p-10 login-fade-in">

                    <div className="text-center mb-8 login-fade-in login-fade-in-delay-1">
                        <div className="flex items-center justify-center gap-2.5 mb-4">
                            <img src={logo} alt="DevSync" className="w-10 h-10 rounded-lg" />
                            <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">DevSync</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                        <p className="text-white/50 text-sm">Sign in to continue your dev journey</p>
                    </div>

                    {/* ── API Error Toast ── */}
                    {apiError && (
                        <div className="login-error-toast mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                            <span>{apiError}</span>
                        </div>
                    )}

                    <div className="space-y-5">
                        <div className="login-fade-in login-fade-in-delay-2 mb-5">
                            <label className="block text-sm font-medium text-white/60 mb-1.5">Email</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5a2.25 2.25 0 0 0-2.25 2.25m19.5 0-8.953 5.468a1.5 1.5 0 0 1-1.594 0L2.25 6.75" />
                                    </svg>
                                </span>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={handleEmailChange}
                                    onKeyDown={handleKeyDown}
                                    className={`login-input w-full rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/25 ${errors.email ? 'login-input-error' : ''}`}
                                />
                            </div>
                            {errors.email && <p className="login-field-error mt-1.5 text-xs">{errors.email}</p>}
                        </div>

                        <div className="login-fade-in login-fade-in-delay-3">
                            <label className="block text-sm font-medium text-white/60 mb-1.5">Password</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                    </svg>
                                </span>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    onKeyDown={handleKeyDown}
                                    className={`login-input w-full rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/25 ${errors.password ? 'login-input-error' : ''}`}
                                />
                            </div>
                            {errors.password && <p className="login-field-error mt-1.5 text-xs">{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between text-sm login-fade-in login-fade-in-delay-3">
                            <label className="flex items-center gap-2 cursor-pointer text-white/50">
                                <input type="checkbox" className="checkbox checkbox-xs checkbox-primary rounded" />
                                Remember me
                            </label>
                            <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            className={`login-btn-gradient login-fade-in login-fade-in-delay-4 w-full py-3 rounded-xl text-sm font-semibold text-white tracking-wide ${isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                            onClick={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing in…
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </div>


                    <div className="flex items-center gap-3 my-7 login-fade-in login-fade-in-delay-4">
                        <div className="login-divider-line flex-1" />
                        <span className="text-xs text-white/30 uppercase tracking-widest">or continue with</span>
                        <div className="login-divider-line flex-1" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 login-fade-in login-fade-in-delay-4">
                        <button className="login-social-btn flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white/70 cursor-pointer">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                            </svg>
                            GitHub
                        </button>

                        <button className="login-social-btn flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white/70 cursor-pointer">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                    </div>

                    <p className="text-center text-sm text-white/40 mt-7 login-fade-in login-fade-in-delay-4">
                        Don't have an account?{' '}
                        <a href="#" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                            Sign up
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

