#!/usr/bin/env node

const { execSync } = require('child_process');
const prompts = require('prompts');
const logger = require('../utils/logger');
const fileUtils = require('../utils/file');
const { detectFramework } = require('../config/framework');
const { detectPackageManager, ensurePackageJson } = require('../config/package-manager');
const { createComponentStructure } = require('../generators/component');
const { setupEnvExampleNextJs, setupEnvExampleReact } = require('../generators/env');
const { FRAMEWORKS } = require('../constants');

async function promptUserConfiguration() {
  // Detect framework first
  const detectedFramework = detectFramework();
  
  // If no framework is detected or it's not React/Next.js, abort
  if (!detectedFramework) {
    logger.error('\n❌ No supported framework detected.');
    logger.warning('This tool only supports React and Next.js projects.');
    logger.gray('\nPlease ensure you are running this command in a React or Next.js project directory.');
    return null;
  }

  // Use detected framework directly without prompting
  const initialResponses = {
    framework: detectedFramework
  };

  // Detect package manager
  const packageManager = detectPackageManager();
  if (!packageManager) {
    logger.error('  ✗ Could not detect package manager. Please ensure you have a package.json file.');
    return null;
  }

  const additionalPrompts = [];
  const inboxComponentPath = fileUtils.joinPaths(process.cwd(), 'components', 'ui', 'inbox');
  if (fileUtils.exists(inboxComponentPath)) {
    logger.warning('\n⚠️  The Novu Inbox component is already installed in your project.');
    logger.gray(`   Location: ${logger.cyan(inboxComponentPath)}`);
    logger.gray('   You can choose to overwrite the existing installation or cancel.\n');
    
    additionalPrompts.push({
      type: 'confirm',
      name: 'overwriteComponents',
      message: 'Would you like to overwrite the existing installation?',
      initial: false,
    });
  }

  const envExamplePath = fileUtils.joinPaths(process.cwd(), '.env.example');
  if (initialResponses.framework === FRAMEWORKS.NEXTJS && fileUtils.exists(envExamplePath)) {
    const envExampleContent = fileUtils.readFile(envExamplePath);
    if (!envExampleContent.includes('NEXT_PUBLIC_NOVU_APP_ID')) {
      additionalPrompts.push({
        type: 'confirm',
        name: 'updateEnvExample',
        message: '.env.example already exists. Append Novu variables?',
        initial: true,
      });
    } else {
      logger.blue('  i Novu variables seem to already exist in .env.example. Skipping prompt to update.');
      // Set default as if user chose not to update if variables are already there
      initialResponses.updateEnvExample = false;
    }
  }

  let additionalResponses = {};
  if (additionalPrompts.length > 0) {
    additionalResponses = await prompts(additionalPrompts);
    // If user cancels additional prompts
    for (const prompt of additionalPrompts) {
      if (additionalResponses[prompt.name] === undefined && prompt.type === 'confirm') {
        logger.warning(`\nCancelled prompt for ${prompt.name}. Proceeding with default/safe option.`);
      }
    }
  }
  
  return {
    ...initialResponses,
    ...additionalResponses,
    packageManager,
    // Set defaults if prompts were skipped or cancelled
    overwriteComponents: additionalResponses.overwriteComponents !== undefined ? additionalResponses.overwriteComponents : false,
    updateEnvExample: additionalResponses.updateEnvExample !== undefined ? additionalResponses.updateEnvExample : (initialResponses.framework === FRAMEWORKS.NEXTJS && !fileUtils.exists(envExamplePath)), // Default to true if file doesn't exist
  };
}

function installDependencies(framework, packageManager) {
  logger.gray('• Installing required packages...');

  const packagesToInstall = framework === FRAMEWORKS.NEXTJS ? '@novu/nextjs' : '@novu/react react-router-dom';
  const command = `${packageManager.name} ${packageManager.install} ${packagesToInstall}`;

  logger.gray(`  $ ${command}`);
  execSync(command, { stdio: 'inherit' });
  logger.success('  ✓ Dependencies installed successfully');
}

function removeSelf(packageManager) {
  try {
    // Check if we're running from the source directory
    const isSourceDir = __dirname === process.cwd();
    
    if (isSourceDir) {
      logger.blue('  • Running from source directory - skipping self-removal');
      logger.gray('    This is expected when testing locally.');
      return;
    }

    const command = `${packageManager.name} remove add-inbox`;
    logger.gray(`  $ ${command}`);
    execSync(command, { stdio: 'inherit' });
    logger.success('  ✓ Removed add-inbox package');
  } catch (error) {
    logger.warning('  • Could not remove add-inbox package automatically.');
    logger.gray('    You can manually remove it later if desired.');
  }
}

function displayNextSteps(framework) {
  const componentImportPath = './components/ui/inbox/NovuInbox';

  logger.blue('\n📝 Next Steps');
  logger.divider();

  logger.blue('1. Import the Inbox component:');
  logger.cyan(`   import NovuInbox from '${componentImportPath}';\n`);

  logger.blue('2. Configure your environment variables:');
  if (framework === FRAMEWORKS.NEXTJS) {
    logger.gray('   Ensure these are in your .env or .env.local file (and .env.example):');
    logger.cyan('   NEXT_PUBLIC_NOVU_APP_ID=your_app_id_here\n');
  } else {
    logger.gray('   Ensure these are available as environment variables (e.g., in .env file):');
    logger.cyan('   REACT_APP_NOVU_APP_ID=your_app_id_here (for Create React App)');
    logger.cyan('   VITE_NOVU_APP_ID=your_app_id_here (for Vite)\n');
  }

  logger.blue('3. Implement the getSubscriberId function:');
  logger.gray('   Open the NovuInbox component and implement the getSubscriberId function');
  logger.gray('   based on your chosen auth provider. Example implementations are provided in the code.\n');

  logger.blue('4. Use the component in your app:');
  logger.cyan('   <Inbox />\n');

  logger.blue('5. Get your Novu credentials:');
  logger.gray('   • Visit https://web.novu.co to create an account and application.');
  logger.gray('   • Find your Application Identifier in the Novu dashboard.\n');

  logger.blue('6. Customize your Inbox & learn more:');
  logger.gray('   • Styling:     ') + logger.cyan('https://docs.novu.co/platform/inbox/react/styling');
  logger.gray('   • Hooks:       ') + logger.cyan('https://docs.novu.co/platform/inbox/react/hooks');
  logger.gray('   • Localization:') + logger.cyan('https://docs.novu.co/platform/inbox/react/localization');
  logger.gray('   • Production:  ') + logger.cyan('https://docs.novu.co/platform/inbox/react/production\n');

  logger.success('🎉 You\'re all set! Happy coding with Novu! 🎉\n');
}

async function init() {
  logger.banner();

  logger.blue('🔍 Step 1: Detecting project configuration...');
  const config = await promptUserConfiguration();

  if (!config) {
    logger.yellow('\nInstallation cancelled.');
    return;
  }

  const { framework, packageManager, overwriteComponents, updateEnvExample } = config;
  logger.success(`  ✓ Detected framework: ${logger.bold(framework)}`);
  logger.success(`  ✓ Detected package manager: ${logger.bold(packageManager.name)}\n`);

  try {
    logger.blue('📦 Step 2: Checking package.json...');
    const packageJsonReady = await ensurePackageJson(packageManager);
    if (!packageJsonReady) {
      process.exit(1);
    }

    logger.blue('\n📦 Step 3: Installing dependencies...');
    installDependencies(framework, packageManager);

    logger.blue('\n📁 Step 4: Creating component structure...');
    createComponentStructure(framework, overwriteComponents);

    logger.blue('\n⚙️ Step 5: Setting up environment configuration...');
    if (framework === FRAMEWORKS.NEXTJS) {
      setupEnvExampleNextJs(updateEnvExample);
    } else {
      setupEnvExampleReact(updateEnvExample);
    }

    logger.success('\n✅ Installation completed successfully!\n');

    logger.blue('🧹 Step 6: Cleaning up...');
    removeSelf(packageManager);

    displayNextSteps(framework);

  } catch (error) {
    logger.error('\n❌ Error during installation:');
    if (error.message) {
      logger.error(`  Message: ${error.message}`);
    }
    if (error.stderr) {
      logger.error(`  Stderr: ${error.stderr.toString().trim()}`);
    }
    if (error.stdout) {
      logger.gray(`  Stdout: ${error.stdout.toString().trim()}`);
    }
    logger.warning('\nPlease check the error messages above. If the issue persists, consult the Novu documentation or seek support.');
    process.exit(1);
  }
}

// --- Entry Point ---
if (require.main === module) {
  init().catch((error) => {
    logger.error('\n❌ An unexpected error occurred:');
    logger.error(error);
    process.exit(1);
  });
}

module.exports = { init }; 