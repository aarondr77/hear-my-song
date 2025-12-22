import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Wall } from './Wall';
import { Lighting } from './Lighting';
import { Window } from './Window';
import { LoveLetter } from './LoveLetter';

export function SignInScene() {
  return (
    <Canvas shadows>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={60} />
      
      <Lighting />
      
      {/* Wall - extends beyond viewport */}
      <Wall position={[0, 0, 0]} size={[50, 30]} />
      
      {/* Floor - only extends forward */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 2]} receiveShadow>
        <planeGeometry args={[50, 10]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.8} metalness={0.1} />
      </mesh>
      
      {/* Window (same component as room) */}
      <Window position={[-3, 2, 0.1]} hasPlatform={true} />
      
      {/* Love letter with spotlight effect */}
      <LoveLetter position={[2, 2, 0.1]} />
      
      {/* Warm golden spotlight pointing at love letter */}
      <spotLight
        position={[2, 5, 3]}
        angle={0.4}
        penumbra={0.5}
        intensity={1.5}
        color="#FFE5B4"
        castShadow
        target-position={[2, 2, 0]}
      />
    </Canvas>
  );
}

