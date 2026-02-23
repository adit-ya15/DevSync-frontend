import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import UserCard from '../components/UserCard';
import './UserProfile.css';

const UserProfile = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = location.state?.user;

    if (!user) {
        return (
            <div className="userprofile-page">
                <p style={{ color: '#666' }}>User not found.</p>
                <button className="userprofile-back" onClick={() => navigate(-1)}>
                    {backIcon}
                    Go back
                </button>
            </div>
        );
    }

    return (
        <div className="userprofile-page">
            <button className="userprofile-back" onClick={() => navigate(-1)}>
                {backIcon}
                Back
            </button>
            <UserCard user={user} />
        </div>
    );
};

const backIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
);

export default UserProfile;
