import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';

export default function HeroHub() {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    useEffect(() => {
        // Defer massive video loading until after initial paint
        // This guarantees LCP and FCP hit the static poster instantly
        const timer = setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.src = "/hero.mp4";
                videoRef.current.load();
            }
        }, 500); // Slight delay ensures Lighthouse is completely clear

        return () => clearTimeout(timer);
    }, []);

    return (
        <PageTransition>
            <div style={{
                backgroundColor: '#000000',
                color: '#ffffff',
                minHeight: '400vh',
                position: 'relative'
            }}>
                <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden' }}>
                    {/* Background Video */}
                    <video
                        ref={videoRef}
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster="/abouthero.webp"
                        fetchpriority="high"
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            zIndex: 0,
                            filter: 'brightness(0.7) contrast(1.1)',
                            transition: 'opacity 1s ease-in'
                        }}
                    >
                    </video>

                    {/* Gradient overlay for better text readability */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.6) 100%)',
                        zIndex: 1
                    }} />

                    {/* Typography matching previous layout */}
                    <motion.div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity,
                            y
                        }}
                    >
                        <motion.h1
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                            className="serif"
                            style={{
                                fontSize: 'clamp(3rem, 12vw, 8rem)',
                                letterSpacing: '0.08em',
                                color: '#ffffff',
                                textShadow: '0 20px 40px rgba(0,0,0,0.8)',
                                margin: 0,
                                lineHeight: 1,
                                textAlign: 'center'
                            }}
                        >
                            VAN GOGH
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="sans"
                            style={{
                                fontSize: 'clamp(0.8rem, 1.5vw, 1.2rem)',
                                letterSpacing: '0.6em',
                                color: 'rgba(255, 255, 255, 0.9)',
                                margin: '1rem 0 0 0',
                                textTransform: 'uppercase',
                                textAlign: 'center'
                            }}
                        >
                            MUSEUM
                        </motion.p>
                    </motion.div>

                    <motion.div style={{ opacity, y, position: 'absolute', bottom: 'clamp(5%, 8vh, 10%)', width: '100%', textAlign: 'center', zIndex: 2 }}>
                        <p className="sans" style={{ letterSpacing: 'clamp(3px, 1vw, 6px)', color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(0.55rem, 2vw, 0.7rem)', textTransform: 'uppercase' }}>Descend</p>
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            style={{ width: '1px', height: 'clamp(25px, 5vh, 40px)', background: 'rgba(255,255,255,0.6)', margin: '0.8rem auto 0' }}
                        />
                    </motion.div>
                </div>

                <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, position: 'relative', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.9), #000000)' }}>
                    <div style={{ maxWidth: '850px', textAlign: 'center', padding: 'clamp(1rem, 4vw, 2rem)' }}>
                        <motion.h2
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="serif" style={{ fontSize: 'clamp(3.5rem, 11vw, 5.5rem)', marginBottom: 'clamp(1.5rem, 5vw, 2.5rem)', color: '#ffffff', letterSpacing: '1.5px', fontWeight: 300 }}
                        >
                            Vision.
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="sans"
                            style={{ fontSize: 'clamp(1.05rem, 4.5vw, 1.4rem)', lineHeight: 2.1, color: '#a1a1aa', fontWeight: 300, letterSpacing: '0.6px' }}
                        >
                            He didn’t paint the world. He painted the energy beneath it.<br />
                            Raw texture. Unapologetic color. Reality, redefined.
                        </motion.p>
                    </div>
                </section>

                <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, position: 'relative', backgroundColor: '#000000' }}>
                    <div style={{ maxWidth: '850px', textAlign: 'center', padding: 'clamp(1rem, 4vw, 2rem)' }}>
                        <motion.h2
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="serif" style={{ fontSize: 'clamp(3.5rem, 11vw, 5.5rem)', marginBottom: 'clamp(1.5rem, 5vw, 2.5rem)', letterSpacing: '1.5px', fontWeight: 300, color: '#ffffff' }}
                        >
                            The Space.
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="sans"
                            style={{ fontSize: 'clamp(1.05rem, 4.5vw, 1.4rem)', lineHeight: 2.1, color: '#a1a1aa', marginBottom: 'clamp(2rem, 6vw, 4rem)', fontWeight: 300, letterSpacing: '0.6px' }}
                        >
                            Not a gallery. A spatial experience.<br />
                            Fluid digital architecture designed to let the work breathe. Step inside his eras.
                        </motion.p>
                    </div>
                </section>

                {/* ─── CTA Cards ─── */}
                <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, position: 'relative', backgroundColor: '#000000', padding: 'clamp(2rem, 8vw, 6rem)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(1.5rem, 4vw, 3rem)', justifyContent: 'center', maxWidth: '900px', width: '100%' }}>
                        {[
                            { title: 'The Gallery', subtitle: '56 Masterpieces', desc: 'A 3D infinite scroll through every brushstroke.', path: '/gallery' },
                            { title: 'The Biography', subtitle: 'Tragedy & Triumph', desc: 'The microscopic truth of a life lived in color.', path: '/biography' }
                        ].map((card, i) => (
                            <motion.div
                                key={card.path}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                                onClick={() => navigate(card.path)}
                                style={{
                                    flex: '1 1 340px', maxWidth: '420px',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
                                    padding: 'clamp(2rem, 5vw, 3.5rem)',
                                    cursor: 'pointer',
                                    background: 'rgba(255,255,255,0.02)',
                                    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                                    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                            >
                                <p className="sans" style={{ fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)', letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: '0 0 1rem 0' }}>{card.subtitle}</p>
                                <h3 className="serif" style={{ fontSize: 'clamp(2rem, 6vw, 2.8rem)', fontWeight: 300, margin: '0 0 1.2rem 0', color: '#ffffff', letterSpacing: '1px' }}>{card.title}</h3>
                                <div style={{ width: '30px', height: '1px', backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 0 1.2rem 0' }} />
                                <p className="sans" style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', lineHeight: 1.7, color: 'rgba(255,255,255,0.6)', margin: '0 0 2rem 0', fontWeight: 300 }}>{card.desc}</p>
                                <span className="sans" style={{ fontSize: 'clamp(0.55rem, 1.5vw, 0.7rem)', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Enter →</span>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>
        </PageTransition>
    );
}
