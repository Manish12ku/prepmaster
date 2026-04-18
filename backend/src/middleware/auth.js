const admin = require('../config/firebaseAdmin');
const User = require('../models/User');
const { isConnected } = require('../config/database');

// Mock users store for development
const mockUsers = new Map();

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Mock mode - skip Firebase verification
    if (process.env.SKIP_MONGODB === 'true') {
      // Decode token without verification for mock mode
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = Buffer.from(base64, 'base64').toString();
      const decodedToken = JSON.parse(jsonPayload);
      
      req.user = decodedToken;
      
      // Create or get mock user
      if (!mockUsers.has(decodedToken.uid)) {
        const isSuperAdmin = decodedToken.email === 'mankumishar0@gmail.com';
        mockUsers.set(decodedToken.uid, {
          _id: 'mock-' + decodedToken.uid,
          uid: decodedToken.uid,
          name: decodedToken.name || 'Test User',
          email: decodedToken.email || 'test@example.com',
          role: isSuperAdmin ? 'super_admin' : 'student',
          isBlocked: false
        });
      }
      
      req.dbUser = mockUsers.get(decodedToken.uid);
      return next();
    }
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    req.user = decodedToken;
    
    // Fetch database user to attach role information
    try {
      const dbUser = await User.findOne({ uid: decodedToken.uid });
      if (dbUser) {
        req.dbUser = dbUser;
      }
    } catch (err) {
      console.error('Error fetching database user:', err);
      // Continue without dbUser - some endpoints may not need it
    }
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Mock mode - use req.dbUser already set by verifyToken
      if (process.env.SKIP_MONGODB === 'true') {
        if (!req.dbUser) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        if (req.dbUser.isBlocked) {
          return res.status(403).json({ message: 'User is blocked' });
        }

        if (!roles.includes(req.dbUser.role)) {
          return res.status(403).json({ message: 'Insufficient permissions' });
        }
        
        return next();
      }

      const dbUser = await User.findOne({ uid: req.user.uid });
      
      if (!dbUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (dbUser.isBlocked) {
        return res.status(403).json({ message: 'User is blocked' });
      }

      if (!roles.includes(dbUser.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      req.dbUser = dbUser;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
};

module.exports = { verifyToken, requireRole };
