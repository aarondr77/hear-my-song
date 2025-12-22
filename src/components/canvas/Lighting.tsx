import { useRef } from 'react';
import { DirectionalLight, SpotLight } from 'three';

export function Lighting() {
  const directionalLightRef = useRef<DirectionalLight>(null);
  const spotLightRef = useRef<SpotLight>(null);

  return (
    <>
      {/* Lower ambient light to allow shadows to be more visible */}
      <ambientLight intensity={0.35} color="#FFF8F5" />
      
      {/* Main directional light - warm, simulating window/overhead light */}
      <directionalLight
        ref={directionalLightRef}
        position={[4, 6, 6]}
        intensity={0.9}
        color="#FFEDDE"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0001}
        shadow-radius={4}
      />
      
      {/* Secondary shadow-casting light from the other side for depth */}
      <directionalLight
        position={[-5, 4, 5]}
        intensity={0.4}
        color="#FFE8E0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0002}
      />
      
      {/* Soft overhead fill light */}
      <directionalLight
        position={[0, 8, 2]}
        intensity={0.25}
        color="#FFF5EE"
      />
      
      {/* Subtle warm accent light from below */}
      <pointLight
        position={[0, -3, 3]}
        intensity={0.15}
        color="#FFDFD3"
        distance={10}
        decay={2}
      />
    </>
  );
}
