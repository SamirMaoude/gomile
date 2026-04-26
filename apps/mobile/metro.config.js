const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// `shared/` is a plain workspace folder, not a package under apps/*, so Metro
// needs the monorepo root watched explicitly to resolve those runtime imports.
config.watchFolders = [workspaceRoot, ...(config.watchFolders ?? [])];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
