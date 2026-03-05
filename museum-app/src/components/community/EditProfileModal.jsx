import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { compressImage } from '../../utils/compressImage';

export default function EditProfileModal({ isOpen, onClose, user, currentProfile, onUpdate }) {
    const fileInputRef = useRef(null);

    const [name, setName] = useState(currentProfile?.full_name || user?.user_metadata?.full_name || '');
    const [bio, setBio] = useState(currentProfile?.bio || '');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(currentProfile?.avatar_url || user?.user_metadata?.avatar_url || null);

    const [saving, setSaving] = useState(false);
    const [compressing, setCompressing] = useState(false);
    const [error, setError] = useState('');

    const handleFile = async (f) => {
        if (!f) return;
        if (!f.type.startsWith('image/')) {
            setError('Please select an image file.');
            return;
        }
        if (f.size > 10 * 1024 * 1024) {
            setError('Image too large. Maximum size is 10MB.');
            return;
        }

        setError('');
        setCompressing(true);
        const previewUrl = URL.createObjectURL(f);
        setAvatarPreview(previewUrl);

        try {
            const compressed = await compressImage(f, 1200, 0.8);
            setAvatarFile({ file: compressed, original: f });
        } catch (err) {
            console.error('Compression failed:', err);
            setAvatarFile({ file: f, original: f });
        } finally {
            setCompressing(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files[0]);
    };

    const handleSave = async () => {
        if (!user || saving || compressing) return;
        if (!name.trim()) { setError('Name is required.'); return; }

        setSaving(true);
        setError('');

        try {
            let avatarUrl = currentProfile?.avatar_url || user?.user_metadata?.avatar_url;

            // 1. Upload new avatar if selected
            if (avatarFile) {
                const ext = avatarFile.file.name.split('.').pop() || 'jpg';
                const fileName = `${user.id}/avatar_${Date.now()}.${ext}`;
                const { error: uploadErr } = await supabase.storage.from('avatars').upload(fileName, avatarFile.file);
                if (uploadErr) {
                    if (uploadErr.message.includes('Bucket not found')) {
                        // Create bucket on the fly if missing (requires proper permission, but just in case)
                        console.warn('Avatars bucket might be missing.');
                    }
                    throw uploadErr;
                }
                const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
                avatarUrl = data.publicUrl;
            }

            // 2. Update Public Profiles Table
            const profileData = {
                id: user.id,
                full_name: name.trim(),
                bio: bio.trim(),
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString()
            };

            const { error: dbErr } = await supabase.from('profiles').upsert(profileData);
            if (dbErr) throw dbErr;

            // 3. Update Auth Metadata (so existing parts of app relying on user_metadata.avatar_url keep working)
            await supabase.auth.updateUser({
                data: { full_name: profileData.full_name, avatar_url: profileData.avatar_url }
            });

            // 4. Update existing Posts with new avatar/name (optional but good for UX so old posts reflect new name)
            // Doing this silently to not block the UI
            supabase.from('posts').update({
                user_name: profileData.full_name,
                user_avatar: profileData.avatar_url
            }).eq('user_id', user.id).then(({ error }) => {
                if (error) console.error("Failed to sync posts:", error);
            });

            if (onUpdate) onUpdate(profileData);
            onClose();

        } catch (err) {
            console.error('Save profile error:', err);
            setError(err.message || 'Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                        onClick={(!saving && !compressing) ? onClose : undefined}
                        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
                    />

                    <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        style={{ position: 'relative', width: '100%', maxWidth: '500px', backgroundColor: '#111111', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                    >
                        {/* Header */}
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 className="serif" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 300, color: '#fff', letterSpacing: '1px' }}>Edit Profile</h2>
                            <button onClick={onClose} disabled={saving || compressing} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '0.5rem', display: 'flex' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div style={{ padding: '1.5rem' }}>

                            {/* Avatar Section */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={e => e.preventDefault()}
                                    onDrop={handleDrop}
                                    style={{
                                        width: '100px', height: '100px', borderRadius: '50%',
                                        backgroundColor: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(255,255,255,0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', overflow: 'hidden', position: 'relative',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                                >
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                    )}

                                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s ease', color: '#fff', fontSize: '0.7rem' }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}
                                    >Change</div>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={e => handleFile(e.target.files[0])} accept="image/*" style={{ display: 'none' }} />
                                {compressing && <span className="sans" style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '0.8rem' }}>Processing image...</span>}
                            </div>

                            {/* Form Fields */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="sans" style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Display Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Vincent van Gogh"
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px 16px', color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s ease' }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.3)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                    disabled={saving || compressing}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="sans" style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Bio</label>
                                <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Painter, dreamer, lover of stars..." rows="3"
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px 16px', color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s ease', resize: 'vertical' }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.3)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                    disabled={saving || compressing}
                                />
                            </div>

                            {error && <div className="sans" style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>{error}</div>}

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem' }}>
                                <button onClick={onClose} disabled={saving || compressing} className="sans"
                                    style={{ flex: 1, background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '12px', cursor: 'pointer', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', transition: 'all 0.2s ease' }}
                                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                                >Cancel</button>
                                <button onClick={handleSave} disabled={saving || compressing || !name.trim()} className="sans"
                                    style={{ flex: 1, background: '#ffffff', color: '#000000', border: 'none', borderRadius: '8px', padding: '12px', cursor: (saving || compressing || !name.trim()) ? 'not-allowed' : 'pointer', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 500, opacity: (saving || compressing || !name.trim()) ? 0.5 : 1, transition: 'all 0.2s ease' }}
                                >{saving ? 'Saving...' : 'Save Profile'}</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
