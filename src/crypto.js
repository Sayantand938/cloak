// src/crypto.js
// AES-256-GCM encryption/decryption utilities for cloak

import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const PBKDF2_ITERATIONS = 100_000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 32;
const DIGEST = 'sha256';

/**
 * Derives a 256-bit key from a master key and salt using PBKDF2.
 * @param {string} masterKey
 * @param {Buffer} salt
 * @returns {Buffer}
 */
function getDerivedKey(masterKey, salt) {
  return crypto.pbkdf2Sync(masterKey, salt, PBKDF2_ITERATIONS, KEY_LENGTH, DIGEST);
}

/**
 * Encrypts plain text using AES-256-GCM with a random salt and IV.
 * Returns a JSON string containing salt, iv, auth tag, and ciphertext.
 *
 * @param {string} plainText - The text to encrypt.
 * @param {string} masterKey - The master key (passphrase).
 * @returns {string} JSON-encoded cipher payload.
 */
export function encrypt(plainText, masterKey) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getDerivedKey(masterKey, salt);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return JSON.stringify({
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    tag: authTag.toString('hex'),
    data: encrypted,
  });
}

/**
 * Decrypts a cipher payload created by encrypt().
 *
 * @param {string} cipherPayload - JSON-encoded cipher payload.
 * @param {string} masterKey - The master key (passphrase).
 * @returns {string} Decrypted plain text.
 * @throws {Error} If decryption fails (wrong key, tampered data).
 */
export function decrypt(cipherPayload, masterKey) {
  const { salt, iv, tag, data } = JSON.parse(cipherPayload);

  const key = getDerivedKey(masterKey, Buffer.from(salt, 'hex'));
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(tag, 'hex'));

  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
