const { AUTH_PROVIDERS } = require('../constants');
const fileUtils = require('./file');

function detectAuthProviders() {
  try {
    const packageJsonPath = fileUtils.joinPaths(process.cwd(), 'package.json');
    const packageJson = fileUtils.readJson(packageJsonPath);
    
    if (!packageJson) return [];

    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    const providers = [];
    if (dependencies['next-auth']) providers.push(AUTH_PROVIDERS.NEXTAUTH);
    if (dependencies['@supabase/supabase-js']) providers.push(AUTH_PROVIDERS.SUPABASE);
    if (dependencies['@auth0/auth0-react']) providers.push(AUTH_PROVIDERS.AUTH0);
    if (dependencies['@clerk/nextjs'] || dependencies['@clerk/clerk-react']) providers.push(AUTH_PROVIDERS.CLERK);

    return providers;
  } catch (error) {
    return [];
  }
}

function hasNextThemes() {
  try {
    const packageJsonPath = fileUtils.joinPaths(process.cwd(), 'package.json');
    const packageJson = fileUtils.readJson(packageJsonPath);
    
    if (!packageJson) return false;

    return (
      (packageJson.dependencies && packageJson.dependencies['next-themes']) ||
      (packageJson.devDependencies && packageJson.devDependencies['next-themes'])
    );
  } catch (error) {
    return false;
  }
}

module.exports = {
  detectAuthProviders,
  hasNextThemes
}; 