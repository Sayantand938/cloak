// src/commands/init.js
import fs from 'node:fs';
import crypto from 'node:crypto';
import pc from 'picocolors';
import { jsonPath, existingKeyPath } from '../key-store.js';

export function init(options) {
  const activePath = existingKeyPath();

  if (activePath && !options.force) {
    console.log(pc.red(`❌ A master key already exists at: ${activePath}`));
    console.log(pc.yellow(`💡 Use ${pc.bold('cloak init --force')} if you explicitly want to overwrite it.`));
    console.log(pc.red('🚨 WARNING: Overwriting your key makes previously encrypted files unreadable!'));
    process.exit(1);
  }

  const key = crypto.randomBytes(32).toString('hex');

  const configData = { master_key: key };
  fs.writeFileSync(jsonPath, JSON.stringify(configData, null, 2), 'utf8');

  console.log(`\n✨ ${pc.green(pc.bold('Success! Your environment manager is initialized.'))}`);
  console.log(`🔑 ${pc.cyan(pc.bold('Generated Master Key:'))} ${pc.gray(key)}`);
  console.log(`💾 ${pc.blue('Auto-saved to configuration file:')} ${pc.underline(jsonPath)}`);
}
