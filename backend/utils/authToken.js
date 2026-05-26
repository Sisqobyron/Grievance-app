const crypto = require('crypto');

const TOKEN_SEPARATOR = '.';
const TOKEN_TTL_SECONDS = Number(process.env.AUTH_TOKEN_TTL_SECONDS || 60 * 60 * 12);

const base64UrlEncode = (value) => Buffer.from(value)
  .toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/g, '');

const base64UrlDecode = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  return Buffer.from(padded, 'base64').toString('utf8');
};

const getSecret = () => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'development-only-auth-secret';
  }

  return null;
};

const sign = (payload) => {
  const secret = getSecret();

  if (!secret) {
    throw new Error('Missing JWT_SECRET environment variable');
  }

  return base64UrlEncode(
    crypto.createHmac('sha256', secret).update(payload).digest()
  );
};

exports.createToken = (user) => {
  const now = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({
    sub: user.id,
    role: user.role,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS
  });
  const encodedPayload = base64UrlEncode(payload);

  return `${encodedPayload}${TOKEN_SEPARATOR}${sign(encodedPayload)}`;
};

exports.verifyToken = (token) => {
  const [payloadPart, signaturePart] = token.split(TOKEN_SEPARATOR);

  if (!payloadPart || !signaturePart) {
    throw new Error('Malformed token');
  }

  const expectedSignature = sign(payloadPart);
  const receivedSignature = Buffer.from(signaturePart);
  const computedSignature = Buffer.from(expectedSignature);

  if (
    receivedSignature.length !== computedSignature.length ||
    !crypto.timingSafeEqual(receivedSignature, computedSignature)
  ) {
    throw new Error('Invalid token signature');
  }

  const payload = JSON.parse(base64UrlDecode(payloadPart));

  if (!payload.sub || !payload.exp) {
    throw new Error('Invalid token payload');
  }

  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }

  return payload;
};
