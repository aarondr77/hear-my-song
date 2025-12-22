import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface PlatformProps {
  position: [number, number, number];
  size?: [number, number, number];
}

export function Platform({ position, size = [1.5, 0.1, 1.5] }: PlatformProps) {
  const meshRef = useRef<Mesh>(null);

  return (
    <mesh ref={meshRef} position={position} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#8B7355" metalness={0.3} roughness={0.7} />
    </mesh>
  );
}

