#!/usr/bin/env node
// cli.js
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { Command } from 'commander';
import * as yaml from 'js-yaml';
import pc from 'picocolors';
import dotenv from 'dotenv';
import { password } from '@inquirer/prompts';
import { encrypt, decrypt } from '../crypto-utils.js';

const program = new Command();
const homeDir = os.homedir();
const yamlPath = path.join(homeDir, '.env-encrypter.yaml');
const jsonPath = path.join(homeDir, '.env-encrypter.json');

// Check if a master key exists anywhere on the system
function existingKeyPath() {
    if (fs.existsSync(yamlPath)) {
        try {
            const doc = yaml.load(fs.readFileSync(yamlPath, 'utf8'));
            if (doc?.master_key) return yamlPath;
        } catch { }
    }
    if (fs.existsSync(jsonPath)) {
        try {
            const doc = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            if (doc?.master_key) return jsonPath;
        } catch { }
    }
    return null;
}

// Resolve key from YAML, JSON, ENV_KEY, or Interactive Prompt
async function getMasterKey() {
    const activePath = existingKeyPath();

    if (activePath === yamlPath) {
        const doc = yaml.load(fs.readFileSync(yamlPath, 'utf8'));
        return doc.master_key.trim();
    }

    if (activePath === jsonPath) {
        const doc = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        return doc.master_key.trim();
    }

    if (process.env.ENV_KEY) {
        return process.env.ENV_KEY.trim();
    }

    console.log(pc.yellow('⚠️ Master key not found in configuration files or \$ENV_KEY.'));
    return await password({ message: 'Enter your Master Key:' });
}

program
    .name('env-encrypter')
    .description('In-memory encrypted environment variable manager')
    .version('1.3.0');

// Command: init
program
    .command('init')
    .description('Initialize setup and generate a secure master key')
    .option('--force', 'Force generate and overwrite the existing master key')
    .action((options) => {
        const activePath = existingKeyPath();

        if (activePath && !options.force) {
            console.log(pc.red(`❌ A master key already exists at: ${activePath}`));
            console.log(pc.yellow(`💡 Use ${pc.bold('env-encrypter init --force')} if you explicitly want to overwrite it.`));
            console.log(pc.red(`🚨 WARNING: Overwriting your key makes previously encrypted files unreadable!`));
            process.exit(1);
        }

        const key = crypto.randomBytes(32).toString('hex');

        const configData = { master_key: key };
        fs.writeFileSync(jsonPath, JSON.stringify(configData, null, 2), 'utf8');

        console.log(`\n✨ ${pc.green(pc.bold('Success! Your environment manager is initialized.'))}`);
        console.log(`🔑 ${pc.cyan(pc.bold('Generated Master Key:'))} ${pc.gray(key)}`);
        console.log(`💾 ${pc.blue('Auto-saved to configuration file:')} ${pc.underline(jsonPath)}`);
    });

// Command: forget
program
    .command('forget')
    .description('Safely delete the local master key configuration file')
    .action(() => {
        const activePath = existingKeyPath();
        if (!activePath) {
            console.log(pc.yellow('ℹ️ No local configuration file found to delete.'));
            process.exit(0);
        }

        fs.unlinkSync(activePath);
        console.log(pc.green(`🗑️ Successfully deleted local key configuration file: ${activePath}`));
        console.log(pc.yellow('⚠️ Note: You must manually provide your master key or \$ENV_KEY for future actions.'));
    });

// Command: seal
program
    .command('seal')
    .description('Encrypt a .env file into a secure .env.enc file')
    .option('-f, --file <path>', 'Path to input env file', '.env')
    .option('-o, --out <path>', 'Path to output file', '.env.enc')
    .action(async (options) => {
        const masterKey = await getMasterKey();
        const envPath = path.resolve(process.cwd(), options.file);
        const outPath = path.resolve(process.cwd(), options.out);

        if (!fs.existsSync(envPath)) {
            console.error(pc.red(`❌ Source file not found: ${envPath}`));
            process.exit(1);
        }

        const plainEnv = fs.readFileSync(envPath, 'utf8');
        const encryptedData = encrypt(plainEnv, masterKey);

        fs.writeFileSync(outPath, encryptedData, 'utf8');
        console.log(pc.green(`✅ Sealed ${options.file} -> ${options.out}`));
    });

// Command: set <key> <value>
program
    .command('set')
    .description('Add or update a variable inside the encrypted file directly')
    .argument('<key>', 'The environment variable name (e.g. PORT)')
    .argument('<value>', 'The value to assign')
    .option('-f, --file <path>', 'Path to encrypted env file', '.env.enc')
    .action(async (key, value, options) => {
        const masterKey = await getMasterKey();
        const encPath = path.resolve(process.cwd(), options.file);

        let currentEnvStr = '';
        if (fs.existsSync(encPath)) {
            try {
                const encryptedPayload = fs.readFileSync(encPath, 'utf8');
                currentEnvStr = decrypt(encryptedPayload, masterKey);
            } catch {
                console.error(pc.red('❌ Decryption failed! Cannot open file to modify it.'));
                process.exit(1);
            }
        }

        // Parse existing, update value, and reconstruct string safely
        const parsed = dotenv.parse(currentEnvStr);
        parsed[key.toUpperCase()] = value;

        const updatedEnvStr = Object.entries(parsed)
            .map(([k, v]) => `${k}="${v.replace(/"/g, '\\"')}"`)
            .join('\n') + '\n';

        const encryptedData = encrypt(updatedEnvStr, masterKey);
        fs.writeFileSync(encPath, encryptedData, 'utf8');
        console.log(pc.green(`🚀 Successfully set [${key.toUpperCase()}] in memory and re-sealed ${options.file}`));
    });

// Command: reveal
program
    .command('reveal')
    .description('Decrypt and view the contents of a .env.enc file in the terminal')
    .option('-f, --file <path>', 'Path to encrypted env file', '.env.enc')
    .action(async (options) => {
        const masterKey = await getMasterKey();
        const encPath = path.resolve(process.cwd(), options.file);

        if (!fs.existsSync(encPath)) {
            console.error(pc.red(`❌ Encrypted file not found: ${encPath}`));
            process.exit(1);
        }

        try {
            const encryptedPayload = fs.readFileSync(encPath, 'utf8');
            const decryptedEnvStr = decrypt(encryptedPayload, masterKey);

            console.log(`\n🔓 ${pc.green(pc.bold('Decrypted Environment Variables:'))}`);
            console.log(pc.cyan('--------------------------------------------'));
            console.log(decryptedEnvStr.trim());
            console.log(pc.cyan('--------------------------------------------\n'));
        } catch (err) {
            console.error(pc.red('❌ Decryption failed! Check your master key file or \$ENV_KEY'));
            process.exit(1);
        }
    });

// Command: run
program
    .command('run')
    .description('Decrypt .env.enc in RAM and execute a command')
    .option('-f, --file <path>', 'Path to encrypted env file', '.env.enc')
    .argument('<cmd...>', 'Command and arguments to run (e.g. node index.js)')
    .action(async (cmd, options) => {
        const masterKey = await getMasterKey();
        const encPath = path.resolve(process.cwd(), options.file);

        if (!fs.existsSync(encPath)) {
            console.error(pc.red(`❌ Encrypted file not found: ${encPath}`));
            process.exit(1);
        }

        try {
            const encryptedPayload = fs.readFileSync(encPath, 'utf8');
            const decryptedEnvStr = decrypt(encryptedPayload, masterKey);

            const parsedEnv = dotenv.parse(decryptedEnvStr);
            const mergedEnv = { ...process.env, ...parsedEnv };

            const [childCmd, ...childArgs] = cmd;

            const child = spawn(childCmd, childArgs, {
                env: mergedEnv,
                stdio: 'inherit',
                shell: true
            });

            child.on('exit', (code) => process.exit(code ?? 0));
        } catch (err) {
            console.error(pc.red('❌ Decryption failed! Check your master key file or \$ENV_KEY'));
            process.exit(1);
        }
    });

program.parse();
