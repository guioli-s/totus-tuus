// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Garante resolução de imports ESM com extensão .js explícita (necessário para @react-navigation v7)
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'js',
  'jsx',
  'ts',
  'tsx',
  'cjs',
  'mjs',
];

module.exports = config;
