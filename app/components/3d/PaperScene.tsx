'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Float } from '@react-three/drei';
import { Suspense } from 'react';
import CrumpledPaper from './CrumpledPaper';

interface PaperSceneProps {
  papers: Array<{
    id: string;
    model: string;
    state: 'folded' | 'unfolding' | 'unfolded';
    content?: string;
    isWinner?: boolean;
    position: [number, number, number];
    delay: number;
  }>;
  onPaperClick?: (id: string) => void;
  onPaperHover?: (id: string) => void;
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        color="#ffffff"
      />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#f0f0f0" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.5}
        penumbra={1}
        intensity={0.3}
        castShadow
        color="#ffffff"
      />
    </>
  );
}

function GraphPaperBackground() {
  return (
    <mesh position={[0, -2.5, -5]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[50, 50, 50, 50]} />
      <meshBasicMaterial 
        color="#f8f8f8" 
        wireframe 
        wireframeLinewidth={0.5}
        transparent
        opacity={0.1}
      />
    </mesh>
  );
}

function Podium({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} receiveShadow castShadow>
      <boxGeometry args={[3, 0.5, 2]} />
      <meshStandardMaterial color="#e5e5e5" roughness={0.8} metalness={0.1} />
      {/* Gold trim for winner */}
      <mesh position={[0, 0.26, 0]}>
        <boxGeometry args={[3.1, 0.02, 2.1]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
      </mesh>
    </mesh>
  );
}

export default function PaperScene({ papers, onPaperClick, onPaperHover }: PaperSceneProps) {
  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden border border-gray-200" style={{ backgroundColor: 'white' }}>
      <Canvas 
        shadows
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'white' }}
      >
        <PerspectiveCamera makeDefault position={[0, 3, 8]} fov={50} />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
          minDistance={5}
          maxDistance={15}
        />

        <Suspense fallback={null}>
          {/* White background */}
          <color attach="background" args={['white']} />
          
          {/* Lighter fog for white scene */}
          <fog attach="fog" args={['#f5f5f5', 15, 40]} />
          
          <Lights />
          
          {/* Graph paper background */}
          <GraphPaperBackground />
          
          {/* Papers */}
          {papers.map((paper) => (
            <Float
              key={paper.id}
              speed={2}
              rotationIntensity={0.2}
              floatIntensity={0.3}
              floatingRange={[-0.1, 0.1]}
            >
              <CrumpledPaper
                position={paper.position}
                state={paper.state}
                delay={paper.delay}
                modelName={paper.model}
                isWinner={paper.isWinner}
                onClick={() => onPaperClick?.(paper.id)}
                onHover={() => onPaperHover?.(paper.id)}
              >
                {/* Content will be rendered on the paper */}
              </CrumpledPaper>
            </Float>
          ))}
          
          {/* Winner podium */}
          {papers.some(p => p.isWinner) && (
            <Podium position={[0, -2, 0]} />
          )}
          
          {/* Ground shadows */}
          <ContactShadows
            position={[0, -2.5, 0]}
            opacity={0.15}
            scale={20}
            blur={2}
            far={10}
            color="#000000"
          />
        </Suspense>
      </Canvas>
    </div>
  );
}