/* eslint-disable no-undef */
// Config Metro pour le monorepo Vigie.
// @vigie/shared est consommé en source TypeScript avec des imports relatifs
// NodeNext (`./verdict.js`) : Metro doit réessayer sans l'extension `.js`
// pour retomber sur le fichier `.ts` correspondant.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const sharedPackageDir = path.resolve(__dirname, '..', '..', 'packages', 'shared');

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = defaultResolveRequest ?? context.resolveRequest;
  if (
    moduleName.startsWith('.') &&
    moduleName.endsWith('.js') &&
    context.originModulePath.startsWith(sharedPackageDir)
  ) {
    return resolve(context, moduleName.slice(0, -'.js'.length), platform);
  }
  return resolve(context, moduleName, platform);
};

module.exports = config;
