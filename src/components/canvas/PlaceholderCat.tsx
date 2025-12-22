import { useRef } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import { getPlatform } from '../../config/platforms';
import type { CatState } from '../../types';

interface PlaceholderCatProps {
  catState: CatState & { currentTrackIndex: number | null };
}

export function PlaceholderCat({ catState }: PlaceholderCatProps) {
  const catRef = useRef<Mesh>(null);
  const { platform, recordIndex, facing } = catState;

  const platformData = getPlatform(platform);
  if (!platformData) return null;

  // Calculate cat position
  let catPosition = { ...platformData.position };
  
  if (platformData.type === 'shelf' && recordIndex !== null && recordIndex < platformData.records.length) {
    // Position cat next to the current record on the shelf
    const recordCount = platformData.records.length;
    const recordSpacing = 1.2;
    const startOffset = -(recordCount - 1) * recordSpacing / 2;
    catPosition.x += startOffset + recordIndex * recordSpacing;
  }

  // Add slight Y offset to sit on platform
  catPosition.y += 0.3;

  useFrame(() => {
    if (catRef.current) {
      // Smoothly move to target position
      catRef.current.position.lerp(
        { x: catPosition.x, y: catPosition.y, z: catPosition.z },
        0.1
      );
      
      // Face the correct direction
      catRef.current.rotation.y = facing === 'left' ? Math.PI : 0;
    }
  });

  return (
    <mesh ref={catRef} position={[catPosition.x, catPosition.y, catPosition.z]} castShadow>
      {/* Simple box cat placeholder */}
      <boxGeometry args={[0.4, 0.4, 0.4]} />
      <meshStandardMaterial color="#FFA500" />
      
      {/* Eyes */}
      <mesh position={[0.1, 0.1, 0.21]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <mesh position={[-0.1, 0.1, 0.21]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#000" />
      </mesh>
    </mesh>
  );
}

