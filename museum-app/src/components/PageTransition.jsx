import React from 'react';
import { motion } from 'framer-motion';

// Apple-like smooth cinematic transition curves
const transition = { duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] };

const pageVariants = {
    initial: { opacity: 0, scale: 1.15, filter: 'blur(20px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)', transition },
};

export default function PageTransition({ children, style }) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={pageVariants}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                ...style
            }}
        >
            {children}
        </motion.div>
    );
}
