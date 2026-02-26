import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../constants/commonData';
import { addUser } from '../redux/userSlice';
import UserCard from '../components/UserCard';
import './Profile.css';
import './Feed.css';
import toast from 'react-hot-toast';

const Profile = () => {
    const user = useSelector(store => store.user);
    const dispatch = useDispatch();

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
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
            toast.success('Profile updated!');
            setIsEditing(false);
        } catch (error) {
            const msg = error?.response?.data?.message || error?.response?.data || 'Failed to update profile';
            toast.error(typeof msg === 'string' ? msg : 'Something went wrong');
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

    /* ── Edit Mode ── */
    if (isEditing) {
        return (
            <div className="profile-page">

                <div className="profile-edit-layout">
                    {/* Live preview — mirrors exactly what others see in feed */}
                    <div className="profile-preview-wrap">
                        <p className="profile-preview-label">How others see you</p>
                        <UserCard
                            user={form}
                            actions={
                                <div className="feed-actions">
                                    <button className="feed-action-btn feed-btn-pass" disabled title="Pass">
                                        {passIcon}
                                    </button>
                                    <button className="feed-action-btn feed-btn-like" disabled title="Interested">
                                        {likeIcon}
                                    </button>
                                </div>
                            }
                        />
                    </div>

                    {/* Edit form */}
                    <div className="profile-edit-card">
                        <div className="profile-edit-header">
                            <span className="profile-edit-title">Edit Profile</span>
                            <button className="profile-edit-close" onClick={handleCancel}>
                                {closeIcon}
                            </button>
                        </div>

                        <div className="profile-edit-body">
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
            </div>
        );
    }

    /* ── View Mode ── */
    return (
        <div className="profile-page">
            <UserCard
                user={user}
                showEmail
                actions={
                    <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
                        {editIcon}
                        Edit Profile
                    </button>
                }
            />
        </div>
    );
};

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

const passIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

const likeIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
);

export default Profile;