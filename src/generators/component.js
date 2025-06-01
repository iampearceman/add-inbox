const { FRAMEWORKS } = require('../constants');
const fileUtils = require('../utils/file');
const logger = require('../utils/logger');
const { generateNextJsComponent } = require('./frameworks/nextjs');
const { generateReactComponent } = require('./frameworks/react');

function createComponentStructure(framework, overwrite, subscriberId = null) {
  const cwd = process.cwd();
  const srcDir = fileUtils.joinPaths(cwd, 'src');
  const appDir = fileUtils.joinPaths(cwd, 'app');
  
  // Determine the base directory for components
  let baseDir = cwd;
  if (fileUtils.exists(srcDir)) {
    baseDir = srcDir;
    logger.gray('  • Using src directory for component placement');
  } else if (fileUtils.exists(appDir)) {
    baseDir = appDir;
    logger.gray('  • Using app directory for component placement');
  } else {
    logger.gray('  • No src or app directory found, using project root');
  }

  const componentsBaseDir = 'components';
  const inboxRelativeDir = 'ui/inbox';
  const inboxDir = fileUtils.joinPaths(baseDir, componentsBaseDir, inboxRelativeDir);

  if (fileUtils.exists(inboxDir) && !overwrite) {
    logger.warning(`  • Inbox component directory ${logger.cyan(inboxRelativeDir)} already exists. Skipping creation.`);
    return;
  }

  if (fileUtils.exists(inboxDir) && overwrite) {
    logger.warning(`  • Overwriting existing Inbox component directory: ${logger.cyan(inboxRelativeDir)}`);
    fileUtils.removeDirectory(inboxDir);
  }

  fileUtils.createDirectory(inboxDir);
  logger.gray(`  • Created component directory structure at ${logger.cyan(inboxRelativeDir)}`);

  logger.gray('\n• Creating component files...');
  const inboxComponentFilePath = fileUtils.joinPaths(inboxDir, 'NovuInbox.tsx');
  
  // Generate component content based on framework
  const inboxComponentContent = framework.framework === FRAMEWORKS.NEXTJS 
    ? generateNextJsComponent(subscriberId)
    : generateReactComponent(subscriberId);

  fileUtils.writeFile(inboxComponentFilePath, inboxComponentContent);
  logger.success(`  ✓ Created ${logger.cyan(inboxRelativeDir + '/NovuInbox.tsx')}`);
}

module.exports = {
  createComponentStructure
}; 