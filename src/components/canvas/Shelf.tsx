import { useRef, useMemo } from 'react';
import { Mesh } from 'three';
import { Record } from './Record';
import { Platform } from './Platform';
import type { SpotifyTrack } from '../../types';
import type { Platform as PlatformType } from '../../types';

interface ShelfProps {
  platform: PlatformType;
  tracks: SpotifyTrack[];
  highlightedTrackIndex: number | null;
  onRecordClick?: (trackIndex: number) => void;
}

export function Shelf({ platform, tracks, highlightedTrackIndex, onRecordClick }: ShelfProps) {
  const shelfRef = useRef<Mesh>(null);

  // Calculate record positions on shelf
  const recordPositions = useMemo(() => {
    const positions: Array<[number, number, number]> = [];
    const recordCount = platform.records.length;
    const recordSpacing = 1.2;
    const startOffset = -(recordCount - 1) * recordSpacing / 2;
    
    platform.records.forEach((trackIndex, index) => {
      positions.push([
        platform.position.x + startOffset + index * recordSpacing,
        platform.position.y + 0.5,
        platform.position.z,
      ]);
    });
    
    return positions;
  }, [platform]);

  return (
    <group>
      {/* Shelf board */}
      <mesh ref={shelfRef} position={[platform.position.x, platform.position.y, platform.position.z]} castShadow receiveShadow>
        <boxGeometry args={[platform.records.length * 1.2 + 0.5, 0.2, 0.8]} />
        <meshStandardMaterial color="#8B4513" metalness={0.2} roughness={0.8} />
      </mesh>
      
      {/* Platform underneath shelf */}
      <Platform 
        position={[platform.position.x, platform.position.y - 0.3, platform.position.z]} 
        size={[platform.records.length * 1.2 + 0.8, 0.1, 1.5]} 
      />
      
      {/* Records */}
      {platform.records.map((trackIndex, index) => {
        const track = tracks[trackIndex];
        if (!track) return null;
        
        return (
          <Record
            key={track.id}
            track={track}
            position={recordPositions[index]}
            isHighlighted={highlightedTrackIndex === trackIndex}
            onClick={() => onRecordClick?.(trackIndex)}
          />
        );
      })}
    </group>
  );
}

