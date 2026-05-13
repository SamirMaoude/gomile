const path = require('path');
const fs = require('fs');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo so Metro sees shared packages (if it exists)
if (fs.existsSync(monorepoRoot)) {
  config.watchFolders = [monorepoRoot];
}

// With pnpm hoisted node_modules, all packages are at the monorepo root
const nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];
if (fs.existsSync(path.resolve(monorepoRoot, 'node_modules'))) {
  nodeModulesPaths.push(path.resolve(monorepoRoot, 'node_modules'));
}
config.resolver.nodeModulesPaths = nodeModulesPaths;

// Fix for EAS build: handle App module resolution for monorepo
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle ../../App imports from Expo AppEntry.js in EAS builds
  if (moduleName === '../../App' || moduleName === '../../../App' || moduleName.startsWith('../../App.')) {
    const candidates = [
      path.resolve(projectRoot, 'App.js'),
      path.resolve(projectRoot, 'App.tsx'),
      path.resolve(projectRoot, 'App.ts'),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return {
          filePath: candidate,
          type: 'sourceFile',
        };
      }
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

