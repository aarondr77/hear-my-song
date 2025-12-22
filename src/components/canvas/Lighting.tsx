import { useRef } from 'react';
import { DirectionalLight, SpotLight } from 'three';

export function Lighting() {
  const directionalLightRef = useRef<DirectionalLight>(null);
  const spotLightRef = useRef<SpotLight>(null);

  return (
    <>
      {/* Warm ambient light for cozy atmosphere */}
      <ambientLight intensity={0.5} color="#FFF8E7" />
      
      {/* Main directional light - warm, soft */}
      <directionalLight
        ref={directionalLightRef}
        position={[3, 8, 5]}
        intensity={0.7}
        color="#FFE5B4"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0001}
      />
      
      {/* Fill light for softer shadows */}
      <directionalLight
        position={[-3, 4, 3]}
        intensity={0.3}
        color="#FFF8E7"
      />
    </>
  );
}

