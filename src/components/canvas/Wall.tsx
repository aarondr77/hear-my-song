import { useMemo } from 'react';
import { DataTexture, RGBAFormat, ClampToEdgeWrapping } from 'three';

interface WallProps {
  position?: [number, number, number];
  size?: [number, number];
}

// Improved noise function for realistic texture
function noise(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

// Smooth noise with interpolation for softer patterns
function smoothNoise(x: number, y: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  
  // Smoothstep interpolation
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  
  const n00 = noise(x0, y0);
  const n10 = noise(x0 + 1, y0);
  const n01 = noise(x0, y0 + 1);
  const n11 = noise(x0 + 1, y0 + 1);
  
  const nx0 = n00 * (1 - sx) + n10 * sx;
  const nx1 = n01 * (1 - sx) + n11 * sx;
  
  return nx0 * (1 - sy) + nx1 * sy;
}

// Fractal Brownian Motion for more complex texture
function fbm(x: number, y: number, octaves: number): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  
  for (let i = 0; i < octaves; i++) {
    value += amplitude * smoothNoise(x * frequency, y * frequency);
    amplitude *= 0.5;
    frequency *= 2;
  }
  
  return value;
}

// Generate realistic painted plaster wall texture with lighting gradient
function createWallTexture(width: number, height: number): DataTexture {
  const size = width * height;
  const data = new Uint8Array(size * 4); // RGBA
  
  // Lighter, more neutral base color - warm white with hint of pink
  // Moving from salmon (#E8D4CC) to warm off-white (#F0E6E2)
  const baseColor = { r: 240, g: 230, b: 226 };

  for (let i = 0; i < size; i++) {
    const x = (i % width) / width;
    const y = Math.floor(i / width) / height;
    
    // Enhanced multi-octave noise for more visible plaster texture
    const plasterBase = fbm(x * 40, y * 40, 4) * 0.15;
    
    // Add stipple/orange peel texture effect
    const stipple = noise(x * 300, y * 300) * 0.06;
    
    // Fine surface imperfections
    const imperfections = noise(x * 500, y * 500) * 0.03;
    
    // Subtle larger blotches (like paint absorption variations)
    const blotches = smoothNoise(x * 8, y * 8) * 0.04;
    
    // Combine texture layers
    const textureNoise = plasterBase + stipple + imperfections + blotches;
    
    // Subtle color temperature variation (warmer/cooler spots)
    const tempVariation = smoothNoise(x * 12, y * 12) * 0.02;
    
    // Radial lighting gradient - lighter in center-upper area
    const centerX = 0.5;
    const centerY = 0.6;
    const dx = x - centerX;
    const dy = y - centerY;
    const distFromCenter = Math.sqrt(dx * dx + dy * dy);
    
    // Stronger vignette/ambient occlusion effect - darker at edges
    const maxDist = 0.65;
    const lightingGradient = 1 - Math.pow(Math.min(distFromCenter / maxDist, 1), 1.8) * 0.18;
    
    // Additional edge darkening for corners
    const edgeDarkening = Math.min(
      x * 4,
      (1 - x) * 4,
      y * 3,
      (1 - y) * 3,
      1
    );
    const cornerShadow = 0.92 + edgeDarkening * 0.08;
    
    // Combine all effects
    const textureVariation = textureNoise * 18;
    const warmthShift = tempVariation * 6;
    
    // Apply lighting gradient and texture
    let r = baseColor.r + textureVariation + warmthShift;
    let g = baseColor.g + textureVariation * 0.95 - warmthShift * 0.3;
    let b = baseColor.b + textureVariation * 0.9 - warmthShift * 0.5;
    
    // Apply lighting gradient and corner shadows
    const combinedLighting = lightingGradient * cornerShadow;
    r *= combinedLighting;
    g *= combinedLighting;
    b *= combinedLighting;
    
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
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

export function Wall({ position = [0, 0, 0], size = [50, 30] }: WallProps) {
  // Generate wall texture at higher resolution for better quality
  const wallTexture = useMemo(() => {
    const texture = createWallTexture(1024, 1024);
    // No tiling - single texture with baked lighting gradient
    texture.repeat.set(1, 1);
    return texture;
  }, []);

  return (
    <mesh position={position} receiveShadow renderOrder={0}>
      <planeGeometry args={size} />
      <meshStandardMaterial 
        color="#ffffff"
        map={wallTexture}
        roughness={0.9}
        metalness={0.0}
        depthWrite={true}
      />
    </mesh>
  );
}
