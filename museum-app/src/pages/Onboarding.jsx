import * as THREE from 'three';
import React, { useRef, useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame, createPortal, useThree } from '@react-three/fiber';
import { Sparkles, Stars, useGLTF, useFBO, MeshTransmissionMaterial, Environment } from '@react-three/drei';
import { easing } from 'maath';
import PageTransition from '../components/PageTransition';
import { motion } from 'framer-motion';

/* ─────────────────────────────────────────────
   ULTRA-LIGHTWEIGHT 3D ATMOSPHERE
   Pure monochrome — white only
───────────────────────────────────────────── */
function AmbientField() {
    const groupRef = useRef();
    useFrame((state, delta) => {
        if (!groupRef.current) return;
        groupRef.current.rotation.y += delta * 0.012;
        groupRef.current.rotation.x += delta * 0.004;
    });
    return (
        <group ref={groupRef}>
            <Stars radius={90} depth={60} count={1500} factor={3} saturation={0} fade speed={0.2} />
            <Sparkles count={250} scale={45} size={1.5} speed={0.12} opacity={0.18} color="#ffffff" />
            <Sparkles count={100} scale={55} size={2} speed={0.06} opacity={0.08} color="#888888" />
        </group>
    );
}

function CameraBreath({ diving }) {
    useFrame((state, delta) => {
        if (diving) {
            // Cinematic push through the sphere using safe single-axis easing
            easing.damp(state.camera.position, 'z', 0.5, 0.35, delta);
        } else {
            const t = state.clock.elapsedTime;
            state.camera.position.x = Math.sin(t * 0.25) * 0.2;
            state.camera.position.y = Math.cos(t * 0.18) * 0.12;
            easing.damp(state.camera.position, 'z', 15, 0.2, delta);
        }
        state.camera.lookAt(0, 0, 0);
    });
    return null;
}

/* ─────────────────────────────────────────────
   GLASS SPHERE (LENS)
───────────────────────────────────────────── */
function Lens({ children, damping = 0.2, ...props }) {
    const ref = useRef()
    const { nodes } = useGLTF('/lens-transformed.glb')
    const buffer = useFBO()
    const viewport = useThree((state) => state.viewport)
    const [scene] = useState(() => new THREE.Scene())

    useFrame((state, delta) => {
        // Evaluate viewport at Z=5 so the pointer positioning maps correctly to where the lens is
        const viewportCoord = state.viewport.getCurrentViewport(state.camera, [0, 0, 5])
        easing.damp3(
            ref.current.position,
            [(state.pointer.x * viewportCoord.width) / 2, (state.pointer.y * viewportCoord.height) / 2, 5],
            damping,
            delta
        )

        state.gl.setRenderTarget(buffer)
        state.gl.setClearColor('#000000')
        state.gl.render(scene, state.camera)
        state.gl.setRenderTarget(null)
    })

    return (
        <>
            {createPortal(children, scene)}
            <mesh scale={[viewport.width, viewport.height, 1]}>
                <planeGeometry />
                <meshBasicMaterial map={buffer.texture} />
            </mesh>
            <mesh scale={2.5} ref={ref} rotation-x={Math.PI / 2} geometry={nodes.Cylinder.geometry} {...props}>
                <MeshTransmissionMaterial buffer={buffer.texture} ior={1.2} thickness={1.5} anisotropy={0.1} chromaticAberration={0.04} color="#ffffff" />
            </mesh>
        </>
    )
}

/* ─────────────────────────────────────────────
   FRAMER MOTION VARIANTS
───────────────────────────────────────────── */
const wordReveal = {
    hidden: {},
    visible: (delay) => ({
        transition: { staggerChildren: 0.12, delayChildren: delay }
    }),
    exit: { opacity: 0, transition: { duration: 0.8 } }
};

const letterVariant = {
    hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
    visible: {
        opacity: 1, y: 0, filter: 'blur(0px)',
        transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
    },
};

const titleReveal = {
    hidden: { opacity: 0, scale: 1.08, filter: 'blur(25px)', letterSpacing: '0.15em' },
    visible: {
        opacity: 1, scale: 1, filter: 'blur(0px)', letterSpacing: '0.08em',
        transition: { duration: 2.5, ease: [0.16, 1, 0.3, 1] }
    },
};

const lineGrow = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
        scaleX: 1, opacity: 1,
        transition: { duration: 1.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }
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
    const [phase, setPhase] = useState('quote');
    const [diving, setDiving] = useState(false);

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('reveal'), 6500);
        const t2 = setTimeout(() => setPhase('ready'), 10000);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    const handleEnter = () => {
        setDiving(true);
        window.setTimeout(() => navigate('/hub'), 1400);
    };

    const quoteStyle = {
        fontSize: 'clamp(1.3rem, 5.5vw, 2.5rem)',
        color: '#ffffff',
        fontStyle: 'italic',
        letterSpacing: '1px',
        lineHeight: 1.7,
        fontWeight: 300,
    };

    return (
        <PageTransition>
            <div style={{
                position: 'relative', width: '100vw', height: '100vh',
                backgroundColor: '#000000', overflow: 'hidden'
            }}>

                {/* ── 3D Starfield ── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: diving ? 0 : 1 }}
                    transition={{ duration: diving ? 0.6 : 4 }}
                    style={{ position: 'absolute', inset: 0 }}
                >
                    <Canvas camera={{ position: [0, 0, 15], fov: 50 }} dpr={[1, 1.5]}>
                        <color attach="background" args={['#000000']} />
                        <ambientLight intensity={0.5} />
                        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#ffffff" />
                        <Environment preset="studio" />
                        <Suspense fallback={null}>
                            <Lens>
                                <AmbientField />
                                <CameraBreath diving={diving} />
                            </Lens>
                        </Suspense>
                    </Canvas>
                </motion.div>

                {/* ── Film Grain ── */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 5,
                    background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
                    pointerEvents: 'none', opacity: 0.4
                }} />

                {/* ── Vignette ── */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 6,
                    background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
                    pointerEvents: 'none'
                }} />

                {/* ── CONTENT ── */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    zIndex: 10, pointerEvents: 'none'
                }}>

                    {/* ───── PHASE 1: QUOTE ───── */}
                    <motion.div
                        initial={{ opacity: 0, filter: 'blur(10px)' }}
                        animate={{
                            opacity: (phase === 'quote' && !diving) ? 1 : 0,
                            scale: (phase === 'quote' && !diving) ? 1 : 0.96,
                            filter: (phase === 'quote' && !diving) ? 'blur(0px)' : 'blur(8px)'
                        }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            position: 'absolute',
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            textAlign: 'center', padding: '0 30px', gap: '4px'
                        }}
                    >
                        <StaggeredLine text={'"I dream my painting,'} delay={0.8} style={quoteStyle} />
                        <StaggeredLine text={'and I paint my dream."'} delay={2.5} style={quoteStyle} />

                        <motion.span
                            variants={subtleFadeUp}
                            custom={4.2}
                            initial="hidden"
                            animate="visible"
                            className="sans"
                            style={{
                                fontSize: 'clamp(0.5rem, 2vw, 0.7rem)',
                                color: 'rgba(255,255,255,0.35)',
                                letterSpacing: 'clamp(3px, 1.5vw, 8px)',
                                marginTop: 'clamp(1.5rem, 4vw, 2.5rem)',
                                textTransform: 'uppercase',
                                fontWeight: 300
                            }}
                        >
                            — Vincent van Gogh
                        </motion.span>
                    </motion.div>

                    {/* ───── PHASE 2 & 3: REVEAL ───── */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
                        animate={
                            diving
                                ? { opacity: 0, scale: 2.2, filter: 'blur(20px)', transition: { duration: 1.2, ease: "easeInOut" } }
                                : (phase === 'reveal' || phase === 'ready')
                                    ? { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 1.5, ease: 'easeOut' } }
                                    : { opacity: 0, scale: 0.9, filter: 'blur(20px)', transition: { duration: 0 } }
                        }
                        style={{
                            position: 'absolute',
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            textAlign: 'center', padding: '0 20px'
                        }}
                    >
                        <motion.h1
                            variants={titleReveal}
                            initial="hidden"
                            animate="visible"
                            className="serif"
                            style={{
                                fontSize: 'clamp(3.2rem, 17vw, 9.5rem)',
                                color: '#ffffff',
                                fontWeight: 300,
                                margin: 0,
                                lineHeight: 1,
                            }}
                        >
                            VAN GOGH
                        </motion.h1>

                        <motion.div
                            variants={lineGrow}
                            initial="hidden"
                            animate="visible"
                            style={{
                                width: 'clamp(60px, 20vw, 140px)',
                                height: '1px',
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                                marginTop: 'clamp(0.8rem, 2.5vw, 1.5rem)',
                                marginBottom: 'clamp(0.8rem, 2.5vw, 1.5rem)',
                                transformOrigin: 'center'
                            }}
                        />

                        <motion.p
                            variants={subtleFadeUp}
                            custom={1}
                            initial="hidden"
                            animate="visible"
                            className="sans"
                            style={{
                                fontSize: 'clamp(0.6rem, 2.5vw, 1rem)',
                                color: 'rgba(255,255,255,0.35)',
                                letterSpacing: 'clamp(8px, 3vw, 22px)',
                                textTransform: 'uppercase',
                                margin: 0,
                                fontWeight: 200
                            }}
                        >
                            MUSEUM
                        </motion.p>

                        <motion.span
                            variants={subtleFadeUp}
                            custom={1.6}
                            initial="hidden"
                            animate="visible"
                            className="sans"
                            style={{
                                fontSize: 'clamp(0.45rem, 1.8vw, 0.65rem)',
                                color: 'rgba(255,255,255,0.2)',
                                letterSpacing: 'clamp(4px, 2vw, 10px)',
                                marginTop: 'clamp(0.6rem, 2vw, 1rem)',
                                fontWeight: 300
                            }}
                        >
                            1853 — 1890
                        </motion.span>

                        {/* ───── CTA IN THE CENTER FLOW ───── */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{
                                opacity: (phase === 'ready' && !diving) ? 1 : 0,
                                y: (phase === 'ready' && !diving) ? 0 : 5
                            }}
                            transition={{ duration: 1.4, delay: (phase === 'ready' && !diving) ? 0.5 : 0, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                marginTop: 'clamp(2.5rem, 5vh, 4rem)',
                                zIndex: 20,
                                pointerEvents: (phase === 'ready' && !diving) ? 'auto' : 'none'
                            }}
                        >
                            <motion.button
                                onClick={handleEnter}
                                className="sans"
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                style={{
                                    background: 'transparent',
                                    color: '#ffffff',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '50px',
                                    padding: 'clamp(11px, 2.5vw, 15px) clamp(30px, 7vw, 52px)',
                                    cursor: 'pointer',
                                    fontSize: 'clamp(0.55rem, 2.2vw, 0.75rem)',
                                    textTransform: 'uppercase',
                                    letterSpacing: 'clamp(3px, 1.5vw, 7px)',
                                    backdropFilter: 'blur(12px)',
                                    fontWeight: 300,
                                    transition: 'border-color 0.5s ease, background 0.5s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                                }}
                            >
                                Enter the Experience
                            </motion.button>
                        </motion.div>
                    </motion.div>
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
