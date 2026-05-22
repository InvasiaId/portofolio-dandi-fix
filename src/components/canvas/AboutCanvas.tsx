import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Cylinder, Sphere } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

function Bubbles() {
  const count = 60;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 1.4;
        temp.push({
            x: Math.cos(angle) * radius,
            y: Math.random() * 5.0 + 0.8,
            z: Math.sin(angle) * radius,
            speed: Math.random() * 0.01 + 0.005,
            scale: Math.random() * 0.04 + 0.01,
            phase: Math.random() * Math.PI * 2
        });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (meshRef.current) {
        const time = state.clock.getElapsedTime();
        particles.forEach((particle, i) => {
            particle.y += particle.speed;
            if (particle.y > 5.5) {
                particle.y = 0.8;
            }
            // slight wobble
            const wobbleX = particle.x + Math.sin(time * 2 + particle.phase) * 0.02;
            const wobbleZ = particle.z + Math.cos(time * 2 + particle.phase) * 0.02;

            dummy.position.set(wobbleX, particle.y, wobbleZ);
            dummy.scale.set(particle.scale, particle.scale, particle.scale);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} position={[0, 0, 0]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#0ae2ff" transparent opacity={0.6} />
    </instancedMesh>
  );
}

const glitchVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const glitchFragmentShader = `
uniform float time;
uniform sampler2D tDiffuse;
varying vec2 vUv;

float rand(vec2 co) {
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
  vec2 uv = vUv;
  
  // Glitch params
  float glitchFactor = step(0.9, sin(time * 5.0)) * 0.1; 
  float shift = (rand(vec2(time, uv.y)) - 0.5) * glitchFactor;
  
  // RGB shift
  float r = texture2D(tDiffuse, uv + vec2(shift, 0.0)).r;
  float g = texture2D(tDiffuse, uv).g;
  float b = texture2D(tDiffuse, uv - vec2(shift, 0.0)).b;
  float a = texture2D(tDiffuse, uv).a;
  
  // Scanlines
  float scanline = sin(uv.y * 800.0 - time * 10.0) * 0.04;
  
  vec4 color = vec4(r, g, b, a);
  // Enhance glow
  color.rgb += vec3(0.0, 0.2, 0.2) * color.a;
  
  gl_FragColor = color + vec4(scanline, scanline, scanline, 0.0);
  
  if (gl_FragColor.a < 0.1) discard;
}
`;

function HumanHologram() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const texture = useLoader(THREE.TextureLoader, '/pra.png');
  texture.minFilter = THREE.LinearFilter;
  // Increase saturation/brightness by mapping to basic material instead of glitch shader, 
  // so it's clearly visible

  useFrame((state) => {
    if (meshRef.current) {
        meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.1 + 3.2;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 3.2, 0]} renderOrder={2}>
      <planeGeometry args={[2.5, 5.0]} />
      <meshBasicMaterial 
        map={texture} 
        transparent={true} 
        side={THREE.DoubleSide} 
        depthWrite={false} 
        alphaTest={0.1}
      />
      <pointLight color="#0ae2ff" intensity={4} distance={8} position={[0, 0.5, 0]} />
      <pointLight color="#00ff41" intensity={2} distance={4} position={[0, 1.5, 0]} />
      <pointLight color="#00ff41" intensity={2} distance={4} position={[0, -1, 0]} />
    </mesh>
  );
}

function Incubator() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, -2, 0]}>
      {/* Base / Bottom part */}
      <Cylinder args={[2.2, 2.4, 0.4, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#ffffff" metalness={0.7} roughness={0.1} />
      </Cylinder>
      <Cylinder args={[2.0, 2.2, 0.3, 32]} position={[0, 0.35, 0]}>
        <meshStandardMaterial color="#ffffff" metalness={0.6} roughness={0.1} />
      </Cylinder>
      <Cylinder args={[1.7, 2.0, 0.2, 32]} position={[0, 0.6, 0]}>
        <meshBasicMaterial color="#00ff41" transparent opacity={0.8} />
      </Cylinder>
      {/* Base glowing core */}
      <Cylinder args={[1.5, 1.5, 0.2, 32]} position={[0, 0.8, 0]}>
        <meshBasicMaterial color="#0ae2ff" />
      </Cylinder>

      {/* Top cap - Mirrored from Base */}
      <Cylinder args={[1.5, 1.5, 0.2, 32]} position={[0, 6.6, 0]}>
        <meshBasicMaterial color="#0ae2ff" />
      </Cylinder>
      <Cylinder args={[2.0, 1.7, 0.2, 32]} position={[0, 6.8, 0]}>
        <meshBasicMaterial color="#00ff41" transparent opacity={0.8} />
      </Cylinder>
      <Cylinder args={[2.2, 2.0, 0.3, 32]} position={[0, 7.05, 0]}>
        <meshStandardMaterial color="#ffffff" metalness={0.6} roughness={0.1} />
      </Cylinder>
      <Cylinder args={[2.4, 2.2, 0.4, 32]} position={[0, 7.4, 0]}>
        <meshStandardMaterial color="#ffffff" metalness={0.7} roughness={0.1} />
      </Cylinder>

      {/* Glass Tube */}
      <Cylinder args={[1.65, 1.65, 5.6, 32]} position={[0, 3.7, 0]}>
        <meshPhysicalMaterial 
          color="#0ae2ff" 
          transparent 
          opacity={0.1} 
          roughness={0.05}
          metalness={0.5}
          transmission={0.9} 
          thickness={0.2}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </Cylinder>

      {/* Liquid inside the tube */}
      <Cylinder args={[1.6, 1.6, 4.6, 32]} position={[0, 3.2, 0]}>
        <meshPhysicalMaterial 
          color="#0ae2ff" 
          transparent 
          opacity={0.05} 
          roughness={0.1}
          transmission={0.8}
          depthWrite={false}
        />
      </Cylinder>

      {/* Liquid surface */}
      <Cylinder args={[1.6, 1.6, 0.05, 32]} position={[0, 5.5, 0]}>
        <meshBasicMaterial color="#00ff41" transparent opacity={0.5} />
      </Cylinder>

      {/* Animated Bubbles */}
      <Bubbles />

      {/* Central Floating Subject */}
      <Suspense fallback={null}>
        <HumanHologram />
      </Suspense>
      
      {/* Beam light glowing inside */}
      <Cylinder args={[0.4, 1.2, 5.6, 32]} position={[0, 3.7, 0]}>
        <meshBasicMaterial color="#00ff41" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide}/>
      </Cylinder>
    </group>
  );
}

export function AboutCanvas() {
  return (
    <div className="absolute inset-0 z-0 h-full w-full pointer-events-none">
      <Canvas camera={{ position: [0, 1.5, 18], fov: 45 }}>
        <fog attach="fog" args={['#02040a', 5, 30]} />
        <ambientLight intensity={0.4} color="#0ae2ff" />
        <spotLight position={[5, 10, 5]} angle={0.5} penumbra={1} intensity={2} color="#00ff41" />
        <spotLight position={[-5, 5, 5]} angle={0.3} penumbra={1} intensity={1} color="#0ae2ff" />
        <group position={[0, -2.5, 0]}>
          <Incubator />
        </group>
        <EffectComposer>
          <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
