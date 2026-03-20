import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../constants/commonData';
import { addUser } from '../redux/userSlice';
import './Profile.css';
import toast from 'react-hot-toast';

const Profile = () => {
    const user = useSelector(store => store.user);
    const dispatch = useDispatch();

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newSkill, setNewSkill] = useState('');

    const [form, setForm] = useState({
        firstName: '', lastName: '', age: '', gender: '', about: '', skills: [],
    });

    const [profileImageFile, setProfileImageFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('');

    useEffect(() => {
        if (user) {
            setForm({
                firstName: user.firstName || '', lastName: user.lastName || '',
                age: user.age || '', gender: user.gender || '',
                about: user.about || '', skills: user.skills || [],
            });
            setPhotoPreview(user.photoUrl || '');
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImageFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleAddSkill = () => {
        const skill = newSkill.trim();
        if (skill && !form.skills.includes(skill)) {
            setForm(prev => ({ ...prev, skills: [...prev.skills, skill] }));
            setNewSkill('');
        }
    };

    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
    };

    const handleCancel = () => {
        setIsEditing(false);
        setProfileImageFile(null);
        if (user) {
            setForm({ firstName: user.firstName || '', lastName: user.lastName || '', age: user.age || '', gender: user.gender || '', about: user.about || '', skills: user.skills || [] });
            setPhotoPreview(user.photoUrl || '');
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('firstName', form.firstName);
            formData.append('lastName', form.lastName);
            if (form.age) formData.append('age', form.age);
            if (form.gender) formData.append('gender', form.gender);
            if (form.about) formData.append('about', form.about);
            if (form.skills.length > 0) formData.append('skills', JSON.stringify(form.skills));
            if (profileImageFile) formData.append('profileImage', profileImageFile);

            await axios.patch(BASE_URL + '/profile/edit', formData, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } });
            const profileRes = await axios.get(BASE_URL + '/profile/view', { withCredentials: true });
            dispatch(addUser(profileRes.data));
            toast.success('Profile updated!');
            setIsEditing(false);
        } catch (error) {
            const msg = error?.response?.data?.message || error?.response?.data || 'Failed to update profile';
            toast.error(typeof msg === 'string' ? msg : 'Something went wrong');
        } finally { setSaving(false); }
    };

    if (!user) {
        return <div className="profile-page"><div className="profile-loading"><span className="profile-spinner" /></div></div>;
    }

    /* ── View Mode ── */
    if (!isEditing) {
        return (
            <div className="profile-page">
                <div className="profile-card-view">
                    {/* Hero Cover */}
                    <div className="profile-hero">
                        <div className="profile-hero-gradient" />
                        <div className="profile-hero-pattern" />
                    </div>

                    {/* Avatar */}
                    <div className="profile-avatar-section">
                        <div className="profile-avatar-ring">
                            <img
                                src={user.photoUrl || `https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=200&name=${user.firstName}`}
                                alt={user.firstName}
                                className="profile-avatar-img"
                                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=200&name=${user.firstName}`; }}
                            />
                        </div>
                        <h1 className="profile-name">{user.firstName} {user.lastName}</h1>
                        {user.about && <p className="profile-bio">{user.about}</p>}
                    </div>

                    {/* Stats */}
                    <div className="profile-stats">
                        <div className="profile-stat">
                            <span className="profile-stat-value">{user.skills?.length || 0}</span>
                            <span className="profile-stat-label">Skills</span>
                        </div>
                        <div className="profile-stat-divider" />
                        <div className="profile-stat">
                            <span className="profile-stat-value">{user.age || '—'}</span>
                            <span className="profile-stat-label">Age</span>
                        </div>
                        <div className="profile-stat-divider" />
                        <div className="profile-stat">
                            <span className="profile-stat-value">{user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : '—'}</span>
                            <span className="profile-stat-label">Gender</span>
                        </div>
                    </div>

                    {/* Skills */}
                    {user.skills?.length > 0 && (
                        <div className="profile-skills-section">
                            <h3 className="profile-section-title">Tech Stack</h3>
                            <div className="profile-skills-grid">
                                {user.skills.map((skill, i) => (
                                    <span key={i} className="profile-skill-badge">{skill}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Edit CTA */}
                    <button className="profile-edit-cta" onClick={() => setIsEditing(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>
                        Edit Profile
                    </button>
                </div>
            </div>
        );
    }

    /* ── Edit Mode ── */
    return (
        <div className="profile-page">
            <div className="profile-edit-layout">
                {/* Live Preview */}
                <div className="profile-preview-side">
                    <span className="profile-preview-badge">Live Preview</span>
                    <div className="profile-preview-card">
                        <div className="profile-preview-hero" />
                        <div className="profile-preview-avatar-wrap">
                            <img
                                src={photoPreview || `https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=120&name=${form.firstName || 'U'}`}
                                alt="" className="profile-preview-avatar"
                                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=120&name=${form.firstName || 'U'}`; }}
                            />
                        </div>
                        <h3 className="profile-preview-name">{form.firstName || 'First'} {form.lastName || 'Last'}</h3>
                        {form.about && <p className="profile-preview-bio">{form.about}</p>}
                        {form.skills.length > 0 && (
                            <div className="profile-preview-skills">
                                {form.skills.slice(0, 5).map((s, i) => (
                                    <span key={i} className="profile-preview-skill">{s}</span>
                                ))}
                                {form.skills.length > 5 && <span className="profile-preview-skill">+{form.skills.length - 5}</span>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Edit Form */}
                <div className="profile-edit-card">
                    <div className="profile-edit-header">
                        <h2 className="profile-edit-title">Edit Profile</h2>
                        <button className="profile-edit-close" onClick={handleCancel}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="profile-edit-body">
                        <div className="profile-field">
                            <label className="profile-field-label">Profile Photo</label>
                            <label className="profile-photo-upload">
                                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                <div className="profile-photo-dropzone">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="" className="profile-photo-thumb" />
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm12.75-11.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /></svg>
                                    )}
                                    <span>Click to upload</span>
                                </div>
                            </label>
                        </div>

                        <div className="profile-field-row">
                            <div className="profile-field">
                                <label className="profile-field-label">First Name</label>
                                <input className="profile-input" name="firstName" value={form.firstName} onChange={handleChange} placeholder="John" />
                            </div>
                            <div className="profile-field">
                                <label className="profile-field-label">Last Name</label>
                                <input className="profile-input" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Doe" />
                            </div>
                        </div>

                        <div className="profile-field-row">
                            <div className="profile-field">
                                <label className="profile-field-label">Age</label>
                                <input className="profile-input" name="age" type="number" min="13" max="120" value={form.age} onChange={handleChange} placeholder="25" />
                            </div>
                            <div className="profile-field">
                                <label className="profile-field-label">Gender</label>
                                <select className="profile-input profile-select" name="gender" value={form.gender} onChange={handleChange}>
                                    <option value="">Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="profile-field">
                            <label className="profile-field-label">About</label>
                            <textarea className="profile-input profile-textarea" name="about" value={form.about} onChange={handleChange} placeholder="Tell the world about yourself..." rows={3} />
                        </div>

                        <div className="profile-field">
                            <label className="profile-field-label">Skills</label>
                            <div className="profile-skills-wrap">
                                {form.skills.map((skill, idx) => (
                                    <span key={idx} className="profile-skill-chip editable" onClick={() => handleRemoveSkill(skill)} title="Click to remove">
                                        {skill}
                                        <span className="profile-skill-remove">×</span>
                                    </span>
                                ))}
                            </div>
                            <div className="profile-skill-add-row">
                                <input className="profile-input" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={handleSkillKeyDown} placeholder="React, Node.js, Python..." style={{ flex: 1 }} />
                                <button type="button" className="profile-skill-add-btn" onClick={handleAddSkill}>+ Add</button>
                            </div>
                        </div>
                    </div>

                    <div className="profile-edit-actions">
                        <button className="profile-btn profile-btn-cancel" onClick={handleCancel} disabled={saving}>Cancel</button>
                        <button className="profile-btn profile-btn-save" onClick={handleSave} disabled={saving}>
                            {saving && <span className="profile-spinner" />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;