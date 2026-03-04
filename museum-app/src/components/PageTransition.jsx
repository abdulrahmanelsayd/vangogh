import React from 'react';
import { motion } from 'framer-motion';

// Apple-like snappy cinematic transition curves
const transition = { duration: 0.4, ease: [0.25, 1, 0.5, 1] };

const pageVariants = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0, transition },
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
                willChange: 'filter, transform, opacity',
                ...style
            }}
        >
            {children}
        </motion.div>
    );
}
