import React, { Suspense, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Text, useTexture, Float, MeshReflectorMaterial, MeshTransmissionMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';

function ImageText(props) {
    const texture = useTexture('/D1xaXOvW0AEI_M5.jpg');
    const { size } = useThree();

    // Smooth responsive scale based on static CSS pixels, preventing 3D viewport calculation flashes
    // Stabilized for the final Z=14 camera approach. Size=1 matches the original 15% viewport width.
    const scale = Math.min(1.2, size.width / 800);

    return (
        <group {...props} scale={[scale, scale, 1]}>
            <Text
                fontSize={1}
                letterSpacing={0.08}
                position={[0, 0.2, 0]}
                outlineWidth={0.015}
                outlineColor="#111111"
            >
                VAN GOGH
                <meshPhysicalMaterial
                    map={texture}
                    roughness={0.05}
                    metalness={0.6}
                    clearcoat={1}
                    clearcoatRoughness={0.05}
                />
            </Text>
            <Float speed={3} rotationIntensity={0.2} floatIntensity={0.4} floatingRange={[-0.03, 0.03]}>
                <Text fontSize={0.3} letterSpacing={0.8} position={[0, -0.6, 0.3]}>
                    MUSEUM
                    <MeshTransmissionMaterial
                        backside
                        thickness={1.5}
                        roughness={0.05}
                        transmission={0.9}
                        ior={1.3}
                        chromaticAberration={0.02}
                        anisotropy={0.1}
                        distortion={0.3}
                        distortionScale={0.5}
                        color="#f5f5f5"
                    />
                </Text>
            </Float>
        </group>
    );
}

function Ground() {
    const [floor, normal] = useTexture(['/SurfaceImperfections003_1K_var1.jpg', '/SurfaceImperfections003_1K_Normal.jpg']);
    return (
        <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
            <planeGeometry args={[10, 10]} />
            <MeshReflectorMaterial
                blur={[400, 100]}
                resolution={512}
                mirror={0.5}
                mixBlur={6}
                mixStrength={1.5}
                color="#888"
                metalness={0.6}
                roughnessMap={floor}
                normalMap={normal}
                normalScale={[3, 3]}
            />
        </mesh>
    );
}

function Intro() {
    const [vec] = useState(() => new THREE.Vector3());
    return useFrame((state) => {
        state.camera.position.lerp(vec.set(state.pointer.x * 5, 3 + state.pointer.y * 2, 14), 0.05);
        state.camera.lookAt(0, 0, 0);
    });
}

const HeroCanvas = () => (
    <Canvas gl={{ alpha: false }} dpr={[1, 2]} camera={{ position: [0, 3, 100], fov: typeof window !== 'undefined' && window.innerWidth < 768 ? 25 : 15 }}>
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 10, 20]} />
        <Suspense fallback={null}>
            <Environment preset="studio" />
            <group position={[0, -1, 0]}>
                <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
                    <ImageText position={[0, 1.3, -2]} />
                </Float>
                <Ground />
            </group>
            <ambientLight intensity={0.5} />
            <spotLight position={[0, 10, 0]} intensity={0.8} color="#ffffff" />
            <directionalLight position={[-50, 0, -40]} intensity={0.7} color="#e0e0e0" />
            <Intro />
        </Suspense>
    </Canvas>
);

export default function HeroHub() {
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    return (
        <PageTransition>
            <div style={{ backgroundColor: '#000000', color: '#ffffff', minHeight: '300vh' }}>
                <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden' }}>
                    <HeroCanvas />
                    <motion.div style={{ opacity, y, position: 'absolute', bottom: 'clamp(5%, 8vh, 10%)', width: '100%', textAlign: 'center' }}>
                        <p className="sans" style={{ letterSpacing: 'clamp(3px, 1vw, 6px)', color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(0.55rem, 2vw, 0.7rem)', textTransform: 'uppercase' }}>Descend</p>
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            style={{ width: '1px', height: 'clamp(25px, 5vh, 40px)', background: 'rgba(255,255,255,0.6)', margin: '0.8rem auto 0' }}
                        />
                    </motion.div>
                </div>

                <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, position: 'relative', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.9), #000000)' }}>
                    <div style={{ maxWidth: '800px', textAlign: 'center', padding: 'clamp(1rem, 4vw, 2rem)' }}>
                        <motion.h2
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="serif" style={{ fontSize: 'clamp(3rem, 10vw, 4.5rem)', marginBottom: 'clamp(1.5rem, 5vw, 2.5rem)', color: '#ffffff', letterSpacing: '1px', fontWeight: 300 }}
                        >
                            Vision.
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="sans"
                            style={{ fontSize: 'clamp(0.95rem, 4vw, 1.2rem)', lineHeight: 2.2, color: '#a1a1aa', fontWeight: 300, letterSpacing: '0.5px' }}
                        >
                            He didn’t paint the world. He painted the energy beneath it.<br />
                            Raw texture. Unapologetic color. Reality, redefined.
                        </motion.p>
                    </div>
                </section>

                <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, position: 'relative', backgroundColor: '#000000' }}>
                    <div style={{ maxWidth: '800px', textAlign: 'center', padding: 'clamp(1rem, 4vw, 2rem)' }}>
                        <motion.h2
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="serif" style={{ fontSize: 'clamp(3rem, 10vw, 4.5rem)', marginBottom: 'clamp(1.5rem, 5vw, 2.5rem)', letterSpacing: '1px', fontWeight: 300, color: '#ffffff' }}
                        >
                            The Space.
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="sans"
                            style={{ fontSize: 'clamp(0.95rem, 4vw, 1.2rem)', lineHeight: 2.2, color: '#a1a1aa', marginBottom: 'clamp(2rem, 6vw, 4rem)', fontWeight: 300, letterSpacing: '0.5px' }}
                        >
                            Not a gallery. A spatial experience.<br />
                            Fluid digital architecture designed to let the work breathe. Step inside his eras.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(0.8rem, 3vw, 2rem)', flexWrap: 'wrap', padding: '0 clamp(0.5rem, 2vw, 1rem)' }}
                        >
                            <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: '#ffffff', color: '#000000' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/biography')}
                                className="sans"
                                style={{ padding: 'clamp(0.8rem, 2.5vw, 1.2rem) clamp(1.5rem, 5vw, 3.5rem)', background: 'transparent', color: '#ffffff', border: '1px solid #ffffff', borderRadius: '50px', fontSize: 'clamp(0.65rem, 2.5vw, 0.9rem)', cursor: 'pointer', letterSpacing: 'clamp(2px, 0.8vw, 4px)', textTransform: 'uppercase', transition: 'all 0.4s ease' }}
                            >
                                Descend into the Mind
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: '#ffffff', color: '#000000' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/gallery')}
                                className="sans"
                                style={{ padding: 'clamp(0.8rem, 2.5vw, 1.2rem) clamp(1.5rem, 5vw, 3.5rem)', background: '#ffffff', color: '#000000', border: '1px solid #ffffff', borderRadius: '50px', fontSize: 'clamp(0.65rem, 2.5vw, 0.9rem)', cursor: 'pointer', letterSpacing: 'clamp(2px, 0.8vw, 4px)', textTransform: 'uppercase', transition: 'all 0.4s ease' }}
                            >
                                Enter The Masterpiece
                            </motion.button>
                        </motion.div>
                    </div>
                </section>
            </div>
        </PageTransition>
    );
}
