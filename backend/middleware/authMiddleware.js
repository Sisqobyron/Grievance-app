const userModel = require('../models/userModel');
const { verifyToken } = require('../utils/authToken');

const getLegacyUser = (token) => {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_LEGACY_AUTH_TOKENS !== 'true') {
    throw new Error('Legacy tokens are disabled');
  }

  const userJson = Buffer.from(token, 'base64').toString();
  return JSON.parse(userJson);
};

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    let tokenPayload;

    try {
      tokenPayload = verifyToken(token);
    } catch (tokenError) {
      tokenPayload = getLegacyUser(token);
    }

    userModel.findUserById(tokenPayload.sub || tokenPayload.id, (err, dbUser) => {
      if (err || !dbUser) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      req.user = userModel.sanitizeUser(dbUser);
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;