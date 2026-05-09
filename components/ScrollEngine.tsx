// @ts-nocheck
'use client';

import * as THREE from 'three';
import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics, RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier';
import { Text, Environment } from '@react-three/drei';

const techs = [
    'Python',
    'Generative AI',
    'Machine Learning',
    'Data Science',
    'Pixhawk',
];

// Rich, modern color palette
const colors = [
    '#FF3366', // Vibrant Pink
    '#20D2A3', // Mint
    '#FF9933', // Orange
    '#8A2BE2', // Purple
    '#00BFFF', // Blue
];

const Ball = ({ text, color, position }: { text: string, color: string, position: [number, number, number] }) => {
    const rigidBody = useRef<RapierRigidBody>(null);
    const [hovered, setHovered] = useState(false);

    // Apply an initial random push to get them moving immediately
    useEffect(() => {
        if (rigidBody.current) {
            const impulse = {
                x: (Math.random() - 0.5) * 10,
                y: (Math.random() - 0.5) * 10,
                z: (Math.random() - 0.5) * 10,
            };
            rigidBody.current.applyImpulse(impulse, true);
        }
    }, []);

    // Continuous subtle forces to keep them bouncing and prevent sticking to edges
    useFrame(() => {
        if (rigidBody.current) {
            const pos = rigidBody.current.translation();
            const distance = Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2);
            // Gentle gravity well towards the center (0,0,0) if they drift too far
            if (distance > 5) {
                const force = {
                    x: -pos.x * 0.02,
                    y: -pos.y * 0.02,
                    z: -pos.z * 0.02,
                };
                rigidBody.current.applyImpulse(force, true);
            }
        }
    });

    const handlePointerEnter = (e: any) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
        // Small physical bump when the mouse hovers over it
        if (rigidBody.current) {
            const impulse = {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2,
                z: (Math.random() - 0.5) * 2,
            };
            rigidBody.current.applyImpulse(impulse, true);
        }
    };

    const handlePointerLeave = (e: any) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'auto';
    };

    const handleClick = (e: any) => {
        e.stopPropagation();
        // Stronger push and spin on click
        if (rigidBody.current) {
            const impulse = {
                x: (Math.random() - 0.5) * 15,
                y: (Math.random() - 0.5) * 15,
                z: (Math.random() - 0.5) * 15,
            };
            const torque = {
                x: (Math.random() - 0.5) * 10,
                y: (Math.random() - 0.5) * 10,
                z: (Math.random() - 0.5) * 10,
            };
            rigidBody.current.applyImpulse(impulse, true);
            rigidBody.current.applyTorqueImpulse(torque, true);
        }
    };

    return (
        <RigidBody
            ref={rigidBody}
            position={position}
            colliders="ball"
            restitution={1.1} // High bounciness
            friction={0.1}
            linearDamping={0.1} // Very low drag to keep them floating
            angularDamping={0.1}
            canSleep={false} // Never put to sleep so they always drift
        >
            <mesh
                onPointerEnter={handlePointerEnter}
                onPointerLeave={handlePointerLeave}
                onClick={handleClick}
                castShadow
                receiveShadow
            >
                <sphereGeometry args={[1.2, 64, 64]} />
                <meshStandardMaterial
                    color={color}
                    roughness={0.15} // Glossy finish
                    metalness={0.6} // Premium metallic feel
                    emissive={hovered ? color : '#000000'}
                    emissiveIntensity={hovered ? 0.3 : 0}
                />
                {/* Front text */}
                <Text
                    position={[0, 0, 1.25]} // Float slightly off the surface of the sphere
                    fontSize={0.3}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#000000"
                    font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                >
                    {text}
                </Text>
                {/* Back text */}
                <Text
                    position={[0, 0, -1.25]}
                    rotation={[0, Math.PI, 0]}
                    fontSize={0.3}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#000000"
                    font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                >
                    {text}
                </Text>
            </mesh>
        </RigidBody>
    );
};

// Invisible boundaries matching the viewport size
const Boundaries = () => {
    const { viewport } = useThree();
    const width = viewport.width;
    const height = viewport.height;
    const depth = 20;
    const thickness = 1;

    return (
        <>
            <RigidBody type="fixed" position={[0, height / 2 + thickness / 2, 0]} restitution={1}>
                <CuboidCollider args={[width / 2, thickness / 2, depth / 2]} />
            </RigidBody>
            <RigidBody type="fixed" position={[0, -height / 2 - thickness / 2, 0]} restitution={1}>
                <CuboidCollider args={[width / 2, thickness / 2, depth / 2]} />
            </RigidBody>
            <RigidBody type="fixed" position={[-width / 2 - thickness / 2, 0, 0]} restitution={1}>
                <CuboidCollider args={[thickness / 2, height / 2, depth / 2]} />
            </RigidBody>
            <RigidBody type="fixed" position={[width / 2 + thickness / 2, 0, 0]} restitution={1}>
                <CuboidCollider args={[thickness / 2, height / 2, depth / 2]} />
            </RigidBody>
            <RigidBody type="fixed" position={[0, 0, depth / 2 + thickness / 2]} restitution={1}>
                <CuboidCollider args={[width / 2, height / 2, thickness / 2]} />
            </RigidBody>
            <RigidBody type="fixed" position={[0, 0, -depth / 2 - thickness / 2]} restitution={1}>
                <CuboidCollider args={[width / 2, height / 2, thickness / 2]} />
            </RigidBody>
        </>
    );
};

export default function AntiGravityScene() {
    return (
        <div style={{ width: '100%', height: '100vh', background: '#050505', overflow: 'hidden' }}>
            <Canvas shadows camera={{ position: [0, 0, 15], fov: 45 }}>
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <Environment preset="city" />

                {/* Zero Gravity Physics Engine */}
                <Physics gravity={[0, 0, 0]}>
                    <Boundaries />

                    {techs.map((text, i) => {
                        const position: [number, number, number] = [
                            (Math.random() - 0.5) * 8,
                            (Math.random() - 0.5) * 8,
                            (Math.random() - 0.5) * 5,
                        ];
                        const color = colors[i % colors.length];
                        return <Ball key={text} text={text} color={color} position={position} />;
                    })}
                </Physics>
            </Canvas>
        </div>
    );
}
