import { Platform, FLOOR_PLATFORM_ID, FLOOR_Y, FLOOR_Z } from '../types';

// Dynamic platform generation constants
const ITEM_SIZE = 2; // Size of each record/window
const WALL_HEIGHT = 6; // Total wall height in 3D units
const RECORDS_PER_SHELF = 1; // Number of records per shelf initially
const RECORD_SPACING = 2.2; // Space between records on a shelf
const GAP_WIDTH = 0.5; // Gap between columns
const GAP_HEIGHT = 0.5; // Gap between rows
const VERTICAL_OFFSET = 0.6; // Move everything up by this amount

// Floor platform constants
export const FLOOR_BOUNDS = {
  minX: -10,
  maxX: 15,
};

// Calculate position for a platform at a given row and column
function calculatePosition(row: number, col: number, isWindow: boolean = false): { x: number; y: number; z: number } {
  // Window is always at column 0, row 0
  if (isWindow) {
    const startX = -4; // Fixed position for window
    const startY = (WALL_HEIGHT / 2) - GAP_HEIGHT - (ITEM_SIZE / 2) + VERTICAL_OFFSET;
    return {
      x: startX,
      y: startY,
      z: 0.1, // Slightly in front of wall
    };
  }
  
  // For shelves, calculate position based on column
  // Column 0 is window, so shelves start at column 1
  const shelfCol = col - 1;
  const startX = -4 + ITEM_SIZE + GAP_WIDTH + (shelfCol * (ITEM_SIZE + GAP_WIDTH));
  const startY = (WALL_HEIGHT / 2) - GAP_HEIGHT - (ITEM_SIZE / 2) - (row * (ITEM_SIZE + GAP_HEIGHT)) + VERTICAL_OFFSET;
  
  return {
    x: startX,
    y: startY,
    z: 0.1, // Slightly in front of wall
  };
}

// Cache for generated platforms
let cachedPlatforms: Record<number, Platform> | null = null;
let cachedTrackCount: number = 0;

// Medal case position in grid (row 0, column 3 = first row, three in from left)
const MEDAL_ROW = 0;
const MEDAL_COL = 3;

// Generate platforms dynamically based on track count
export function generatePlatforms(trackCount: number): Record<number, Platform> {
  // Return cached platforms if track count hasn't changed
  if (cachedPlatforms && cachedTrackCount === trackCount) {
    return cachedPlatforms;
  }
  
  const platforms: Record<number, Platform> = {};
  let platformId = 0;
  let trackIndex = 0;
  
  // Row 0: Window at (0,0)
  const windowId = platformId++;
  platforms[windowId] = {
    id: windowId,
    grid: { row: 0, col: 0 },
    position: calculatePosition(0, 0, true),
    connections: { left: null, right: null, up: null, down: null },
    type: 'window',
    records: [],
  };
  
  // Generate shelves in 2 rows, extending to the right
  // Special items (medal) are placed at specific positions, tracks fill remaining slots
  const ROWS = 2;
  const shelvesByRow: Record<number, Platform[]> = { 0: [], 1: [] };
  let medalId: number | null = null;
  
  // Calculate how many columns we need (accounting for medal taking one slot)
  // Medal is at row 0, col 3, so it uses one slot in the top row
  const columnsNeeded = Math.ceil((trackCount + 1) / ROWS); // +1 for medal slot
  
  // Create platforms column by column
  for (let col = 1; col <= columnsNeeded; col++) {
    for (let row = 0; row < ROWS; row++) {
      // Check if this is the medal position
      if (row === MEDAL_ROW && col === MEDAL_COL) {
        // Create medal platform instead of shelf
        medalId = platformId++;
        platforms[medalId] = {
          id: medalId,
          grid: { row, col },
          position: calculatePosition(row, col),
          connections: { left: null, right: null, up: null, down: null },
          type: 'medal',
          records: [], // Medal has no records
        };
        shelvesByRow[row].push(platforms[medalId]);
        continue; // Don't assign a track to this position
      }
      
      if (trackIndex >= trackCount) break;
      
      const shelfId = platformId++;
      const shelfPosition = calculatePosition(row, col);
      
      platforms[shelfId] = {
        id: shelfId,
        grid: { row, col },
        position: shelfPosition,
        connections: { left: null, right: null, up: null, down: null },
        type: 'shelf',
        records: [trackIndex],
      };
      
      shelvesByRow[row].push(platforms[shelfId]);
      trackIndex++;
    }
  }
  
  // Add floor platform with special ID
  platforms[FLOOR_PLATFORM_ID] = {
    id: FLOOR_PLATFORM_ID,
    grid: { row: 2, col: 0 }, // Virtual row below bottom shelves
    position: { x: 0, y: FLOOR_Y, z: FLOOR_Z },
    connections: { left: null, right: null, up: null, down: null },
    type: 'floor',
    records: [],
  };
  
  // Helper to find a platform (shelf or medal) in a row at or near a column
  const findPlatformInRow = (row: number, col: number, direction: 'left' | 'right' | 'exact'): Platform | undefined => {
    const platformsInRow = shelvesByRow[row] || [];
    
    if (direction === 'exact') {
      return platformsInRow.find(p => p.grid.col === col);
    }
    
    if (direction === 'left') {
      // Find rightmost platform with col < target col
      return platformsInRow
        .filter(p => p.grid.col < col)
        .sort((a, b) => b.grid.col - a.grid.col)[0];
    } else {
      // Find leftmost platform with col > target col  
      return platformsInRow
        .filter(p => p.grid.col > col)
        .sort((a, b) => a.grid.col - b.grid.col)[0];
    }
  };

  // Set up connections for shelves and medal (all navigable platforms)
  Object.values(platforms).forEach(platform => {
    if (platform.type === 'shelf' || platform.type === 'medal') {
      const { row, col } = platform.grid;
      
      // Left connection
      if (col === 1) {
        // First column: connect to window if top row, or platform above if bottom row
        if (row === 0) {
          platform.connections.left = windowId;
        } else {
          const platformAbove = findPlatformInRow(0, col, 'exact');
          platform.connections.left = platformAbove?.id ?? null;
        }
      } else {
        // Other columns: connect to platform in same row, previous column
        const leftPlatform = findPlatformInRow(row, col, 'left');
        platform.connections.left = leftPlatform?.id ?? null;
      }
      
      // Right connection
      const rightPlatform = findPlatformInRow(row, col, 'right');
      platform.connections.right = rightPlatform?.id ?? null;
      
      // Up connection (only for bottom row)
      if (row === 1) {
        const platformAbove = findPlatformInRow(0, col, 'exact');
        platform.connections.up = platformAbove?.id ?? null;
      }
      
      // Down connection
      if (row === 0) {
        // Top row: connect down to platform below
        const platformBelow = findPlatformInRow(1, col, 'exact');
        platform.connections.down = platformBelow?.id ?? null;
      } else if (row === 1) {
        // Bottom row: connect down to floor
        platform.connections.down = FLOOR_PLATFORM_ID;
      }
    }
  });
  
  // Update window connections
  const firstTopShelf = shelvesByRow[0][0];
  const firstBottomShelf = shelvesByRow[1][0];
  if (firstTopShelf) {
    platforms[windowId].connections.right = firstTopShelf.id;
  }
  if (firstBottomShelf) {
    platforms[windowId].connections.down = firstBottomShelf.id;
  }
  
  // Floor platform connections: up connects to all bottom row shelves
  // We'll handle floor movement specially in the movement hook
  // The floor doesn't have traditional left/right connections - it uses continuous X position
  
  // Cache the result
  cachedPlatforms = platforms;
  cachedTrackCount = trackCount;
  
  return platforms;
}

// Get medal platform (useful for zoom functionality)
export function getMedalPlatform(): Platform | undefined {
  if (!cachedPlatforms) return undefined;
  return Object.values(cachedPlatforms).find(p => p.type === 'medal');
}

// Calculate wall width based on platforms
export function calculateWallWidth(platforms: Record<number, Platform>): number {
  const allPlatforms = Object.values(platforms);
  if (allPlatforms.length === 0) return 50; // Default width
  
  // Find the rightmost platform
  let maxX = -Infinity;
  allPlatforms.forEach(platform => {
    const rightEdge = platform.position.x + ITEM_SIZE / 2;
    if (rightEdge > maxX) {
      maxX = rightEdge;
    }
  });
  
  // Add padding on the right
  const padding = 5;
  const wallWidth = Math.max(50, (maxX + padding) * 2); // Ensure minimum width
  
  return wallWidth;
}

export const CAT_START_PLATFORM = 4; // Will be updated dynamically
export const CAT_START_RECORD = 0;

// Helper function to get platform by ID
// Uses cached platforms if available, otherwise generates with default track count
export function getPlatform(id: number, trackCount?: number): Platform | undefined {
  if (cachedPlatforms && (!trackCount || cachedTrackCount === trackCount)) {
    return cachedPlatforms[id];
  }
  // If no cache or track count changed, generate platforms
  if (trackCount) {
    const platforms = generatePlatforms(trackCount);
    return platforms[id];
  }
  // Fallback: use cached or generate with default
  if (!cachedPlatforms) {
    cachedPlatforms = generatePlatforms(5);
  }
  return cachedPlatforms[id];
}

// Helper function to get all platforms (requires track count)
export function getAllPlatforms(trackCount: number = 5): Platform[] {
  const platforms = generatePlatforms(trackCount);
  return Object.values(platforms);
}

// Get the floor platform
export function getFloorPlatform(): Platform | undefined {
  return cachedPlatforms?.[FLOOR_PLATFORM_ID];
}

// Find the closest bottom row shelf to a given X position (for jumping up from floor)
export function findClosestBottomShelf(x: number): Platform | null {
  if (!cachedPlatforms) return null;
  
  const bottomShelves = Object.values(cachedPlatforms).filter(
    p => p.type === 'shelf' && p.grid.row === 1
  );
  
  if (bottomShelves.length === 0) return null;
  
  // Find the shelf with the closest X position
  let closest = bottomShelves[0];
  let closestDist = Math.abs(x - closest.position.x);
  
  for (const shelf of bottomShelves) {
    const dist = Math.abs(x - shelf.position.x);
    if (dist < closestDist) {
      closest = shelf;
      closestDist = dist;
    }
  }
  
  return closest;
}

// Get all bottom row shelves (for floor-to-shelf navigation)
export function getBottomRowShelves(): Platform[] {
  if (!cachedPlatforms) return [];
  return Object.values(cachedPlatforms).filter(
    p => p.type === 'shelf' && p.grid.row === 1
  );
}
