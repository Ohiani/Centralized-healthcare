/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Get all patients
 *     tags: [Patients]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search patients by name, NIN, or phone
 *       - in: query
 *         name: nin
 *         schema:
 *           type: string
 *         description: Filter by NIN
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: Filter by phone number
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter by email
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of patients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Patient'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patient data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/patients/search:
 *   get:
 *     summary: Search patient by nin, phone, or email
 *     tags: [Patients]
 *     parameters:
 *       - in: query
 *         name: nin
 *         schema:
 *           type: string
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patient found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/patients:
 *   post:
 *     summary: Create new patient
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nin:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *               bloodType:
 *                 type: string
 *               allergies:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Patient created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       400:
 *         description: Patient with this NIN already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/patients/{id}:
 *   put:
 *     summary: Update patient
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nin:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *               bloodType:
 *                 type: string
 *               allergies:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Patient updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/patients/{id}:
 *   delete:
 *     summary: Delete patient
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patient deleted
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/patients/{patientId}/records:
 *   post:
 *     summary: Add medical record to patient
 *     description: When called with a hospital API key, "hospital" defaults to that hospital's registered name.
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *               hospital:
 *                 type: string
 *               doctor:
 *                 type: string
 *               diagnosis:
 *                 type: string
 *               status:
 *                 type: string
 *               recordType:
 *                 type: string
 *                 enum: [diagnosis, lab, prescription, imaging, procedure]
 *               notes:
 *                 type: string
 *               vitals:
 *                 type: object
 *               labResults:
 *                 type: object
 *               prescriptions:
 *                 type: array
 *                 items:
 *                   type: object
 *               imagingFindings:
 *                 type: string
 *     responses:
 *       201:
 *         description: Record added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Visit'
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/patients/{patientId}/records:
 *   get:
 *     summary: Get all records for a patient
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Visit'
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/patients/me:
 *   get:
 *     summary: Get the logged-in patient's own record
 *     description: >
 *       Returns the patient record linked to this login (linked automatically by NIN or phone number).
 *       Medical records (recentVisits) are only included once a hospital or doctor has approved an access request.
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patient record plus access status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patient:
 *                   $ref: '#/components/schemas/Patient'
 *                 accessApproved:
 *                   type: boolean
 *       404:
 *         description: No patient record linked to this account
 */

/**
 * @swagger
 * /api/patients/me/report:
 *   get:
 *     summary: Download the logged-in patient's medical history as a PDF
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: No approved access request yet
 *       404:
 *         description: No patient record linked to this account
 */

/**
 * @swagger
 * /api/patients/{id}/report:
 *   get:
 *     summary: Download a patient's medical history as a PDF (providers and hospitals)
 *     tags: [Patients]
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
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Patient not found
 */

const express = require('express');
const router = express.Router();
const { auth, authOrApiKey, optionalAuth } = require('../middleware/auth');
const Patient = require('../models/Patient');
const { findPatientForUser, notifyRecordAccess, hasApprovedAccess } = require('../services/patientAccess');
const { streamPatientReport } = require('../services/report');

// GET /api/patients - Fetch patients with optional search
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { search, nin, phone, email } = req.query;
    
    let query = {};

    // Search by specific fields
    if (nin) {
      query.nin = nin;
    }
    if (phone) {
      query.phoneNumber = phone;
    }
    if (email) {
      query.email = email;
    }

    // Text search
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { nin: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const patients = await Patient.find(query).select('-recentVisits').limit(100);
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/patients/me - Logged-in patient's own record
// NOTE: /me routes must be defined BEFORE /:id
router.get('/me', auth, async (req, res) => {
  try {
    const patient = await findPatientForUser(req.user);
    if (!patient) {
      return res.status(404).json({ message: 'No patient record is linked to this account' });
    }

    const accessApproved = await hasApprovedAccess(patient._id);
    const json = patient.toJSON();
    if (!accessApproved) {
      delete json.recentVisits;
    }
    res.json({ patient: json, accessApproved });
  } catch (error) {
    console.error('Error fetching own patient record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/patients/me/report - Logged-in patient's PDF report
router.get('/me/report', auth, async (req, res) => {
  try {
    const patient = await findPatientForUser(req.user);
    if (!patient) {
      return res.status(404).json({ message: 'No patient record is linked to this account' });
    }
    if (!(await hasApprovedAccess(patient._id))) {
      return res.status(403).json({ message: 'Your access request has not been approved yet' });
    }
    streamPatientReport(patient, res);
  } catch (error) {
    console.error('Error generating own report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/patients/search - Search patient by nin, phone, or email
// NOTE: This route must be defined BEFORE /:id to avoid matching 'search' as an id
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { nin, phone, email } = req.query;
    
    if (!nin && !phone && !email) {
      return res.status(400).json({ message: 'At least one search parameter (nin, phone, or email) is required' });
    }
    
    let query = {};
    if (nin) query.nin = nin;
    if (phone) query.phoneNumber = phone;
    if (email) query.email = email;

    const patient = await Patient.findOne(query);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    notifyRecordAccess(patient, req);
    res.json(patient);
  } catch (error) {
    console.error('Error searching patient:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/patients/:id - Fetch patient by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    notifyRecordAccess(patient, req);
    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/patients/:id/report - PDF report for providers and hospitals
router.get('/:id/report', authOrApiKey, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    notifyRecordAccess(patient, req);
    streamPatientReport(patient, res);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/patients - Create new patient
router.post('/', async (req, res) => {
  try {
    const { nin, phoneNumber, email, firstName, lastName, dateOfBirth, bloodType, allergies } = req.body;

    // Check if patient with same NIN exists
    if (nin) {
      const existingPatient = await Patient.findOne({ nin });
      if (existingPatient) {
        return res.status(400).json({ message: 'Patient with this NIN already exists' });
      }
    }

    const patient = new Patient({
      nin,
      phoneNumber,
      email,
      firstName,
      lastName,
      dateOfBirth,
      bloodType,
      allergies: allergies || []
    });

    await patient.save();
    res.status(201).json(patient);
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/patients/:id - Update patient
router.put('/:id', auth, async (req, res) => {
  try {
    const { nin, phoneNumber, email, firstName, lastName, dateOfBirth, bloodType, allergies } = req.body;

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        nin,
        phoneNumber,
        email,
        firstName,
        lastName,
        dateOfBirth,
        bloodType,
        allergies,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/patients/:id - Delete patient
router.delete('/:id', auth, async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/patients/:patientId/records - Add medical record to patient
router.post('/:patientId/records', authOrApiKey, async (req, res) => {
  try {
    const { date, hospital, doctor, diagnosis, status, recordType, notes, vitals, labResults, prescriptions, imagingFindings } = req.body;

    const patient = await Patient.findById(req.params.patientId);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const newRecord = {
      id: 'r-' + Date.now(),
      date: date || new Date().toISOString().split('T')[0],
      hospital: hospital || req.hospital?.name,
      doctor: doctor || req.user?.name,
      diagnosis,
      status: status || 'Pending',
      recordType,
      notes,
      vitals,
      labResults,
      prescriptions,
      imagingFindings
    };

    patient.recentVisits.unshift(newRecord);
    patient.updatedAt = Date.now();
    await patient.save();

    res.status(201).json(newRecord);
  } catch (error) {
    console.error('Error adding record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/patients/:patientId/records - Get all records for a patient
router.get('/:patientId/records', optionalAuth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    notifyRecordAccess(patient, req);
    res.json(patient.recentVisits || []);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
