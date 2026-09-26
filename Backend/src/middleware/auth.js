const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Hospital = require('../models/Hospital');

const hashApiKey = (apiKey) => crypto.createHash('sha256').update(apiKey).digest('hex');

const generateApiKey = () => {
  const apiKey = 'chrs_' + crypto.randomBytes(24).toString('hex');
  return { apiKey, apiKeyHash: hashApiKey(apiKey), apiKeyPrefix: apiKey.slice(0, 12) };
};

// Returns the active hospital that owns the x-api-key header, or null
const findHospitalByApiKey = async (apiKey) => {
  const hospital = await Hospital.findOne({ apiKeyHash: hashApiKey(apiKey), isActive: true });
  if (hospital) {
    // Fire-and-forget: used by the admin dashboard to show which hospitals are syncing
    Hospital.updateOne({ _id: hospital._id }, { lastActivityAt: new Date() }).catch(() => {});
  }
  return hospital;
};

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Accepts either a hospital API key (x-api-key header) or a user JWT.
// Sets req.hospital for API-key callers and req.user for JWT callers.
const authOrApiKey = async (req, res, next) => {
  const apiKey = req.header('x-api-key');
  if (!apiKey) {
    return auth(req, res, next);
  }

  try {
    const hospital = await findHospitalByApiKey(apiKey);
    if (!hospital) {
      return res.status(401).json({ message: 'Invalid or inactive API key' });
    }
    req.hospital = hospital;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or inactive API key' });
  }
};

// Optional auth - doesn't fail if no token, just adds user (or hospital) if present
const optionalAuth = async (req, res, next) => {
  try {
    const apiKey = req.header('x-api-key');
    if (apiKey) {
      const hospital = await findHospitalByApiKey(apiKey);
      if (hospital) {
        req.hospital = hospital;
      }
    }

    const authHeader = req.header('Authorization');
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      
      // Skip verification if JWT_SECRET is not set
      if (!process.env.JWT_SECRET) {
        return next();
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = user;
        req.token = token;
      }
    }
    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
};

module.exports = { auth, authOrApiKey, optionalAuth, generateApiKey, hashApiKey };
