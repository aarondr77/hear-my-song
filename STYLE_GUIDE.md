# Record Room - Style Guide

## Overall Aesthetic
**Vibe:** Warm & Cozy - Like a personal music production workspace, inviting and intimate
**Inspiration:** Music studios, vinyl record shops, cozy creative spaces

---

## Color Palette

### Primary Colors
- **Warm Beige/Cream:** `#F5F1E8` - Main background, light surfaces
- **Warm Brown:** `#8B6F47` - Wood textures, shelves, platforms
- **Deep Brown:** `#5C4A37` - Darker wood accents, shadows
- **Cream White:** `#FAF8F3` - Cards, modals, light surfaces

### Accent Colors
- **Spotify Green:** `#1DB954` - Play buttons, active states, highlights
- **Warm Orange:** `#E8A87C` - Cat, interactive elements, warmth
- **Soft Pink:** `#F4C2C2` - Love letter, romantic accents
- **Muted Blue:** `#A8C5D1` - Window sky, cool accents

### Text Colors
- **Primary Text:** `#2C2C2C` - Dark brown/charcoal for readability
- **Secondary Text:** `#6B6B6B` - Medium gray for less important text
- **Light Text:** `#FFFFFF` - On dark backgrounds

### Background Colors
- **Main Background:** `#F5F1E8` - Warm beige
- **3D Scene Background:** `#E8E0D5` - Slightly darker warm tone
- **Modal/Card Background:** `#FAF8F3` - Cream white
- **Dark Overlay:** `rgba(44, 44, 44, 0.7)` - For modals

---

## Typography

### Font Family
**Primary:** Modern sans-serif stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter', 'Helvetica Neue', sans-serif;
```

### Font Sizes
- **Hero/Title:** 32px - 48px (bold, 700)
- **Heading 1:** 24px - 32px (semibold, 600)
- **Heading 2:** 20px - 24px (semibold, 600)
- **Body Large:** 18px (regular, 400)
- **Body:** 16px (regular, 400)
- **Body Small:** 14px (regular, 400)
- **Caption:** 12px (regular, 400)

### Font Weights
- **Bold:** 700 - Titles, important text
- **Semibold:** 600 - Headings, emphasis
- **Regular:** 400 - Body text
- **Light:** 300 - Subtle text (optional)

---

## 3D Scene Styling

### Materials & Textures
- **Wall:** Light warm beige (`#E8E6E1`) with subtle texture, soft shadows
- **Floor:** Warm brown wood texture (`#D2B48C`) with grain visible
- **Shelves:** Rich brown wood (`#8B4513`) with realistic wood grain texture
- **Platforms:** Medium brown (`#8B7355`) with slight metallic sheen
- **Records:** Dark vinyl (`#2C2C2C`) with glossy finish, album art crisp

### Lighting
- **Ambient:** Warm, soft (`#FFF8E7` tint) - Creates cozy atmosphere
- **Directional:** Soft shadows, not harsh - From upper left
- **Spotlight (Sign-in):** Warm golden light (`#FFE5B4`) on love letter
- **Shadows:** Soft, diffused - Not sharp black

### Cat (Placeholder)
- **Color:** Warm orange (`#FFA500`) or soft terracotta (`#E8A87C`)
- **Style:** Simple geometric, friendly
- **Eyes:** Dark brown/black, expressive

### Window
- **Frame:** Dark brown wood (`#5C4A37`)
- **Glass:** Slightly tinted blue (`#87CEEB`) with 30% opacity
- **Sky:** Soft blue gradient (`#87CEEB` to `#E0F6FF`)

---

## UI Components

### Buttons
**Primary (Spotify Green):**
- Background: `#1DB954`
- Hover: `#1ED760`
- Text: White
- Padding: 12px 24px
- Border radius: 8px
- Shadow: Soft, subtle

**Secondary:**
- Background: Warm beige (`#F5F1E8`)
- Border: 1px solid `#8B6F47`
- Text: `#2C2C2C`
- Hover: Slight darken

### Modals
- Background: Cream white (`#FAF8F3`)
- Border radius: 12px
- Shadow: Large, soft (`0 8px 32px rgba(0, 0, 0, 0.15)`)
- Padding: 24px
- Border: Subtle, if any (`1px solid rgba(139, 111, 71, 0.1)`)

### Cards (Notes)
- Background: `#FAF8F3`
- Border: Left border accent (3px solid `#4a90e2` or `#1DB954`)
- Border radius: 8px
- Padding: 12px
- Shadow: Subtle (`0 2px 8px rgba(0, 0, 0, 0.08)`)

### Input Fields
- Background: White (`#FFFFFF`)
- Border: 1px solid `#DDD`
- Focus border: 2px solid `#1DB954`
- Border radius: 6px
- Padding: 12px

### Now Playing Bar
- Background: Dark warm brown (`#3A2F1F`) or dark gray (`#282828`)
- Text: White/cream
- Height: 60px
- Shadow: Top shadow (`0 -2px 8px rgba(0, 0, 0, 0.3)`)

---

## Spacing & Layout

### Spacing Scale
- **XS:** 4px
- **SM:** 8px
- **MD:** 16px
- **LG:** 24px
- **XL:** 32px
- **2XL:** 48px

### Border Radius
- **Small:** 4px - Small elements
- **Medium:** 8px - Buttons, cards
- **Large:** 12px - Modals, large containers
- **Round:** 50% - Circular elements

### Shadows
- **Subtle:** `0 2px 4px rgba(0, 0, 0, 0.08)`
- **Medium:** `0 4px 12px rgba(0, 0, 0, 0.12)`
- **Large:** `0 8px 32px rgba(0, 0, 0, 0.15)`

---

## Interactive Elements

### Hover States
- Slight scale transform (1.02x - 1.05x)
- Color darken/lighten (10-15%)
- Smooth transitions (0.2s ease)

### Active States
- Slight scale down (0.98x)
- Color shift
- Immediate feedback

### Focus States
- Outline: 2px solid `#1DB954`
- Smooth transition

### Loading States
- Subtle pulse animation
- Warm colors maintained
- Smooth transitions

---

## Specific Components

### Sign-In Scene
- **Love Letter:** Cream paper (`#FFF8DC`) with soft shadow
- **Heart:** Soft pink (`#FF69B4`) with gentle glow
- **Spotlight:** Warm golden (`#FFE5B4`)
- **Button:** Spotify green, prominent

### Record Modal
- **Vinyl:** Dark (`#2C2C2C`) with realistic shine
- **Spinning Animation:** Smooth, 3s rotation
- **Album Art:** Crisp, well-lit
- **Background:** Cream white, cozy

### Notes
- **Author:** Warm accent color (user-specific)
- **Timestamp:** Muted gray
- **Content:** Readable, comfortable line height (1.6)
- **Delete Button:** Subtle, appears on hover

### Cat Interaction Prompt
- **Background:** Dark overlay (`rgba(0, 0, 0, 0.8)`)
- **Text:** White, clear
- **Key Badge:** Slightly lighter background
- **Animation:** Gentle fade in/out

---

## Responsive Considerations
- Desktop-first (as per spec)
- Maintain warm aesthetic at all sizes
- Touch targets: Minimum 44px
- Readable text: Minimum 14px

---

## Animation Principles
- **Smooth:** Ease-in-out transitions
- **Subtle:** Not distracting
- **Purposeful:** Every animation has meaning
- **Duration:** 200-300ms for interactions, 3s for continuous (vinyl)

---

## Accessibility
- **Contrast:** WCAG AA compliant (4.5:1 for text)
- **Focus Indicators:** Clear and visible
- **Color:** Not the only indicator (use icons, text)
- **Keyboard Navigation:** Full support

---

## Implementation Notes
- Use CSS custom properties (variables) for colors
- Maintain consistent spacing scale
- Test in warm lighting conditions
- Ensure textures load gracefully (fallbacks)

