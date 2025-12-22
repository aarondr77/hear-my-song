import { useMemo } from 'react';
import { DataTexture, RepeatWrapping, RGBAFormat } from 'three';
import * as THREE from 'three';

interface FloorProps {
  position?: [number, number, number];
  width?: number;
  depth?: number;
}

// Simple noise function for wood grain
function noise(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

// Generate wood grain texture
function createWoodTexture(width: number, height: number): DataTexture {
  const size = width * height;
  const data = new Uint8Array(size * 4); // RGBA
  const baseColor = { r: 210, g: 180, b: 140 }; // #D2B48C

  for (let i = 0; i < size; i++) {
    const x = (i % width) / width;
    const y = Math.floor(i / width) / height;
    
    // Create wood grain pattern using sine waves
    const grain = Math.sin(y * Math.PI * 20) * 0.3;
    const noiseValue = noise(x * 100, y * 5) * 0.2;
    const combined = grain + noiseValue;
    
    // Add subtle color variation
    const variation = combined * 25;
    const r = Math.max(0, Math.min(255, baseColor.r + variation));
    const g = Math.max(0, Math.min(255, baseColor.g + variation * 0.8));
    const b = Math.max(0, Math.min(255, baseColor.b + variation * 0.6));
    
    const stride = i * 4;
    data[stride] = r;
    data[stride + 1] = g;
    data[stride + 2] = b;
    data[stride + 3] = 255; // Alpha
  }

  const texture = new DataTexture(data, width, height, RGBAFormat);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  return texture;
}

export function Floor({ position = [0, -3, 2], width = 50, depth = 10 }: FloorProps) {
  const plankWidth = 0.5; // Width of each plank
  const plankCount = Math.ceil(width / plankWidth);
  const seamWidth = 0.02; // Gap between planks
  
  // Generate wood texture
  const woodTexture = useMemo(() => createWoodTexture(256, 256), []);

  // Create individual planks
  const planks = useMemo(() => {
    const plankArray = [];
    const totalWidth = plankCount * plankWidth;
    const startX = -totalWidth / 2;
    
    for (let i = 0; i < plankCount; i++) {
      const x = startX + i * plankWidth + plankWidth / 2;
      // Slight color variation per plank
      const colorVariation = (Math.random() - 0.5) * 0.1;
      const plankColor = new THREE.Color(0xD2B48C);
      plankColor.offsetHSL(colorVariation, 0, 0);
      
      plankArray.push({
        x,
        color: plankColor,
      });
    }
    return plankArray;
  }, [plankCount]);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={position}>
      {planks.map((plank, index) => (
        <mesh key={index} position={[plank.x, 0, 0]} receiveShadow>
          <boxGeometry args={[plankWidth - seamWidth, 0.05, depth]} />
          <meshStandardMaterial 
            color={plank.color}
            map={woodTexture}
            roughness={0.75}
            metalness={0.1}
          />
        </mesh>
      ))}
      
      {/* Seams between planks (dark lines) */}
      {planks.slice(0, -1).map((plank, index) => {
        const seamX = plank.x + plankWidth / 2;
        return (
          <mesh key={`seam-${index}`} position={[seamX, 0.03, 0]}>
            <boxGeometry args={[seamWidth, 0.02, depth]} />
            <meshStandardMaterial color="#8B7355" />
          </mesh>
        );
      })}
    </group>
  );
}

