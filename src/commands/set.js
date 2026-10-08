// src/commands/set.js
import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import dotenv from 'dotenv';
import { getMasterKey } from '../key-store.js';
import { encrypt, decrypt } from '../crypto.js';

export async function setCommand(key, value, options) {
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

  // Parse existing env vars, update value, and reconstruct
  const parsed = dotenv.parse(currentEnvStr);
  parsed[key.toUpperCase()] = value;

  const updatedEnvStr =
    Object.entries(parsed)
      .map(([k, v]) => `${k}="${v.replace(/"/g, '\\"')}"`)
      .join('\n') + '\n';

  const encryptedData = encrypt(updatedEnvStr, masterKey);
  fs.writeFileSync(encPath, encryptedData, 'utf8');
  console.log(
    pc.green(
      `🚀 Successfully set [${key.toUpperCase()}] in memory and re-sealed ${options.file}`,
    ),
  );
}
