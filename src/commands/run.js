// src/commands/run.js
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import pc from 'picocolors';
import dotenv from 'dotenv';
import { getMasterKey } from '../key-store.js';
import { decrypt } from '../crypto.js';

export async function run(cmd, options) {
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
      shell: true,
    });

    child.on('exit', (code) => process.exit(code ?? 0));
  } catch {
    console.error(pc.red('❌ Decryption failed! Check your master key file or $ENV_KEY'));
    process.exit(1);
  }
}
