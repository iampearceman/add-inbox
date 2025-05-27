const { PACKAGE_MANAGERS } = require('../constants');
const fileUtils = require('../utils/file');
const logger = require('../utils/logger');

function detectPackageManager() {
  const cwd = process.cwd();
  
  // Check for lock files first
  if (fileUtils.exists(fileUtils.joinPaths(cwd, 'pnpm-lock.yaml'))) {
    return { name: PACKAGE_MANAGERS.PNPM, install: 'add', init: 'init' };
  }
  if (fileUtils.exists(fileUtils.joinPaths(cwd, 'yarn.lock'))) {
    return { name: PACKAGE_MANAGERS.YARN, install: 'add', init: 'init -y' };
  }
  if (fileUtils.exists(fileUtils.joinPaths(cwd, 'package-lock.json'))) {
    return { name: PACKAGE_MANAGERS.NPM, install: 'install', init: 'init -y' };
  }

  // If no lock file is found, check package.json for packageManager field
  try {
    const packageJsonPath = fileUtils.joinPaths(cwd, 'package.json');
    if (fileUtils.exists(packageJsonPath)) {
      const packageJson = fileUtils.readJson(packageJsonPath);
      if (packageJson.packageManager) {
        const [name, version] = packageJson.packageManager.split('@');
        if (name === PACKAGE_MANAGERS.NPM) {
          return { name: PACKAGE_MANAGERS.NPM, install: 'install', init: 'init -y' };
        } else if (name === PACKAGE_MANAGERS.YARN) {
          return { name: PACKAGE_MANAGERS.YARN, install: 'add', init: 'init -y' };
        } else if (name === PACKAGE_MANAGERS.PNPM) {
          return { name: PACKAGE_MANAGERS.PNPM, install: 'add', init: 'init' };
        }
      }
    }
  } catch (error) {
    logger.warning('  • Could not read package.json for package manager detection');
  }

  // If no package manager is detected, default to npm
  logger.warning('  • No package manager detected, defaulting to npm');
  return { name: PACKAGE_MANAGERS.NPM, install: 'install', init: 'init -y' };
}

async function ensurePackageJson(packageManager) {
  const packagePath = fileUtils.joinPaths(process.cwd(), 'package.json');
  if (!fileUtils.exists(packagePath)) {
    logger.warning('No package.json found.');
    const { confirm } = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: `Initialize a new package.json using ${logger.cyan(`${packageManager.name} ${packageManager.init}`)}?`,
      initial: true,
    });

    if (confirm) {
      try {
        logger.gray(`  $ ${packageManager.name} ${packageManager.init}`);
        execSync(`${packageManager.name} ${packageManager.init}`, { stdio: 'inherit' });
        logger.success('  ✓ package.json initialized.');
      } catch (error) {
        logger.error('  ✗ Failed to initialize package.json:');
        logger.error(error.message);
        logger.cyan('  Please initialize it manually and try again.');
        return false;
      }
    } else {
      logger.error('  Installation cannot proceed without a package.json.');
      return false;
    }
  }
  logger.success('  ✓ package.json is ready.');
  return true;
}

module.exports = {
  detectPackageManager,
  ensurePackageJson
}; 