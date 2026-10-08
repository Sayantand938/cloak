#!/usr/bin/env node
// src/cli.js — Commander program setup and command registration

import { Command } from 'commander';
import { init } from './commands/init.js';
import { seal } from './commands/seal.js';
import { reveal } from './commands/reveal.js';
import { run } from './commands/run.js';
import { setCommand } from './commands/set.js';
import { forget } from './commands/forget.js';

const program = new Command();

program
  .name('cloak')
  .description('In-memory encrypted environment variable manager')
  .version('1.3.0');

// init
program
  .command('init')
  .description('Initialize setup and generate a secure master key')
  .option('--force', 'Force generate and overwrite the existing master key')
  .action(init);

// seal
program
  .command('seal')
  .description('Encrypt a .env file into a secure .env.enc file')
  .option('-f, --file <path>', 'Path to input env file', '.env')
  .option('-o, --out <path>', 'Path to output file', '.env.enc')
  .action(seal);

// reveal
program
  .command('reveal')
  .description('Decrypt and view the contents of a .env.enc file in the terminal')
  .option('-f, --file <path>', 'Path to encrypted env file', '.env.enc')
  .action(reveal);

// run
program
  .command('run')
  .description('Decrypt .env.enc in RAM and execute a command')
  .option('-f, --file <path>', 'Path to encrypted env file', '.env.enc')
  .argument('<cmd...>', 'Command and arguments to run (e.g. node index.js)')
  .action(run);

// set
program
  .command('set')
  .description('Add or update a variable inside the encrypted file directly')
  .argument('<key>', 'The environment variable name (e.g. PORT)')
  .argument('<value>', 'The value to assign')
  .option('-f, --file <path>', 'Path to encrypted env file', '.env.enc')
  .action(setCommand);

// forget
program
  .command('forget')
  .description('Safely delete the local master key configuration file')
  .action(forget);

program.parse();
