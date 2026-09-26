const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['government', 'private'],
    default: 'government'
  },
  state: {
    type: String,
    required: true
  },
  address: {
    type: String
  },
  registrationCode: {
    type: String,
    unique: true
  },
  // Only a SHA-256 hash of the API key is stored; the raw key is shown once on creation/regeneration
  apiKeyHash: {
    type: String,
    select: false,
    index: true
  },
  // First characters of the key, so admins can tell keys apart without seeing them
  apiKeyPrefix: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Updated whenever the hospital calls the API with its key
  lastActivityAt: {
    type: Date
  }
}, { timestamps: true });

hospitalSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.apiKeyHash;
    return ret;
  }
});

module.exports = mongoose.model('Hospital', hospitalSchema);
