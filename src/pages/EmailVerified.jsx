import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assests/images/logo.png';
import './Login.css';

const EmailVerified = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/login");
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="login-page">
            <div className="login-glow" />

            <div className="login-logo-area">
                <img src={logo} alt="DevSync" className="login-logo-icon" />
                <h1 className="login-brand-name">DevSync</h1>
                <p className="login-tagline">Your email has been verified successfully!</p>
            </div>

            <div className="login-card">
                <div className="text-center">
                    <div className="mb-6 flex justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="login-title mb-3">Email Verified!</h2>
                    <p className="login-subtitle mb-8">
                        Your email has been verified successfully. You can now log in to your account.
                    </p>
                    <button
                        onClick={() => navigate("/login")}
                        className="login-btn w-full"
                    >
                        Go to Login
                    </button>
                    <p className="text-gray-400 text-sm mt-4 animate-pulse">
                        Redirecting in 3 seconds...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmailVerified;
