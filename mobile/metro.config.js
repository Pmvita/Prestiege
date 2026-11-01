/* eslint-disable @typescript-eslint/no-var-requires */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');
const sharedPath = path.resolve(workspaceRoot, 'shared');

const config = getDefaultConfig(projectRoot);

// Monorepo: watch shared package + workspace root (npm workspaces)
config.watchFolders = [sharedPath, workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Expo lives in the workspace root node_modules, so hierarchical lookup
// binds react-dom to root React 18.3 while app code uses mobile React 18.2.
config.resolver.disableHierarchicalLookup = true;

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
  'react-native-web': path.resolve(projectRoot, 'node_modules/react-native-web'),
};

// Treat JSON as modules (marketplace mock data)
config.resolver.sourceExts = config.resolver.sourceExts?.includes('json')
  ? config.resolver.sourceExts
  : [...(config.resolver.sourceExts || []), 'json'];
config.resolver.assetExts = (config.resolver.assetExts || []).filter(
  (ext) => ext !== 'json'
);

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'prestiege-shared': sharedPath,
};

module.exports = config;
