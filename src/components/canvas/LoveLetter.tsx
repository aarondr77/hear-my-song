import { useRef } from 'react';
import { Mesh } from 'three';

interface LoveLetterProps {
  position?: [number, number, number];
}

export function LoveLetter({ position = [0, 2, 0] }: LoveLetterProps) {
  const letterRef = useRef<Mesh>(null);

  return (
    <group position={position}>
      {/* Letter paper */}
      <mesh ref={letterRef} castShadow receiveShadow>
        <boxGeometry args={[1.5, 2, 0.05]} />
        <meshStandardMaterial color="#FFF8DC" />
      </mesh>
      
      {/* Heart symbol (simple representation) - soft pink from style guide */}
      <mesh position={[0, 0.3, 0.06]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshStandardMaterial color="#F4C2C2" emissive="#F4C2C2" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

