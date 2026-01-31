import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Wall } from './Wall';
import { Floor } from './Floor';
import { Lighting } from './Lighting';
import { Shelf } from './Shelf';
import { Window } from './Window';
import { MedalCase } from './MedalCase';
import { PlaceholderCat } from './PlaceholderCat';
import { CameraFollow } from './CameraFollow';
import { LobsterToy } from './LobsterToy';
import { BaseballHat } from './BaseballHat';
import { ChristmasLights } from './ChristmasLights';
import { FloorLamp } from './FloorLamp';
import { ArcLamp } from './ArcLamp';
import { ShelfLamp } from './ShelfLamp';
import { PothosPlant } from './PothosPlant';
import { getAllPlatforms, generatePlatforms, calculateWallWidth } from '../../config/platforms';
import type { SpotifyTrack, ToyState, HatState, LampState } from '../../types';
import type { CatState } from '../../types';
import { FLOOR_Y, FLOOR_Z } from '../../types';

/** Default wall size for the back (blank) scene; same coordinate system, no platforms. */
const BACK_WALL_SIZE: [number, number] = [16, 30];

interface RoomProps {
  activeWall?: 'main' | 'back';
  tracks: SpotifyTrack[];
  catState: CatState & { currentTrackIndex: number | null };
  toyState: ToyState;
  hatState: HatState;
  lampState: LampState;
  onRecordClick?: (trackIndex: number) => void;
  isZoomed?: boolean;
  zoomTarget?: { x: number; y: number; z: number };
  isPlaying?: boolean;
}

export function Room({ activeWall = 'main', tracks, catState, toyState, hatState, lampState, onRecordClick, isZoomed, zoomTarget, isPlaying = false }: RoomProps) {
  // Generate platforms dynamically based on track count (main scene only)
  const platforms = useMemo(() => getAllPlatforms(tracks.length), [tracks.length]);
  
  // Calculate wall width based on platform layout (main scene)
  const mainWallSize = useMemo(() => {
    const platformMap = generatePlatforms(tracks.length);
    const width = calculateWallWidth(platformMap);
    return [width, 30] as [number, number];
  }, [tracks.length]);

  const wallSize = activeWall === 'main' ? mainWallSize : BACK_WALL_SIZE;

  return (
    <Canvas shadows>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={60} />
      
      {activeWall === 'main' && (
        <CameraFollow catState={catState} isZoomed={isZoomed} zoomTarget={zoomTarget} />
      )}
      
      <Lighting />
      
      <Wall position={[0, 0, 0]} size={wallSize} />
      <Floor position={[0, -3, 2]} width={wallSize[0]} depth={10} />
      
      {activeWall === 'main' && (
        <>
          {/* Platforms, Shelves, Window, and Medal Case */}
          <Suspense fallback={null}>
            <ChristmasLights platforms={platforms.filter(p => p.type !== 'floor')} />
            
            {platforms.map((platform) => {
              if (platform.type === 'floor') return null;
              if (platform.type === 'window') {
                return (
                  <Window
                    key={platform.id}
                    position={[platform.position.x, platform.position.y, platform.position.z]}
                    hasPlatform={true}
                  />
                );
              }
              if (platform.type === 'medal') {
                return (
                  <MedalCase
                    key={platform.id}
                    position={[platform.position.x, platform.position.y, platform.position.z]}
                  />
                );
              }
              return (
                <Shelf
                  key={platform.id}
                  platform={platform}
                  tracks={tracks}
                  highlightedTrackIndex={catState.currentTrackIndex}
                  onRecordClick={onRecordClick}
                />
              );
            })}
          </Suspense>
          
          {!toyState.isCarried && (
            <LobsterToy 
              position={[toyState.position.x, FLOOR_Y + .05, FLOOR_Z]} 
              isCarried={toyState.isCarried}
            />
          )}
          
          {!hatState.isWorn && (
            <BaseballHat 
              position={[hatState.position.x, FLOOR_Y + .2, FLOOR_Z]} 
              isWorn={hatState.isWorn}
            />
          )}
          
          <PlaceholderCat 
            catState={catState} 
            carryingToy={toyState.isCarried} 
            wearingHat={hatState.isWorn}
            wearingLamp={lampState.isWorn}
            isPlaying={isPlaying} 
          />
          
          <FloorLamp position={[-4, FLOOR_Y, FLOOR_Z + 0.5]} />
          <ArcLamp position={[10, FLOOR_Y, FLOOR_Z + 0.5]} />
          
          {!lampState.isWorn && (
            <ShelfLamp position={[lampState.position.x, lampState.position.y, lampState.position.z]} lampPostColor="#1e4005" lightColor="#ba5d9d" />
          )}
          
          <PothosPlant position={[-.75, 1.1, 0.5]} vineLength={2.5} />
        </>
      )}
    </Canvas>
  );
}
