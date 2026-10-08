// src/commands/seal.js
import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import { getMasterKey } from '../key-store.js';
import { encrypt } from '../crypto.js';

export async function seal(options) {
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
}
