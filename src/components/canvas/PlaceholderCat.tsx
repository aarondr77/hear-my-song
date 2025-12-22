import { useRef, useMemo } from 'react';
import { Group, Vector3, Mesh, MeshStandardMaterial, Color, SphereGeometry, CylinderGeometry, ConeGeometry, CatmullRomCurve3, TubeGeometry } from 'three';
import { useFrame } from '@react-three/fiber';
import { getPlatform } from '../../config/platforms';
import type { CatState } from '../../types';

interface PlaceholderCatProps {
  catState: CatState & { currentTrackIndex: number | null };
}

// Cat scale - sized to fit on shelf platforms (records are 2x2 units)
// Cat should be clearly visible - about 0.6-0.8 units tall when sitting
const CAT_SCALE = 1.0;

// Material definitions for tuxedo cat appearance
function createBlackFurMaterial() {
  return new MeshStandardMaterial({
    color: new Color('#1A1A1A'), // Deep black fur
    roughness: 0.85,
    metalness: 0.0,
  });
}

function createWhiteFurMaterial() {
  return new MeshStandardMaterial({
    color: new Color('#F5F5F5'), // Bright white fur
    roughness: 0.9,
    metalness: 0.0,
  });
}

function createEyeMaterial() {
  return new MeshStandardMaterial({
    color: new Color('#4A9F4A'), // Bright green cat eyes
    emissive: new Color('#2D6B2D'),
    emissiveIntensity: 0.5,
    roughness: 0.1,
    metalness: 0.2,
  });
}

function createPupilMaterial() {
  return new MeshStandardMaterial({
    color: new Color('#050505'), // Black pupils
    roughness: 0.1,
    metalness: 0.0,
  });
}

function createNoseMaterial() {
  return new MeshStandardMaterial({
    color: new Color('#2A2A2A'), // Dark nose (tuxedo cats often have dark noses)
    roughness: 0.5,
    metalness: 0.0,
  });
}

function createInnerEarMaterial() {
  return new MeshStandardMaterial({
    color: new Color('#E8B4B8'), // Pink inner ear
    roughness: 0.8,
    metalness: 0.0,
  });
}

// Create a sitting tuxedo cat model facing forward (+Z direction, toward camera)
function createCatModel(): { group: Group; tail: Mesh | null } {
  const catGroup = new Group();
  let tailMesh: Mesh | null = null;
  
  // === BODY (sitting cat - oval shaped, slightly tilted back) - BLACK ===
  const bodyGeometry = new SphereGeometry(0.18, 24, 16);
  bodyGeometry.scale(1.0, 1.3, 0.85); // Taller than wide for sitting pose
  const body = new Mesh(bodyGeometry, createBlackFurMaterial());
  body.position.set(0, 0.15, 0);
  body.rotation.x = -0.15; // Slight tilt back for sitting pose
  body.castShadow = true;
  body.receiveShadow = true;
  catGroup.add(body);
  
  // === CHEST/FRONT - WHITE (tuxedo marking) ===
  const chestGeometry = new SphereGeometry(0.13, 16, 12);
  chestGeometry.scale(0.85, 1.1, 0.65);
  const chest = new Mesh(chestGeometry, createWhiteFurMaterial());
  chest.position.set(0, 0.1, 0.09);
  chest.castShadow = true;
  catGroup.add(chest);
  
  // === BELLY - WHITE (extends down from chest) ===
  const bellyGeometry = new SphereGeometry(0.1, 16, 12);
  bellyGeometry.scale(0.9, 1.0, 0.6);
  const belly = new Mesh(bellyGeometry, createWhiteFurMaterial());
  belly.position.set(0, -0.02, 0.06);
  belly.castShadow = true;
  catGroup.add(belly);
  
  // === HEAD - BLACK ===
  const headGeometry = new SphereGeometry(0.14, 24, 20);
  headGeometry.scale(1.1, 1.0, 0.95); // Slightly wider for cat face
  const head = new Mesh(headGeometry, createBlackFurMaterial());
  head.position.set(0, 0.42, 0.08);
  head.castShadow = true;
  head.receiveShadow = true;
  catGroup.add(head);
  
  // === MUZZLE (snout area) - WHITE (tuxedo marking) ===
  const muzzleGeometry = new SphereGeometry(0.065, 16, 12);
  muzzleGeometry.scale(1.3, 0.85, 1.0);
  const muzzle = new Mesh(muzzleGeometry, createWhiteFurMaterial());
  muzzle.position.set(0, 0.37, 0.17);
  muzzle.castShadow = true;
  catGroup.add(muzzle);
  
  // === CHIN - WHITE (connects to chest) ===
  const chinGeometry = new SphereGeometry(0.04, 12, 10);
  chinGeometry.scale(1.2, 1.0, 0.8);
  const chin = new Mesh(chinGeometry, createWhiteFurMaterial());
  chin.position.set(0, 0.32, 0.14);
  catGroup.add(chin);
  
  // === EARS (triangular, pointing up) - BLACK ===
  const earGeometry = new ConeGeometry(0.05, 0.1, 4);
  
  // Left ear
  const leftEar = new Mesh(earGeometry, createBlackFurMaterial());
  leftEar.position.set(-0.08, 0.54, 0.04);
  leftEar.rotation.z = -0.25;
  leftEar.rotation.x = 0.1;
  leftEar.castShadow = true;
  catGroup.add(leftEar);
  
  // Left inner ear
  const innerEarGeometry = new ConeGeometry(0.03, 0.06, 4);
  const leftInnerEar = new Mesh(innerEarGeometry, createInnerEarMaterial());
  leftInnerEar.position.set(-0.08, 0.53, 0.06);
  leftInnerEar.rotation.z = -0.25;
  leftInnerEar.rotation.x = 0.1;
  catGroup.add(leftInnerEar);
  
  // Right ear
  const rightEar = new Mesh(earGeometry, createBlackFurMaterial());
  rightEar.position.set(0.08, 0.54, 0.04);
  rightEar.rotation.z = 0.25;
  rightEar.rotation.x = 0.1;
  rightEar.castShadow = true;
  catGroup.add(rightEar);
  
  // Right inner ear
  const rightInnerEar = new Mesh(innerEarGeometry, createInnerEarMaterial());
  rightInnerEar.position.set(0.08, 0.53, 0.06);
  rightInnerEar.rotation.z = 0.25;
  rightInnerEar.rotation.x = 0.1;
  catGroup.add(rightInnerEar);
  
  // === EYES (almond-shaped with pupils) ===
  const eyeWhiteGeometry = new SphereGeometry(0.028, 16, 12);
  eyeWhiteGeometry.scale(1.3, 1.0, 0.5);
  
  // Left eye
  const leftEyeWhite = new Mesh(eyeWhiteGeometry, createEyeMaterial());
  leftEyeWhite.position.set(-0.05, 0.44, 0.16);
  leftEyeWhite.rotation.y = -0.2;
  catGroup.add(leftEyeWhite);
  
  // Left pupil (vertical slit)
  const pupilGeometry = new SphereGeometry(0.015, 8, 8);
  pupilGeometry.scale(0.5, 1.2, 0.5);
  const leftPupil = new Mesh(pupilGeometry, createPupilMaterial());
  leftPupil.position.set(-0.05, 0.44, 0.175);
  catGroup.add(leftPupil);
  
  // Right eye
  const rightEyeWhite = new Mesh(eyeWhiteGeometry, createEyeMaterial());
  rightEyeWhite.position.set(0.05, 0.44, 0.16);
  rightEyeWhite.rotation.y = 0.2;
  catGroup.add(rightEyeWhite);
  
  // Right pupil
  const rightPupil = new Mesh(pupilGeometry, createPupilMaterial());
  rightPupil.position.set(0.05, 0.44, 0.175);
  catGroup.add(rightPupil);
  
  // === NOSE (small triangle) - DARK ===
  const noseGeometry = new SphereGeometry(0.02, 8, 8);
  noseGeometry.scale(1.2, 0.8, 0.8);
  const nose = new Mesh(noseGeometry, createNoseMaterial());
  nose.position.set(0, 0.39, 0.2);
  catGroup.add(nose);
  
  // === WHISKER MARKS (small bumps on muzzle) - WHITE ===
  const whiskerBumpGeometry = new SphereGeometry(0.008, 6, 6);
  const whiskerPositions = [
    [-0.04, 0.36, 0.19],
    [-0.05, 0.35, 0.17],
    [0.04, 0.36, 0.19],
    [0.05, 0.35, 0.17],
  ];
  whiskerPositions.forEach(([x, y, z]) => {
    const bump = new Mesh(whiskerBumpGeometry, createWhiteFurMaterial());
    bump.position.set(x, y, z);
    catGroup.add(bump);
  });
  
  // === FRONT LEGS (sitting, vertical) - BLACK ===
  const frontLegGeometry = new CylinderGeometry(0.035, 0.04, 0.18, 12);
  
  const frontLeftLeg = new Mesh(frontLegGeometry, createBlackFurMaterial());
  frontLeftLeg.position.set(-0.08, -0.02, 0.1);
  frontLeftLeg.castShadow = true;
  frontLeftLeg.receiveShadow = true;
  catGroup.add(frontLeftLeg);
  
  const frontRightLeg = new Mesh(frontLegGeometry, createBlackFurMaterial());
  frontRightLeg.position.set(0.08, -0.02, 0.1);
  frontRightLeg.castShadow = true;
  frontRightLeg.receiveShadow = true;
  catGroup.add(frontRightLeg);
  
  // === FRONT PAWS - WHITE (tuxedo "socks") ===
  const pawGeometry = new SphereGeometry(0.04, 12, 8);
  pawGeometry.scale(1.0, 0.5, 1.2);
  
  const frontLeftPaw = new Mesh(pawGeometry, createWhiteFurMaterial());
  frontLeftPaw.position.set(-0.08, -0.12, 0.12);
  frontLeftPaw.castShadow = true;
  catGroup.add(frontLeftPaw);
  
  const frontRightPaw = new Mesh(pawGeometry, createWhiteFurMaterial());
  frontRightPaw.position.set(0.08, -0.12, 0.12);
  frontRightPaw.castShadow = true;
  catGroup.add(frontRightPaw);
  
  // === BACK LEGS (haunches - sitting pose) - BLACK ===
  const haunchGeometry = new SphereGeometry(0.08, 16, 12);
  haunchGeometry.scale(0.9, 1.1, 1.0);
  
  const leftHaunch = new Mesh(haunchGeometry, createBlackFurMaterial());
  leftHaunch.position.set(-0.1, 0.02, -0.05);
  leftHaunch.castShadow = true;
  leftHaunch.receiveShadow = true;
  catGroup.add(leftHaunch);
  
  const rightHaunch = new Mesh(haunchGeometry, createBlackFurMaterial());
  rightHaunch.position.set(0.1, 0.02, -0.05);
  rightHaunch.castShadow = true;
  rightHaunch.receiveShadow = true;
  catGroup.add(rightHaunch);
  
  // === BACK PAWS (tucked under) - WHITE (tuxedo "socks") ===
  const backPawGeometry = new SphereGeometry(0.035, 12, 8);
  backPawGeometry.scale(1.0, 0.5, 1.1);
  
  const backLeftPaw = new Mesh(backPawGeometry, createWhiteFurMaterial());
  backLeftPaw.position.set(-0.12, -0.1, 0.0);
  backLeftPaw.castShadow = true;
  catGroup.add(backLeftPaw);
  
  const backRightPaw = new Mesh(backPawGeometry, createWhiteFurMaterial());
  backRightPaw.position.set(0.12, -0.1, 0.0);
  backRightPaw.castShadow = true;
  catGroup.add(backRightPaw);
  
  // === TAIL (curved, coming from back) - BLACK ===
  const tailCurve = new CatmullRomCurve3([
    new Vector3(0, 0.08, -0.15),
    new Vector3(0.05, 0.12, -0.22),
    new Vector3(0.12, 0.2, -0.25),
    new Vector3(0.15, 0.32, -0.22),
    new Vector3(0.12, 0.38, -0.18),
  ]);
  const tailGeometry = new TubeGeometry(tailCurve, 20, 0.025, 8, false);
  const tail = new Mesh(tailGeometry, createBlackFurMaterial());
  tail.castShadow = true;
  tailMesh = tail;
  catGroup.add(tail);
  
  // Tail tip (slightly fluffy end) - BLACK with small white tip
  const tailTipGeometry = new SphereGeometry(0.03, 8, 8);
  const tailTip = new Mesh(tailTipGeometry, createBlackFurMaterial());
  tailTip.position.set(0.12, 0.38, -0.18);
  tailTip.castShadow = true;
  catGroup.add(tailTip);
  
  // Small white tip at very end of tail
  const tailWhiteTipGeometry = new SphereGeometry(0.015, 6, 6);
  const tailWhiteTip = new Mesh(tailWhiteTipGeometry, createWhiteFurMaterial());
  tailWhiteTip.position.set(0.11, 0.4, -0.17);
  catGroup.add(tailWhiteTip);
  
  return { group: catGroup, tail: tailMesh };
}

export function PlaceholderCat({ catState }: PlaceholderCatProps) {
  const catRef = useRef<Group>(null);
  const tailRef = useRef<Mesh | null>(null);
  const { platform, recordIndex, facing, isMoving } = catState;

  // Create the procedural cat model
  const catModel = useMemo(() => {
    const { group, tail } = createCatModel();
    tailRef.current = tail;
    
    // Apply scale
    group.scale.set(CAT_SCALE, CAT_SCALE, CAT_SCALE);
    
    return group;
  }, []);

  const platformData = getPlatform(platform);
  if (!platformData) return null;

  // Calculate cat position
  let catPosition = { ...platformData.position };
  
  if (platformData.type === 'shelf' && recordIndex !== null && recordIndex < platformData.records.length) {
    // Position cat next to the current record on the shelf
    // Records are now 2x2 and spaced 2.2 apart
    const recordCount = platformData.records.length;
    const RECORD_SPACING = 2.2;
    const totalWidth = (recordCount - 1) * RECORD_SPACING;
    const startOffset = -totalWidth / 2;
    catPosition.x += startOffset + recordIndex * RECORD_SPACING;
  }

  // Position cat on the platform (platform is at y - 1.1 from record center)
  // Adjust Y so the cat sits properly on the platform
  catPosition.y = platformData.position.y - 1.1 + 0.15;
  // Move cat forward (positive Z) so it's in front of the record, not behind
  catPosition.z = platformData.position.z + 0.6;

  // Animation and movement
  useFrame((state) => {
    if (catRef.current) {
      // Smoothly move to target position
      const targetPos = new Vector3(catPosition.x, catPosition.y, catPosition.z);
      catRef.current.position.lerp(targetPos, 0.1);
      
      // Face the correct direction (rotate 180 degrees so cat faces forward by default)
      // When facing "right", cat faces right (+X)
      // When facing "left", cat faces left (-X)
      const baseRotation = 0; // Already facing forward (+Z)
      catRef.current.rotation.y = facing === 'left' ? baseRotation + Math.PI / 2 : baseRotation - Math.PI / 2;
      
      // Animate tail (gentle sway)
      if (tailRef.current) {
        if (isMoving) {
          // More active movement when moving
          tailRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 5) * 0.4;
          tailRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 3) * 0.15;
        } else {
          // Subtle idle sway
          tailRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.15;
          tailRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
        }
      }
      
      // Subtle breathing animation on the body
      const breathScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.01;
      catModel.scale.set(CAT_SCALE * breathScale, CAT_SCALE, CAT_SCALE * breathScale);
    }
  });

  return (
    <group ref={catRef} position={[catPosition.x, catPosition.y, catPosition.z]}>
      <primitive 
        object={catModel} 
        castShadow 
        receiveShadow
      />
    </group>
  );
}

