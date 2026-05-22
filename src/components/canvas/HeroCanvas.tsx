import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

function NeuralSphere({ onClick }: { onClick: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);
  
  const count = 800;
  const { positions, originalPositions } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const orig = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
       const u = Math.random() * 2 - 1;
       const theta = Math.random() * 2 * Math.PI;
       const r = 1.7 + Math.random() * 0.5;
       const phi = Math.acos(u);
       
       const x = r * Math.sin(phi) * Math.cos(theta);
       const y = r * Math.sin(phi) * Math.sin(theta);
       const z = r * Math.cos(phi);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      orig[i * 3] = x;
      orig[i * 3 + 1] = y;
      orig[i * 3 + 2] = z;
    }
    return { positions: pos, originalPositions: orig };
  }, [count]);

  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });
  const baseRotation = useRef({ x: 0, y: 0 });
  const lastPointer = useRef(new THREE.Vector2());
  const mouseVelocity = useRef(0);

  useEffect(() => {
    document.body.style.cursor = isDragging ? 'grabbing' : (hovered ? 'grab' : 'auto');
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered, isDragging]);

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - lastMousePos.current.x;
        const deltaY = e.clientY - lastMousePos.current.y;
        baseRotation.current.y += deltaX * 0.01;
        baseRotation.current.x += deltaY * 0.01;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
    };
    const handleUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    }
    
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [isDragging]);

  useFrame((state, delta) => {
    const dist = state.pointer.distanceTo(lastPointer.current);
    mouseVelocity.current = THREE.MathUtils.lerp(mouseVelocity.current, dist / Math.max(delta, 0.001), 0.1);
    lastPointer.current.copy(state.pointer);

    if (groupRef.current) {
      if (!isDragging) {
        baseRotation.current.y += 0.002;
      }
      
      const targetY = baseRotation.current.y - state.pointer.x * 0.5;
      const targetX = baseRotation.current.x + state.pointer.y * 0.5;

      groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.1;
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.1;
    }
    
    if (sphereRef.current) {
      sphereRef.current.rotation.y -= 0.002;
      sphereRef.current.rotation.x -= 0.001;
    }
    
    if (pointsRef.current && pointsRef.current.geometry) {
      const positionsSet = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const time = state.clock.getElapsedTime();
      
      let localMouse = new THREE.Vector3(state.pointer.x, state.pointer.y, 0.5);
      localMouse.unproject(state.camera);
      const dir = localMouse.sub(state.camera.position).normalize();
      const distance = (1.5 - state.camera.position.z) / dir.z;
      const worldMouse = state.camera.position.clone().add(dir.multiplyScalar(distance));
      
      let targetLocalMouse = new THREE.Vector3();
      if (groupRef.current) {
          targetLocalMouse.copy(worldMouse);
          groupRef.current.worldToLocal(targetLocalMouse);
      }

      // Aktifkan magnet jika kursor ada di atas bola (walau mouse diam)
      const isMagnetic = hovered;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        
        const px = positionsSet[i3];
        const py = positionsSet[i3+1];
        const pz = positionsSet[i3+2];
        
        const ox = originalPositions[i3];
        const oy = originalPositions[i3+1];
        const oz = originalPositions[i3+2];
        
        const dx = targetLocalMouse.x - px;
        const dy = targetLocalMouse.y - py;
        const dz = targetLocalMouse.z - pz;
        const distToMouse = Math.max(Math.sqrt(dx*dx + dy*dy + dz*dz), 0.001);
        
        if (isMagnetic) {
            // Batas area magnet
            if (distToMouse < 3.0) {
                // Radius unik per partikel agar tidak menyatu di 1 titik
                const targetRadius = 0.2 + (i % 15) * 0.05; 
                
                const influence = Math.max(0, 1 - distToMouse / 3.0);
                
                // Tarik atau dorong partikel ke targetRadius
                const pullStrength = (distToMouse - targetRadius) * 0.02 * influence;
                
                positionsSet[i3] += (dx / distToMouse) * pullStrength;
                positionsSet[i3+1] += (dy / distToMouse) * pullStrength;
                positionsSet[i3+2] += (dz / distToMouse) * pullStrength;
                
                // Efek berputar (swirl) di sekitar mouse seperti terhisap
                const swirlSpeed = 0.03 * influence;
                positionsSet[i3] += (-dy / distToMouse) * swirlSpeed;
                positionsSet[i3+1] += (dx / distToMouse) * swirlSpeed;
                
                // Sedikit gelombang Z agar terlihat bervolume
                positionsSet[i3+2] += Math.sin(time * 2 + i) * 0.005;
            } else {
                // Berada di luar jangkauan magnet (dalam status hovered tapi jauh)
                positionsSet[i3] += (ox - px) * 0.008 + Math.sin(time*1.5 + i)*0.002;
                positionsSet[i3+1] += (oy - py) * 0.008 + Math.cos(time*1.5 + i)*0.002;
                positionsSet[i3+2] += (oz - pz) * 0.008;
            }
        } else {
            // Mouse keluar dari area bola, kembali menyebar natural
            positionsSet[i3] += (ox - px) * 0.008 + Math.sin(time*1.5 + i)*0.002;
            positionsSet[i3+1] += (oy - py) * 0.008 + Math.cos(time*1.5 + i)*0.002;
            positionsSet[i3+2] += (oz - pz) * 0.008;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <Sphere 
         ref={sphereRef} 
         args={[1.7, 32, 32]} 
         onPointerDown={(e) => {
             e.stopPropagation();
             setIsDragging(true);
             dragStartPos.current = { x: e.clientX, y: e.clientY };
             lastMousePos.current = { x: e.clientX, y: e.clientY };
         }}
         onClick={(e) => { 
             e.stopPropagation(); 
             const dist = Math.hypot(e.clientX - dragStartPos.current.x, e.clientY - dragStartPos.current.y);
             if (dist < 5) {
                 onClick(); 
             }
         }}
         onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
         onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
      >
        <meshBasicMaterial color="#0ae2ff" wireframe transparent opacity={0.15} />
      </Sphere>
      
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
            usage={THREE.DynamicDrawUsage}
          />
        </bufferGeometry>
        <pointsMaterial
          transparent
          color="#0ae2ff"
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export function HeroCanvas({ onBallClick }: { onBallClick: () => void }) {
  return (
    <div className="absolute top-0 right-0 bottom-0 w-full md:w-1/2 z-0 pointer-events-none md:pointer-events-auto opacity-80 md:opacity-100 flex items-center justify-center">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        <fog attach="fog" args={['#02040a', 4, 10]} />
        <NeuralSphere onClick={onBallClick} />
      </Canvas>
    </div>
  );
}
