const userModel = require('../models/userModel');

const authMiddleware = (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // In a real application, you would verify a JWT token here
    // For now, we'll just check if the user exists in the database
    const userJson = Buffer.from(token, 'base64').toString();
    const user = JSON.parse(userJson);

    userModel.findUserById(user.id, (err, dbUser) => {
      if (err || !dbUser) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      // Add user data to request object
      req.user = dbUser;
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;