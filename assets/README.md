# SureBank Mobile - Assets

## 📦 What's Here

### Brand Design Files (SVG)
✅ **Created and ready to use:**

1. **`surebank-logo.svg`** - Main app icon
   - Professional shield design with $S symbol
   - Navy blue (#1a2c4f) + Gold (#d4af37)
   - 1024x1024px vector graphic

2. **`surebank-splash.svg`** - Splash screen
   - Full branding with logo, name, and tagline
   - Dark gradient background
   - Ready for conversion to PNG

3. **`surebank-favicon.svg`** - Web favicon
   - Simplified logo for small sizes
   - 48x48px optimized design

### Current Asset Status

| Asset | Status | Action Required |
|-------|--------|-----------------|
| icon.png | ⚠️ Placeholder | Convert from `surebank-logo.svg` |
| adaptive-icon.png | ⚠️ Placeholder | Convert from `surebank-logo.svg` |
| splash-icon.png | ⚠️ Placeholder | Convert from `surebank-splash.svg` |
| favicon.png | ⚠️ Placeholder | Convert from `surebank-favicon.svg` |

---

## 🚀 Quick Start - Convert SVG to PNG

### Option 1: Automated Script (Recommended)

```bash
# Install ImageMagick first
brew install imagemagick

# Run conversion script
cd assets
./convert-assets.sh
```

This will automatically generate all 4 required PNG files!

### Option 2: Online Tools (No Installation)

Use any of these free online converters:
- **CloudConvert**: https://cloudconvert.com/svg-to-png
- **Convertio**: https://convertio.co/svg-png/
- **SVG to PNG**: https://svgtopng.com/

**Steps:**
1. Upload `surebank-logo.svg`
2. Set output size to 1024x1024
3. Download as `icon.png`
4. Repeat for other assets (see guide below)

### Option 3: Use Design Software

Open SVG files in:
- **Figma** (Free, online)
- **Adobe Illustrator**
- **Inkscape** (Free, open source)
- **Sketch** (macOS)

Then export as PNG at required sizes.

📚 **Full detailed guide**: See [`ASSET_CONVERSION_GUIDE.md`](ASSET_CONVERSION_GUIDE.md)

---

## 🎨 Brand Colors

### Primary Palette
- **Navy Blue (Primary)**: `#1a2c4f`
  - Use for: Main backgrounds, primary UI elements

- **Dark Navy (Background)**: `#0f1721`
  - Use for: App background, cards

- **Gold (Accent)**: `#d4af37`
  - Use for: Highlights, important actions, success states

### Secondary Colors
- **Success Green**: `#22c55e`
- **Warning Orange**: `#f97316`
- **Error Red**: `#dc2626`
- **Gray Scale**: `#f8fafc` to `#0f172a`

📚 **Complete brand guide**: See [`BRANDING_GUIDE.md`](BRANDING_GUIDE.md)

---

## 📋 Asset Requirements

### App Icon (`icon.png`)
- **Size**: 1024x1024px
- **Format**: PNG with transparency
- **Source**: `surebank-logo.svg`

### Android Adaptive Icon (`adaptive-icon.png`)
- **Size**: 1024x1024px
- **Format**: PNG with transparency
- **Source**: `surebank-logo.svg`
- **Note**: Keep logo in center 66% (safe area for circular masks)

### Splash Screen (`splash-icon.png`)
- **Size**: 1024x1024px minimum
- **Format**: PNG
- **Source**: `surebank-splash.svg`
- **Background**: Can be colored (dark navy #0f1721)

### Favicon (`favicon.png`)
- **Size**: 48x48px (or 32x32px)
- **Format**: PNG
- **Source**: `surebank-favicon.svg`

---

## ✅ Quality Checklist

Before using the assets, verify:

- [ ] Resolution is correct (1024x1024 for icons, 48x48 for favicon)
- [ ] Colors match brand guidelines
- [ ] Transparent background where needed
- [ ] No pixelation or blur
- [ ] Files are properly named
- [ ] Files are in `/assets` directory

---

## 🧪 Testing After Conversion

1. **Replace placeholder files** with your converted PNGs

2. **Clear Expo cache**:
```bash
npm run reset
```

3. **Start the app**:
```bash
npm start
```

4. **Test on device/simulator**:
```bash
npm run android  # or npm run ios
```

5. **Build to see final result**:
```bash
npm run build:apk
```

---

## 📁 File Structure

```
assets/
├── README.md                    # This file
├── BRANDING_GUIDE.md           # Complete brand guidelines
├── ASSET_CONVERSION_GUIDE.md   # Detailed conversion instructions
│
├── surebank-logo.svg           # Source: App icon design
├── surebank-splash.svg         # Source: Splash screen design
├── surebank-favicon.svg        # Source: Favicon design
├── convert-assets.sh           # Automated conversion script
│
├── icon.png                    # ⚠️ Convert from surebank-logo.svg
├── adaptive-icon.png           # ⚠️ Convert from surebank-logo.svg
├── splash-icon.png             # ⚠️ Convert from surebank-splash.svg
└── favicon.png                 # ⚠️ Convert from surebank-favicon.svg
```

---

## 🎯 Next Steps

1. **Convert SVG to PNG** using one of the methods above
2. **Optimize PNGs** (optional) - Use TinyPNG or ImageOptim
3. **Test in app** - See how the branding looks
4. **Build for production** - Ready for app store submission

---

## 🆘 Need Help?

### Documentation
- [Asset Conversion Guide](ASSET_CONVERSION_GUIDE.md) - Step-by-step conversion
- [Branding Guide](BRANDING_GUIDE.md) - Design specifications
- [Build Guide](../BUILD_READY_SUMMARY.md) - Production deployment

### Tools
- **Conversion Script**: `./convert-assets.sh`
- **Online Converters**: CloudConvert, Convertio, SVG to PNG

### Resources
- [Expo Assets Documentation](https://docs.expo.dev/develop/user-interface/assets/)
- [App Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)

---

**SureBank Mobile App**
**Version**: 1.0.0
**Last Updated**: 2025-10-03
