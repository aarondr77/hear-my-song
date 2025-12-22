import { useRef, Suspense } from 'react';
import { Mesh } from 'three';
import { useTexture } from '@react-three/drei';
import { Platform } from './Platform';
import type { SpotifyTrack } from '../../types';

interface RecordProps {
  track: SpotifyTrack;
  position: [number, number, number];
  isHighlighted?: boolean;
  onClick?: () => void;
}

function AlbumArt({ url }: { url: string }) {
  const texture = useTexture(url);
  return (
    <mesh position={[0, 0.3, 0.06]}>
      <planeGeometry args={[0.5, 0.5]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

export function Record({ track, position, isHighlighted = false, onClick }: RecordProps) {
  const recordRef = useRef<Mesh>(null);
  const albumArtUrl = track.album.images[0]?.url;

  return (
    <group position={position}>
      {/* Platform underneath */}
      <Platform position={[0, -0.3, 0]} size={[1.2, 0.1, 1.2]} />
      
      {/* Record disc */}
      <mesh 
        ref={recordRef} 
        position={[0, 0.2, 0.01]}
        onClick={onClick}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.4, 0.4, 0.05, 32]} />
        <meshStandardMaterial 
          color={isHighlighted ? "#FFD700" : "#2C2C2C"}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Album art */}
      {albumArtUrl && (
        <Suspense fallback={null}>
          <AlbumArt url={albumArtUrl} />
        </Suspense>
      )}
      
      {/* Highlight ring */}
      {isHighlighted && (
        <mesh position={[0, 0.2, 0.02]}>
          <ringGeometry args={[0.45, 0.5, 32]} />
          <meshStandardMaterial 
            color="#FFD700" 
            emissive="#FFD700"
            emissiveIntensity={0.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  );
}

