const chalk = require('chalk');

const logger = {
  info: (message) => console.log(chalk.blue(message)),
  success: (message) => console.log(chalk.green(message)),
  warning: (message) => console.log(chalk.yellow(message)),
  error: (message) => console.log(chalk.red(message)),
  gray: (message) => console.log(chalk.gray(message)),
  cyan: (message) => console.log(chalk.cyan(message)),
  blue: (message) => console.log(chalk.blue(message)),
  yellow: (message) => console.log(chalk.yellow(message)),
  bold: (message) => chalk.bold(message),
  
  step: (number, title) => {
    console.log('\n' + chalk.blue(`📝 Step ${number}: ${title}`));
  },
  
  divider: () => {
    console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
  },
  
  banner: () => {
    console.log('\n');
    console.log('██╗███╗   ██╗██████╗  ██████╗ ██╗  ██╗');
    console.log('██║████╗  ██║██╔══██╗██╔═══██╗╚██╗██╔╝');
    console.log('██║██╔██╗ ██║██████╔╝██║   ██║ ╚███╔╝ ');
    console.log('██║██║╚██╗██║██╔══██╗██║   ██║ ██╔██╗ ');
    console.log('██║██║ ╚████║██████╔╝╚██████╔╝██╔╝ ██╗');
    console.log('╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝');
    console.log(chalk.bold('by Novu\n'));
    console.log(chalk.gray('This installer will help you set up the Novu Inbox component in your project.\n'));
  }
};

module.exports = logger; 