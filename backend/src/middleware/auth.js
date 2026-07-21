import jwt from 'jsonwebtoken';

// Using JWT_SECRET to match the token generation in authController.js
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'supersecret';

export const protect = (req, res, next) => {
  try {
    console.log('VERIFYING WITH:', JWT_SECRET)
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authorized, token missing or malformed' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Not authorized, token missing' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach the userId to the request object so subsequent routes can use it
    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    return res.status(401).json({ error: 'Not authorized, token invalid or expired' });
  }
};
