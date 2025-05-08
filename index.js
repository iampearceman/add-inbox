#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const prompts = require('prompts');
const chalk = require('chalk');

// --- Helper Functions ---

/**
 * Prompts the user for framework and package manager selection,
 * and for decisions on overwriting existing files/configurations.
 */
async function promptUserConfiguration() {
  const initialResponses = await prompts([
    {
      type: 'select',
      name: 'framework',
      message: 'What framework are you using?',
      choices: [
        { title: 'Next.js', value: 'nextjs' },
        { title: 'React (e.g., CRA, Vite)', value: 'react' },
      ],
    },
    {
      type: 'select',
      name: 'packageManager',
      message: 'Which package manager would you like to use?',
      choices: [
        { title: 'npm', value: { name: 'npm', install: 'install', init: 'init -y' } },
        { title: 'yarn', value: { name: 'yarn', install: 'add', init: 'init -y' } },
        { title: 'pnpm', value: { name: 'pnpm', install: 'add', init: 'init' } }, // pnpm init is interactive
      ],
    },
  ]);

  // If user cancels initial prompts
  if (!initialResponses.framework || !initialResponses.packageManager) {
    return null;
  }

  const additionalPrompts = [];
  const inboxComponentPath = path.join(process.cwd(), 'components', 'ui', 'inbox');
  if (fs.existsSync(inboxComponentPath)) {
    additionalPrompts.push({
      type: 'confirm',
      name: 'overwriteComponents',
      message: chalk.yellow(`The directory ${chalk.cyan(inboxComponentPath)} already exists. Overwrite?`),
      initial: false,
    });
  }

  const envExamplePath = path.join(process.cwd(), '.env.example');
  if (initialResponses.framework === 'nextjs' && fs.existsSync(envExamplePath)) {
    const envExampleContent = fs.readFileSync(envExamplePath, 'utf-8');
    if (!envExampleContent.includes('NEXT_PUBLIC_NOVU_APP_ID')) {
        additionalPrompts.push({
          type: 'confirm',
          name: 'updateEnvExample',
          message: chalk.yellow('.env.example already exists. Append Novu variables?'),
          initial: true,
        });
    } else {
        console.log(chalk.blue('  i Novu variables seem to already exist in .env.example. Skipping prompt to update.'));
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
             console.log(chalk.yellow(`\nCancelled prompt for ${prompt.name}. Proceeding with default/safe option.`));
        }
    }
  }
  
  return {
    ...initialResponses,
    ...additionalResponses,
    // Set defaults if prompts were skipped or cancelled
    overwriteComponents: additionalResponses.overwriteComponents !== undefined ? additionalResponses.overwriteComponents : false,
    updateEnvExample: additionalResponses.updateEnvExample !== undefined ? additionalResponses.updateEnvExample : (initialResponses.framework === 'nextjs' && !fs.existsSync(envExamplePath)), // Default to true if file doesn't exist
  };
}

/**
 * Ensures that a package.json file exists in the current directory.
 * If not, it prompts the user to initialize one.
 * @param {object} packageManager - The package manager object { name, init }
 * @returns {Promise<boolean>} True if package.json is ready, false otherwise.
 */
async function ensurePackageJson(packageManager) {
  const packagePath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packagePath)) {
    console.log(chalk.yellow('No package.json found.'));
    const { confirm } = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: `Initialize a new package.json using ${chalk.cyan(`${packageManager.name} ${packageManager.init}`)}?`,
      initial: true,
    });

    if (confirm) {
      try {
        console.log(chalk.gray(`  $ ${packageManager.name} ${packageManager.init}`));
        execSync(`${packageManager.name} ${packageManager.init}`, { stdio: 'inherit' });
        console.log(chalk.green('  ✓ package.json initialized.'));
      } catch (error) {
        console.error(chalk.red('  ✗ Failed to initialize package.json:'), error.message);
        console.log(chalk.cyan('  Please initialize it manually and try again.'));
        return false;
      }
    } else {
      console.log(chalk.red('  Installation cannot proceed without a package.json.'));
      return false;
    }
  }
  console.log(chalk.green('  ✓ package.json is ready.'));
  return true;
}

/**
 * Installs Novu dependencies based on the selected framework and package manager.
 * @param {string} framework - 'nextjs' or 'react'.
 * @param {object} packageManager - The package manager object { name, install }
 */
function installDependencies(framework, packageManager) {
  console.log(chalk.yellow('\n📦 Step 1: Installing Novu dependencies'));
  console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
  console.log(chalk.gray('• Installing required packages...'));

  const packagesToInstall = framework === 'nextjs' ? '@novu/nextjs' : '@novu/react react-router-dom';
  const command = `${packageManager.name} ${packageManager.install} ${packagesToInstall}`;

  console.log(chalk.gray(`  $ ${command}`));
  execSync(command, { stdio: 'inherit' });
  console.log(chalk.green('  ✓ Dependencies installed successfully'));
}

/**
 * Creates the Novu Inbox component file structure.
 * @param {string} framework - 'nextjs' or 'react'.
 * @param {boolean} overwrite - Whether to overwrite existing components.
 */
function createComponentStructure(framework, overwrite) {
  console.log(chalk.yellow('\n📁 Step 2: Setting up component structure'));
  console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

  const componentsBaseDir = 'components'; // Consider making this configurable in future
  const inboxRelativeDir = path.join('ui', 'inbox');
  const inboxDir = path.join(process.cwd(), componentsBaseDir, inboxRelativeDir);

  if (fs.existsSync(inboxDir) && !overwrite) {
    console.log(chalk.yellow(`  • Inbox component directory ${chalk.cyan(inboxDir)} already exists. Skipping creation.`));
    return;
  }

  if (fs.existsSync(inboxDir) && overwrite) {
    console.log(chalk.yellow(`  • Overwriting existing Inbox component directory: ${chalk.cyan(inboxDir)}`));
    fs.rmSync(inboxDir, { recursive: true, force: true });
  }

  fs.mkdirSync(inboxDir, { recursive: true });
  console.log(chalk.gray(`  • Created component directory structure at ${chalk.cyan(inboxDir)}`));

  console.log(chalk.gray('\n• Creating component files...'));
  const inboxComponentFilePath = path.join(inboxDir, 'novuInbox.tsx');
  const inboxComponentContent = generateInboxComponentContent(framework);
  fs.writeFileSync(inboxComponentFilePath, inboxComponentContent);
  console.log(chalk.green(`  ✓ Created ${chalk.cyan(path.join(inboxRelativeDir, 'novuInbox.tsx'))}`));
}

/**
 * Generates the content for the inbox.tsx component file.
 * @param {string} framework - 'nextjs' or 'react'.
 * @returns {string} The component code.
 */
function generateInboxComponentContent(framework) {
  if (framework === 'nextjs') {
    return `'use client';

import { Inbox } from '@novu/nextjs';
import { dark } from '@novu/nextjs/themes';
import { useTheme } from 'next-themes';

// The Novu inbox component is a React component that allows you to display a notification inbox.
// Learn more: https://docs.novu.co/platform/inbox/overview

const appId = process.env.NEXT_PUBLIC_NOVU_APP_ID;
const subscriberId = process.env.NEXT_PUBLIC_NOVU_SUBSCRIBER_ID;

if (!appId || !subscriberId) {
  throw new Error('Novu app ID and subscriber ID must be set');
}

const inboxConfig = {
  applicationIdentifier: appId, // The application identifier is used to identify the application that the inbox belongs to.
  subscriberId: subscriberId, // The subscriber ID is used to identify the subscriber that the inbox belongs to.
  appearance: {
    variables: {
      // The \`variables\` object allows you to define global styling properties that can be reused throughout the inbox.
      // Learn more: https://docs.novu.co/platform/inbox/react/styling#variables
    },
    elements: {
      // The \`elements\` object allows you to define styles for these components.
      // Learn more: https://docs.novu.co/platform/inbox/react/styling#elements
    }
  },
};

export default function NovuInbox() {
  const { resolvedTheme } = useTheme();

  return (
    <Inbox 
      {...inboxConfig} 
      appearance={{ 
        ...inboxConfig.appearance,
        baseTheme: resolvedTheme === 'dark' ? dark : undefined 
      }}
    />
  );
}`;
  }

  // React (CRA, Vite, etc.)
  return `import React from 'react';
import { Inbox } from '@novu/react';
import { useNavigate } from 'react-router-dom';

const appId = process.env.REACT_APP_NOVU_APP_ID || 
              process.env.VITE_NOVU_APP_ID || 
              process.env.NOVU_APP_ID;
const subscriberId = process.env.REACT_APP_NOVU_SUBSCRIBER_ID || 
                    process.env.VITE_NOVU_SUBSCRIBER_ID || 
                    process.env.NOVU_SUBSCRIBER_ID;

if (!appId || !subscriberId) {
  throw new Error('Novu app ID and subscriber ID must be set');
}

const inboxConfig = {
  applicationIdentifier: appId,
  subscriberId: subscriberId,
  appearance: {
    variables: {
      // The \`variables\` object allows you to define global styling properties that can be reused throughout the inbox.
      // Learn more: https://docs.novu.co/platform/inbox/react/styling#variables
    },
    elements: {
      // The \`elements\` object allows you to define styles for these components.
      // Learn more: https://docs.novu.co/platform/inbox/react/styling#elements
    }
  },
  hooks: {
    useNavigate: () => useNavigate(),
  },
};

export default function NovuInbox() {
  return (
    <Inbox {...inboxConfig} />
  );
}`;
}


/**
 * Creates or updates the .env.example file for Next.js projects.
 * @param {boolean} updateExisting - Whether to append to an existing .env.example.
 */
function setupEnvExampleNextJs(updateExisting) {
  console.log(chalk.gray('\n• Setting up environment configuration for Next.js...'));
  const envPath = path.join(process.cwd(), '.env.example');
  const envContentToAdd = `\n# Novu configuration (added by Novu Inbox Installer)
NEXT_PUBLIC_NOVU_APP_ID=your_novu_app_id_here
NEXT_PUBLIC_NOVU_SUBSCRIBER_ID=your_subscriber_id_here
`;

  if (fs.existsSync(envPath)) {
    const existingContent = fs.readFileSync(envPath, 'utf-8');
    if (existingContent.includes('NEXT_PUBLIC_NOVU_APP_ID=')) {
      console.log(chalk.blue('  • Novu variables (NEXT_PUBLIC_NOVU_APP_ID) already detected in .env.example. No changes made.'));
    } else if (updateExisting) {
      fs.appendFileSync(envPath, envContentToAdd);
      console.log(chalk.blue('  • Appended Novu configuration to existing .env.example'));
    } else {
      console.log(chalk.yellow('  • .env.example exists. Skipping modification as Novu variables were not found and appending was not confirmed.'));
      console.log(chalk.cyan('    Please manually add Novu variables to your .env.example:'));
      console.log(chalk.cyan('    NEXT_PUBLIC_NOVU_APP_ID=your_novu_app_id_here'));
      console.log(chalk.cyan('    NEXT_PUBLIC_NOVU_SUBSCRIBER_ID=your_subscriber_id_here'));
    }
  } else {
    fs.writeFileSync(envPath, envContentToAdd.trimStart()); // Remove leading newline if file is new
    console.log(chalk.blue('  • Created .env.example with Novu configuration'));
  }
  console.log(chalk.gray('    Remember to copy .env.example to .env (or .env.local) and fill in your credentials.'));
  console.log(chalk.gray('    Ensure .env or .env.local is in your .gitignore file.'));
}

/**
 * Displays the next steps and guidance to the user.
 * @param {string} framework - 'nextjs' or 'react'.
 */
function displayNextSteps(framework) {
  const componentImportPath = './components/ui/inbox/novuInbox'; // Updated import path

  console.log(chalk.bold.blue('\n📝 Next Steps'));
  console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

  console.log(chalk.blue('1. Import the Inbox component:'));
  console.log(chalk.cyan(`   import NovuInbox from '${componentImportPath}';\n`));

  console.log(chalk.blue('2. Configure your environment variables (or pass as props):'));
  if (framework === 'nextjs') {
    console.log(chalk.gray('   Ensure these are in your .env or .env.local file (and .env.example):'));
    console.log(chalk.cyan('   NEXT_PUBLIC_NOVU_APP_ID=your_app_id_here'));
    console.log(chalk.cyan('   NEXT_PUBLIC_NOVU_SUBSCRIBER_ID=your_subscriber_id_here\n'));
  } else {
    console.log(chalk.gray('   Ensure these are available as environment variables (e.g., in .env file):'));
    console.log(chalk.cyan('   REACT_APP_NOVU_APP_ID=your_app_id_here (for Create React App)'));
    console.log(chalk.cyan('   VITE_NOVU_APP_ID=your_app_id_here (for Vite)'));
    console.log(chalk.cyan('   REACT_APP_NOVU_SUBSCRIBER_ID=your_subscriber_id_here'));
    console.log(chalk.cyan('   VITE_NOVU_SUBSCRIBER_ID=your_subscriber_id_here'));
    console.log(chalk.gray('   Or pass them directly as props: applicationIdentifier="...", subscriberId="..."\n'));
  }

  console.log(chalk.blue('3. Use the component in your app:'));
  console.log(chalk.cyan('   <Inbox />'));
  console.log(chalk.gray('   (Ensure props or environment variables for applicationIdentifier and subscriberId are set)\n'));


  console.log(chalk.blue('4. Get your Novu credentials:'));
  console.log(chalk.gray('   • Visit https://web.novu.co to create an account and application.'));
  console.log(chalk.gray('   • Find your Application Identifier in the Novu dashboard.'));
  console.log(chalk.gray('   • Your Subscriber ID is the unique identifier for your users.\n'));

  console.log(chalk.blue('5. Customize your Inbox & learn more:'));
  console.log(chalk.gray('   • Styling:     ') + chalk.cyan('https://docs.novu.co/platform/inbox/react/styling'));
  console.log(chalk.gray('   • Hooks:       ') + chalk.cyan('https://docs.novu.co/platform/inbox/react/hooks'));
  console.log(chalk.gray('   • Localization:') + chalk.cyan('https://docs.novu.co/platform/inbox/react/localization'));
  console.log(chalk.gray('   • Production:  ') + chalk.cyan('https://docs.novu.co/platform/inbox/react/production\n'));

  console.log(chalk.bold.green('🎉 You\'re all set! Happy coding with Novu! 🎉\n'));
}


// --- Main Installation Logic ---
async function init() {
  console.log('\n');
  console.log('██╗███╗   ██╗██████╗  ██████╗ ██╗  ██╗');
  console.log('██║████╗  ██║██╔══██╗██╔═══██╗╚██╗██╔╝');
  console.log('██║██╔██╗ ██║██████╔╝██║   ██║ ╚███╔╝ ');
  console.log('██║██║╚██╗██║██╔══██╗██║   ██║ ██╔██╗ ');
  console.log('██║██║ ╚████║██████╔╝╚██████╔╝██╔╝ ██╗');
  console.log('╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝');
  console.log(chalk.bold('by Novu\n'));
  console.log(chalk.gray('This installer will help you set up the Novu Inbox component in your project.\n'));

  const config = await promptUserConfiguration();

  if (!config) {
    console.log(chalk.yellow('\nInstallation cancelled.'));
    return;
  }

  const { framework, packageManager, overwriteComponents, updateEnvExample } = config;

  try {
    const packageJsonReady = await ensurePackageJson(packageManager);
    if (!packageJsonReady) {
      process.exit(1);
    }

    installDependencies(framework, packageManager);
    createComponentStructure(framework, overwriteComponents);

    if (framework === 'nextjs') {
      setupEnvExampleNextJs(updateEnvExample);
    }

    console.log(chalk.green.bold('\n✅ Installation completed successfully!\n'));
    displayNextSteps(framework);

  } catch (error) {
    console.error(chalk.red('\n❌ Error during installation:'));
    if (error.message) {
        console.error(chalk.red(`  Message: ${error.message}`));
    }
    if (error.stderr) {
      console.error(chalk.red(`  Stderr: ${error.stderr.toString().trim()}`));
    }
    if (error.stdout) {
         console.error(chalk.gray(`  Stdout: ${error.stdout.toString().trim()}`));
    }
    // For more detailed debugging if needed:
    // console.error(error);
    console.log(chalk.yellow('\nPlease check the error messages above. If the issue persists, consult the Novu documentation or seek support.'));
    process.exit(1);
  }
}

// --- Entry Point ---
if (require.main === module) {
  init().catch((error) => {
    console.error(chalk.red('\n❌ An unexpected error occurred:'));
    console.error(error);
    process.exit(1);
  });
}

module.exports = { init, generateInboxComponentContent }; // Export for potential testing or programmatic use