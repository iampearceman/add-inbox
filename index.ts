#!/usr/bin/env node

import path from 'path';
const cliPath = path.join(__dirname, 'src', 'cli', 'index.ts');
import(cliPath); 