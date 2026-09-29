// crypto-utils.js
import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';

function getDerivedKey(masterKey, salt) {
    return crypto.pbkdf2Sync(masterKey, salt, 100000, 32, 'sha256');
}

export function encrypt(plainText, masterKey) {
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);
    const key = getDerivedKey(masterKey, salt);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return JSON.stringify({
        salt: salt.toString('hex'),
        iv: iv.toString('hex'),
        tag: authTag.toString('hex'),
        data: encrypted
    }, null, 2);
}

export function decrypt(cipherPayload, masterKey) {
    const { salt, iv, tag, data } = JSON.parse(cipherPayload);

    const key = getDerivedKey(masterKey, Buffer.from(salt, 'hex'));
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'));

    decipher.setAuthTag(Buffer.from(tag, 'hex'));

    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}