import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

export default function GlobalNavigation() {
    const navigate = useNavigate();
    const location = useLocation();

    // Do not show navigation on the Onboarding screen
    if (location.pathname === '/') return null;

    return (
        <>
            {/* Global Left Sidebar Overlay */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="global-sidebar"
            >
                {/* Top: AE Logo */}
                <div
                    style={{ position: 'relative', width: '45px', height: '40px', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                    onClick={() => navigate('/hub')}
                >
                    <span className="serif" style={{ position: 'absolute', left: '2px', top: 0, fontSize: '2.5rem', fontWeight: 600, color: '#ffffff', zIndex: 2, letterSpacing: '-2px', textShadow: '0 5px 15px rgba(0,0,0,0.5)' }}>A</span>
                    <span className="serif" style={{ position: 'absolute', left: '16px', top: '6px', fontSize: '2.7rem', fontWeight: 200, fontStyle: 'italic', color: 'rgba(255,255,255,0.9)', mixBlendMode: 'overlay', zIndex: 1, filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.8))' }}>E</span>
                </div>

                {/* Center Socials */}
                <div className="sidebar-socials">
                    <a href="https://www.instagram.com/abdulrahmanelsaydd?igsh=MWt2cTJrNmZrMTg1eA==" target="_blank" rel="noreferrer" style={{ color: '#ffffff', opacity: 0.5, transition: 'opacity 0.4s ease' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                    </a>
                    <a href="https://x.com/abdelrahmaan_11" target="_blank" rel="noreferrer" style={{ color: '#ffffff', opacity: 0.5, transition: 'opacity 0.4s ease' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 4.076H5.036z" />
                        </svg>
                    </a>
                    <a href="mailto:abdulrahmaanelsayd@gmail.com" style={{ color: '#ffffff', opacity: 0.5, transition: 'opacity 0.4s ease' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                    </a>
                </div>

                {/* Bottom Language Toggle */}
                <div className="sans language-toggle" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', fontSize: '0.65rem', letterSpacing: '2px', opacity: 0.6 }}>
                    <span style={{ cursor: 'pointer', opacity: 1, color: '#ffffff' }}>EN</span>
                </div>
            </motion.div>

            {/* Top Navbar */}
            <motion.nav
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="global-navbar"
            >
                <div className="sans navbar-links">
                    <button onClick={() => { navigate('/hub'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="nav-link">Home</button>
                    <button onClick={() => navigate('/gallery')} className="nav-link">Gallery</button>
                    <button onClick={() => navigate('/biography')} className="nav-link">Biography</button>
                </div>
            </motion.nav>
        </>
    );
}
