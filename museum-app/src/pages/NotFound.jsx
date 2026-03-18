import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EASE_PREMIUM } from '../constants';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: '#000000',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            color: '#ffffff', textAlign: 'center', padding: '2rem'
        }}>
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: EASE_PREMIUM }}
                className="serif"
                style={{
                    fontSize: 'clamp(5rem, 20vw, 12rem)',
                    fontWeight: 300,
                    margin: 0,
                    lineHeight: 1,
                    color: 'rgba(255,255,255,0.08)'
                }}
            >
                404
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.3, ease: EASE_PREMIUM }}
                className="serif"
                style={{
                    fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                    fontWeight: 300,
                    marginTop: '-1rem',
                    letterSpacing: '2px'
                }}
            >
                Lost in the Gallery.
            </motion.p>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="sans"
                style={{
                    fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                    color: 'rgba(255,255,255,0.4)',
                    maxWidth: '400px',
                    lineHeight: 1.8,
                    margin: '1.5rem 0 2.5rem 0',
                    fontWeight: 300
                }}
            >
                This painting doesn't exist — yet.
            </motion.p>

            <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9, ease: EASE_PREMIUM }}
                onClick={() => navigate('/hub')}
                className="sans"
                style={{
                    background: 'transparent',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '50px',
                    padding: '14px 40px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '4px',
                    transition: 'all 0.4s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#000000'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ffffff'; }}
            >
                Return to Museum
            </motion.button>
        </div>
    );
}
