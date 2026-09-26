// Seeds demo data: two hospitals (matching the Hospital A/B demo portals) with staff,
// and one sample patient with records. Safe to run more than once.
//
//   npm run seed               create anything missing
//   npm run seed -- --new-keys also issue fresh API keys for the demo hospitals
//
// API keys are only printed when a hospital is created or its key is regenerated.
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Hospital = require('../src/models/Hospital');
const Staff = require('../src/models/Staff');
const Patient = require('../src/models/Patient');
const { generateApiKey } = require('../src/middleware/auth');

const DEMO_HOSPITALS = [
  {
    envVar: 'VITE_HOSPITAL_A_API_KEY',
    data: { name: 'City General Hospital', type: 'government', state: 'Lagos', address: '1 Marina Road, Lagos', registrationCode: 'HSP-DEMO-A' },
    staff: [
      { licenseNumber: 'MDCN-12345', name: 'Dr. Chinedu Okafor', role: 'doctor' },
      { licenseNumber: 'RON-11122', name: 'Nurse Bola Adeyemi', role: 'nurse' }
    ]
  },
  {
    envVar: 'VITE_HOSPITAL_B_API_KEY',
    data: { name: 'Metropolitan Medical Center', type: 'private', state: 'FCT', address: '12 Garki Way, Abuja', registrationCode: 'HSP-DEMO-B' },
    staff: [
      { licenseNumber: 'MDCN-33445', name: 'Dr. Ibrahim Yusuf', role: 'doctor' }
    ]
  }
];

const DEMO_PATIENT = {
  nin: '12345678901',
  phoneNumber: '+2348012345678',
  email: 'emmanuel.adebayo@example.com',
  firstName: 'Emmanuel',
  lastName: 'Adebayo',
  dateOfBirth: '1990-04-12',
  bloodType: 'O+',
  allergies: ['Penicillin'],
  recentVisits: [
    {
      id: 'r-seed-3', date: '2026-01-28', hospital: 'City General Hospital', doctor: 'Dr. Chinedu Okafor',
      diagnosis: 'Complete Blood Count (CBC)', status: 'Completed', recordType: 'lab',
      labResults: { WBC: '7.2 x 10^9/L', Hemoglobin: '14.5 g/dL', Platelets: '245 x 10^9/L' }
    },
    {
      id: 'r-seed-2', date: '2026-01-20', hospital: 'Metropolitan Medical Center', doctor: 'Dr. Ibrahim Yusuf',
      diagnosis: 'Upper Respiratory Tract Infection', status: 'Treated', recordType: 'prescription',
      prescriptions: [{ drug: 'Amoxicillin 500mg', dosage: '3x daily, 7 days' }]
    },
    {
      id: 'r-seed-1', date: '2025-12-10', hospital: 'City General Hospital', doctor: 'Dr. Chinedu Okafor',
      diagnosis: 'Hypertension - Initial Diagnosis', status: 'Ongoing', recordType: 'diagnosis',
      notes: 'Started lifestyle modification; review in 3 months.',
      vitals: { bloodPressure: '150/95', temperature: 36.8, heartRate: 82, weight: 84 }
    }
  ]
};

const run = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set. Copy .env.example to .env and fill it in.');
  }
  const newKeys = process.argv.includes('--new-keys');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected to ${mongoose.connection.host}/${mongoose.connection.name}\n`);

  const keyLines = [];
  for (const demo of DEMO_HOSPITALS) {
    let hospital = await Hospital.findOne({ registrationCode: demo.data.registrationCode });
    if (!hospital || newKeys) {
      const { apiKey, apiKeyHash, apiKeyPrefix } = generateApiKey();
      if (hospital) {
        hospital.apiKeyHash = apiKeyHash;
        hospital.apiKeyPrefix = apiKeyPrefix;
        await hospital.save();
        console.log(`New API key issued for ${hospital.name}`);
      } else {
        hospital = await Hospital.create({ ...demo.data, apiKeyHash, apiKeyPrefix });
        console.log(`Created hospital ${hospital.name}`);
      }
      keyLines.push(`${demo.envVar}=${apiKey}`);
    } else {
      console.log(`Hospital ${hospital.name} already exists (use --new-keys to issue a new API key)`);
    }

    for (const member of demo.staff) {
      await Staff.updateOne(
        { hospitalId: hospital._id, licenseNumber: member.licenseNumber },
        { $setOnInsert: { ...member, hospitalId: hospital._id } },
        { upsert: true }
      );
    }
  }

  if (await Patient.exists({ nin: DEMO_PATIENT.nin })) {
    console.log(`Sample patient NIN ${DEMO_PATIENT.nin} already exists`);
  } else {
    await Patient.create(DEMO_PATIENT);
    console.log(`Created sample patient ${DEMO_PATIENT.firstName} ${DEMO_PATIENT.lastName} (NIN ${DEMO_PATIENT.nin})`);
  }

  if (keyLines.length) {
    console.log('\nAdd these lines to Frontendfiles/.env, then restart the frontend:\n');
    console.log(keyLines.join('\n'));
    console.log('\nThese keys are not stored anywhere in readable form. Run "npm run seed -- --new-keys" if you lose them.');
  }
};

run()
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
