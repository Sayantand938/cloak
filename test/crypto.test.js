// test/crypto.test.js — Basic encryption/decryption round-trip tests

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { encrypt, decrypt } from '../src/crypto.js';

const MASTER_KEY = 'test-master-key-1234567890abcdef';

describe('crypto module', () => {
  it('should encrypt and decrypt a simple string', () => {
    const original = 'HELLO="world"';
    const payload = encrypt(original, MASTER_KEY);
    const decrypted = decrypt(payload, MASTER_KEY);
    assert.equal(decrypted, original);
  });

  it('should encrypt and decrypt a multi-line .env file', () => {
    const original = `PORT=3000
DATABASE_URL="postgres://user:pass@localhost:5432/db"
SECRET_KEY="super-secret-value"`;
    const payload = encrypt(original, MASTER_KEY);
    const decrypted = decrypt(payload, MASTER_KEY);
    assert.equal(decrypted, original);
  });

  it('should produce different ciphertexts for the same plaintext (random salt/IV)', () => {
    const original = 'TEST="value"';
    const payload1 = encrypt(original, MASTER_KEY);
    const payload2 = encrypt(original, MASTER_KEY);
    assert.notEqual(payload1, payload2);
  });

  it('should throw on wrong key', () => {
    const original = 'HELLO="world"';
    const payload = encrypt(original, MASTER_KEY);
    assert.throws(() => decrypt(payload, 'wrong-key'), /unable to authenticate/i);
  });

  it('should handle empty string', () => {
    const original = '';
    const payload = encrypt(original, MASTER_KEY);
    const decrypted = decrypt(payload, MASTER_KEY);
    assert.equal(decrypted, original);
  });

  it('should handle special characters', () => {
    const original = 'PASSWORD="p@ssw0rd!$#%^&*()_+-=[]{}|;:,.<>?/~`"';
    const payload = encrypt(original, MASTER_KEY);
    const decrypted = decrypt(payload, MASTER_KEY);
    assert.equal(decrypted, original);
  });
});
