import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../constants/commonData';
import { addConnections } from '../redux/connectionSlice';
import defaultAvatar from '../assests/images/default-user-image.png';
import './Connections.css';

const Connections = () => {
    const connections = useSelector(store => store.connections);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const fetchConnections = async () => {
        if (connections) return;
        setLoading(true);
        try {
            const res = await axios.get(BASE_URL + '/user/connections', { withCredentials: true });
            dispatch(addConnections(res.data?.data || []));
        } catch (error) {
            console.error('Connections fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConnections();
    }, []);

    const handleViewProfile = (user) => {
        navigate(`/user/${user._id}`, { state: { user } });
    };

    /* ── Loading ── */
    if (loading) {
        return (
            <div className="connections-page">
                <div className="connections-loading">
                    <div className="connections-spinner" />
                </div>
            </div>
        );
    }

    /* ── Empty ── */
    if (!connections || connections.length === 0) {
        return (
            <div className="connections-page">
                <div className="connections-empty">
                    <span className="connections-empty-icon">🤝</span>
                    <h2 className="connections-empty-title">No connections yet</h2>
                    <p className="connections-empty-text">
                        Start swiping on the feed to find and connect with other developers!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="connections-page">
            <div className="connections-container">
                <div className="connections-header">
                    <h1 className="connections-title">Connections</h1>
                    <span className="connections-count">
                        {connections.length}
                    </span>
                </div>

                {connections.map((user, idx) => {
                    const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Developer';
                    const photo = user.photoUrl || defaultAvatar;
                    const meta = user.about
                        || (user.gender && user.age ? `${user.gender}, ${user.age}` : '')
                        || (user.skills?.length ? user.skills.slice(0, 3).join(' · ') : 'Developer');

                    return (
                        <React.Fragment key={user._id || idx}>
                            <div
                                className="connection-row"
                                style={{ animationDelay: `${idx * 0.04}s` }}
                                onClick={() => handleViewProfile(user)}
                            >
                                <div className="connection-avatar-ring">
                                    <img
                                        className="connection-avatar"
                                        src={photo}
                                        alt={displayName}
                                        onError={(e) => { e.target.src = defaultAvatar; }}
                                    />
                                </div>
                                <div className="connection-info">
                                    <p className="connection-name">
                                        {displayName}{user.age ? `, ${user.age}` : ''}
                                    </p>
                                    <p className="connection-meta">{meta}</p>
                                </div>
                                {chevronIcon}
                            </div>
                            {idx < connections.length - 1 && <div className="connection-divider" />}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

const chevronIcon = (
    <svg className="connection-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
);

export default Connections;
