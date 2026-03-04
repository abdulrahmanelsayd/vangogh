import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';

/* ─────────────────────────────────────────────
   FRAMER MOTION VARIANTS
───────────────────────────────────────────── */
const wordReveal = {
    hidden: {},
    visible: (delay) => ({
        transition: { staggerChildren: 0.12, delayChildren: delay }
    }),
    exit: { opacity: 0, filter: 'blur(10px)', transition: { duration: 1.2 } }
};

const letterVariant = {
    hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
    visible: {
        opacity: 1, y: 0, filter: 'blur(0px)',
        transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
    },
};

const titleReveal = {
    hidden: { opacity: 0, scale: 0.9, filter: 'blur(20px)', letterSpacing: '0.15em' },
    visible: {
        opacity: 1, scale: 1, filter: 'blur(0px)', letterSpacing: '0.08em',
        transition: { duration: 2.5, ease: [0.16, 1, 0.3, 1] }
    },
};

const subtleFadeUp = {
    hidden: { opacity: 0, y: 14 },
    visible: (delay) => ({
        opacity: 1, y: 0,
        transition: { duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }
    }),
};

function StaggeredLine({ text, delay, style }) {
    const words = text.split(' ');
    return (
        <motion.p
            variants={wordReveal}
            custom={delay}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ ...style, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 0.35em', margin: 0 }}
        >
            {words.map((word, i) => (
                <motion.span key={i} variants={letterVariant} style={{ display: 'inline-block' }}>
                    {word}
                </motion.span>
            ))}
        </motion.p>
    );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function Onboarding() {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [phase, setPhase] = useState('quote');
    const [diving, setDiving] = useState(false);

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('reveal'), 6000);

        // Defer massive video loading until after initial paint
        const t2 = setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.src = "/hero.mp4";
                videoRef.current.load();
            }
        }, 500);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);

    const handleEnter = () => {
        setDiving(true);
        window.setTimeout(() => navigate('/hub'), 1500);
    };

    const quoteStyle = {
        fontFamily: '"Cormorant Garamond", serif',
        fontSize: 'clamp(2rem, 6vw, 4.5rem)',
        color: '#ffffff',
        letterSpacing: '2px',
        lineHeight: 1.5,
        fontWeight: 300,
        textTransform: 'uppercase'
    };

    return (
        <PageTransition>
            <div style={{
                position: 'relative', width: '100vw', height: '100vh',
                backgroundColor: '#000000', overflow: 'hidden'
            }}>

                {/* ── Cinematic Video Background ── */}
                <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: diving ? 1.3 : 1, opacity: diving ? 0 : 1 }}
                    transition={{
                        opacity: { duration: diving ? 1.5 : 3, ease: diving ? [0.4, 0, 0.2, 1] : "easeOut" },
                        scale: { duration: diving ? 1.5 : 20, ease: diving ? [0.4, 0, 0.2, 1] : "easeOut" }
                    }}
                    style={{ position: 'absolute', inset: -50, zIndex: 0 }}
                >
                    <video
                        ref={videoRef}
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster="/abouthero.webp"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            filter: 'brightness(0.25) contrast(1.2) grayscale(0.2)',
                            transition: 'opacity 1s ease-in'
                        }}
                    >
                    </video>
                </motion.div>

                {/* ── Edge Vignette Overlays ── */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 5,
                    background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,1) 100%)',
                    pointerEvents: 'none'
                }} />

                {/* ── Content Phase Logic ── */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    zIndex: 10, pointerEvents: 'none'
                }}>

                    <AnimatePresence mode="wait">
                        {phase === 'quote' && !diving && (
                            <motion.div
                                key="quote"
                                exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)', transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] } }}
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    textAlign: 'center', padding: '0 30px', gap: '4px', position: 'absolute'
                                }}
                            >
                                <StaggeredLine text={'I dream my painting,'} delay={0.5} style={quoteStyle} />
                                <StaggeredLine text={'and I paint my dream.'} delay={2.0} style={quoteStyle} />

                                <motion.span
                                    variants={subtleFadeUp}
                                    custom={3.5}
                                    initial="hidden"
                                    animate="visible"
                                    className="sans"
                                    style={{
                                        fontSize: 'clamp(0.6rem, 2vw, 0.8rem)',
                                        color: 'rgba(255,255,255,0.4)',
                                        letterSpacing: 'clamp(3px, 1.5vw, 8px)',
                                        marginTop: 'clamp(2rem, 4vw, 3rem)',
                                        textTransform: 'uppercase',
                                        fontWeight: 300
                                    }}
                                >
                                    — Vincent van Gogh
                                </motion.span>
                            </motion.div>
                        )}

                        {phase === 'reveal' && !diving && (
                            <motion.div
                                key="reveal"
                                exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)', transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] } }}
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    textAlign: 'center', padding: '0 20px', position: 'absolute'
                                }}
                            >
                                <motion.h1
                                    variants={titleReveal}
                                    initial="hidden"
                                    animate="visible"
                                    className="serif"
                                    style={{
                                        fontSize: 'clamp(3.5rem, 15vw, 9rem)',
                                        color: '#ffffff',
                                        fontWeight: 300,
                                        margin: 0,
                                        lineHeight: 1,
                                        textShadow: '0 20px 40px rgba(0,0,0,0.8)'
                                    }}
                                >
                                    VAN GOGH
                                </motion.h1>

                                <motion.p
                                    variants={subtleFadeUp}
                                    custom={1}
                                    initial="hidden"
                                    animate="visible"
                                    className="sans"
                                    style={{
                                        fontSize: 'clamp(0.7rem, 2.5vw, 1.2rem)',
                                        color: 'rgba(255,255,255,0.8)',
                                        letterSpacing: 'clamp(8px, 4vw, 24px)',
                                        textTransform: 'uppercase',
                                        margin: 'clamp(1rem, 3vw, 2rem) 0 0 0',
                                        fontWeight: 200,
                                        paddingLeft: 'clamp(8px, 4vw, 24px)' // Offset optical balance due to letter spacing
                                    }}
                                >
                                    MUSEUM
                                </motion.p>

                                {/* ───── CTA IN THE CENTER FLOW ───── */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 1.5, delay: 2.5, ease: [0.16, 1, 0.3, 1] }}
                                    style={{
                                        marginTop: 'clamp(3rem, 8vh, 5rem)',
                                        zIndex: 20,
                                        pointerEvents: 'auto'
                                    }}
                                >
                                    <button
                                        onClick={handleEnter}
                                        className="sans"
                                        style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            color: '#ffffff',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '50px',
                                            padding: 'clamp(12px, 2.5vw, 16px) clamp(35px, 8vw, 60px)',
                                            cursor: 'pointer',
                                            fontSize: 'clamp(0.6rem, 2.2vw, 0.8rem)',
                                            textTransform: 'uppercase',
                                            letterSpacing: 'clamp(3px, 1.5vw, 5px)',
                                            backdropFilter: 'blur(15px)',
                                            WebkitBackdropFilter: 'blur(15px)',
                                            fontWeight: 300,
                                            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#ffffff';
                                            e.currentTarget.style.color = '#000000';
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                            e.currentTarget.style.color = '#ffffff';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                    >
                                        Enter the Experience
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ───── DIVE BLACKOUT ───── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: diving ? 1 : 0 }}
                    transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                    style={{
                        position: 'absolute', inset: 0,
                        backgroundColor: '#000000', zIndex: 100,
                        pointerEvents: diving ? 'auto' : 'none'
                    }}
                />
            </div>
        </PageTransition>
    );
}
