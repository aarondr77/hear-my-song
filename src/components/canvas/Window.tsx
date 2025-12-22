import { useRef, useMemo } from 'react';
import { Group, DataTexture, RGBAFormat, ClampToEdgeWrapping } from 'three';
import { useFrame } from '@react-three/fiber';
import { Platform } from './Platform';

interface WindowProps {
  position: [number, number, number];
  hasPlatform?: boolean;
}

// Generate a sky texture with gradient - vibrant blue
function createSkyTexture(width: number, height: number): DataTexture {
  const size = width * height;
  const data = new Uint8Array(size * 4);
  
  // Sky gradient colors - vivid blue at top, light blue toward horizon
  const topColor = { r: 100, g: 170, b: 255 };    // Vivid sky blue
  const bottomColor = { r: 180, g: 220, b: 255 }; // Light blue near horizon
  
  for (let i = 0; i < size; i++) {
    const y = Math.floor(i / width) / height;
    
    // Gradient from top to bottom
    const t = Math.pow(y, 0.5); // Ease the gradient
    
    const r = topColor.r + (bottomColor.r - topColor.r) * t;
    const g = topColor.g + (bottomColor.g - topColor.g) * t;
    const b = topColor.b + (bottomColor.b - topColor.b) * t;
    
    const stride = i * 4;
    data[stride] = r;
    data[stride + 1] = g;
    data[stride + 2] = b;
    data[stride + 3] = 255;
  }
  
  const texture = new DataTexture(data, width, height, RGBAFormat);
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

// Cloud component that floats by - constrained within bounds
function Cloud({ initialPosition, speed, scale, bounds }: { 
  initialPosition: [number, number, number]; 
  speed: number;
  scale: number;
  bounds: { minX: number; maxX: number };
}) {
  const cloudRef = useRef<Group>(null);
  const startX = initialPosition[0];
  const range = bounds.maxX - bounds.minX;
  
  useFrame((state) => {
    if (cloudRef.current) {
      // Move cloud slowly to the right, wrap around within bounds
      const time = state.clock.elapsedTime * speed;
      // Wrap within the bounds
      const normalizedX = ((startX - bounds.minX + time) % range);
      const x = bounds.minX + normalizedX;
      cloudRef.current.position.x = x;
    }
  });
  
  return (
    <group ref={cloudRef} position={initialPosition}>
      {/* Fluffy cloud made of flattened spheres (scaled z to 0.1 so they don't extend forward) */}
      <mesh position={[0, 0, 0]} scale={[scale, scale, scale * 0.1]} renderOrder={1}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#ffffff" depthWrite={true} />
      </mesh>
      <mesh position={[0.12, 0.03, 0]} scale={[scale * 0.9, scale * 0.9, scale * 0.1]} renderOrder={1}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#ffffff" depthWrite={true} />
      </mesh>
      <mesh position={[-0.1, 0.02, 0]} scale={[scale * 0.85, scale * 0.85, scale * 0.1]} renderOrder={1}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshBasicMaterial color="#ffffff" depthWrite={true} />
      </mesh>
      <mesh position={[0.06, -0.04, 0]} scale={[scale * 0.75, scale * 0.75, scale * 0.1]} renderOrder={1}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#ffffff" depthWrite={true} />
      </mesh>
      <mesh position={[-0.06, -0.03, 0]} scale={[scale * 0.7, scale * 0.7, scale * 0.1]} renderOrder={1}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial color="#ffffff" depthWrite={true} />
      </mesh>
      <mesh position={[0.18, 0, 0]} scale={[scale * 0.65, scale * 0.65, scale * 0.1]} renderOrder={1}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ffffff" depthWrite={true} />
      </mesh>
    </group>
  );
}

export function Window({ position, hasPlatform = true }: WindowProps) {
  const WINDOW_SIZE = 2;
  const OPENING_SIZE = 1.6; // The visible opening size
  const FRAME_THICKNESS = (WINDOW_SIZE - OPENING_SIZE) / 2; // 0.2
  const FRAME_DEPTH = 0.15;
  const PANE_DIVIDER_WIDTH = 0.05;
  
  // Create sky texture
  const skyTexture = useMemo(() => createSkyTexture(256, 256), []);
  
  // Cloud bounds - keep clouds within the window opening
  const cloudBounds = { minX: -OPENING_SIZE / 2 + 0.15, maxX: OPENING_SIZE / 2 - 0.15 };

  // Z positions - window is at z=0.1, wall is at z=0
  // To be visible, sky must have absolute z > 0
  // Frame front at wall (z=0 absolute) = -0.1 relative to window
  // Frame back recessed = -0.1 - 0.15 = -0.25 relative
  // But sky at -0.25 relative = -0.15 absolute (behind wall!)
  // Solution: Position sky so it's visible (abs z > 0.05 for safety)
  const WALL_Z_RELATIVE = -0.1; // Wall is 0.1 units back from window position
  const Z_FRAME_FRONT = WALL_Z_RELATIVE;           // Frame front flush with wall
  const Z_FRAME_BACK = WALL_Z_RELATIVE - FRAME_DEPTH; // -0.25 relative
  const Z_SKY = -0.08;                              // Sky visible (absolute z = 0.02)
  const Z_CLOUDS = -0.06;                           // Clouds just in front of sky
  const Z_MULLIONS = 0.01;                          // Pane dividers in front
  const Z_GLASS = 0.02;                             // Glass surface - frontmost
  const FRAME_CENTER_Z = (Z_FRAME_FRONT + Z_FRAME_BACK) / 2; // Center of frame depth

  return (
    <group position={position}>
      {/* ===== RECESSED CONTENT (inside the wall) ===== */}
      
      {/* Sky background - furthest back, uses BasicMaterial so lighting doesn't affect it */}
      <mesh position={[0, 0, Z_SKY]}>
        <planeGeometry args={[OPENING_SIZE, OPENING_SIZE]} />
        <meshBasicMaterial map={skyTexture} />
      </mesh>
      
      {/* Animated clouds - behind mullions */}
      <group position={[0, 0, Z_CLOUDS]} renderOrder={1}>
        <Cloud 
          initialPosition={[-0.2, 0.3, 0]} 
          speed={0.06} 
          scale={1.2} 
          bounds={cloudBounds}
        />
        <Cloud 
          initialPosition={[0.4, 0.0, 0]} 
          speed={0.045} 
          scale={1.0} 
          bounds={cloudBounds}
        />
        <Cloud 
          initialPosition={[-0.5, -0.25, 0]} 
          speed={0.055} 
          scale={0.9} 
          bounds={cloudBounds}
        />
      </group>
      
      {/* Glass panes - subtle tint */}
      <mesh position={[0, 0, Z_GLASS]}>
        <planeGeometry args={[OPENING_SIZE, OPENING_SIZE]} />
        <meshStandardMaterial 
          color="#E8F4FC" 
          transparent 
          opacity={0.1}
          metalness={0.2}
          roughness={0.05}
        />
      </mesh>
      
      {/* ===== WINDOW FRAME (hollow - 4 bars around edges) ===== */}
      
      {/* Top frame bar */}
      <mesh position={[0, (WINDOW_SIZE - FRAME_THICKNESS) / 2, FRAME_CENTER_Z]} castShadow receiveShadow>
        <boxGeometry args={[WINDOW_SIZE, FRAME_THICKNESS, FRAME_DEPTH]} />
        <meshStandardMaterial color="#5C4A37" metalness={0.1} roughness={0.85} />
      </mesh>
      
      {/* Bottom frame bar */}
      <mesh position={[0, -(WINDOW_SIZE - FRAME_THICKNESS) / 2, FRAME_CENTER_Z]} castShadow receiveShadow>
        <boxGeometry args={[WINDOW_SIZE, FRAME_THICKNESS, FRAME_DEPTH]} />
        <meshStandardMaterial color="#5C4A37" metalness={0.1} roughness={0.85} />
      </mesh>
      
      {/* Left frame bar */}
      <mesh position={[-(WINDOW_SIZE - FRAME_THICKNESS) / 2, 0, FRAME_CENTER_Z]} castShadow receiveShadow>
        <boxGeometry args={[FRAME_THICKNESS, WINDOW_SIZE - FRAME_THICKNESS * 2, FRAME_DEPTH]} />
        <meshStandardMaterial color="#5C4A37" metalness={0.1} roughness={0.85} />
      </mesh>
      
      {/* Right frame bar */}
      <mesh position={[(WINDOW_SIZE - FRAME_THICKNESS) / 2, 0, FRAME_CENTER_Z]} castShadow receiveShadow>
        <boxGeometry args={[FRAME_THICKNESS, WINDOW_SIZE - FRAME_THICKNESS * 2, FRAME_DEPTH]} />
        <meshStandardMaterial color="#5C4A37" metalness={0.1} roughness={0.85} />
      </mesh>
      
      {/* ===== MULLIONS (pane dividers - cross in middle) ===== */}
      
      {/* Vertical mullion - divides left and right panes */}
      <mesh position={[0, 0, Z_MULLIONS]} castShadow receiveShadow renderOrder={10}>
        <boxGeometry args={[PANE_DIVIDER_WIDTH, OPENING_SIZE, 0.1]} />
        <meshStandardMaterial color="#5C4A37" metalness={0.1} roughness={0.85} depthWrite={true} />
      </mesh>
      
      {/* Horizontal mullion - divides top and bottom panes */}
      <mesh position={[0, 0, Z_MULLIONS]} castShadow receiveShadow renderOrder={10}>
        <boxGeometry args={[OPENING_SIZE, PANE_DIVIDER_WIDTH, 0.1]} />
        <meshStandardMaterial color="#5C4A37" metalness={0.1} roughness={0.85} depthWrite={true} />
      </mesh>
      
      {/* ===== INNER REVEAL (sides of the recess) ===== */}
      
      {/* Top reveal */}
      <mesh position={[0, OPENING_SIZE / 2 + FRAME_THICKNESS / 2 - 0.1, FRAME_CENTER_Z]} receiveShadow>
        <boxGeometry args={[OPENING_SIZE, 0.02, FRAME_DEPTH]} />
        <meshStandardMaterial color="#4A3B2E" metalness={0.1} roughness={0.9} />
      </mesh>
      
      {/* Bottom reveal (window sill) */}
      <mesh position={[0, -OPENING_SIZE / 2 - FRAME_THICKNESS / 2 + 0.1, FRAME_CENTER_Z]} receiveShadow>
        <boxGeometry args={[OPENING_SIZE + 0.1, 0.04, FRAME_DEPTH + 0.05]} />
        <meshStandardMaterial color="#4A3B2E" metalness={0.1} roughness={0.9} />
      </mesh>

      {/* Platform underneath */}
      {hasPlatform && (
        <Platform position={[0, -1.1, 0]} size={[WINDOW_SIZE, 0.1, 1.5]} />
      )}
    </group>
  );
}
