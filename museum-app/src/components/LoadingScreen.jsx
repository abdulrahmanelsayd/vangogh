import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingScreen() {
    return (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: '#000000',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            zIndex: 99999
        }}>
            <motion.h1
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: [0.3, 0.8, 0.3], scale: 1 }}
                transition={{ opacity: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }, scale: { duration: 1, ease: [0.16, 1, 0.3, 1] } }}
                className="serif"
                style={{
                    fontSize: 'clamp(1.8rem, 6vw, 3rem)',
                    color: '#ffffff', fontWeight: 300,
                    letterSpacing: '0.08em', margin: 0
                }}
            >
                VAN GOGH
            </motion.h1>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: '120px' }}
                transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    height: '1px', backgroundColor: 'rgba(255,255,255,0.3)',
                    marginTop: '1.5rem'
                }}
            />
        </div>
    );
}
