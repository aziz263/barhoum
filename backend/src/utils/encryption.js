const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');

// Clé de chiffrement (en production, utiliser une variable d'environnement)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
const IV_LENGTH = 16;

/**
 * Chiffrer un texte (pour les champs sensibles en base de données)
 */
const encryptField = (text) => {
  if (!text) return text;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'utf8').slice(0, 32), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

/**
 * Déchiffrer un texte
 */
const decryptField = (encryptedText) => {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
  try {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'utf8').slice(0, 32), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return encryptedText; // Return as-is if decryption fails
  }
};

/**
 * Chiffrer un fichier (pour les documents sensibles)
 */
const encryptFile = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'utf8').slice(0, 32), iv);

    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);

    // Écrire l'IV au début du fichier
    output.write(iv);

    input.pipe(cipher).pipe(output);

    output.on('finish', () => resolve());
    output.on('error', reject);
    input.on('error', reject);
  });
};

/**
 * Déchiffrer un fichier
 */
const decryptFile = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const input = fs.createReadStream(inputPath);
    let iv = null;
    let decipher = null;
    let output = null;
    let headerRead = false;

    input.on('readable', () => {
      if (!headerRead) {
        iv = input.read(IV_LENGTH);
        if (iv) {
          headerRead = true;
          decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'utf8').slice(0, 32), iv);
          output = fs.createWriteStream(outputPath);

          output.on('finish', () => resolve());
          output.on('error', reject);

          // Lire le reste et déchiffrer
          let chunk;
          while (null !== (chunk = input.read())) {
            output.write(decipher.update(chunk));
          }
        }
      } else {
        let chunk;
        while (null !== (chunk = input.read())) {
          output.write(decipher.update(chunk));
        }
      }
    });

    input.on('end', () => {
      if (decipher && output) {
        try {
          output.write(decipher.final());
        } catch (e) {
          // ignore
        }
        output.end();
      }
    });

    input.on('error', reject);
  });
};

/**
 * Calculer le hash SHA-256 d'un fichier
 */
const hashFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
};

module.exports = {
  encryptField,
  decryptField,
  encryptFile,
  decryptFile,
  hashFile,
};
