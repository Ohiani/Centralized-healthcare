// Seeds demo data: six hospitals with staff (the first two match the Hospital A/B demo
// portals) and five patients whose records span several hospitals. Safe to run more
// than once: existing hospitals, staff and patients (matched by NIN) are left alone.
// All names are fictional.
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
  },
  {
    data: { name: 'Unity Specialist Hospital', type: 'private', state: 'Kano', address: '7 Zaria Road, Kano', registrationCode: 'HSP-DEMO-C' },
    staff: [
      { licenseNumber: 'MDCN-44120', name: 'Dr. Aisha Bello', role: 'doctor' },
      { licenseNumber: 'RON-20731', name: 'Nurse Halima Sani', role: 'nurse' }
    ]
  },
  {
    data: { name: 'Riverside General Hospital', type: 'government', state: 'Rivers', address: '22 Aba Road, Port Harcourt', registrationCode: 'HSP-DEMO-D' },
    staff: [
      { licenseNumber: 'MDCN-51876', name: 'Dr. Tamuno Briggs', role: 'doctor' },
      { licenseNumber: 'MDCN-51902', name: 'Dr. Ebiere Johnson', role: 'doctor' }
    ]
  },
  {
    data: { name: 'Heritage Women & Children Hospital', type: 'private', state: 'Oyo', address: '5 Ring Road, Ibadan', registrationCode: 'HSP-DEMO-E' },
    staff: [
      { licenseNumber: 'MDCN-60233', name: 'Dr. Folake Adeyinka', role: 'doctor' },
      { licenseNumber: 'RON-31544', name: 'Nurse Kemi Ogunleye', role: 'nurse' }
    ]
  },
  {
    data: { name: 'Crescent Medical Centre', type: 'government', state: 'Enugu', address: '14 Ogui Road, Enugu', registrationCode: 'HSP-DEMO-F' },
    staff: [
      { licenseNumber: 'MDCN-72418', name: 'Dr. Obinna Eze', role: 'doctor' }
    ]
  }
];

const DEMO_PATIENTS = [{
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
},
{
  nin: '23456789012',
  phoneNumber: '+2348031122334',
  email: 'amina.ibrahim@example.com',
  firstName: 'Amina',
  lastName: 'Ibrahim',
  dateOfBirth: '1995-08-23',
  bloodType: 'A-',
  allergies: [],
  recentVisits: [
    {
      id: 'r-seed-4', date: '2026-08-14', hospital: 'Heritage Women & Children Hospital', doctor: 'Dr. Folake Adeyinka',
      diagnosis: 'Antenatal Checkup (28 weeks)', status: 'Completed', recordType: 'diagnosis',
      notes: 'Pregnancy progressing normally. Advised iron supplementation.',
      vitals: { bloodPressure: '118/76', temperature: 36.6, heartRate: 88, weight: 71 }
    },
    {
      id: 'r-seed-3', date: '2026-08-14', hospital: 'Heritage Women & Children Hospital', doctor: 'Dr. Folake Adeyinka',
      diagnosis: 'Obstetric Ultrasound', status: 'Completed', recordType: 'imaging',
      imagingFindings: 'Single live intrauterine fetus, 28 weeks gestation. Normal amniotic fluid volume. Placenta posterior, not low-lying.'
    },
    {
      id: 'r-seed-2', date: '2026-06-02', hospital: 'Unity Specialist Hospital', doctor: 'Dr. Aisha Bello',
      diagnosis: 'Full Blood Count', status: 'Completed', recordType: 'lab',
      labResults: { Hemoglobin: '10.4 g/dL', WBC: '6.8 x 10^9/L', Platelets: '210 x 10^9/L' }
    },
    {
      id: 'r-seed-1', date: '2026-06-02', hospital: 'Unity Specialist Hospital', doctor: 'Dr. Aisha Bello',
      diagnosis: 'Mild Iron-Deficiency Anaemia', status: 'Ongoing', recordType: 'prescription',
      prescriptions: [{ drug: 'Ferrous Sulphate 200mg', dosage: '1x daily, 3 months' }, { drug: 'Folic Acid 5mg', dosage: '1x daily' }]
    }
  ]
},
{
  nin: '34567890123',
  phoneNumber: '+2348055512345',
  email: 'chukwuemeka.obi@example.com',
  firstName: 'Chukwuemeka',
  lastName: 'Obi',
  dateOfBirth: '1968-11-02',
  bloodType: 'B+',
  allergies: ['Sulfa drugs'],
  recentVisits: [
    {
      id: 'r-seed-4', date: '2026-09-10', hospital: 'Crescent Medical Centre', doctor: 'Dr. Obinna Eze',
      diagnosis: 'Diabetes Follow-up', status: 'Ongoing', recordType: 'diagnosis',
      notes: 'Glycaemic control improving. Continue current medication; review in 3 months.',
      vitals: { bloodPressure: '138/88', temperature: 36.7, heartRate: 76, weight: 92 }
    },
    {
      id: 'r-seed-3', date: '2026-09-10', hospital: 'Crescent Medical Centre', doctor: 'Dr. Obinna Eze',
      diagnosis: 'HbA1c and Fasting Glucose', status: 'Completed', recordType: 'lab',
      labResults: { HbA1c: '7.4%', 'Fasting Glucose': '142 mg/dL', Creatinine: '1.0 mg/dL' }
    },
    {
      id: 'r-seed-2', date: '2026-03-18', hospital: 'City General Hospital', doctor: 'Dr. Chinedu Okafor',
      diagnosis: 'Type 2 Diabetes Mellitus', status: 'Ongoing', recordType: 'prescription',
      prescriptions: [{ drug: 'Metformin 500mg', dosage: '2x daily with meals' }]
    },
    {
      id: 'r-seed-1', date: '2025-11-05', hospital: 'City General Hospital', doctor: 'Dr. Chinedu Okafor',
      diagnosis: 'Cataract Extraction (Right Eye)', status: 'Completed', recordType: 'procedure',
      notes: 'Uncomplicated phacoemulsification with lens implant.'
    }
  ]
},
{
  nin: '45678901234',
  phoneNumber: '+2348067788990',
  email: 'tonye.george@example.com',
  firstName: 'Tonye',
  lastName: 'George',
  dateOfBirth: '2001-02-17',
  bloodType: 'O-',
  allergies: ['Peanuts'],
  recentVisits: [
    {
      id: 'r-seed-3', date: '2026-07-21', hospital: 'Riverside General Hospital', doctor: 'Dr. Tamuno Briggs',
      diagnosis: 'Left Wrist X-Ray', status: 'Completed', recordType: 'imaging',
      imagingFindings: 'Undisplaced fracture of the distal radius. No joint involvement.'
    },
    {
      id: 'r-seed-2', date: '2026-07-21', hospital: 'Riverside General Hospital', doctor: 'Dr. Tamuno Briggs',
      diagnosis: 'Distal Radius Fracture - Cast Applied', status: 'Treated', recordType: 'procedure',
      notes: 'Below-elbow cast applied. Review in 6 weeks.',
      vitals: { bloodPressure: '122/78', temperature: 36.9, heartRate: 90, weight: 68 }
    },
    {
      id: 'r-seed-1', date: '2026-02-09', hospital: 'Riverside General Hospital', doctor: 'Dr. Ebiere Johnson',
      diagnosis: 'Malaria (Uncomplicated)', status: 'Treated', recordType: 'prescription',
      prescriptions: [{ drug: 'Artemether/Lumefantrine 80/480mg', dosage: '2x daily, 3 days' }, { drug: 'Paracetamol 1g', dosage: 'as needed' }]
    }
  ]
},
{
  // Registered by phone number only (no NIN), as the system allows
  phoneNumber: '+2348099001122',
  email: 'zainab.musa@example.com',
  firstName: 'Zainab',
  lastName: 'Musa',
  dateOfBirth: '2016-05-30',
  bloodType: 'AB+',
  allergies: ['Penicillin', 'Dust mites'],
  recentVisits: [
    {
      id: 'r-seed-2', date: '2026-09-02', hospital: 'Unity Specialist Hospital', doctor: 'Dr. Aisha Bello',
      diagnosis: 'Asthma Exacerbation', status: 'Treated', recordType: 'prescription',
      notes: 'Mild exacerbation triggered by dust. Inhaler technique reviewed with parent.',
      prescriptions: [{ drug: 'Salbutamol Inhaler 100mcg', dosage: '2 puffs as needed' }, { drug: 'Prednisolone 20mg', dosage: '1x daily, 3 days' }],
      vitals: { temperature: 37.1, heartRate: 104, weight: 31 }
    },
    {
      id: 'r-seed-1', date: '2025-10-12', hospital: 'Heritage Women & Children Hospital', doctor: 'Dr. Folake Adeyinka',
      diagnosis: 'Childhood Asthma', status: 'Ongoing', recordType: 'diagnosis',
      notes: 'Recurrent wheeze since age 6. Started on preventer inhaler.'
    }
  ]
}];

const run = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set. Copy .env.example to .env and fill it in.');
  }
  const newKeys = process.argv.includes('--new-keys');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected to ${mongoose.connection.host}/${mongoose.connection.name}\n`);

  const keyLines = [];
  const otherKeys = [];
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
      if (demo.envVar) {
        keyLines.push(`${demo.envVar}=${apiKey}`);
      } else {
        otherKeys.push(`${hospital.name}: ${apiKey}`);
      }
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

  for (const demoPatient of DEMO_PATIENTS) {
    const label = demoPatient.nin ? `NIN ${demoPatient.nin}` : `phone ${demoPatient.phoneNumber}`;
    const existing = demoPatient.nin
      ? await Patient.exists({ nin: demoPatient.nin })
      : await Patient.exists({ phoneNumber: demoPatient.phoneNumber });
    if (existing) {
      console.log(`Sample patient ${label} already exists`);
    } else {
      await Patient.create(demoPatient);
      console.log(`Created sample patient ${demoPatient.firstName} ${demoPatient.lastName} (${label})`);
    }
  }

  if (keyLines.length) {
    console.log('\nAdd these lines to Frontendfiles/.env, then restart the frontend:\n');
    console.log(keyLines.join('\n'));
  }
  if (otherKeys.length) {
    console.log('\nAPI keys for the other demo hospitals (for Swagger or your own client):\n');
    console.log(otherKeys.join('\n'));
  }
  if (keyLines.length || otherKeys.length) {
    console.log('\nThese keys are not stored anywhere in readable form. Run "npm run seed -- --new-keys" if you lose them.');
  }
};

run()
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
