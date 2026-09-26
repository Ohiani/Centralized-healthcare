const Patient = require('../models/Patient');
const Notification = require('../models/Notification');
const AccessRequest = require('../models/AccessRequest');

// Finds the Patient record for a patient login. If none is linked yet, links the
// record whose NIN or phone number matches the user's identifier (e.g. a patient
// a hospital registered before the patient created a login).
const findPatientForUser = async (user) => {
  let patient = await Patient.findOne({ userId: user._id });
  if (patient || !user.identifier) {
    return patient;
  }

  patient = await Patient.findOne({
    userId: { $exists: false },
    $or: [{ nin: user.identifier }, { phoneNumber: user.identifier }]
  });
  if (patient) {
    patient.userId = user._id;
    await patient.save();
  }
  return patient;
};

const notifyUser = (userId, title, message) => {
  if (!userId) return Promise.resolve();
  return Notification.create({ userId, title, message, time: new Date().toLocaleString('en-GB') })
    .catch((error) => console.error('Failed to create notification:', error.message));
};

// Tells the patient (if they have a login) who looked at their record
const notifyRecordAccess = (patient, req) => {
  if (!patient || !patient.userId) return;
  // A patient viewing their own record is not worth alerting on
  if (req.user && String(req.user._id) === String(patient.userId)) return;

  const accessor = req.hospital
    ? req.hospital.name
    : req.user
      ? `${req.user.name} (${req.user.role})`
      : null;
  if (!accessor) return;

  notifyUser(
    patient.userId,
    'Record Accessed',
    `${accessor} accessed your medical record on ${new Date().toLocaleString('en-GB')}.`
  );
};

const hasApprovedAccess = async (patientId) => {
  const approved = await AccessRequest.exists({ patientId, status: 'approved' });
  return Boolean(approved);
};

module.exports = { findPatientForUser, notifyUser, notifyRecordAccess, hasApprovedAccess };
