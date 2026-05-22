import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Cylinder, useTexture, Html, ScrollControls, Scroll, useScroll, Text } from '@react-three/drei';
import * as THREE from 'three';

const allProjects = [
  { id: 1, title: 'CYBER_CORE', color: '#0ae2ff', desc: 'AI Management Dashboard', category: 'XR / VR / AI' },
  { id: 2, title: 'NEURAL_NET', color: '#b338ff', desc: 'Machine Learning Visualizer', category: 'XR / VR / AI' },
  { id: 3, title: 'DATA_STREAM', color: '#00ff41', desc: 'Real-time Analytics Engine', category: 'WEBSITE' },
  { id: 4, title: 'HOLO_DECK', color: '#ff3366', desc: 'VR Interior Planner', category: 'INSTALLATION' },
  { id: 5, title: 'QUANTUM_SYS', color: '#ffff00', desc: 'Quantum Computing Sim', category: 'GAME' },
  { id: 6, title: 'NEXUS_LINK', color: '#0ae2ff', desc: 'Multiplayer Hub', category: 'MULTIPLAYER' },
  { id: 7, title: 'WEB_NINJA', color: '#b338ff', desc: 'Modern Website Builder', category: 'WEBSITE' },
  { id: 8, title: 'DEFENDER_X', color: '#ff3366', desc: 'Arcade Survival Game', category: 'GAME' }
];

function FiberOptic({ length = 12, positionY = 0 }: { length?: number, positionY?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll(); // Use scroll for parallax

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
      
      // Infinite parallax scroll effect for the fiber optic inside its bounded area
      if (scroll) {
        groupRef.current.position.y = positionY + (scroll.offset * 2); 
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, positionY, 0]}>
      {/* Core glowing pillar */}
      <Cylinder args={[0.5, 0.5, length, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#0ae2ff" transparent opacity={0.2} wireframe />
      </Cylinder>
      <Cylinder args={[0.2, 0.2, length, 16]} position={[0, 0, 0]}>
         <meshBasicMaterial color="#b338ff" transparent opacity={0.5} blending={THREE.AdditiveBlending} />
      </Cylinder>
      
      {/* simulated pulsing light dots inside */}
      {Array.from({ length: 60 }).map((_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 0.5, 
          (Math.random() - 0.5) * length * 0.8, 
          (Math.random() - 0.5) * 0.5
        ]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#00ff41" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

function CarouselCard({ project, index, total, onSelect }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const angle = (index / total) * Math.PI * 2;
  const radius = 3.5;
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      // Global rotation is handled by parent, here we just keep them slightly floating
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() + index) * 0.1;
    }
  });

  return (
    <group 
      ref={groupRef}
      position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
      rotation={[0, -angle + Math.PI / 2, 0]}
    >
      <mesh>
        <planeGeometry args={[2.5, 1.5]} />
        <meshBasicMaterial color={hovered ? "#0a1526" : "#050b14"} opacity={0.8} transparent side={THREE.DoubleSide} />
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(2.5, 1.5)]} />
          <lineBasicMaterial color={project.color} />
        </lineSegments>
      </mesh>
      
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelect(project);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'default';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Invisible hit area for better interaction on text */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[2.2, 0.8]} />
          <meshBasicMaterial visible={false} />
        </mesh>

        <Text
          position={[0, 0.2, 0.02]}
          fontSize={0.2}
          color={project.title ? "#0ae2ff" : "#fff"}
          anchorX="center"
          anchorY="middle"
          maxWidth={2.2}
          textAlign="center"
          overflowWrap="break-word"
        >
          {project.title}
        </Text>
        
        {/* Line separator */}
        <mesh position={[0, -0.05, 0.02]}>
          <planeGeometry args={[2, 0.01]} />
          <meshBasicMaterial color="#ffffff" opacity={0.2} transparent />
        </mesh>

        <Text
          position={[0, -0.25, 0.02]}
          fontSize={0.12}
          color={hovered ? "#ffffff" : "#cccccc"}
          anchorX="center"
          anchorY="middle"
          maxWidth={2.2}
          textAlign="center"
          overflowWrap="break-word"
        >
          {project.description || project.desc || ''}
        </Text>
      </group>
    </group>
  );
}

function Carousel({ projects, onSelect, positionY = 0, direction = 1 }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef(0);
  const isDragging = useRef(false);
  const previousX = useRef(0);
  
  useFrame((state, delta) => {
    if (!isDragging.current) {
      targetRotation.current += delta * 0.1 * direction;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y += (targetRotation.current - groupRef.current.rotation.y) * 0.1;
    }
  });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    isDragging.current = true;
    previousX.current = e.clientX;
    e.target.setPointerCapture?.(e.pointerId);
  };

  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    isDragging.current = false;
    e.target.releasePointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: any) => {
    if (isDragging.current) {
      e.stopPropagation();
      const deltaX = e.clientX - previousX.current;
      targetRotation.current += deltaX * 0.01;
      previousX.current = e.clientX;
    }
  };

  return (
    <group 
      ref={groupRef} 
      position={[0, positionY, 0]}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerOut={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      <mesh visible={false}>
        <cylinderGeometry args={[2.9, 2.9, 2.5, 32]} />
        <meshBasicMaterial side={THREE.DoubleSide} />
      </mesh>
      {projects.map((proj: any, i: number) => (
        <CarouselCard 
          key={proj.id} 
          project={proj} 
          index={i} 
          total={projects.length} 
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}

function SceneContent({ projectChunks, onSelectProject, spacing, totalPages }: any) {
  const { viewport } = useThree();
  
  // Make the fiber optic span the entire scrollable area
  const fiberLength = Math.max(12, totalPages * viewport.height + 4);

  return (
    <>
      <fog attach="fog" args={['#02040a', 5, 15]} />
      {/* FiberOptic stays fixed relative to the scroll so it continues infinitely down */}
      <FiberOptic length={fiberLength} positionY={-(fiberLength / 2) + viewport.height / 2} />
      
      <Scroll>
        {projectChunks.map((chunk: any, index: number) => (
          <Carousel 
            key={`carousel-${index}`}
            projects={chunk} 
            onSelect={onSelectProject} 
            positionY={-(index * spacing)} 
            direction={index % 2 === 0 ? 1 : -1}
          />
        ))}
      </Scroll>
    </>
  );
}

function SceneWrapper({ projectChunks, onSelectProject }: any) {
  const { viewport } = useThree();
  
  // Jarak antar carousel
  const CAROUSEL_SPACING = 3.5; 
  
  const pages = Math.max(1, 1 + ((projectChunks.length - 1) * CAROUSEL_SPACING) / viewport.height);
  
  return (
    <ScrollControls pages={pages} damping={0.2} distance={1}>
      <SceneContent 
         projectChunks={projectChunks} 
         onSelectProject={onSelectProject} 
         spacing={CAROUSEL_SPACING} 
         totalPages={pages} 
      />
    </ScrollControls>
  );
}

export function PortfolioCanvas({ projects, onSelectProject, filterCategory }: { projects: any[], onSelectProject: (p: any) => void, filterCategory?: string }) {
  const filteredProjects = filterCategory && filterCategory !== 'ALL' 
    ? projects.filter((p: any) => p.cat === filterCategory)
    : projects;

  const projectChunks = [];
  for (let i = 0; i < filteredProjects.length; i += 5) {
    projectChunks.push(filteredProjects.slice(i, i + 5));
  }

  return (
    <div className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing hide-three-scroll">
      <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
        <React.Suspense fallback={null}>
          <SceneWrapper projectChunks={projectChunks} onSelectProject={onSelectProject} />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
