import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

export function encrypt(text: string, secretKeyHex: string): string {
  if (!text) return '';
  if (!secretKeyHex || secretKeyHex.length !== 64) {
    throw new Error('Invalid key length. Hex encoded key must be exactly 64 characters (32 bytes).');
  }
  const key = Buffer.from(secretKeyHex, 'hex');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${tag}:${encrypted}`;
}

export function decrypt(encryptedText: string, secretKeyHex: string): string {
  if (!encryptedText) return '';
  if (!secretKeyHex || secretKeyHex.length !== 64) {
    throw new Error('Invalid key length. Hex encoded key must be exactly 64 characters (32 bytes).');
  }
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    return encryptedText; // Fallback if not encrypted
  }

  const [ivHex, tagHex, encryptedData] = parts;
  const key = Buffer.from(secretKeyHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
