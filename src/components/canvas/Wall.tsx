import { useLoader } from '@react-three/fiber';
import { TextureLoader, RepeatWrapping } from 'three';
import { useMemo } from 'react';

interface WallProps {
  position?: [number, number, number];
  size?: [number, number];
}

export function Wall({ position = [0, 0, 0], size = [50, 30] }: WallProps) {
  // Warm beige from style guide
  const wallColor = useMemo(() => '#E8E6E1', []);

  return (
    <mesh position={position} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial color={wallColor} />
    </mesh>
  );
}

