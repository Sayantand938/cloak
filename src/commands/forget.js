// src/commands/forget.js
import fs from 'node:fs';
import pc from 'picocolors';
import { existingKeyPath } from '../key-store.js';

export function forget() {
  const activePath = existingKeyPath();
  if (!activePath) {
    console.log(pc.yellow('ℹ️ No local configuration file found to delete.'));
    process.exit(0);
  }

  fs.unlinkSync(activePath);
  console.log(pc.green(`🗑️ Successfully deleted local key configuration file: ${activePath}`));
  console.log(pc.yellow('⚠️ Note: You must manually provide your master key or $ENV_KEY for future actions.'));
}
