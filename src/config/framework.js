const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { FRAMEWORKS } = require('../constants');

/**
 * Configuration and Constants
 */
const MIN_VERSIONS = {
  [FRAMEWORKS.REACT]: 16,
  [FRAMEWORKS.NEXTJS]: 12
};

const FRAMEWORK_SETUPS = {
  [FRAMEWORKS.NEXTJS]: 'App Router',
  [FRAMEWORKS.REACT]: 'Create React App'
};

/**
 * File System Operations
 */

/**
 * Reads and parses package.json
 * @returns {Object|null} The parsed package.json or null if not found/invalid
 */
function getPackageJson() {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } catch (error) {
    logger.warning('Failed to read package.json:', error.message);
    return null;
  }
}

/**
 * Version Management
 */

/**
 * Extracts the version of a framework from package.json
 * @param {Object} packageJson - The parsed package.json
 * @param {string} framework - The framework to check
 * @returns {string|null} The framework version or null if not found
 */
function getFrameworkVersion(packageJson, framework) {
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  const version = dependencies[framework];
  if (!version) return null;

  // Remove any ^ or ~ from version
  return version.replace(/[\^~]/, '');
}

/**
 * Validates if a framework version meets minimum requirements
 * @param {string} version - The version to validate
 * @param {string} framework - The framework being validated
 * @returns {boolean} Whether the version is valid
 */
function validateFrameworkVersion(version, framework) {
  if (!version) return false;

  const [major] = version.split('.');
  return parseInt(major) >= MIN_VERSIONS[framework];
}

/**
 * Framework Detection
 */

/**
 * Detects the framework and its version from the project
 * @returns {Object|null} Framework information or null if not detected
 */
function detectFramework() {
  const packageJson = getPackageJson();
  if (!packageJson) {
    return null;
  }

  // Check for Next.js first
  const nextVersion = getFrameworkVersion(packageJson, 'next');
  if (nextVersion && validateFrameworkVersion(nextVersion, FRAMEWORKS.NEXTJS)) {
    return {
      framework: FRAMEWORKS.NEXTJS,
      version: nextVersion,
      setup: FRAMEWORK_SETUPS[FRAMEWORKS.NEXTJS]
    };
  }

  // Check for React
  const reactVersion = getFrameworkVersion(packageJson, 'react');
  if (reactVersion && validateFrameworkVersion(reactVersion, FRAMEWORKS.REACT)) {
    return {
      framework: FRAMEWORKS.REACT,
      version: reactVersion,
      setup: FRAMEWORK_SETUPS[FRAMEWORKS.REACT]
    };
  }

  // Additional checks for Next.js in case it's not in package.json
  try {
    const nextConfigPath = path.join(process.cwd(), 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      return {
        framework: FRAMEWORKS.NEXTJS,
        version: 'latest', // We can't determine version without package.json
        setup: FRAMEWORK_SETUPS[FRAMEWORKS.NEXTJS]
      };
    }
  } catch (error) {
    logger.warning('Failed to check for next.config.js:', error.message);
  }

  return null;
}

module.exports = {
  detectFramework,
  validateFrameworkVersion,
  MIN_VERSIONS,
  FRAMEWORK_SETUPS
}; 