const userModel = require('../models/userModel');
const { createToken } = require('../utils/authToken');
const { hashPassword, isHashedPassword, verifyPassword } = require('../utils/passwords');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  userModel.findUserByEmail(email, async (err, user) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    try {
      const passwordValid = await verifyPassword(password, user.password);

      if (!passwordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (!isHashedPassword(user.password)) {
        const upgradedPassword = await hashPassword(password);
        userModel.updatePassword(user.id, upgradedPassword, () => {});
      }

      const safeUser = userModel.sanitizeUser(user);
      const token = createToken(safeUser);

      res.json({ message: 'Login successful', user: safeUser, token });
    } catch (error) {
      res.status(500).json({ message: 'Authentication failed' });
    }
  });
};
