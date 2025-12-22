import { Platform } from '../types';

// Even spacing grid system for 2D wall view
// 3 columns x 3 rows = 9 slots (1 window + 8 shelves with 15 records)
const COLUMNS = 3;
const ROWS = 3;
const WALL_WIDTH = 10; // Total wall width in 3D units
const WALL_HEIGHT = 7; // Total wall height in 3D units
const HORIZONTAL_SPACING = WALL_WIDTH / (COLUMNS + 1);
const VERTICAL_SPACING = WALL_HEIGHT / (ROWS + 1);

// Calculate evenly spaced position
function calculateEvenPosition(row: number, col: number): { x: number; y: number; z: number } {
  // Center the grid on the wall
  const startX = -(WALL_WIDTH / 2) + HORIZONTAL_SPACING;
  const startY = (WALL_HEIGHT / 2) - VERTICAL_SPACING;
  
  return {
    x: startX + col * HORIZONTAL_SPACING,
    y: startY - row * VERTICAL_SPACING,
    z: 0.1, // Slightly in front of wall
  };
}

// Platform definitions - evenly spaced 3x3 grid
// Window at top-left, then records distributed evenly across 8 shelves
export const platforms: Record<number, Platform> = {
  // Row 0 (top)
  0: {
    id: 0,
    grid: { row: 0, col: 0 },
    position: calculateEvenPosition(0, 0),
    connections: { left: null, right: 1, up: null, down: 3 },
    type: 'window',
    records: [],
  },
  1: {
    id: 1,
    grid: { row: 0, col: 1 },
    position: calculateEvenPosition(0, 1),
    connections: { left: 0, right: 2, up: null, down: 4 },
    type: 'shelf',
    records: [0, 1, 2],
  },
  2: {
    id: 2,
    grid: { row: 0, col: 2 },
    position: calculateEvenPosition(0, 2),
    connections: { left: 1, right: null, up: null, down: 5 },
    type: 'shelf',
    records: [3, 4],
  },
  // Row 1 (middle)
  3: {
    id: 3,
    grid: { row: 1, col: 0 },
    position: calculateEvenPosition(1, 0),
    connections: { left: null, right: 4, up: 0, down: 6 },
    type: 'shelf',
    records: [5, 6],
  },
  4: {
    id: 4,
    grid: { row: 1, col: 1 },
    position: calculateEvenPosition(1, 1),
    connections: { left: 3, right: 5, up: 1, down: 7 },
    type: 'shelf',
    records: [7, 8],
  },
  5: {
    id: 5,
    grid: { row: 1, col: 2 },
    position: calculateEvenPosition(1, 2),
    connections: { left: 4, right: null, up: 2, down: 8 },
    type: 'shelf',
    records: [9, 10],
  },
  // Row 2 (bottom)
  6: {
    id: 6,
    grid: { row: 2, col: 0 },
    position: calculateEvenPosition(2, 0),
    connections: { left: null, right: 7, up: 3, down: null },
    type: 'shelf',
    records: [11, 12],
  },
  7: {
    id: 7,
    grid: { row: 2, col: 1 },
    position: calculateEvenPosition(2, 1),
    connections: { left: 6, right: 8, up: 4, down: null },
    type: 'shelf',
    records: [13],
  },
  8: {
    id: 8,
    grid: { row: 2, col: 2 },
    position: calculateEvenPosition(2, 2),
    connections: { left: 7, right: null, up: 5, down: null },
    type: 'shelf',
    records: [14],
  },
};

export const CAT_START_PLATFORM = 4; // Start in middle
export const CAT_START_RECORD = 0;

// Helper function to get platform by ID
export function getPlatform(id: number): Platform | undefined {
  return platforms[id];
}

// Helper function to get all platforms
export function getAllPlatforms(): Platform[] {
  return Object.values(platforms);
}
