import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, Sparkles, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';

function StarryDome() {
    // We use a single, high-res texture specifically chosen to serve as a deep, elegant background
    const texture = useTexture('/D1xaXOvW0AEI_M5.jpg');
    texture.colorSpace = THREE.SRGBColorSpace;
    const domeRef = useRef();

    useFrame(() => {
        if (domeRef.current) {
            // Ultra-slow, barely perceptible rotation for a premium feel without movement sickness
            domeRef.current.rotation.y -= 0.00015;
            domeRef.current.rotation.x += 0.00005;
        }
    });

    return (
        <mesh ref={domeRef}>
            <sphereGeometry args={[150, 64, 64]} />
            <meshBasicMaterial
                map={texture}
                side={THREE.BackSide}
                // Very dim color (0.35) so white text pops perfectly without needing heavy drop-shadows
                color={new THREE.Color(0.35, 0.35, 0.35)}
                fog={false}
            />
        </mesh>
    );
}

// Highly Optimized Background Environment
function BackgroundScene() {
    return (
        <Canvas
            camera={{ position: [0, 0, 0], fov: 60 }}
            style={{ position: 'fixed', top: 0, left: 0, height: '100vh', width: '100vw', zIndex: 0, pointerEvents: 'none' }}
            // Locking pixel ratio prevents heavy rendering on high-DPI screens, ensuring "rocket" speed
            dpr={[1, 1.5]}
        >
            <color attach="background" args={['#000000']} />
            <Suspense fallback={null}>
                <StarryDome />

                {/* Reduced particle counts for smooth 60fps+ on all devices */}
                <Stars radius={100} depth={50} count={1500} factor={3} saturation={0} fade speed={0.5} />
                <Sparkles count={600} scale={150} size={3} speed={0.3} opacity={0.4} color="#ffffff" />
                <Sparkles count={400} scale={100} size={5} speed={0.2} opacity={0.3} color="#aaccff" />

                {/* Minimal post-processing. Removed Aberration and Noise for speed. */}
                <EffectComposer disableNormalPass multisampling={0}>
                    <Bloom luminanceThreshold={0.5} intensity={0.6} mipmapBlur />
                    <Vignette eskil={false} offset={0.3} darkness={0.9} />
                </EffectComposer>
            </Suspense>
        </Canvas>
    );
}

export default function Biography() {
    const navigate = useNavigate();

    const narrativeData = [
        {
            title: "A Relentless Cycle",
            text: "To capture the microscopic details of Vincent van Gogh’s life is to examine a relentless cycle of intense passion, crushing rejection, and sheer willpower. He did not simply drift into becoming an artist; he was driven into it after exhausting every other avenue of human connection and societal purpose."
        },
        {
            title: "1. The Formative Fractures",
            text: "Born in Groot Zundert, Vincent’s early psychological landscape was shaped by his mother’s lingering grief over her firstborn. At 16, his uncle secured him a junior position at the Goupil & Cie art dealership. Romantic rejection and a growing belief that the commodification of art was vulgar derailed him. He was fired in 1876."
        },
        {
            title: "The Fanatical Preacher",
            text: "Desperate to serve, he turned to the church. Sent to a bleak coal-mining region, his radical empathy—giving away his clothes, sleeping on dirt—got him fired for undermining priestly dignity. At 27, starving and considered a total failure, he picked up a pencil."
        },
        {
            title: "2. The Stumbles into Art",
            text: "Moving to The Hague, this era was defined by intense drama. He took in a pregnant sex worker, leading to societal ostracization. Returning to his parents in Nuenen, he painted The Potato Eaters (1885), deliberately choosing coarse models because he wanted the painting to literally smell of bacon, smoke, and potato steam."
        },
        {
            title: "3. The Parisian Awakening",
            text: "Arriving in Paris, his artistic worldview was shattered and rebuilt. Introduced to Pointillism, Vincent realized his Dutch palette was obsolete. He began using complementary colors to make vibrating canvases. However, Paris took a physical toll. Surviving largely on absinthe and cheap wine, he suffered severe malnutrition."
        },
        {
            title: "4. The Arles Utopia and Collapse",
            text: "Seeking the brilliant light of the South, he rented the 'Yellow House' in Arles. Working furiously under the blazing sun, he created masterpieces like Sunflowers. But after a disastrous attempt to live with Paul Gauguin, Vincent suffered a psychotic break on Dec 23, 1888, severing his own ear."
        },
        {
            title: "5. The Asylum & The End",
            text: "Entering an asylum voluntarily, his attacks were terrifyingly hallucinatory. Yet, between episodes, he was entirely lucid. His brushstrokes evolved into thick, swirling, rhythmic lines. Feeling his financial dependence was destroying his brother's life, Vincent shot himself in a wheat field on July 27, 1890."
        },
        {
            title: "6. The Posthumous Architecture",
            text: "The detail most frequently omitted is the sheer speed of Theo's subsequent collapse. Broken by grief, Theo lost his mind entirely within weeks. Vincent's legacy fell to Theo's widow, Johanna, who meticulously translated their letters over 35 years, forcing the art world to acknowledge his greatness."
        }
    ];

    return (
        <PageTransition>
            <div style={{ backgroundColor: '#000000', minHeight: '100vh', width: '100vw', position: 'relative' }}>

                {/* The Fast 3D Layer */}
                <BackgroundScene />

                {/* Minimalist Top Nav */}
                <button
                    onClick={() => navigate('/hub')}
                    className="sans"
                    style={{
                        position: 'fixed', top: 40, left: 40, zIndex: 100,
                        background: 'transparent', color: 'rgba(255,255,255,0.7)',
                        border: 'none', cursor: 'pointer',
                        textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.75rem',
                        transition: 'all 0.4s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.transform = 'translateX(-5px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                    ← Return to Hub
                </button>

                {/* Ultra-Smooth Scrolling Typography Layout */}
                <div style={{ position: 'relative', zIndex: 10, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '25vh', paddingBottom: '30vh' }}>

                    {narrativeData.map((data, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-10%" }} // Triggers slightly before it enters the viewport center
                            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }} // Elegant Apple-like easing curve
                            style={{
                                width: '100%',
                                maxWidth: '720px', // Perfect reading width
                                padding: '15vh 30px', // Generous whitespace separates chapters like a museum wall
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '28px',
                                textAlign: 'center'
                            }}
                        >
                            <h2
                                className="serif"
                                style={{
                                    fontSize: 'clamp(2rem, 7vw, 2.8rem)',
                                    margin: 0,
                                    fontWeight: 300,
                                    color: '#ffffff',
                                    lineHeight: 1.2,
                                    letterSpacing: '0.03em'
                                }}
                            >
                                {data.title}
                            </h2>

                            {/* Subtle chic separator line */}
                            <div style={{ width: '40px', height: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }} />

                            <p
                                className="sans"
                                style={{
                                    fontSize: 'clamp(1rem, 4.5vw, 1.25rem)',
                                    lineHeight: 1.85,
                                    margin: 0,
                                    color: 'rgba(255, 255, 255, 0.85)', // Slight off-white reduces eye strain
                                    fontWeight: 300
                                }}
                            >
                                {data.text}
                            </p>
                        </motion.div>
                    ))}

                    {/* Final Elegant End Dot */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        style={{ marginTop: '10vh', display: 'flex', justifyContent: 'center' }}
                    >
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)' }} />
                    </motion.div>

                </div>
            </div>
        </PageTransition>
    );
}
