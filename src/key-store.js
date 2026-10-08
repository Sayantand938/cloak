// src/key-store.js
// Master key resolution: checks YAML, JSON, ENV_KEY, interactive prompt

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import * as yaml from 'js-yaml';
import pc from 'picocolors';
import { password } from '@inquirer/prompts';

export const homeDir = os.homedir();
export const yamlPath = path.join(homeDir, '.env-encrypter.yaml');
export const jsonPath = path.join(homeDir, '.env-encrypter.json');

/**
 * Returns the path of the first existing master-key config file,
 * or null if none is found.
 * @returns {string|null}
 */
export function existingKeyPath() {
  if (fs.existsSync(yamlPath)) {
    try {
      const doc = yaml.load(fs.readFileSync(yamlPath, 'utf8'));
      if (doc?.master_key) return yamlPath;
    } catch {
      // fall through
    }
  }
  if (fs.existsSync(jsonPath)) {
    try {
      const doc = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      if (doc?.master_key) return jsonPath;
    } catch {
      // fall through
    }
  }
  return null;
}

/**
 * Resolves the master key from config files, ENV_KEY, or interactive prompt.
 * @returns {Promise<string>}
 */
export async function getMasterKey() {
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

  console.log(pc.yellow('⚠️ Master key not found in configuration files or $ENV_KEY.'));
  return await password({ message: 'Enter your Master Key:' });
}
