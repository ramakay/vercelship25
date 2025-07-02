'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { animated, useSpring } from '@react-spring/three';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface CrumpledPaperProps {
  position: [number, number, number];
  state: 'folded' | 'unfolding' | 'unfolded';
  children?: React.ReactNode;
  delay?: number;
  modelName?: string;
  isWinner?: boolean;
  onHover?: () => void;
  onClick?: () => void;
}

// Vertex shader for paper crumpling effect
const vertexShader = `
  uniform float crumpleAmount;
  uniform float time;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  // Simplex noise function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i = floor(v + dot(v, C.yyy));
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
    vec3 ns = n_ * D.wyz - D.xzx;
    
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
    
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    
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
    vNormal = normal;
    vPosition = position;
    
    vec3 pos = position;
    
    // Apply crumpling deformation
    float noise1 = snoise(pos * 3.0 + time * 0.1) * crumpleAmount;
    float noise2 = snoise(pos * 5.0 - time * 0.15) * crumpleAmount * 0.5;
    float noise3 = snoise(pos * 8.0 + time * 0.2) * crumpleAmount * 0.25;
    
    // Deform position based on noise
    pos.z += (noise1 + noise2 + noise3) * 0.3;
    pos.x += noise1 * 0.1;
    pos.y += noise2 * 0.1;
    
    // Add edge curling effect
    float edgeDist = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
    float edgeCurl = (1.0 - smoothstep(0.0, 0.2, edgeDist)) * crumpleAmount;
    pos.z += edgeCurl * 0.1;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment shader for paper appearance
const fragmentShader = `
  uniform float crumpleAmount;
  uniform float opacity;
  uniform vec3 paperColor;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    // Paper base color with slight texture
    vec3 color = paperColor;
    
    // Add subtle noise texture
    float noise = fract(sin(dot(vUv.xy, vec2(12.9898, 78.233))) * 43758.5453);
    color += noise * 0.02;
    
    // Shadow in creases
    float shadow = 1.0 - crumpleAmount * 0.3;
    color *= shadow;
    
    // Edge darkening
    float edgeDist = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
    float edgeShadow = smoothstep(0.0, 0.1, edgeDist);
    color *= 0.9 + edgeShadow * 0.1;
    
    gl_FragColor = vec4(color, opacity);
  }
`;

export default function CrumpledPaper({
  position,
  state,
  delay = 0,
  modelName,
  isWinner = false,
  onHover,
  onClick,
  children
}: CrumpledPaperProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Animation springs
  const { crumpleAmount, opacity, positionY, rotation, scale } = useSpring({
    crumpleAmount: state === 'folded' ? 1 : 0,
    opacity: state === 'folded' ? 0.8 : 1,
    positionY: state === 'folded' ? position[1] + 2 : position[1],
    rotation: state === 'folded' ? [0.5, 0.3, 0.2] : [0, 0, 0],
    scale: isWinner ? 1.2 : 1,
    config: { mass: 1, tension: 80, friction: 30 },
    delay
  });

  // Create shader material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        crumpleAmount: { value: 1 },
        time: { value: 0 },
        opacity: { value: 0.8 },
        paperColor: { value: new THREE.Color(isWinner ? '#e6f4ea' : '#f8f9fa') }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide
    });
  }, [isWinner]);

  // Animate shader uniforms
  useFrame((threeState) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = threeState.clock.elapsedTime;
      materialRef.current.uniforms.crumpleAmount.value = crumpleAmount.get();
      materialRef.current.uniforms.opacity.value = opacity.get();
    }

    // Subtle floating animation
    if (meshRef.current && state !== 'folded') {
      meshRef.current.position.y = position[1] + Math.sin(threeState.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <animated.group
      position-x={position[0]}
      position-y={positionY}
      position-z={position[2]}
      scale={scale}
    >
      <animated.mesh
        ref={meshRef}
        rotation-x={rotation.to((r) => Array.isArray(r) ? r[0] : 0)}
        rotation-y={rotation.to((r) => Array.isArray(r) ? r[1] : 0)}
        rotation-z={rotation.to((r) => Array.isArray(r) ? r[2] : 0)}
        onPointerOver={onHover}
        onClick={onClick}
        castShadow
        receiveShadow
      >
        <planeGeometry args={[2, 2.8, 32, 32]} />
        <primitive object={material} ref={materialRef} />
      </animated.mesh>

      {/* Model name label */}
      {modelName && (
        <Text
          position={[0, -1.6, 0.01]}
          fontSize={0.15}
          color={isWinner ? '#16a34a' : '#64748b'}
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-medium.ttf"
        >
          {modelName}
        </Text>
      )}

      {/* Winner badge */}
      {isWinner && (
        <mesh position={[0.8, 1.2, 0.02]}>
          <circleGeometry args={[0.15, 32]} />
          <meshBasicMaterial color="#16a34a" />
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.08}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            ★
          </Text>
        </mesh>
      )}

      {children}
    </animated.group>
  );
}