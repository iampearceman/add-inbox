const { FRAMEWORKS, ENV_VARIABLES } = require('../constants');
const fileUtils = require('../utils/file');
const logger = require('../utils/logger');

function setupEnvExampleNextJs(updateExisting) {
  logger.gray('• Setting up environment configuration for Next.js...');
  const envExamplePath = fileUtils.joinPaths(process.cwd(), '.env.example');
  const envLocalPath = fileUtils.joinPaths(process.cwd(), '.env.local');
  const envContentToAdd = `\n# Novu configuration (added by Novu Inbox Installer)
${ENV_VARIABLES.NEXTJS.APP_ID}=
`;

  // Handle .env.example
  if (fileUtils.exists(envExamplePath)) {
    const existingContent = fileUtils.readFile(envExamplePath);
    if (existingContent.includes(ENV_VARIABLES.NEXTJS.APP_ID)) {
      logger.blue('  • Novu variables already detected in .env.example. No changes made.');
    } else if (updateExisting) {
      fileUtils.appendFile(envExamplePath, envContentToAdd);
      logger.blue('  • Appended Novu configuration to existing .env.example');
    } else {
      logger.warning('  • .env.example exists. Skipping modification as Novu variables were not found and appending was not confirmed.');
      logger.cyan('    Please manually add Novu variables to your .env.example:');
      logger.cyan(`    ${ENV_VARIABLES.NEXTJS.APP_ID}=`);
    }
  } else {
    fileUtils.writeFile(envExamplePath, envContentToAdd.trimStart());
    logger.blue('  • Created .env.example with Novu configuration');
  }

  // Handle .env.local
  if (fileUtils.exists(envLocalPath)) {
    const existingContent = fileUtils.readFile(envLocalPath);
    if (existingContent.includes(ENV_VARIABLES.NEXTJS.APP_ID)) {
      logger.blue('  • Novu variables already detected in .env.local. No changes made.');
    } else {
      fileUtils.appendFile(envLocalPath, envContentToAdd);
      logger.blue('  • Appended Novu configuration to existing .env.local');
    }
  } else {
    fileUtils.writeFile(envLocalPath, envContentToAdd.trimStart());
    logger.blue('  • Created .env.local with Novu configuration');
  }

  logger.gray('    Remember to fill in your Novu credentials in .env.local.');
  logger.gray('    Ensure .env.local is in your .gitignore file.');
}

function setupEnvExampleReact(updateExisting) {
  logger.gray('• Setting up environment configuration for React...');
  const envPath = fileUtils.joinPaths(process.cwd(), '.env.example');
  const envContentToAdd = `\n# Novu configuration (added by Novu Inbox Installer)
${ENV_VARIABLES.REACT.APP_ID}=
`;

  if (fileUtils.exists(envPath)) {
    const existingContent = fileUtils.readFile(envPath);
    if (existingContent.includes(ENV_VARIABLES.REACT.APP_ID)) {
      logger.blue('  • Novu variables already detected in .env.example. No changes made.');
    } else if (updateExisting) {
      fileUtils.appendFile(envPath, envContentToAdd);
      logger.blue('  • Appended Novu configuration to existing .env.example');
    } else {
      logger.warning('  • .env.example exists. Skipping modification as Novu variables were not found and appending was not confirmed.');
      logger.cyan('    Please manually add Novu variables to your .env.example:');
      logger.cyan(`    ${ENV_VARIABLES.REACT.APP_ID}=`);
    }
  } else {
    fileUtils.writeFile(envPath, envContentToAdd.trimStart());
    logger.blue('  • Created .env.example with Novu configuration');
  }
  logger.gray('    Remember to copy .env.example to .env and fill in your credentials.');
  logger.gray('    Ensure .env is in your .gitignore file.');
}

module.exports = {
  setupEnvExampleNextJs,
  setupEnvExampleReact
}; 