'use client';

import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

interface EnhancedPaperProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  text?: string;
  state: 'folded' | 'dropping' | 'unfolding' | 'unfolded';
  delay?: number;
  isWinner?: boolean;
  onClick?: () => void;
  onHover?: () => void;
  isBenchmark?: boolean;
  modelName?: string;
}

const vertexShader = `
  uniform float crumpleAmount;
  uniform float time;
  varying vec2 vUv;
  varying float vDisplacement;
  
  // Simplex noise function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0);
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Create crumpling effect
    float noise1 = snoise(pos * 3.0 + time * 0.1) * crumpleAmount;
    float noise2 = snoise(pos * 5.0 - time * 0.15) * crumpleAmount * 0.5;
    float noise3 = snoise(pos * 10.0 + time * 0.05) * crumpleAmount * 0.25;
    
    // Apply displacement with more variation at edges
    float edgeFactor = pow(max(abs(uv.x - 0.5), abs(uv.y - 0.5)) * 2.0, 2.0);
    vDisplacement = (noise1 + noise2 + noise3) * (1.0 + edgeFactor);
    
    pos.z += vDisplacement * 0.3;
    
    // Add slight rotation based on crumpling
    pos.xy += vec2(sin(vDisplacement * 3.0), cos(vDisplacement * 2.0)) * crumpleAmount * 0.05;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform float crumpleAmount;
  uniform sampler2D paperTexture;
  uniform vec3 paperColor;
  uniform float opacity;
  varying vec2 vUv;
  varying float vDisplacement;
  
  void main() {
    // Graph paper lines
    float gridSize = 20.0;
    vec2 grid = abs(fract(vUv * gridSize - 0.5) - 0.5) / fwidth(vUv * gridSize);
    float line = min(grid.x, grid.y);
    float gridAlpha = 1.0 - min(line, 1.0);
    vec3 gridColor = vec3(0.85, 0.85, 0.9) * gridAlpha;
    
    // Paper base color with slight variations
    vec3 baseColor = paperColor + vec3(0.02) * sin(vUv.x * 50.0) * sin(vUv.y * 50.0);
    
    // Shadows based on displacement
    float shadow = 1.0 - vDisplacement * 2.0 * crumpleAmount;
    shadow = clamp(shadow, 0.7, 1.0);
    
    // Combine
    vec3 finalColor = mix(baseColor, gridColor, 0.3) * shadow;
    
    gl_FragColor = vec4(finalColor, opacity);
  }
`;

export default function EnhancedPaper({
  position,
  rotation = [0, 0, 0],
  text = '',
  state,
  delay = 0,
  isWinner = false,
  onClick,
  onHover,
  isBenchmark = false,
  modelName = ''
}: EnhancedPaperProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const textRef = useRef<THREE.Mesh>(null);
  const { clock } = useThree();
  const [hovered, setHovered] = useState(false);
  
  // Animation states
  const dropHeight = isBenchmark ? 8 : 10;
  const startY = position[1] + dropHeight;
  
  // Spring animations
  const { crumpleAmount, positionY, rotationX, rotationZ, scale } = useSpring({
    from: {
      crumpleAmount: 1,
      positionY: startY,
      rotationX: Math.random() * 0.5 - 0.25,
      rotationZ: Math.random() * 0.5 - 0.25,
      scale: 0.8
    },
    to: async (next) => {
      // Wait for delay
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Drop animation
      if (state === 'dropping' || state === 'unfolding' || state === 'unfolded') {
        await next({
          positionY: position[1],
          scale: 1,
          config: { mass: 2, tension: 80, friction: 20 }
        });
      }
      
      // Unfold animation
      if (state === 'unfolding' || state === 'unfolded') {
        await next({
          crumpleAmount: 0,
          rotationX: 0,
          rotationZ: 0,
          config: { mass: 1, tension: 50, friction: 25 }
        });
      }
      
      // Winner elevation
      if (isWinner && state === 'unfolded') {
        await next({
          positionY: position[1] + 1,
          scale: 1.1,
          config: { mass: 1, tension: 40, friction: 15 }
        });
      }
    },
    delay: delay
  });
  
  // Update shader uniforms
  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.elapsedTime;
      materialRef.current.uniforms.crumpleAmount.value = crumpleAmount.get();
    }
    
    // Hover effect
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y = Math.sin(clock.elapsedTime * 2) * 0.05;
    }
  });
  
  // Paper color based on state
  const paperColor = isWinner ? new THREE.Color('#fffef0') : new THREE.Color('#fafafa');
  
  return (
    <animated.group
      position-x={position[0]}
      position-y={positionY}
      position-z={position[2]}
      rotation-x={rotationX}
      rotation-y={rotation[1]}
      rotation-z={rotationZ}
      scale={scale}
    >
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onClick={onClick}
        onPointerOver={() => {
          setHovered(true);
          onHover?.();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <planeGeometry args={[2.5, 3.5, 32, 32]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{
            crumpleAmount: { value: 1 },
            time: { value: 0 },
            paperTexture: { value: null },
            paperColor: { value: paperColor },
            opacity: { value: 1 }
          }}
          side={THREE.DoubleSide}
          transparent
        />
      </mesh>
      
      {/* Text content */}
      {text && (
        <group
          position={[0, 0, 0.01]}
        >
          <Text
            ref={textRef}
            position={[0, 0, 0]}
            fontSize={isBenchmark ? 0.08 : 0.06}
            maxWidth={2.2}
            lineHeight={1.2}
            letterSpacing={0.02}
            color="#2a2a2a"
            anchorX="center"
            anchorY="middle"
            // font="/fonts/Caveat-Regular.ttf"
            // Use CSS font as fallback
            // @ts-expect-error - style prop for font fallback
            style={{ fontFamily: 'var(--font-caveat), cursive' }}
          >
            {text}
          </Text>
          
          {/* Model name label */}
          {modelName && (
            <Text
              position={[0, -1.5, 0]}
              fontSize={0.1}
              color="#666"
              anchorX="center"
              anchorY="middle"
              // font="/fonts/Caveat-Bold.ttf"
            >
              {modelName}
            </Text>
          )}
        </group>
      )}
      
      {/* Winner glow effect */}
      {isWinner && state === 'unfolded' && (
        <mesh position={[0, 0, -0.1]}>
          <planeGeometry args={[3, 4]} />
          <meshBasicMaterial
            color="#fbbf24"
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </animated.group>
  );
}