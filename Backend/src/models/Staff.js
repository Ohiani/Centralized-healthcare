const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  // MDCN number for doctors, RON number for nurses
  licenseNumber: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['doctor', 'nurse'],
    default: 'doctor'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  revokedAt: {
    type: Date
  }
}, { timestamps: true });

// The same licence can only be registered once per hospital
staffSchema.index({ hospitalId: 1, licenseNumber: 1 }, { unique: true });

module.exports = mongoose.model('Staff', staffSchema);
