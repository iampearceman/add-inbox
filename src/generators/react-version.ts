/**
 * Utility functions for React version detection and compatibility checks
 */

/**
 * Gets the React version from the project's dependencies
 * @returns {string} The React version (e.g., '16.14.0', '17.0.2', '18.0.0')
 */
export function getReactVersion(): string {
    try {
      // Try to get React version from package.json
      const packageJson = require('react/package.json');
      return packageJson.version;
    } catch (error) {
      // If we can't get the version, assume it's a modern version
      return '17.0.0';
    }
  }
  
  /**
   * Checks if the React version is modern (17 or higher)
   * @returns {boolean} True if React version is 17 or higher
   */
  export function isModernReact(): boolean {
    const version = getReactVersion();
    return version.startsWith('17.') || version.startsWith('18.');
  }
  
  /**
   * Checks if the React version is legacy (16.x)
   * @returns {boolean} True if React version is 16.x
   */
  export function isLegacyReact(): boolean {
    const version = getReactVersion();
    return version.startsWith('16.');
  }
  
  /**
   * Gets the appropriate environment variable name based on React version
   * @returns {string} The environment variable name to use
   */
  export function getEnvironmentVariableName(): string {
    if (isModernReact()) {
      return 'VITE_NOVU_APP_ID';
    }
    return 'NOVU_APP_ID';
  }
  
  module.exports = {
    getReactVersion,
    isModernReact,
    isLegacyReact,
    getEnvironmentVariableName,
  }; 
  