import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_URL } from '../constants/commonData';
import logo from '../assests/images/logo.png';
import './Login.css';

const VerificationFailed = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const validate = () => {
        const newErrors = {};
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            newErrors.email = "Please enter a valid email";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
        if (apiError) setApiError("");
    };

    const handleResendEmail = async () => {
        if (!validate()) return;

        setIsLoading(true);
        setApiError("");

        try {
            const response = await axios.post(
                BASE_URL + "/resend-verification",
                { email: email.trim() },
                { withCredentials: true }
            );

            toast.success(response.data.message || "Verification email sent!");
            setEmailSent(true);
            setEmail("");
        } catch (error) {
            const msg =
                error?.response?.data?.message ||
                error?.response?.data ||
                "Failed to resend verification email. Please try again.";
            const errorMsg = typeof msg === "string" ? msg : "Failed to resend verification email. Please try again.";
            setApiError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleResendEmail();
        }
    };

    return (
        <div className="login-page">
            <div className="login-glow" />

            <div className="login-logo-area">
                <img src={logo} alt="DevSync" className="login-logo-icon" />
                <h1 className="login-brand-name">DevSync</h1>
                <p className="login-tagline">Email verification link has expired or is invalid.</p>
            </div>

            <div className="login-card">
                {apiError && (
                    <div className="login-error-toast flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                        <span>{apiError}</span>
                    </div>
                )}

                {emailSent ? (
                    <div className="text-center">
                        <div className="mb-6 flex justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="login-title mb-2">Verification Email Sent!</h2>
                        <p className="login-subtitle mb-6">
                            A new verification link has been sent to your email. Please check your inbox and click the link to verify your account.
                        </p>
                        <button
                            onClick={() => navigate("/login")}
                            className="login-btn w-full"
                        >
                            Back to Login
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                        </div>
                        <h2 className="login-title">Verification Failed</h2>
                        <p className="login-subtitle mb-6">
                            The verification link has expired or is invalid. Please request a new verification email.
                        </p>

                        <div className="login-field">
                            <label className="login-label">Email Address</label>
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className={`login-input ${errors.email ? 'login-input-error' : ''}`}
                                value={email}
                                onChange={handleEmailChange}
                                onKeyDown={handleKeyDown}
                            />
                            {errors.email && <span className="login-error">{errors.email}</span>}
                        </div>

                        <button
                            onClick={handleResendEmail}
                            disabled={isLoading}
                            className="login-btn w-full"
                        >
                            {isLoading ? "Sending..." : "Resend Verification Email"}
                        </button>

                        <button
                            onClick={() => navigate("/login")}
                            className="login-btn-secondary w-full mt-3"
                        >
                            Back to Login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerificationFailed;
