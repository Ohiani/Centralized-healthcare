/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: User already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/auth/demo-login:
 *   post:
 *     summary: Demo login for testing (no password required)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [patient, provider, admin]
 *               name:
 *                 type: string
 *               identifier:
 *                 type: string
 *     responses:
 *       200:
 *         description: Demo login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { findPatientForUser } = require('../services/patientAccess');

// In-memory store for demo mode when MongoDB is unavailable
const inMemoryUsers = new Map();
let inMemoryCounter = 0;

// Track if MongoDB is connected
let isMongoConnected = false;

// Try to load models, but continue without them if MongoDB is unavailable
let User, Patient;
try {
  User = require('../models/User');
  Patient = require('../models/Patient');
  
  // Check mongoose connection status
  const mongoose = require('mongoose');
  mongoose.connection.on('connected', () => {
    isMongoConnected = true;
  });
  mongoose.connection.on('disconnected', () => {
    isMongoConnected = false;
  });
} catch (e) {
  console.warn('MongoDB models not available, using in-memory storage');
}

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register - Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, name, identifier, phoneNumber, nin, firstName, lastName, dateOfBirth, bloodType, allergies } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = new User({
      email,
      password,
      role,
      name,
      identifier,
      phoneNumber
    });
    await user.save();

    // If patient, also create patient record
    if (role === 'patient') {
      const patient = new Patient({
        userId: user._id,
        nin,
        phoneNumber: phoneNumber || '',
        email,
        firstName: firstName || name,
        lastName: lastName || '',
        dateOfBirth,
        bloodType,
        allergies: allergies || []
      });
      await patient.save();
    }

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        identifier: user.identifier
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password, role, name, identifier } = req.body;

    // If using mock/simple login (no password), just find or create user
    if (!password) {
      // Simple login mode - find user by email or create temporary session
      let user = await User.findOne({ email });
      
      if (!user) {
        // For demo purposes, allow login without password
        // In production, this should require password
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user._id);
      
      // Get associated patient if exists
      let patient = null;
      if (user.role === 'patient') {
        patient = await Patient.findOne({ userId: user._id });
      }

      return res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
          identifier: user.identifier
        },
        patient: patient ? {
          id: patient._id,
          nin: patient.nin,
          phoneNumber: patient.phoneNumber,
          firstName: patient.firstName,
          lastName: patient.lastName,
          bloodType: patient.bloodType,
          allergies: patient.allergies
        } : null
      });
    }

    // Regular password-based login
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // If role provided, verify it matches (for demo purposes)
    if (role && user.role !== role) {
      return res.status(400).json({ message: 'Invalid role for this user' });
    }

    const token = generateToken(user._id);

    // Get associated patient if exists
    let patient = null;
    if (user.role === 'patient') {
      patient = await Patient.findOne({ userId: user._id });
    }

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        identifier: user.identifier
      },
      patient: patient ? {
        id: patient._id,
        nin: patient.nin,
        phoneNumber: patient.phoneNumber,
        firstName: patient.firstName,
        lastName: patient.lastName,
        bloodType: patient.bloodType,
        allergies: patient.allergies
      } : null
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/demo-login - Demo login for testing (no password required)
// Works with or without MongoDB
router.post('/demo-login', async (req, res) => {
  const { role, name, identifier } = req.body;

  // Try MongoDB first, but fall back to in-memory if it fails
  if (User && Patient) {
    try {
      // Set a timeout for MongoDB operations
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('MongoDB timeout')), 3000)
      );
      
      const mongoPromise = (async () => {
        let user = await User.findOne({ role, identifier });
        if (!user) {
          user = new User({
            email: `${role}_${Date.now()}@demo.com`,
            password: 'demo123',
            role,
            name,
            identifier
          });
          await user.save();
        }
        return user;
      })();

      let user;
      try {
        user = await Promise.race([mongoPromise, timeoutPromise]);
      } catch (mongoError) {
        // MongoDB timed out or failed, will use in-memory below
        user = null;
      }

      if (user) {
        const token = generateToken(user._id);
        let patient = null;
        if (role === 'patient') {
          try {
            // Links the login to a hospital-registered record with the same NIN/phone
            patient = await findPatientForUser(user);
          } catch (e) {
            // Ignore
          }
        }

        return res.json({
          token,
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.name,
            identifier: user.identifier
          },
          patient: patient ? {
            id: patient._id,
            nin: patient.nin,
            phoneNumber: patient.phoneNumber,
            firstName: patient.firstName,
            lastName: patient.lastName,
            bloodType: patient.bloodType,
            allergies: patient.allergies
          } : null
        });
      }
    } catch (error) {
      console.log('MongoDB not available, using in-memory storage');
    }
  }

  // MongoDB not available - use in-memory storage
  try {
    const userKey = `${role}_${identifier || name}`;
    let user = inMemoryUsers.get(userKey);

    if (!user) {
      inMemoryCounter++;
      user = {
        id: `demo_${inMemoryCounter}`,
        email: `${role}_${Date.now()}@demo.com`,
        role,
        name,
        identifier: identifier || name
      };
      inMemoryUsers.set(userKey, user);
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        identifier: user.identifier
      },
      patient: null
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No token' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get associated patient if exists
    let patient = null;
    if (user.role === 'patient') {
      patient = await findPatientForUser(user);
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        identifier: user.identifier
      },
      patient: patient ? {
        id: patient._id,
        nin: patient.nin,
        phoneNumber: patient.phoneNumber,
        firstName: patient.firstName,
        lastName: patient.lastName,
        bloodType: patient.bloodType,
        allergies: patient.allergies
      } : null
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
