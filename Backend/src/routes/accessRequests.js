/**
 * @swagger
 * /api/access-requests:
 *   get:
 *     summary: List access requests
 *     description: >
 *       Patients see only their own requests. Hospitals (API key) see requests addressed to them.
 *       Admins and providers see all requests.
 *     tags: [Access Requests]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *     responses:
 *       200:
 *         description: Access requests, newest first
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AccessRequest'
 *   post:
 *     summary: Patient requests access to their full medical history
 *     description: The logged-in user must be a patient whose account is linked to a patient record (by NIN or phone number).
 *     tags: [Access Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               hospitalId:
 *                 type: string
 *                 description: ID of a registered hospital (or send hospitalName instead)
 *               hospitalName:
 *                 type: string
 *               doctorName:
 *                 type: string
 *               reason:
 *                 type: string
 *                 example: Personal records / Download report
 *     responses:
 *       201:
 *         description: Request created
 *       400:
 *         description: Missing fields, or no patient record linked to this account
 */

/**
 * @swagger
 * /api/access-requests/{id}/approve:
 *   put:
 *     summary: Approve a patient's access request
 *     description: The patient is notified and can then view and download their full history.
 *     tags: [Access Requests]
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated request
 *       404:
 *         description: Request not found
 */

/**
 * @swagger
 * /api/access-requests/{id}/reject:
 *   put:
 *     summary: Reject a patient's access request
 *     tags: [Access Requests]
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated request
 *       404:
 *         description: Request not found
 */

const express = require('express');
const router = express.Router();
const { auth, authOrApiKey } = require('../middleware/auth');
const AccessRequest = require('../models/AccessRequest');
const Hospital = require('../models/Hospital');
const { findPatientForUser, notifyUser } = require('../services/patientAccess');

const withPatientName = (request) => {
  const json = request.toJSON();
  const patient = request.patientId;
  if (patient && patient.firstName) {
    json.patientName = `${patient.firstName} ${patient.lastName}`;
    json.patientNin = patient.nin;
    json.patientId = patient._id;
  }
  return json;
};

// GET /api/access-requests
router.get('/', authOrApiKey, async (req, res) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;

    if (req.hospital) {
      query.hospitalId = req.hospital._id;
    } else if (req.user.role === 'patient') {
      query.userId = req.user._id;
    }

    const requests = await AccessRequest.find(query)
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('patientId', 'firstName lastName nin');
    res.json(requests.map(withPatientName));
  } catch (error) {
    console.error('Error fetching access requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/access-requests
router.post('/', auth, async (req, res) => {
  try {
    const { hospitalId, doctorName, reason } = req.body;
    let { hospitalName } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'reason is required' });
    }

    const patient = await findPatientForUser(req.user);
    if (!patient) {
      return res.status(400).json({
        message: 'No patient record is linked to this account. Log in with the NIN or phone number your hospital registered.'
      });
    }

    if (hospitalId) {
      const hospital = await Hospital.findById(hospitalId);
      if (!hospital) {
        return res.status(400).json({ message: 'Hospital not found' });
      }
      hospitalName = hospital.name;
    }
    if (!hospitalName) {
      return res.status(400).json({ message: 'hospitalId or hospitalName is required' });
    }

    const request = await AccessRequest.create({
      patientId: patient._id,
      userId: req.user._id,
      hospitalId: hospitalId || undefined,
      hospitalName,
      doctorName,
      reason
    });
    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating access request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

const review = (status) => async (req, res) => {
  try {
    const request = await AccessRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Access request not found' });
    }
    if (req.hospital && String(request.hospitalId) !== String(req.hospital._id)) {
      return res.status(403).json({ message: 'This request was not sent to your hospital' });
    }

    request.status = status;
    request.reviewedBy = req.hospital ? req.hospital.name : req.user.name;
    request.reviewedAt = new Date();
    request.reviewNote = req.body?.note;
    await request.save();

    notifyUser(
      request.userId,
      status === 'approved' ? 'Access Request Approved' : 'Access Request Rejected',
      status === 'approved'
        ? `${request.reviewedBy} approved your request. You can now view and download your full medical history.`
        : `${request.reviewedBy} rejected your request${request.reviewNote ? `: ${request.reviewNote}` : '.'}`
    );

    res.json(request);
  } catch (error) {
    console.error('Error reviewing access request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/access-requests/:id/approve
router.put('/:id/approve', authOrApiKey, review('approved'));

// PUT /api/access-requests/:id/reject
router.put('/:id/reject', authOrApiKey, review('rejected'));

module.exports = router;
