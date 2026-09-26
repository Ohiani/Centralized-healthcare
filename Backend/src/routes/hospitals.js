/**
 * @swagger
 * /api/hospitals:
 *   get:
 *     summary: List registered hospitals
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hospitals with their staff counts (API keys are never returned here)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hospital'
 *       401:
 *         description: Not authenticated
 *   post:
 *     summary: Register a hospital and issue its API key
 *     description: The raw API key is returned only in this response. Store it safely; it cannot be retrieved again (only regenerated).
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HospitalInput'
 *     responses:
 *       201:
 *         description: Hospital registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hospital:
 *                   $ref: '#/components/schemas/Hospital'
 *                 apiKey:
 *                   type: string
 *                   example: chrs_3f9a...
 *       400:
 *         description: Missing name or state
 */

/**
 * @swagger
 * /api/hospitals/me:
 *   get:
 *     summary: Get the hospital that owns the supplied API key
 *     description: Hospitals can call this to check their API key works.
 *     tags: [Hospitals]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: The calling hospital
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hospital'
 *       401:
 *         description: Missing, invalid or inactive API key
 */

/**
 * @swagger
 * /api/hospitals/{id}:
 *   get:
 *     summary: Get a hospital by ID
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hospital
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hospital'
 *       404:
 *         description: Hospital not found
 *   put:
 *     summary: Update a hospital (including activating/deactivating it)
 *     description: Setting isActive to false immediately disables the hospital's API key.
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/HospitalInput'
 *               - type: object
 *                 properties:
 *                   isActive:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Updated hospital
 *       404:
 *         description: Hospital not found
 */

/**
 * @swagger
 * /api/hospitals/{id}/api-key:
 *   post:
 *     summary: Regenerate a hospital's API key
 *     description: The old key stops working immediately. The new raw key is returned only in this response.
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: New API key
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hospital:
 *                   $ref: '#/components/schemas/Hospital'
 *                 apiKey:
 *                   type: string
 *       404:
 *         description: Hospital not found
 */

/**
 * @swagger
 * /api/hospitals/{id}/staff:
 *   get:
 *     summary: List doctors and nurses registered at a hospital
 *     description: Accessible to admins (JWT) or to the hospital itself (its own API key).
 *     tags: [Hospital Staff]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Staff'
 *       403:
 *         description: API key belongs to a different hospital
 *   post:
 *     summary: Register a doctor (MDCN) or nurse (RON) at a hospital
 *     tags: [Hospital Staff]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [licenseNumber, name]
 *             properties:
 *               licenseNumber:
 *                 type: string
 *                 example: MDCN-12345
 *               name:
 *                 type: string
 *                 example: Dr. Chinedu Okafor
 *               role:
 *                 type: string
 *                 enum: [doctor, nurse]
 *     responses:
 *       201:
 *         description: Staff member registered
 *       400:
 *         description: Missing fields or licence already registered at this hospital
 */

/**
 * @swagger
 * /api/hospitals/{id}/staff/{staffId}/revoke:
 *   put:
 *     summary: Revoke a staff member's access (e.g. when they leave the hospital)
 *     tags: [Hospital Staff]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated staff member
 *       404:
 *         description: Staff member not found
 */

/**
 * @swagger
 * /api/hospitals/{id}/staff/{staffId}/reactivate:
 *   put:
 *     summary: Restore a revoked staff member's access
 *     tags: [Hospital Staff]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated staff member
 *       404:
 *         description: Staff member not found
 */

const express = require('express');
const router = express.Router();
const { auth, authOrApiKey, generateApiKey } = require('../middleware/auth');
const Hospital = require('../models/Hospital');
const Staff = require('../models/Staff');

const generateRegistrationCode = () => 'HSP-' + Date.now().toString(36).toUpperCase();

// A hospital using its API key may only manage its own staff
const ensureOwnHospital = (req, res, next) => {
  if (req.hospital && String(req.hospital._id) !== req.params.id) {
    return res.status(403).json({ message: 'This API key cannot manage another hospital' });
  }
  next();
};

// GET /api/hospitals - List hospitals with staff counts
router.get('/', auth, async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ createdAt: -1 });
    const counts = await Staff.aggregate([
      { $group: { _id: '$hospitalId', total: { $sum: 1 }, active: { $sum: { $cond: ['$isActive', 1, 0] } } } }
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c]));

    res.json(hospitals.map((h) => ({
      ...h.toJSON(),
      staffCount: countMap.get(String(h._id))?.total || 0,
      activeStaffCount: countMap.get(String(h._id))?.active || 0
    })));
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/hospitals - Register hospital and issue API key
router.post('/', auth, async (req, res) => {
  try {
    const { name, type, state, address } = req.body;
    if (!name || !state) {
      return res.status(400).json({ message: 'name and state are required' });
    }

    const { apiKey, apiKeyHash, apiKeyPrefix } = generateApiKey();
    const hospital = await Hospital.create({
      name,
      type,
      state,
      address,
      registrationCode: generateRegistrationCode(),
      apiKeyHash,
      apiKeyPrefix
    });

    res.status(201).json({ hospital, apiKey });
  } catch (error) {
    console.error('Error creating hospital:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/hospitals/me - Hospital identified by API key
// NOTE: must be defined BEFORE /:id
router.get('/me', authOrApiKey, (req, res) => {
  if (!req.hospital) {
    return res.status(400).json({ message: 'Send the hospital API key in the x-api-key header' });
  }
  res.json(req.hospital);
});

// GET /api/hospitals/:id - Get hospital
router.get('/:id', auth, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    res.json(hospital);
  } catch (error) {
    console.error('Error fetching hospital:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/hospitals/:id - Update hospital
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = {};
    for (const field of ['name', 'type', 'state', 'address', 'isActive']) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const hospital = await Hospital.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    res.json(hospital);
  } catch (error) {
    console.error('Error updating hospital:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/hospitals/:id/api-key - Regenerate API key
router.post('/:id/api-key', auth, async (req, res) => {
  try {
    const { apiKey, apiKeyHash, apiKeyPrefix } = generateApiKey();
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, { apiKeyHash, apiKeyPrefix }, { new: true });
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    res.json({ hospital, apiKey });
  } catch (error) {
    console.error('Error regenerating API key:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/hospitals/:id/staff - List staff
router.get('/:id/staff', authOrApiKey, ensureOwnHospital, async (req, res) => {
  try {
    const staff = await Staff.find({ hospitalId: req.params.id }).sort({ createdAt: 1 });
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/hospitals/:id/staff - Register doctor/nurse
router.post('/:id/staff', authOrApiKey, ensureOwnHospital, async (req, res) => {
  try {
    const { licenseNumber, name, role } = req.body;
    if (!licenseNumber || !name) {
      return res.status(400).json({ message: 'licenseNumber and name are required' });
    }

    const hospital = await Hospital.exists({ _id: req.params.id });
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const staff = await Staff.create({ hospitalId: req.params.id, licenseNumber, name, role });
    res.status(201).json(staff);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This licence number is already registered at this hospital' });
    }
    console.error('Error adding staff:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

const setStaffActive = (isActive) => async (req, res) => {
  try {
    const staff = await Staff.findOneAndUpdate(
      { _id: req.params.staffId, hospitalId: req.params.id },
      { isActive, revokedAt: isActive ? null : new Date() },
      { new: true }
    );
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.json(staff);
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/hospitals/:id/staff/:staffId/revoke
router.put('/:id/staff/:staffId/revoke', authOrApiKey, ensureOwnHospital, setStaffActive(false));

// PUT /api/hospitals/:id/staff/:staffId/reactivate
router.put('/:id/staff/:staffId/reactivate', authOrApiKey, ensureOwnHospital, setStaffActive(true));

module.exports = router;
