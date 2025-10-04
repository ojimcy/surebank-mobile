/* eslint-disable @typescript-eslint/no-require-imports */
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Enable CSS support for NativeWind
config.resolver.sourceExts.push('css');

// Configure NativeWind
module.exports = withNativeWind(config, { 
  input: './global.css',
  configPath: './tailwind.config.js'
});