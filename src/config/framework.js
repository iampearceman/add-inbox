const { FRAMEWORKS } = require('../constants');
const fileUtils = require('../utils/file');
const logger = require('../utils/logger');

function detectFramework() {
  const cwd = process.cwd();
  
  logger.gray('  • Checking for framework...');

  // First check package.json for framework dependencies
  try {
    const packageJsonPath = fileUtils.joinPaths(cwd, 'package.json');
    if (fileUtils.exists(packageJsonPath)) {
      const packageJson = fileUtils.readJson(packageJsonPath);
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      logger.gray('    - Dependencies found:');
      logger.gray(`      next: ${!!dependencies.next}`);
      logger.gray(`      react: ${!!dependencies.react}`);
      logger.gray(`      react-router-dom: ${!!dependencies['react-router-dom']}`);
      logger.gray(`      react-router: ${!!dependencies['react-router']}`);
      logger.gray(`      vite: ${!!dependencies.vite}`);
      logger.gray(`      react-scripts: ${!!dependencies['react-scripts']}`);

      // Check for Next.js first
      if (dependencies.next) {
        logger.gray('    → Detected Next.js from dependencies');
        return FRAMEWORKS.NEXTJS;
      }

      // Then check for React and its common setups
      if (dependencies.react) {
        // Check for React Router
        if (dependencies['react-router-dom'] || dependencies['react-router']) {
          logger.gray('    → Detected React with React Router');
          return FRAMEWORKS.REACT;
        }
        // Check if it's a Vite project
        if (dependencies.vite) {
          logger.gray('    → Detected React with Vite');
          return FRAMEWORKS.REACT;
        }
        // Check if it's a Create React App project
        if (dependencies['react-scripts']) {
          logger.gray('    → Detected React with Create React App');
          return FRAMEWORKS.REACT;
        }
        // If it has React but no specific framework, assume it's a React project
        logger.gray('    → Detected basic React project');
        return FRAMEWORKS.REACT;
      }
    }
  } catch (error) {
    logger.warning('  • Could not read package.json for framework detection');
    logger.gray(`    Error: ${error.message}`);
  }

  // Only check for Next.js specific files if no framework was detected from dependencies
  const nextConfigJs = fileUtils.exists(fileUtils.joinPaths(cwd, 'next.config.js'));
  const nextConfigMjs = fileUtils.exists(fileUtils.joinPaths(cwd, 'next.config.mjs'));
  const appDir = fileUtils.exists(fileUtils.joinPaths(cwd, 'app'));
  const pagesDir = fileUtils.exists(fileUtils.joinPaths(cwd, 'pages'));
  
  logger.gray(`    - Next.js config files: ${nextConfigJs || nextConfigMjs}`);
  logger.gray(`    - Next.js app/pages dirs: ${appDir || pagesDir}`);

  if (nextConfigJs || nextConfigMjs || appDir || pagesDir) {
    logger.gray('    → Detected Next.js from file structure');
    return FRAMEWORKS.NEXTJS;
  }

  logger.gray('    → No framework detected');
  return null;
}

module.exports = {
  detectFramework
}; 