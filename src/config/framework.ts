import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';
import { FRAMEWORKS, FrameworkType } from '../constants';
import fileUtils from '../utils/file';

export interface Framework {
  framework: FrameworkType;
  version: string;
  setup: string;
}

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/**
 * Configuration and Constants
 */
export const MIN_VERSIONS: Record<FrameworkType, number> = {
  [FRAMEWORKS.REACT]: 16,
  [FRAMEWORKS.NEXTJS]: 12
};

export const FRAMEWORK_SETUPS: Record<FrameworkType, string> = {
  [FRAMEWORKS.NEXTJS]: 'App Router',
  [FRAMEWORKS.REACT]: 'Create React App'
};

/**
 * File System Operations
 */

/**
 * Reads and parses package.json
 * @returns {PackageJson|null} The parsed package.json or null if not found/invalid
 */
function getPackageJson(): PackageJson | null {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } catch (error) {
    logger.warning('Failed to read package.json:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Version Management
 */

/**
 * Extracts the version of a framework from package.json
 * @param {PackageJson} packageJson - The parsed package.json
 * @param {string} framework - The framework to check
 * @returns {string|null} The framework version or null if not found
 */
function getFrameworkVersion(packageJson: PackageJson, framework: string): string | null {
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  const version = dependencies?.[framework];
  if (!version) return null;

  // Remove any ^ or ~ from version
  return version.replace(/[\^~]/, '');
}

/**
 * Validates if a framework version meets minimum requirements
 * @param {string} version - The version to validate
 * @param {FrameworkType} framework - The framework being validated
 * @returns {boolean} Whether the version is valid
 */
function validateFrameworkVersion(version: string | null, framework: FrameworkType): boolean {
  if (!version) return false;

  const [major] = version.split('.');
  return parseInt(major) >= MIN_VERSIONS[framework];
}

/**
 * Framework Detection
 */

/**
 * Detects the framework and its version from the project
 * @returns {Framework|null} Framework information or null if not detected
 */
export function detectFramework(): Framework | null {
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
    logger.warning('Failed to check for next.config.js:', error instanceof Error ? error.message : String(error));
  }

  return null;
}

export { validateFrameworkVersion }; 