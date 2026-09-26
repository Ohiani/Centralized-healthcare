/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: System-wide statistics for the admin dashboard
 *     description: >
 *       Hospital status is "syncing" if the hospital used its API key in the last 24 hours,
 *       "idle" if it is active but quiet, and "offline" if an admin has deactivated it.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminStats'
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Patient = require('../models/Patient');
const Hospital = require('../models/Hospital');
const Staff = require('../models/Staff');
const AccessRequest = require('../models/AccessRequest');

const SYNC_WINDOW_MS = 24 * 60 * 60 * 1000;

const hospitalStatus = (hospital) => {
  if (!hospital.isActive) return 'offline';
  if (hospital.lastActivityAt && Date.now() - hospital.lastActivityAt.getTime() < SYNC_WINDOW_MS) return 'syncing';
  return 'idle';
};

// GET /api/admin/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const [totalPatients, recordAgg, hospitals, totalStaff, activeStaff, pendingAccessRequests] = await Promise.all([
      Patient.countDocuments(),
      Patient.aggregate([{ $group: { _id: null, total: { $sum: { $size: { $ifNull: ['$recentVisits', []] } } } } }]),
      Hospital.find().sort({ lastActivityAt: -1, createdAt: -1 }),
      Staff.countDocuments(),
      Staff.countDocuments({ isActive: true }),
      AccessRequest.countDocuments({ status: 'pending' })
    ]);

    res.json({
      totalPatients,
      totalRecords: recordAgg[0]?.total || 0,
      totalHospitals: hospitals.length,
      activeHospitals: hospitals.filter((h) => h.isActive).length,
      totalStaff,
      activeStaff,
      pendingAccessRequests,
      hospitals: hospitals.map((h) => ({
        id: h.id,
        name: h.name,
        state: h.state,
        status: hospitalStatus(h),
        lastActivityAt: h.lastActivityAt
      }))
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
