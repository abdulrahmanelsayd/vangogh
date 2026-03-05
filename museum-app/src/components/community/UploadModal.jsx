import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { compressImage, formatBytes } from '../../utils/compressImage';

export default function UploadModal({ onClose, onUploaded }) {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [caption, setCaption] = useState('');
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [compressing, setCompressing] = useState(false);
    const [compressionInfo, setCompressionInfo] = useState(null);
    const inputRef = useRef(null);

    const handleFile = async (f) => {
        if (!f || !f.type.startsWith('image/')) return;
        if (f.size > 10 * 1024 * 1024) { alert('Image must be under 10MB'); return; }

        // Show preview immediately from original
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(f);

        // Compress in background
        setCompressing(true);
        setCompressionInfo(null);

        const originalSize = f.size;
        const { file: compressed, savedPercent } = await compressImage(f);

        setFile(compressed);
        setCompressing(false);
        setCompressionInfo({
            originalSize,
            compressedSize: compressed.size,
            savedPercent
        });
    };

    const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); };

    const handleSubmit = async () => {
        if (!file || !user || compressing) return;
        setUploading(true);
        try {
            const ext = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${ext}`;
            const { error: uploadErr } = await supabase.storage.from('community-photos').upload(fileName, file);
            if (uploadErr) throw uploadErr;

            const { data: { publicUrl } } = supabase.storage.from('community-photos').getPublicUrl(fileName);

            const { error: insertErr } = await supabase.from('posts').insert({
                user_id: user.id,
                user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Visitor',
                user_avatar: user.user_metadata?.avatar_url || null,
                image_url: publicUrl,
                caption: caption.trim()
            });
            if (insertErr) throw insertErr;

            onUploaded();
            onClose();
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
                position: 'fixed', inset: 0, zIndex: 10000,
                background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: '520px',
                    background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px', padding: 'clamp(1.5rem, 4vw, 2.5rem)', overflow: 'hidden'
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 className="serif" style={{ fontSize: 'clamp(1.3rem, 4vw, 1.6rem)', fontWeight: 300, color: '#ffffff', margin: 0, letterSpacing: '0.5px' }}>Share Your Moment</h3>
                    <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.5rem', cursor: 'pointer', padding: '0.25rem' }}>×</button>
                </div>

                {/* Drop zone */}
                {!preview ? (
                    <div
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                        style={{
                            border: `2px dashed ${dragOver ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '14px', padding: 'clamp(2rem, 6vw, 3rem)',
                            textAlign: 'center', cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            background: dragOver ? 'rgba(255,255,255,0.03)' : 'transparent'
                        }}
                    >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <p className="sans" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', margin: 0, letterSpacing: '1px' }}>
                            Drop an image or <span style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'underline' }}>browse</span>
                        </p>
                        <p className="sans" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', margin: '0.5rem 0 0 0' }}>Max 10MB • JPG, PNG, WebP</p>
                        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
                    </div>
                ) : (
                    <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                        <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }} />
                        <button
                            onClick={() => { setFile(null); setPreview(null); setCompressionInfo(null); }}
                            style={{
                                position: 'absolute', top: '0.75rem', right: '0.75rem',
                                background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff',
                                width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'
                            }}
                        >×</button>

                        {/* Compression indicator overlay */}
                        <AnimatePresence>
                            {compressing && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    style={{
                                        position: 'absolute', bottom: '0.6rem', left: '0.6rem',
                                        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
                                        borderRadius: '8px', padding: '0.4rem 0.7rem',
                                        display: 'flex', alignItems: 'center', gap: '0.4rem'
                                    }}
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%' }}
                                    />
                                    <span className="sans" style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.5px' }}>Optimizing...</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Compression stats badge */}
                <AnimatePresence>
                    {compressionInfo && !compressing && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                padding: '0.45rem 0.8rem', marginBottom: '0.5rem',
                                background: compressionInfo.savedPercent > 0 ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${compressionInfo.savedPercent > 0 ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)'}`,
                                borderRadius: '10px'
                            }}
                        >
                            {compressionInfo.savedPercent > 0 ? (
                                <>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(34,197,94,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    <span className="sans" style={{ fontSize: '0.6rem', color: 'rgba(34,197,94,0.7)', letterSpacing: '0.5px' }}>
                                        Optimized — {formatBytes(compressionInfo.originalSize)} → {formatBytes(compressionInfo.compressedSize)}
                                        <span style={{ fontWeight: 600, marginLeft: '0.3rem' }}>(-{compressionInfo.savedPercent}%)</span>
                                    </span>
                                </>
                            ) : (
                                <span className="sans" style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.5px' }}>
                                    {formatBytes(compressionInfo.originalSize)} — already optimal
                                </span>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Caption */}
                <textarea
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    placeholder="Add a caption..."
                    maxLength={280}
                    className="sans"
                    style={{
                        width: '100%', background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
                        padding: '0.85rem', color: '#ffffff', fontSize: '0.85rem',
                        resize: 'none', height: '80px', outline: 'none',
                        marginTop: '0.5rem', fontFamily: 'inherit', letterSpacing: '0.3px',
                        boxSizing: 'border-box'
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
                <div className="sans" style={{ textAlign: 'right', color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem', marginTop: '0.3rem' }}>{caption.length}/280</div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={!file || uploading || compressing}
                    className="sans"
                    style={{
                        width: '100%', marginTop: '1rem',
                        padding: '14px', borderRadius: '50px',
                        border: 'none', cursor: file && !uploading && !compressing ? 'pointer' : 'default',
                        background: file && !compressing ? '#ffffff' : 'rgba(255,255,255,0.08)',
                        color: file && !compressing ? '#000000' : 'rgba(255,255,255,0.3)',
                        fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '3px',
                        fontWeight: 500, transition: 'all 0.4s ease'
                    }}
                >
                    {compressing ? 'Optimizing...' : uploading ? 'Uploading...' : 'Share'}
                </button>
            </motion.div>
        </motion.div>
    );
}
