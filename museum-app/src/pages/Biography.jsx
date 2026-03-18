import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, Sparkles, ScrollControls, Scroll, useScroll as useDreiScroll, Image as DreiImage } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';

// Authentic Gallery Masterpieces defining the chapters of his life
const narrativeData = [
    {
        title: "A Relentless Cycle",
        text: "To capture the microscopic details of Vincent van Gogh’s life is to examine a relentless cycle of intense passion, crushing rejection, and sheer willpower. He did not simply drift into becoming an artist; he was driven into it after exhausting every other avenue of human connection and societal purpose.",
        img: "/paintings/11.jpg", 
        year: "1888",
    },
    {
        title: "1. The Formative Fractures",
        text: "Born in Groot Zundert, Vincent’s early psychological landscape was shaped by his mother’s lingering grief over her firstborn. At 16, his uncle secured him a junior position at the Goupil & Cie art dealership. Romantic rejection and a growing belief that the commodification of art was vulgar derailed him. He was fired in 1876.",
        img: "/paintings/8.jpg", 
        year: "1876"
    },
    {
        title: "The Fanatical Preacher",
        text: "Desperate to serve, he turned to the church. Sent to a bleak coal-mining region, his radical empathy—giving away his clothes, sleeping on dirt—got him fired for undermining priestly dignity. At 27, starving and considered a total failure, he picked up a pencil.",
        img: "/paintings/7.jpg", 
        year: "1885"
    },
    {
        title: "2. The Stumbles into Art",
        text: "Moving to The Hague, this era was defined by intense drama. He took in a pregnant sex worker, leading to societal ostracization. Returning to his parents in Nuenen, he painted The Potato Eaters (1885), deliberately choosing coarse models because he wanted the painting to literally smell of bacon, smoke, and potato steam.",
        img: "/paintings/10.webp", 
        year: "1885"
    },
    {
        title: "3. The Parisian Awakening",
        text: "Arriving in Paris, his artistic worldview was shattered and rebuilt. Introduced to Pointillism, Vincent realized his Dutch palette was obsolete. He began using complementary colors to make vibrating canvases. However, Paris took a physical toll. Surviving largely on absinthe and cheap wine, he suffered severe malnutrition.",
        img: "/paintings/12.jpg", 
        year: "1887"
    },
    {
        title: "4. The Arles Utopia and Collapse",
        text: "Seeking the brilliant light of the South, he rented the 'Yellow House' in Arles. Working furiously under the blazing sun, he created masterpieces like Sunflowers. But after a disastrous attempt to live with Paul Gauguin, Vincent suffered a psychotic break on Dec 23, 1888, severing his own ear.",
        img: "/paintings/16.webp", 
        year: "1888"
    },
    {
        title: "5. The Asylum & The End",
        text: "Entering an asylum voluntarily, his attacks were terrifyingly hallucinatory. Yet, between episodes, he was entirely lucid. His brushstrokes evolved into thick, swirling, rhythmic lines. Feeling his financial dependence was destroying his brother's life, Vincent shot himself in a wheat field on July 27, 1890.",
        img: "/paintings/1.jpg", 
        year: "1889"
    },
    {
        title: "6. The Posthumous Architecture",
        text: "The detail most frequently omitted is the sheer speed of Theo's subsequent collapse. Broken by grief, Theo lost his mind entirely within weeks. Vincent's legacy fell to Theo's widow, Johanna, who meticulously translated their letters over 35 years, forcing the art world to acknowledge his greatness.",
        img: "/paintings/6.webp", 
        year: "1890"
    }
];

const Z_SPACING = 150;
const CAMERA_GAP = 55;
const MAX_Z = narrativeData.length * Z_SPACING; 

function StarryDome() {
    const texture = useTexture('/bio.png');
    texture.colorSpace = THREE.SRGBColorSpace;
    const domeRef = useRef();
    const { camera } = useThree();

    useFrame(() => {
        if (domeRef.current) {
            domeRef.current.rotation.y -= 0.0001; // Slower rotation for calmer vibe
            // The glorious universe moves with the camera perfectly
            domeRef.current.position.copy(camera.position);
        }
    });

    return (
        <mesh ref={domeRef}>
            <sphereGeometry args={[1000, 64, 64]} />
            <meshBasicMaterial map={texture} side={THREE.BackSide} color={new THREE.Color(0.08, 0.08, 0.08)} fog={false} />
        </mesh>
    );
}

function FlythroughCamera() {
    const scroll = useDreiScroll();
    const { camera } = useThree();

    useFrame((state, delta) => {
        // Scroll offset drives the Z axis identically matching the HTML blocks
        const targetZ = -(scroll.offset * MAX_Z);
        
        camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 4, delta);
        
        // Exquisitely subtle breathing motion
        const targetX = Math.sin(state.clock.elapsedTime * 0.2) * 0.8;
        const targetY = Math.cos(state.clock.elapsedTime * 0.1) * 0.5;
        
        camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 2, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 2, delta);
    });
    return null;
}

function CameraLight() {
    const { camera } = useThree();
    const lightRef = useRef();
    useFrame(() => {
        // A softer ambient-like light following the camera to prevent harsh specular 'suns'
        lightRef.current.position.set(camera.position.x, camera.position.y + 10, camera.position.z + 10);
    });
    return <pointLight ref={lightRef} intensity={200} distance={200} decay={2} color="#ffffff" />;
}

function FramedArtwork({ url, position, scale, isEven }) {
    const ref = useRef();
    
    useFrame((state, delta) => {
        const floatY = Math.sin(state.clock.elapsedTime * 0.5 + position[2]) * 0.5;
        ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, floatY, 2, delta);
        
        // Angle toward the camera's path perfectly
        const targetRotY = isEven ? -0.1 : 0.1;
        ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, targetRotY, 2, delta);
    });

    return (
        <group position={position} ref={ref}>
            <DreiImage url={url} scale={scale} />
            {/* Ultra-clean, minimal matte golden frame */}
            <mesh position={[0, 0, -0.05]}>
                <boxGeometry args={[scale[0] + 0.15, scale[1] + 0.15, 0.05]} />
                <meshStandardMaterial color="#bda86c" metalness={0.2} roughness={1} />
            </mesh>
            {/* Soft, minimal drop shadow */}
            <mesh position={[0, 0, -0.5]}>
                <planeGeometry args={[scale[0] + 1, scale[1] + 1]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.3} />
            </mesh>
        </group>
    );
}

function MuseumScene() {
    return (
        <>
            <StarryDome />
            <ambientLight intensity={0.5} />
            <CameraLight />
            <FlythroughCamera />

            {narrativeData.map((data, i) => {
                const isEven = i % 2 === 0;
                const zPos = -((i + 1) * Z_SPACING) + CAMERA_GAP;
                const xPos = isEven ? 16 : -16; 
                return (
                    <FramedArtwork key={i} url={data.img} position={[xPos, 0, zPos]} scale={[16, 21]} isEven={isEven} />
                );
            })}
        </>
    );
}

export default function Biography() {
    return (
        <PageTransition>
            <div style={{ backgroundColor: '#000000', height: '100vh', width: '100vw', overflow: 'hidden', position: 'fixed', inset: 0 }}>
                <Canvas camera={{ position: [0, 0, 10], fov: 60 }} dpr={[1, 1.5]}>
                    <color attach="background" args={['#000000']} />
                    <Suspense fallback={null}>
                        <ScrollControls pages={narrativeData.length + 1} damping={0.25} distance={1.2}>
                            <MuseumScene />
                            
                            <Scroll html style={{ width: '100%', height: '100%' }}>
                                {/* Title Zero Hero Page */}
                                <div style={{ height: '70vh', width: '100vw', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                    <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, delay: 0.2 }} className="serif" style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', marginBottom: '-1rem' }}>Vincent</motion.span>
                                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.5 }} className="serif" style={{ color: 'white', fontSize: 'clamp(6rem, 15vw, 15rem)', margin: 0, textShadow: '0 20px 50px rgba(0,0,0,0.9)', letterSpacing: '-2px', lineHeight: 0.9 }}>THE MAN.</motion.h1>
                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, delay: 1 }} className="sans" style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '10px', textTransform: 'uppercase', marginTop: '3rem' }}>Scroll to Explore</motion.p>
                                </div>

                                {/* Floating Typographic Chapters synced perfectly to 3D scroll */}
                                {narrativeData.map((data, i) => {
                                    const isEven = i % 2 === 0;
                                    return (
                                        <div key={i} style={{ 
                                            height: '100vh', 
                                            width: '100vw', 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            justifyContent: isEven ? 'flex-start' : 'flex-end',
                                            padding: isEven ? '0 0 0 10vw' : '0 10vw 0 0',
                                            pointerEvents: 'none'
                                        }}>
                                            <motion.div 
                                                initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
                                                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                                viewport={{ once: false, margin: "-20%" }}
                                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                                style={{ 
                                                    maxWidth: '520px', 
                                                    padding: '2rem 0',
                                                    position: 'relative'
                                                }}
                                            >
                                                <div style={{ position: 'relative', zIndex: 1 }}>
                                                    {data.year && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                                            <span style={{ width: '40px', height: '1px', backgroundColor: '#bda86c' }} />
                                                            <span className="sans" style={{ color: '#bda86c', fontSize: '0.85rem', letterSpacing: '6px', textTransform: 'uppercase', fontWeight: 500 }}>{data.year}</span>
                                                        </div>
                                                    )}
                                                    <h2 className="serif" style={{ color: '#ffffff', fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', margin: '0 0 1.2rem 0', lineHeight: 1.1, fontWeight: 300 }}>{data.title}</h2>
                                                    <p className="sans" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', lineHeight: 1.8, margin: 0, fontWeight: 300, letterSpacing: '0.5px' }}>{data.text}</p>
                                                </div>
                                            </motion.div>
                                        </div>
                                    );
                                })}
                            </Scroll>
                            
                            <EffectComposer disableNormalPass multisampling={0}>
                                <Bloom luminanceThreshold={0.9} intensity={0.15} mipmapBlur />
                                <Vignette eskil={false} offset={0.3} darkness={0.9} />
                            </EffectComposer>
                        </ScrollControls>
                    </Suspense>
                </Canvas>
            </div>
        </PageTransition>
    );
}

// Preload the heavy cosmic background and all paintings to prevent GPU stuttering
useTexture.preload('/bio.png');
narrativeData.forEach(data => {
    useTexture.preload(data.img);
});
