const userModel = require('../models/userModel');

exports.login = (req, res) => {
  const { email, password } = req.body;

  userModel.findUserByEmail(email, (err, user) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', user });
  });
};
