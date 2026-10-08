// src/commands/reveal.js
import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import { getMasterKey } from '../key-store.js';
import { decrypt } from '../crypto.js';

export async function reveal(options) {
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
  } catch {
    console.error(pc.red('❌ Decryption failed! Check your master key file or $ENV_KEY'));
    process.exit(1);
  }
}
