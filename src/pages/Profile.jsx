import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../constants/commonData';
import { addUser } from '../redux/userSlice';
import defaultAvatar from '../assests/images/default-user-image.png';
import './Profile.css';

const Profile = () => {
    const user = useSelector(store => store.user);
    const dispatch = useDispatch();

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [newSkill, setNewSkill] = useState('');

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        photoUrl: '',
        age: '',
        gender: '',
        about: '',
        skills: [],
    });

    useEffect(() => {
        if (user) {
            setForm({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                photoUrl: user.photoUrl || '',
                age: user.age || '',
                gender: user.gender || '',
                about: user.about || '',
                skills: user.skills || [],
            });
        }
    }, [user]);

    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(t);
        }
    }, [toast]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSkill = () => {
        const skill = newSkill.trim();
        if (skill && !form.skills.includes(skill)) {
            setForm(prev => ({ ...prev, skills: [...prev.skills, skill] }));
            setNewSkill('');
        }
    };

    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSkill();
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setForm(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skillToRemove),
        }));
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (user) {
            setForm({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                photoUrl: user.photoUrl || '',
                age: user.age || '',
                gender: user.gender || '',
                about: user.about || '',
                skills: user.skills || [],
            });
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                ...form,
                age: form.age ? Number(form.age) : undefined,
            };
            await axios.patch(BASE_URL + '/profile/edit', payload, {
                withCredentials: true,
            });
            const profileRes = await axios.get(BASE_URL + '/profile/view', {
                withCredentials: true,
            });
            dispatch(addUser(profileRes.data));
            setToast({ type: 'success', message: 'Profile updated!' });
            setIsEditing(false);
        } catch (error) {
            const msg = error?.response?.data?.message || error?.response?.data || 'Failed to update profile';
            setToast({ type: 'error', message: typeof msg === 'string' ? msg : 'Something went wrong' });
        } finally {
            setSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="profile-page">
                <div className="profile-spinner" style={{ width: 32, height: 32, borderWidth: 3, margin: '80px auto' }} />
            </div>
        );
    }

    const displayPhoto = user.photoUrl || defaultAvatar;
    const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Developer';
    const genderLabel = user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : null;

    /* ═══════════════ EDIT MODE ═══════════════ */
    if (isEditing) {
        return (
            <div className="profile-page">
                {/* Toast */}
                {toast && (
                    <div className={`profile-toast ${toast.type === 'success' ? 'profile-toast-success' : 'profile-toast-error'}`}>
                        {toast.type === 'success' ? '✓ ' : '✕ '}{toast.message}
                    </div>
                )}

                <div className="profile-edit-card">
                    {/* Header */}
                    <div className="profile-edit-header">
                        <span className="profile-edit-title">Edit Profile</span>
                        <button className="profile-edit-close" onClick={handleCancel}>
                            {closeIcon}
                        </button>
                    </div>

                    {/* Form */}
                    <div className="profile-edit-body">
                        {/* Photo URL */}
                        <div className="profile-field">
                            <label className="profile-field-label">Photo URL</label>
                            <input
                                className="profile-input"
                                name="photoUrl"
                                value={form.photoUrl}
                                onChange={handleChange}
                                placeholder="https://example.com/photo.jpg"
                            />
                            {form.photoUrl && (
                                <div className="profile-photo-preview">
                                    <img
                                        src={form.photoUrl}
                                        alt="Preview"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <span>Preview</span>
                                </div>
                            )}
                        </div>

                        {/* Name */}
                        <div className="profile-field">
                            <div className="profile-field-row">
                                <div>
                                    <label className="profile-field-label">First Name</label>
                                    <input
                                        className="profile-input"
                                        name="firstName"
                                        value={form.firstName}
                                        onChange={handleChange}
                                        placeholder="First name"
                                    />
                                </div>
                                <div>
                                    <label className="profile-field-label">Last Name</label>
                                    <input
                                        className="profile-input"
                                        name="lastName"
                                        value={form.lastName}
                                        onChange={handleChange}
                                        placeholder="Last name"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Age & Gender */}
                        <div className="profile-field">
                            <div className="profile-field-row">
                                <div>
                                    <label className="profile-field-label">Age</label>
                                    <input
                                        className="profile-input"
                                        name="age"
                                        type="number"
                                        min="13"
                                        max="120"
                                        value={form.age}
                                        onChange={handleChange}
                                        placeholder="25"
                                    />
                                </div>
                                <div>
                                    <label className="profile-field-label">Gender</label>
                                    <select
                                        className="profile-input profile-select"
                                        name="gender"
                                        value={form.gender}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* About */}
                        <div className="profile-field">
                            <label className="profile-field-label">About</label>
                            <textarea
                                className="profile-input profile-textarea"
                                name="about"
                                value={form.about}
                                onChange={handleChange}
                                placeholder="Tell us about yourself..."
                                rows={3}
                            />
                        </div>

                        {/* Skills */}
                        <div className="profile-field">
                            <label className="profile-field-label">Skills</label>
                            <div className="profile-skills-wrap">
                                {form.skills.map((skill, idx) => (
                                    <span
                                        key={idx}
                                        className="profile-skill-chip editable"
                                        onClick={() => handleRemoveSkill(skill)}
                                        title="Click to remove"
                                    >
                                        {skill}
                                        <span className="profile-skill-remove">✕</span>
                                    </span>
                                ))}
                            </div>
                            <div className="profile-skill-add-row">
                                <input
                                    className="profile-input"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyDown={handleSkillKeyDown}
                                    placeholder="Add a skill..."
                                    style={{ flex: 1 }}
                                />
                                <button type="button" className="profile-skill-add-btn" onClick={handleAddSkill}>
                                    + Add
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="profile-edit-actions">
                        <button className="profile-btn profile-btn-cancel" onClick={handleCancel} disabled={saving}>
                            Cancel
                        </button>
                        <button className="profile-btn profile-btn-save" onClick={handleSave} disabled={saving}>
                            {saving && <span className="profile-spinner" />}
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ═══════════════ VIEW MODE ═══════════════ */
    return (
        <div className="profile-page">
            {/* Toast */}
            {toast && (
                <div className={`profile-toast ${toast.type === 'success' ? 'profile-toast-success' : 'profile-toast-error'}`}>
                    {toast.type === 'success' ? '✓ ' : '✕ '}{toast.message}
                </div>
            )}

            <div className="profile-card">
                {/* Large Photo */}
                <div className="profile-photo-section">
                    <img
                        src={displayPhoto}
                        alt={displayName}
                        onError={(e) => { e.target.src = defaultAvatar; }}
                    />
                    <div className="profile-photo-gradient" />
                    <div className="profile-photo-info">
                        <h1 className="profile-photo-name">
                            {user.firstName || 'Developer'}
                            {user.age && <span className="profile-photo-age">{user.age}</span>}
                        </h1>
                    </div>
                </div>

                {/* Body */}
                <div className="profile-body">
                    {/* Info rows */}
                    {genderLabel && (
                        <div className="profile-info-row">
                            {genderIcon}
                            <span>{genderLabel}</span>
                        </div>
                    )}
                    {user.email && (
                        <div className="profile-info-row">
                            {emailIcon}
                            <span style={{ color: '#6b6b80', fontSize: '0.82rem' }}>{user.email}</span>
                        </div>
                    )}

                    {/* About */}
                    {user.about && (
                        <>
                            <div className="profile-divider" />
                            <div className="profile-section">
                                <p className="profile-section-title">About</p>
                                <p className="profile-about-text">{user.about}</p>
                            </div>
                        </>
                    )}

                    {/* Skills */}
                    {user.skills && user.skills.length > 0 && (
                        <>
                            <div className="profile-divider" />
                            <div className="profile-section">
                                <p className="profile-section-title">Skills</p>
                                <div className="profile-skills-wrap">
                                    {user.skills.map((skill, idx) => (
                                        <span key={idx} className="profile-skill-chip">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Edit button at bottom */}
                <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
                    {editIcon}
                    Edit Profile
                </button>
            </div>
        </div>
    );
};

/* ── Inline SVG Icons ── */
const editIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

const closeIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 20, height: 20 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

const genderIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);

const emailIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5a2.25 2.25 0 0 0-2.25 2.25m19.5 0-8.953 5.468a1.5 1.5 0 0 1-1.594 0L2.25 6.75" />
    </svg>
);

export default Profile;