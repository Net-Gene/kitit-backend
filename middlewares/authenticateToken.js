const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.cookies.auth_token;
  console.log('Token in request:', token); // Tämän pitäisi näyttää evästeen tunnus


  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
    req.user = user; // Liitä käyttäjätiedot pyyntöön

    next();
  });
};

module.exports = authenticateToken;
