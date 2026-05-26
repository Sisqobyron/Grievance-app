const crypto = require('crypto');

const ITERATIONS = 16384;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';
const LEGACY_HASH_SEPARATOR = '$';

const createHash = (password, salt) => new Promise((resolve, reject) => {
  crypto.scrypt(password, salt, KEY_LENGTH, { N: ITERATIONS }, (error, derivedKey) => {
    if (error) {
      reject(error);
      return;
    }

    resolve(derivedKey.toString('hex'));
  });
});

const safeCompare = (left, right) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

exports.hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await createHash(password, salt);
  return ['scrypt', salt, hash].join(LEGACY_HASH_SEPARATOR);
};

exports.isHashedPassword = (value) => typeof value === 'string' && value.startsWith(`scrypt${LEGACY_HASH_SEPARATOR}`);

exports.verifyPassword = async (password, storedPassword) => {
  if (!storedPassword) {
    return false;
  }

  if (!exports.isHashedPassword(storedPassword)) {
    return safeCompare(password, storedPassword);
  }

  const [, salt, storedHash] = storedPassword.split(LEGACY_HASH_SEPARATOR);

  if (!salt || !storedHash) {
    return false;
  }

  const computedHash = await createHash(password, salt);
  return safeCompare(computedHash, storedHash);
};
