const mongoose = require('mongoose');

const accessRequestSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  // The patient's login account that made the request
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital'
  },
  hospitalName: {
    type: String,
    required: true
  },
  doctorName: {
    type: String
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: String
  },
  reviewedAt: {
    type: Date
  },
  reviewNote: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('AccessRequest', accessRequestSchema);
