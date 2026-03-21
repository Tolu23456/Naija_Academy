const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'woff2',
  'woff',
  'ttf',
  'otf',
];

module.exports = config;
