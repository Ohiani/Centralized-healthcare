const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  hospital: {
    type: String,
    required: true
  },
  doctor: {
    type: String,
    required: true
  },
  diagnosis: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  recordType: {
    type: String,
    enum: ['diagnosis', 'lab', 'prescription', 'imaging', 'procedure'],
    default: 'diagnosis'
  },
  notes: {
    type: String
  },
  vitals: {
    bloodPressure: String,
    temperature: Number,
    heartRate: Number,
    weight: Number
  },
  labResults: {
    type: Map,
    of: String
  },
  prescriptions: [{
    drug: String,
    dosage: String
  }],
  imagingFindings: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  nin: {
    type: String,
    unique: true,
    sparse: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: String
  },
  bloodType: {
    type: String
  },
  allergies: [{
    type: String
  }],
  recentVisits: [visitSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search functionality
patientSchema.index({ firstName: 'text', lastName: 'text', nin: 'text', phoneNumber: 'text' });

module.exports = mongoose.model('Patient', patientSchema);
