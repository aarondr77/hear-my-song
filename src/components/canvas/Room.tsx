import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Wall } from './Wall';
import { Lighting } from './Lighting';
import { Shelf } from './Shelf';
import { Window } from './Window';
import { PlaceholderCat } from './PlaceholderCat';
import { getAllPlatforms } from '../../config/platforms';
import type { SpotifyTrack } from '../../types';
import type { CatState } from '../../types';

interface RoomProps {
  tracks: SpotifyTrack[];
  catState: CatState & { currentTrackIndex: number | null };
  onRecordClick?: (trackIndex: number) => void;
}

export function Room({ tracks, catState, onRecordClick }: RoomProps) {
  const platforms = getAllPlatforms();

  return (
    <Canvas shadows>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={60} />
      
      <Lighting />
      
      {/* Wall - extends beyond viewport, no visible edges */}
      <Wall position={[0, 0, 0]} size={[50, 30]} />
      
      {/* Floor - only extends forward, not sideways - warm brown wood */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 2]} receiveShadow>
        <planeGeometry args={[50, 10]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.8} metalness={0.1} />
      </mesh>
      
      {/* Platforms, Shelves, and Window */}
      <Suspense fallback={null}>
        {platforms.map((platform) => {
          if (platform.type === 'window') {
            return (
              <Window
                key={platform.id}
                position={[platform.position.x, platform.position.y, platform.position.z]}
                hasPlatform={true}
              />
            );
          } else {
            return (
              <Shelf
                key={platform.id}
                platform={platform}
                tracks={tracks}
                highlightedTrackIndex={catState.currentTrackIndex}
                onRecordClick={onRecordClick}
              />
            );
          }
        })}
      </Suspense>
      
      {/* Cat */}
      <PlaceholderCat catState={catState} />
    </Canvas>
  );
}

