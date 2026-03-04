import * as THREE from 'three';
import React, { useRef, useState, Suspense, useMemo } from 'react';
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import { useFBO, useGLTF, useScroll, Text, Image as ImageImpl, Scroll, Preload, ScrollControls, MeshTransmissionMaterial, useTexture } from '@react-three/drei';
import { easing } from 'maath';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { paintingsData } from '../data/paintingsData';

function Lens({ children, damping = 0.2, ...props }) {
    const ref = useRef()
    const { nodes } = useGLTF('/lens-transformed.glb')
    const buffer = useFBO()
    const viewport = useThree((state) => state.viewport)
    const [scene] = useState(() => new THREE.Scene())

    useFrame((state, delta) => {
        const viewportCoord = state.viewport.getCurrentViewport(state.camera, [0, 0, 15])
        easing.damp3(
            ref.current.position,
            [(state.pointer.x * viewportCoord.width) / 2, (state.pointer.y * viewportCoord.height) / 2, 15],
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
            <mesh scale={0.25} ref={ref} rotation-x={Math.PI / 2} geometry={nodes.Cylinder.geometry} {...props}>
                <MeshTransmissionMaterial buffer={buffer.texture} ior={1.2} thickness={1.5} anisotropy={0.1} chromaticAberration={0.04} color="#ffffff" />
            </mesh>
        </>
    )
}

const worldPos = new THREE.Vector3();

// Image component wrapped in Suspense for performant, individual loading
function GalleryImageSuspended({ url, position, targetWidth, active, setActive }) {
    const ref = useRef()
    const [hovered, hover] = useState(false)
    const texture = useTexture(url)

    // dynamically calculate the scale to perfectly fit native aspect ratio without any cropping
    const aspect = texture.image.width / texture.image.height
    const scale = [targetWidth, targetWidth / aspect, 1]

    const isActive = active === url
    const isAnyActive = active !== null

    useFrame((state, delta) => {
        if (!ref.current) return;

        // Auto-illuminate paintings as they scroll into the center of the viewport (Fixes Mobile Hover issue)
        ref.current.getWorldPosition(worldPos);
        const distY = Math.abs(worldPos.y);
        const vh = state.viewport.height;
        // Peak brightness at center, dimming towards the edges
        const focus = 1.0 - (distY / (vh * 0.6));
        const dynamicBrightness = THREE.MathUtils.clamp(focus + 0.2, 0.3, 1.0);

        // Dim unactive items or highlight the focal painting dynamically without needing mouse hover
        let targetColorObj;
        if (isActive || hovered) {
            targetColorObj = new THREE.Color('#ffffff');
        } else if (isAnyActive) {
            targetColorObj = new THREE.Color('#000000');
        } else {
            targetColorObj = new THREE.Color().setScalar(dynamicBrightness);
        }

        ref.current.material.color.lerp(targetColorObj, hovered || isActive ? 0.3 : 0.1)

        // Initialize opacity to 0 just once on the JS side, avoiding React overwrites on hover
        if (ref.current.userData.fading === undefined) {
            ref.current.material.opacity = 0;
            ref.current.userData.fading = true;
        }

        // Fluidly fade the painting in once loaded
        if (ref.current.material.opacity < 1) {
            ref.current.material.opacity = THREE.MathUtils.lerp(ref.current.material.opacity, 1.0, 0.05);
        }

        // Make the active painting massive to take up the cinematic view
        const targetScale = isActive ? [scale[0] * 2.8, scale[1] * 2.8, scale[2]] : (hovered && !isAnyActive ? [scale[0] * 1.05, scale[1] * 1.05, scale[2]] : scale);
        easing.damp3(ref.current.scale, targetScale, 0.25, delta)

        // Shifting massively toward the camera (+Z) and to the left (-X) for the layout
        const targetPosition = isActive
            ? [position[0] - targetWidth * 1.5, position[1], position[2] + 8]
            : (hovered && !isAnyActive ? [position[0], position[1], position[2] + 1] : position);

        easing.damp3(ref.current.position, targetPosition, 0.35, delta)
    })

    return (
        <ImageImpl
            ref={ref}
            position={position}
            scale={scale}
            url={url}
            transparent
            toneMapped={false}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onClick={(e) => {
                e.stopPropagation();
                if (isActive) setActive(null)
                else setActive(url)
            }}
        />
    )
}

function GalleryImage({ url, position, targetWidth, active, setActive }) {
    // Individual Suspense boundary ensures the global page transition isn't blocked
    // while each of the 56 massive textures download and decode.
    return (
        <Suspense fallback={
            <mesh position={position}>
                <planeGeometry args={[targetWidth, targetWidth]} />
                <meshBasicMaterial transparent opacity={0} color="#000000" />
            </mesh>
        }>
            <GalleryImageSuspended url={url} position={position} targetWidth={targetWidth} active={active} setActive={setActive} />
        </Suspense>
    )
}

const AVAILABLE_IMAGES = Array.from({ length: 56 }, (_, i) => {
    const num = i + 1;
    // Exactly map the JPGs vs WebPs provided by the user in the folder
    const isJpg = [1, 7, 8, 11, 12].includes(num);
    return `/paintings/${num}.${isJpg ? 'jpg' : 'webp'}`;
});

function Exhibition({ itemCount, active, setActive }) {
    const { width, height } = useThree((state) => state.viewport)

    // Dynamically loop through available real images to fill the 100 items without error
    const paintings = useMemo(() => Array.from({ length: itemCount }, (_, i) => AVAILABLE_IMAGES[i % AVAILABLE_IMAGES.length]), [itemCount])

    const layout = useMemo(() => {
        const isMobile = height > width; // Portrait aspect ratio check

        return paintings.map((url, i) => {
            const row = isMobile ? i : Math.floor(i / 2);

            // X positioning: 
            // Mobile: Centered in a single column
            // Desktop: Staggered left and right
            const isLeft = i % 2 === 0;
            const x = isMobile ? 0 : (isLeft ? -width / 4 : width / 4);

            // Shift the entire gallery down by 1.5 viewport heights to give room for the intro text
            const yOffset = -height * 1.5;

            // Stagger items deeply vertically
            // Mobile: More vertical space between the larger items
            const spacing = isMobile ? (height * 0.45) : (height * 0.8);
            const y = -row * spacing + yOffset;

            // Target fixed width, height will be calculated automatically by GalleryImage
            // Mobile: Massive increase in size (66% of screen width vs 35% on desktop)
            const targetWidth = isMobile ? (width / 1.5) : (width / 2.8);

            return {
                url,
                position: [x, y, 0], // Strict perfectly aligned sequence
                targetWidth
            }
        })
    }, [paintings, width, height])

    return (
        <group>
            {layout.map((ptg, i) => (
                <GalleryImage key={i} url={ptg.url} position={ptg.position} targetWidth={ptg.targetWidth} active={active} setActive={setActive} />
            ))}
        </group>
    )
}

function HeroPosterSuspended() {
    const { width, height } = useThree((state) => state.viewport)
    const ref = useRef()

    // Pre-cache texture so shader doesn't blind-render
    useTexture('/galleryhero.jpg')

    useFrame((state, delta) => {
        if (!ref.current) return;
        // Slide up softly aligning with the primary animations
        easing.damp3(ref.current.position, [0, 0, -20], 0.4, delta)

        // Ensure fade-in initialization preventing harsh popping
        if (ref.current.children[0].material.opacity < 1) {
            ref.current.children[0].material.opacity = THREE.MathUtils.lerp(ref.current.children[0].material.opacity, 1.0, 0.05);
        }
    })

    return (
        <group ref={ref} position={[0, -height * 0.2, -20]}>
            <ImageImpl
                url="/galleryhero.jpg"
                scale={[width * 1.6, height * 1.6, 1]}
                transparent
                opacity={0} // CSS-style manual tween inside useFrame
                toneMapped={false}
            />
            <mesh position={[0, 0, 0.1]}>
                <planeGeometry args={[width * 1.6, height * 1.6]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.65} />
            </mesh>
            {/* Visual gradient transition hack to blend hero into black gallery */}
            <mesh position={[0, -height * 0.8, 0.2]}>
                <planeGeometry args={[width * 1.6, height * 0.4]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.85} />
            </mesh>
        </group>
    )
}

function HeroPoster() {
    return (
        <Suspense fallback={null}>
            <HeroPosterSuspended />
        </Suspense>
    )
}

function Typography() {
    const { width, height } = useThree((state) => state.viewport)
    const shared = { letterSpacing: -0.04, color: '#ffffff' }
    const ref = useRef()

    // Slide up from bottom natively via frame physics (much faster damp factor)
    useFrame((state, delta) => {
        if (!ref.current) return;
        easing.damp3(ref.current.position, [0, height / 8, -5], 0.3, delta)
    })

    return (
        <group ref={ref} position={[0, height / 8 - height * 0.4, -5]}>
            <Text children="the" position={[-width / 8, height / 10, 0]} fontSize={width / 18} {...shared} fillOpacity={0.4} />
            <Text children="ABSOLUTE" position={[0, -height / 15, 0]} fontSize={width / 5} textAlign="center" {...shared} fillOpacity={0.6} />

            <Text maxWidth={width * 0.7} textAlign="center" children="A VISCERAL DESCENT INTO THE SIGHT OF GENIUS" position={[0, -height / 2.5, 0]} fontSize={width / 35} {...shared} fillOpacity={0.8} letterSpacing={0.2} />
        </group>
    )
}

export default function Gallery() {
    const navigate = useNavigate();
    const [active, setActive] = useState(null)

    // 56 real high-res paintings mapping
    const TOTAL_PAINTINGS = 56;
    // 2 columns. Each row is roughly 0.8 * vh. Total height = (TOTAL_PAINTINGS / 2) * 0.8 = 16 vh. 
    // Add 1 for bottom padding + 1.5 for the intro text offset = 2.5. Let's just add 3.
    const pages = Math.ceil((TOTAL_PAINTINGS / 2) * 0.8) + 3;

    return (
        <PageTransition>
            <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000000', overflow: 'hidden' }}>
                {/* Global Navigation now handles Return routing */}



                {/* Cinematic DOM Overlay for Ultra-Premium Typography */}
                <AnimatePresence>
                    {active && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 50,
                                pointerEvents: 'none',
                                background: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.98) 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 'clamp(5vw, 12vw, 20vw)'
                            }}
                        >
                            <motion.div
                                key={active} // Force re-render of animation when active changes
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 50, opacity: 0 }}
                                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                                style={{
                                    width: 'clamp(280px, 85vw, 550px)',
                                    height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center',
                                    color: '#fff', pointerEvents: 'auto'
                                }}
                            >
                                <div style={{ overflowY: 'auto', paddingRight: '20px', paddingBottom: '20px', WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}>
                                    <h2 className="serif" style={{ fontSize: 'clamp(2rem, 8vw, 4rem)', fontWeight: 300, marginBottom: '1rem', letterSpacing: '-2px', textShadow: '0 10px 30px rgba(0,0,0,0.8)', lineHeight: 1.1 }}>
                                        {paintingsData[active.replace(/[^0-9]/g, '')]?.title || `Masterpiece ${active.replace(/[^0-9]/g, '')}`}
                                    </h2>
                                    <div style={{ width: '100%', height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%)', marginBottom: '2.5rem', flexShrink: 0 }} />
                                    <p className="sans" style={{ fontSize: 'clamp(0.9rem, 4vw, 1.05rem)', lineHeight: 1.9, opacity: 0.85, letterSpacing: '0.4px', whiteSpace: 'pre-line' }}>
                                        {paintingsData[active.replace(/[^0-9]/g, '')]?.description || "A visceral testament to existence."}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setActive(null)}
                                    className="sans"
                                    style={{
                                        marginTop: '1.5rem', background: 'transparent', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)',
                                        borderRadius: '50px', padding: '12px 24px', cursor: 'pointer', fontSize: 'clamp(0.6rem, 2.5vw, 0.8rem)', textTransform: 'uppercase', letterSpacing: '4px',
                                        transition: 'all 0.6s ease', backdropFilter: 'blur(10px)', alignSelf: 'flex-start', flexShrink: 0
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#000000'; e.currentTarget.style.borderColor = '#ffffff'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                                >
                                    ✕ Close Masterpiece
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: active ? 0 : 1, y: active ? 40 : 0 }}
                    transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="serif"
                    style={{
                        position: 'absolute', bottom: 'clamp(85px, 10vh, 120px)', right: 30, zIndex: 100,
                        color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(0.8rem, 2vw, 1.2rem)', fontStyle: 'italic', letterSpacing: '1px',
                        pointerEvents: 'none',
                    }}
                >
                    The Infinite Gallery • Scroll Down
                </motion.div>

                <Canvas camera={{ position: [0, 0, 20], fov: 15 }}>
                    <color attach="background" args={['#000000']} />
                    <Suspense fallback={null}>
                        <ScrollControls damping={0.2} pages={pages} distance={0.5} enabled={!active}>
                            <Lens>
                                <Scroll>
                                    <HeroPoster />
                                    <Typography />
                                    <Exhibition itemCount={TOTAL_PAINTINGS} active={active} setActive={setActive} />
                                </Scroll>
                                <Preload />
                            </Lens>
                        </ScrollControls>
                    </Suspense>
                </Canvas>
            </div>
        </PageTransition>
    )
}
