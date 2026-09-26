/**
 * @swagger
 * /api/ai/recommendations:
 *   post:
 *     summary: Generate AI diagnostic suggestions for a patient
 *     description: >
 *       The server loads the patient's records, builds the prompt and calls the configured AI provider
 *       (AI_PROVIDER in the backend .env: ollama, openai or mock). Local models on a CPU can take 30s or more.
 *       AI output is supplementary and must not replace clinical judgment.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patientId]
 *             properties:
 *               patientId:
 *                 type: string
 *               currentSymptoms:
 *                 type: string
 *                 example: Fever and headache for 3 days
 *     responses:
 *       200:
 *         description: Recommendation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 provider:
 *                   type: string
 *                 model:
 *                   type: string
 *                 recommendation:
 *                   $ref: '#/components/schemas/AIRecommendation'
 *       404:
 *         description: Patient not found
 *       503:
 *         description: AI provider unavailable (e.g. Ollama not running or model not installed)
 */

/**
 * @swagger
 * /api/ai/status:
 *   get:
 *     summary: Check whether the AI provider is reachable
 *     tags: [AI]
 *     security: []
 *     responses:
 *       200:
 *         description: Provider status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 provider:
 *                   type: string
 *                 model:
 *                   type: string
 *                 reachable:
 *                   type: boolean
 *                 modelInstalled:
 *                   type: boolean
 *                 note:
 *                   type: string
 */

const express = require('express');
const router = express.Router();
const { authOrApiKey } = require('../middleware/auth');
const Patient = require('../models/Patient');
const { getRecommendations, getStatus } = require('../services/ai');

// POST /api/ai/recommendations
router.post('/recommendations', authOrApiKey, async (req, res) => {
  const { patientId, currentSymptoms } = req.body;
  if (!patientId) {
    return res.status(400).json({ message: 'patientId is required' });
  }

  let patient;
  try {
    patient = await Patient.findById(patientId);
  } catch {
    patient = null;
  }
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  try {
    res.json(await getRecommendations(patient, currentSymptoms));
  } catch (error) {
    console.error('AI recommendation error:', error.message);
    res.status(503).json({ message: error.message });
  }
});

// GET /api/ai/status
router.get('/status', async (req, res) => {
  res.json(await getStatus());
});

module.exports = router;
