# SureBank Mobile App - Branding & Asset Guide

## Brand Identity

### Company Name
**SureBank** - Your Trusted Financial Partner

### Brand Colors
- **Primary (Navy Blue)**: `#1a2c4f` - Trust, Security, Professionalism
- **Accent (Gold)**: `#d4af37` - Premium, Excellence, Value
- **Success (Green)**: `#22c55e` - Growth, Positive Actions
- **Background (Dark Navy)**: `#0f1721` - Modern, Sophisticated

### Logo Design Concept

#### Icon Design
A stylized shield combined with a dollar/naira symbol representing:
- **Shield**: Security and trust
- **Currency Symbol**: Financial services
- **Modern Geometry**: Innovation and digital banking

#### Typography
- **Primary Font**: SF Pro Display (iOS), Roboto (Android)
- **Logo Wordmark**: Bold, clean, professional
- **Tagline**: Light, readable

---

## Asset Requirements

### 1. App Icon (`icon.png`)
- **Size**: 1024x1024px
- **Format**: PNG with transparency
- **Design**:
  - Navy blue (#1a2c4f) shield background
  - Gold (#d4af37) currency symbol or "S" monogram
  - Rounded corners will be applied by the system
  - No text (icon only)

### 2. Android Adaptive Icon
#### Foreground (`adaptive-icon.png`)
- **Size**: 1024x1024px
- **Safe Area**: Keep important elements in the center 66% (circle)
- **Design**: Same as app icon but with padding for safe area

#### Background
- **Color**: Solid navy (#1a2c4f)
- Or gradient from dark navy (#0f1721) to primary navy (#1a2c4f)

### 3. Splash Screen (`splash-icon.png`)
- **Size**: 1024x1024px minimum
- **Format**: PNG
- **Design**:
  - Navy blue background (#0f1721)
  - SureBank logo centered
  - Gold accent elements
  - Tagline: "Your Trusted Financial Partner"

### 4. Favicon (`favicon.png`)
- **Size**: 48x48px (or 32x32px)
- **Format**: PNG
- **Design**: Simplified version of app icon

---

## Design Instructions for Graphic Designer

### App Icon Design Elements:
```
1. Shield Shape:
   - Rounded shield silhouette
   - Navy blue (#1a2c4f) base
   - Subtle gradient for depth

2. Symbol Overlay:
   - Stylized "S" or naira/dollar symbol
   - Gold color (#d4af37)
   - Centered, takes up 50-60% of shield area

3. Visual Style:
   - Flat design with subtle depth
   - Clean, modern, professional
   - Highly recognizable at small sizes
```

### Splash Screen Design Elements:
```
1. Background:
   - Deep navy gradient (#0f1721 to #1a2c4f)
   - Subtle geometric patterns (optional)

2. Logo:
   - Full color SureBank logo
   - Centered vertically and horizontally
   - Maximum 40% of screen width

3. Tagline:
   - "Your Trusted Financial Partner"
   - Gold (#d4af37) or light gray text
   - Below logo, smaller size
   - Clean sans-serif font

4. Loading Indicator:
   - Optional: subtle spinner or progress bar
   - Gold accent color
```

---

## SVG Template for Logo

Save this as `logo.svg` and use design software to refine:

```svg
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Background Circle -->
  <circle cx="512" cy="512" r="512" fill="#1a2c4f"/>

  <!-- Shield Shape -->
  <path d="M512 256 L768 384 V640 Q768 768 512 896 Q256 768 256 640 V384 Z"
        fill="#1a2c4f"
        stroke="#d4af37"
        stroke-width="16"/>

  <!-- Currency Symbol (simplified $ or ₦) -->
  <text x="512" y="620"
        font-family="Arial, sans-serif"
        font-size="320"
        font-weight="bold"
        fill="#d4af37"
        text-anchor="middle">
    $
  </text>
</svg>
```

---

## Asset Generation Steps

### Using Design Software (Figma/Adobe Illustrator):
1. Create artboard: 1024x1024px
2. Apply design using brand colors
3. Export as PNG at 1x, 2x, 3x resolutions
4. Optimize with ImageOptim or TinyPNG

### Using AI Image Generator:
**Prompt**:
```
"Create a modern, professional mobile app icon for a fintech banking app called SureBank.
Design features a rounded shield shape in deep navy blue (#1a2c4f) with a stylized
gold (#d4af37) currency symbol or 'S' monogram in the center. Flat design style,
clean and minimal, suitable for iOS and Android. 1024x1024px, no text."
```

### Using Online Tools:
- **Icon Generator**: icon.kitchen, makeappicon.com
- **Splash Screen**: splashscreen.design
- **Favicon**: favicon.io

---

## Current Status

✅ **Placeholder assets exist**
⚠️ **Need custom SureBank branded assets**

### Next Steps:
1. Hire designer or use AI to generate icon based on specifications
2. Replace `icon.png` with new design
3. Generate adaptive-icon.png from main icon
4. Create splash screen with logo and branding
5. Generate favicon from icon
6. Test on devices to ensure proper appearance

---

## Color Accessibility

All color combinations have been tested for WCAG AA compliance:
- Navy (#1a2c4f) + White text: ✅ AAA
- Gold (#d4af37) + Navy background: ✅ AA
- Dark Navy (#0f1721) + Light text: ✅ AAA

---

Last Updated: 2025-10-03
