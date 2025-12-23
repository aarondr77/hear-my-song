import { useMemo } from 'react';
import { DataTexture, RepeatWrapping, RGBAFormat } from 'three';
import * as THREE from 'three';

interface FloorProps {
  position?: [number, number, number];
  width?: number;
  depth?: number;
}

// Enhanced noise function for wood grain
function noise(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

// Smooth noise for more natural patterns
function smoothNoise(x: number, y: number, scale: number): number {
  const nx = x * scale;
  const ny = y * scale;
  const fx = Math.floor(nx);
  const fy = Math.floor(ny);
  const fracX = nx - fx;
  const fracY = ny - fy;
  
  const v1 = noise(fx, fy);
  const v2 = noise(fx + 1, fy);
  const v3 = noise(fx, fy + 1);
  const v4 = noise(fx + 1, fy + 1);
  
  const i1 = v1 * (1 - fracX) + v2 * fracX;
  const i2 = v3 * (1 - fracX) + v4 * fracX;
  return i1 * (1 - fracY) + i2 * fracY;
}

// Fractal Brownian Motion for organic variation (similar to Wall.tsx)
function fbm(x: number, y: number, octaves: number): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  
  for (let i = 0; i < octaves; i++) {
    value += amplitude * smoothNoise(x, y, frequency);
    amplitude *= 0.5;
    frequency *= 2;
  }
  
  return value;
}

// Generate enhanced light wood grain texture with multiple layers
// Inspired by warm cabin hardwood floor from reference image
function createWoodTexture(width: number, height: number): DataTexture {
  const size = width * height;
  const data = new Uint8Array(size * 4); // RGBA
  
  // Light wood color palette - warm honey-toned cabin hardwood
  // Base: warm golden brown, variations from light tan to medium brown
  const baseColor = { r: 195, g: 160, b: 130 }; // Warm golden brown
  const lightColor = { r: 220, g: 185, b: 150 }; // Light honey
  const darkColor = { r: 160, g: 120, b: 90 }; // Darker wood grain
  const warmAccent = { r: 210, g: 150, b: 110 }; // Warm reddish accent

  // Pre-generate wood knots with elliptical shapes for realism
  const knots: Array<{ 
    x: number; 
    y: number; 
    radiusX: number; 
    radiusY: number; 
    rotation: number;
    intensity: number;
    ringCount: number;
  }> = [];
  
  for (let i = 0; i < 6; i++) {
    knots.push({
      x: Math.random(),
      y: Math.random(),
      radiusX: 0.03 + Math.random() * 0.05, // Elliptical shape
      radiusY: 0.04 + Math.random() * 0.08,
      rotation: Math.random() * Math.PI, // Random rotation
      intensity: 0.2 + Math.random() * 0.3,
      ringCount: 3 + Math.floor(Math.random() * 4), // Concentric rings
    });
  }

  // Pre-generate wear/scratch patterns
  const scratches: Array<{
    x: number;
    y: number;
    length: number;
    angle: number;
    width: number;
  }> = [];
  
  for (let i = 0; i < 12; i++) {
    scratches.push({
      x: Math.random(),
      y: Math.random(),
      length: 0.05 + Math.random() * 0.15,
      angle: -Math.PI / 6 + Math.random() * Math.PI / 3, // Mostly along grain
      width: 0.002 + Math.random() * 0.004,
    });
  }

  for (let i = 0; i < size; i++) {
    const x = (i % width) / width;
    const y = Math.floor(i / width) / height;
    
    // Multi-scale grain patterns running along plank length (x-axis - horizontal)
    // Coarse grain - main wood bands
    const coarseGrain = Math.sin(x * Math.PI * 25 + y * 0.5) * 0.15;
    
    // Medium grain - secondary texture
    const mediumGrain = Math.sin(x * Math.PI * 60 + smoothNoise(x, y, 5) * 2) * 0.1;
    
    // Fine grain - subtle detail
    const fineGrain = Math.sin(x * Math.PI * 150 + y * 3) * 0.05;
    
    // Cross-grain variation (subtle perpendicular pattern)
    const crossGrain = Math.sin(x * Math.PI * 12) * 0.03;
    
    // Organic variation using FBM for natural look
    const organicNoise1 = fbm(x * 15, y * 15, 4) * 0.12;
    const organicNoise2 = fbm(x * 40, y * 40, 3) * 0.06;
    const organicNoise3 = smoothNoise(x, y, 80) * 0.04;
    
    // Combine all grain layers
    const grainCombined = coarseGrain + mediumGrain + fineGrain + crossGrain + 
                          organicNoise1 + organicNoise2 + organicNoise3;
    
    // Apply elliptical wood knots with concentric rings
    let knotEffect = 0;
    for (const knot of knots) {
      // Apply rotation for elliptical calculation
      const dx = x - knot.x;
      const dy = y - knot.y;
      const cos = Math.cos(knot.rotation);
      const sin = Math.sin(knot.rotation);
      const rotX = dx * cos + dy * sin;
      const rotY = -dx * sin + dy * cos;
      
      // Elliptical distance
      const dist = Math.sqrt((rotX / knot.radiusX) ** 2 + (rotY / knot.radiusY) ** 2);
      
      if (dist < 1) {
        // Inner knot (darker center)
        const innerFalloff = 1 - Math.pow(dist, 0.5);
        knotEffect += knot.intensity * innerFalloff * 0.6;
        
        // Concentric rings around knot
        const ringPattern = Math.sin(dist * Math.PI * knot.ringCount) * 0.5 + 0.5;
        knotEffect += knot.intensity * ringPattern * (1 - dist) * 0.3;
      } else if (dist < 1.5) {
        // Outer ring disturbance (grain flows around knot)
        const outerFalloff = 1 - (dist - 1) / 0.5;
        knotEffect += knot.intensity * outerFalloff * 0.15;
      }
    }
    knotEffect = Math.min(1, knotEffect);
    
    // Apply wear/scratch patterns (subtle lightening)
    let wearEffect = 0;
    for (const scratch of scratches) {
      // Line distance calculation
      const dx = x - scratch.x;
      const dy = y - scratch.y;
      const cos = Math.cos(scratch.angle);
      const sin = Math.sin(scratch.angle);
      
      // Project point onto scratch line
      const alongLine = dx * cos + dy * sin;
      const perpDist = Math.abs(-dx * sin + dy * cos);
      
      if (alongLine >= 0 && alongLine <= scratch.length && perpDist < scratch.width) {
        const edgeFalloff = 1 - perpDist / scratch.width;
        wearEffect += 0.08 * edgeFalloff;
      }
    }
    
    // Subtle worn areas (lighter patches from foot traffic)
    const wornArea = fbm(x * 8, y * 8, 3);
    if (wornArea > 0.6) {
      wearEffect += (wornArea - 0.6) * 0.15;
    }
    
    // Color temperature variation (warmer/cooler spots)
    const tempVariation = smoothNoise(x * 6, y * 6, 1) * 0.03;
    
    // Calculate final color
    // Grain variation determines blend between light and dark
    const grainBlend = (grainCombined + 0.5) * 0.5; // Normalize to 0-0.5 range
    
    // Base color interpolation
    let r = baseColor.r + (lightColor.r - baseColor.r) * grainBlend - 
            (baseColor.r - darkColor.r) * (1 - grainBlend) * 0.3;
    let g = baseColor.g + (lightColor.g - baseColor.g) * grainBlend - 
            (baseColor.g - darkColor.g) * (1 - grainBlend) * 0.3;
    let b = baseColor.b + (lightColor.b - baseColor.b) * grainBlend - 
            (baseColor.b - darkColor.b) * (1 - grainBlend) * 0.3;
    
    // Slight warm accent blending (uses warmAccent) - subtle variation like sun-warmed wood
    const warmMix = Math.min(0.15, tempVariation * 5); // tempVariation ~ [0..0.03] => warmMix ~ [0..0.15]
    r = r * (1 - warmMix) + warmAccent.r * warmMix;
    g = g * (1 - warmMix) + warmAccent.g * warmMix;
    b = b * (1 - warmMix) + warmAccent.b * warmMix;

    // Apply knot darkening
    const knotDarkening = knotEffect * 50;
    r -= knotDarkening;
    g -= knotDarkening * 1.1; // Knots are slightly less red
    b -= knotDarkening * 0.9;
    
    // Apply wear lightening
    r += wearEffect * 25;
    g += wearEffect * 20;
    b += wearEffect * 15;
    
    // Apply temperature variation (warmer = more red/yellow, cooler = more neutral)
    const warmShift = tempVariation * 15;
    r += warmShift;
    g += warmShift * 0.5;
    b -= warmShift * 0.3;
    
    // Subtle ambient occlusion at edges
    const edgeDist = Math.min(x, 1 - x, y, 1 - y);
    if (edgeDist < 0.05) {
      const edgeDarkening = (1 - edgeDist / 0.05) * 8;
      r -= edgeDarkening;
      g -= edgeDarkening;
      b -= edgeDarkening;
    }
    
    // Clamp values
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    
    const stride = i * 4;
    data[stride] = r;
    data[stride + 1] = g;
    data[stride + 2] = b;
    data[stride + 3] = 255; // Alpha
  }

  const texture = new DataTexture(data, width, height, RGBAFormat);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

// Seeded random function for consistent results
function seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

export function Floor({ position = [0, -3, 2], width = 50, depth = 10 }: FloorProps) {
  // Reference plane: wall is at world z=0
  // This Floor is a true horizontal surface (no group rotation).
  // Planks run horizontally (along world X) and are stacked along world Z.
  // We anchor the *back edge* of the floor to sit just in front of the wall to avoid covering it.
  
  const WALL_Z = 0; // Reference plane (wall)
  const Z_FLOOR_START = 0.02; // Keep a small gap in front of wall (prevents z-fighting / intersections)
  const floorZOffset = WALL_Z + Z_FLOOR_START - position[2]; // local Z offset so world back-edge sits at WALL_Z+Z_FLOOR_START

  const basePlankWidth = 0.5; // Base width of each plank (along Z, i.e. front-to-back on the floor)
  const seamWidth = 0.02; // Gap between planks (prevents z-fighting per .cursorrules)
  const plankThickness = 0.05; // Thickness of planks (within 0.01-0.02 z-variation range)
  
  // Generate enhanced wood texture at higher resolution for detail
  const woodTexture = useMemo(() => createWoodTexture(1024, 1024), []);

  // Create individual planks with variation (using seeded random for consistency)
  // Planks run horizontally (along X axis), created along Z axis
  const planks = useMemo(() => {
    const plankArray = [];
    let currentZ = 0; // start at back edge (touching wall, but we offset in world via floorZOffset)
    const random = seededRandom(12345); // Fixed seed for consistent results
    
    // Build planks with width variation until we cover the full depth
    while (currentZ < depth) {
      // Width variation: ±8% from base width for more natural look
      const widthVariation = (random() - 0.5) * 0.16;
      const plankWidth = basePlankWidth * (1 + widthVariation);
      
      // Light wood color system - warm honey/golden tones
      // HSL: hue 0.08-0.12 (warm brown), saturation 0.3-0.5, lightness 0.4-0.7
      const baseHue = 0.08 + random() * 0.04; // Warm brown to golden hue
      const baseSaturation = 0.35 + random() * 0.15; // 0.35-0.5 saturation
      const baseLightness = 0.45 + random() * 0.25; // 0.45-0.7 lightness (light wood)
      const plankColor = new THREE.Color();
      plankColor.setHSL(baseHue, baseSaturation, baseLightness);
      
      // Subtle height variation (0.01-0.02 units per .cursorrules) to prevent z-fighting
      const heightVariation = (random() - 0.5) * 0.015;
      
      // Grain direction variation per plank (subtle rotation)
      const grainRotation = (random() - 0.5) * 0.02;
      
      const z = currentZ + plankWidth / 2;
      
      plankArray.push({
        z,
        width: plankWidth,
        heightOffset: heightVariation,
        color: plankColor,
        grainRotation,
      });
      
      currentZ += plankWidth + seamWidth;
    }
    
    return plankArray;
  }, [depth]);

  return (
    <group position={position}>
      {planks.map((plank, index) => (
        <mesh 
          key={index} 
          position={[0, plank.heightOffset, floorZOffset + plank.z]} 
          rotation={[0, 0, plank.grainRotation]}
          receiveShadow
        >
          {/* Planks run horizontally: width along X, thickness along Y, plankWidth along Z */}
          <boxGeometry args={[width, plankThickness, plank.width - seamWidth]} />
          <meshStandardMaterial 
            color={plank.color}
            map={woodTexture}
            roughness={0.8} // Per .cursorrules: wood roughness 0.75-0.9, using 0.8 for light reflection
            metalness={0.0} // Wood has no metalness per .cursorrules
          />
        </mesh>
      ))}
      
      {/* Seams between planks (dark lines) - positioned slightly above to prevent z-fighting */}
      {/* Seam separation maintained at 0.02 units per .cursorrules */}
      {planks.slice(0, -1).map((plank, index) => {
        const nextPlank = planks[index + 1];
        const seamZ = plank.z + plank.width / 2;
        const seamHeight = Math.max(plank.heightOffset, nextPlank.heightOffset) + 0.015;
        return (
          <mesh key={`seam-${index}`} position={[0, seamHeight, floorZOffset + seamZ]}>
            <boxGeometry args={[width, 0.02, seamWidth]} />
            <meshStandardMaterial color="#4A3828" /> {/* Dark brown seam for light wood */}
          </mesh>
        );
      })}
    </group>
  );
}
