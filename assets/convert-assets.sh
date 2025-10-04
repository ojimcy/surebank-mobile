#!/bin/bash

# SureBank Asset Conversion Script
# Converts SVG assets to PNG format for app icons, splash screens, and favicon

echo "🎨 SureBank Asset Conversion Tool"
echo "=================================="
echo ""

# Check if ImageMagick or other conversion tools are installed
if ! command -v convert &> /dev/null && ! command -v magick &> /dev/null && ! command -v rsvg-convert &> /dev/null; then
    echo "❌ Error: No image conversion tool found!"
    echo ""
    echo "Please install one of the following:"
    echo ""
    echo "Option 1 - ImageMagick (Recommended):"
    echo "  brew install imagemagick"
    echo ""
    echo "Option 2 - librsvg:"
    echo "  brew install librsvg"
    echo ""
    echo "Option 3 - Inkscape (GUI + CLI):"
    echo "  brew install --cask inkscape"
    echo ""
    exit 1
fi

# Determine which tool to use
if command -v magick &> /dev/null; then
    CONVERTER="magick"
    CONVERT_CMD="magick"
elif command -v convert &> /dev/null; then
    CONVERTER="imagemagick"
    CONVERT_CMD="convert"
elif command -v rsvg-convert &> /dev/null; then
    CONVERTER="rsvg"
    CONVERT_CMD="rsvg-convert"
fi

echo "✅ Using: $CONVERTER"
echo ""

# Function to convert SVG to PNG
convert_svg() {
    local input=$1
    local output=$2
    local size=$3

    if [ "$CONVERTER" = "rsvg" ]; then
        rsvg-convert -w $size -h $size "$input" -o "$output"
    else
        $CONVERT_CMD -background none -density 300 -resize ${size}x${size} "$input" "$output"
    fi
}

# Convert app icon (1024x1024)
echo "📱 Converting app icon..."
convert_svg "surebank-logo.svg" "icon.png" 1024
echo "   ✅ icon.png created (1024x1024)"

# Convert adaptive icon (1024x1024)
echo "🤖 Converting Android adaptive icon..."
convert_svg "surebank-logo.svg" "adaptive-icon.png" 1024
echo "   ✅ adaptive-icon.png created (1024x1024)"

# Convert splash screen (1024x1024)
echo "💫 Converting splash screen..."
convert_svg "surebank-splash.svg" "splash-icon.png" 1024
echo "   ✅ splash-icon.png created (1024x1024)"

# Convert favicon (48x48)
echo "🌐 Converting favicon..."
convert_svg "surebank-favicon.svg" "favicon.png" 48
echo "   ✅ favicon.png created (48x48)"

echo ""
echo "✨ All assets converted successfully!"
echo ""
echo "📋 Generated files:"
echo "   • icon.png (1024x1024) - App icon for iOS/Android"
echo "   • adaptive-icon.png (1024x1024) - Android adaptive icon"
echo "   • splash-icon.png (1024x1024) - Splash screen"
echo "   • favicon.png (48x48) - Web favicon"
echo ""
echo "🎯 Next steps:"
echo "   1. Review the generated PNG files"
echo "   2. Optimize images with: npx @expo/image-utils"
echo "   3. Test the app to see the new branding"
echo "   4. Run: npm start"
echo ""
