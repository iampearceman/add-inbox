const { FRAMEWORKS } = require('../constants');
const fileUtils = require('../utils/file');
const logger = require('../utils/logger');
const { generateNextJsComponent } = require('./frameworks/nextjs');
const { generateModernReactComponent, generateLegacyReactComponent } = require('./frameworks/react');
const { isModernReact } = require('./react-version');

async function createComponentStructure(framework, overwriteComponents, subscriberId, region = 'us') {
  logger.gray('• Creating component structure...');
  
  const cwd = process.cwd();
  const srcDir = fileUtils.joinPaths(cwd, 'src');
  const appDir = fileUtils.joinPaths(cwd, 'app');
  
  // Determine the base directory for components
  let baseDir = cwd;
  if (fileUtils.exists(srcDir)) {
    baseDir = srcDir;
  } else if (fileUtils.exists(appDir)) {
    baseDir = appDir;
  }
  
  const componentsDir = fileUtils.joinPaths(baseDir, 'components');
  const uiDir = fileUtils.joinPaths(componentsDir, 'ui');
  const inboxDir = fileUtils.joinPaths(uiDir, 'inbox');
  
  // Create directories if they don't exist
  fileUtils.createDirectory(componentsDir);
  fileUtils.createDirectory(uiDir);
  fileUtils.createDirectory(inboxDir);
  
  // Generate component code based on framework
  let componentCode;
  if (framework.framework === 'nextjs') {
    componentCode = generateNextJsComponent(subscriberId, region);
  } else {
    // For React, determine if it's modern or legacy
    if (isModernReact()) {
      componentCode = generateModernReactComponent(subscriberId, region);
    } else {
      componentCode = generateLegacyReactComponent(subscriberId, region);
    }
  }
  
  // Write component file
  const componentPath = fileUtils.joinPaths(inboxDir, 'NovuInbox.tsx');
  fileUtils.writeFile(componentPath, componentCode);
  
  logger.success('  ✓ Created Novu Inbox component');
  logger.gray(`    Location: ${componentPath}`);
}

module.exports = {
  createComponentStructure
}; 