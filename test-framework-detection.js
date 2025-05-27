#!/usr/bin/env node

const { detectFramework } = require('./index.js');
const chalk = require('chalk');

console.log(chalk.bold.blue('\n🔍 Testing Framework Detection\n'));
console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

const framework = detectFramework();

console.log(chalk.bold('\nDetection Result:'));
if (framework === 'nextjs') {
  console.log(chalk.cyan('  → Detected as Next.js project'));
} else if (framework === 'react') {
  console.log(chalk.cyan('  → Detected as React project'));
} else {
  console.log(chalk.yellow('  → No framework detected'));
}

console.log(chalk.gray('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')); 