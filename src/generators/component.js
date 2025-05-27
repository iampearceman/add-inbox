const { FRAMEWORKS } = require('../constants');
const fileUtils = require('../utils/file');
const logger = require('../utils/logger');
const { generateNextJsComponent } = require('./frameworks/nextjs');
const { generateReactComponent } = require('./frameworks/react');

function createComponentStructure(framework, overwrite) {
  const componentsBaseDir = 'components';
  const inboxRelativeDir = fileUtils.joinPaths('ui', 'inbox');
  const inboxDir = fileUtils.joinPaths(process.cwd(), componentsBaseDir, inboxRelativeDir);

  if (fileUtils.exists(inboxDir) && !overwrite) {
    logger.warning(`  • Inbox component directory ${logger.cyan(inboxDir)} already exists. Skipping creation.`);
    return;
  }

  if (fileUtils.exists(inboxDir) && overwrite) {
    logger.warning(`  • Overwriting existing Inbox component directory: ${logger.cyan(inboxDir)}`);
    fileUtils.removeDirectory(inboxDir);
  }

  fileUtils.createDirectory(inboxDir);
  logger.gray(`  • Created component directory structure at ${logger.cyan(inboxDir)}`);

  logger.gray('\n• Creating component files...');
  const inboxComponentFilePath = fileUtils.joinPaths(inboxDir, 'NovuInbox.tsx');
  
  // Generate component content based on framework
  const inboxComponentContent = framework === FRAMEWORKS.NEXTJS 
    ? generateNextJsComponent()
    : generateReactComponent();

  fileUtils.writeFile(inboxComponentFilePath, inboxComponentContent);
  logger.success(`  ✓ Created ${logger.cyan(fileUtils.joinPaths(inboxRelativeDir, 'NovuInbox.tsx'))}`);
}

module.exports = {
  createComponentStructure
}; 