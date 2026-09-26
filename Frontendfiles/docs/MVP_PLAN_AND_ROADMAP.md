# Centralized Healthcare Record System (CHRS) — MVP Plan & Development Roadmap

## Overview

CHRS is a **Unified Medical Records System** where:
- **Hospitals** (paper-based or digital) push patient records to a central database
- **Patients** are identified by NIN (primary) or phone number (secondary, for those without NIN)
- **Registered hospitals** can pull records to access a patient’s full medical history across facilities
- **Doctors** (with unique IDs e.g. MDCN) have full access; **nurses** (e.g. RON) have limited access (vitals, etc.)
- **Admin** manages hospital registration, doctor onboarding, and revokes access when staff leave

---

## 1. Feature Breakdown

### Core Features (Must Have for MVP)

| # | Feature | Description | Actor |
|---|---------|-------------|-------|
| 1 | **Patient registration** | Register with NIN (primary) or phone number (secondary) | Hospital |
| 2 | **Patient lookup** | Fetch patient by NIN, phone, or email | Hospital |
| 3 | **Create/update medical record** | Add visit, diagnosis, vitals, notes; sync to central DB | Hospital (Doctor) |
| 4 | **Push records to CMRS** | Paper or digital → push to unified system | Hospital |
| 5 | **Pull records from CMRS** | Hospital checks local DB, fetches latest from CMRS before care | Hospital |
| 6 | **Hospital registration** | Register private/government hospitals; authorize access | Admin |
| 7 | **Doctor/Nurse management** | Add doctors (MDCN) and nurses (RON); revoke when they leave | Admin |
| 8 | **Role-based access** | Doctors: full record access; Nurses: limited (vitals); Admin: hospital/doctor management | System |
| 9 | **Landing page + Login** | Public landing; role-based login (Patient, Provider, Admin) | All |
| 10 | **Patient self-service** | Patient views own records (limited) | Patient |

### Extended Features (Post-MVP)

| # | Feature | Stage |
|---|---------|-------|
| 11 | NIN Service integration | Phase 2 |
| 12 | AI recommendations from patient records | Phase 2 |
| 13 | Audit logs & compliance | Phase 2 |
| 14 | World Health Organization / research integration | Phase 3 |
| 15 | Emergency access workflows | Phase 3 |
| 16 | Mobile app | Phase 3 |

---

## 2. Development Stages

### Stage 1 — MVP (8–12 weeks)

**Goal:** End-to-end flow: hospital registers → doctor adds patient → record pushed → another hospital pulls record.

| Sprint | Focus | Deliverables |
|--------|-------|--------------|
| **1–2** | Backend + DB | Node/Express API, MongoDB, schemas (Patient, Hospital, Doctor, Record) |
| **3** | Auth | JWT auth, role-based middleware (patient, provider, admin) |
| **4** | Patient + Record API | CRUD: create/update patient, create/update medical record, search by NIN/phone/email |
| **5** | Hospital + Doctor API | Hospital registration, doctor/nurse CRUD, hospital–doctor association |
| **6** | Frontend wiring | Replace mocks with API calls, add react-router, env config |
| **7** | Login + RBAC | Real login (NIN/phone for patient, staff ID for provider), protected routes |
| **8** | Polish & testing | Error handling, validation, basic tests |

### Stage 2 — Enhancements (6–8 weeks)

- NIN Service integration (mock or real)
- AI feature: learn from records, basic recommendations
- Audit trail
- Email/phone verification flows

### Stage 3 — Commercialization (Ongoing)

- WHO/research integration
- Advanced analytics
- Multi-tenancy, pricing, SLAs

---

## 3. MVP Architecture (Mapped to Your Diagram)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Existing Vite + React)                   │
│  Landing Page (Home) → Login → Dashboard (Patient | Provider | Admin)        │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CENTRAL MEDICAL RECORDS SERVICE (CMRS)                    │
│                         Node.js + Express REST API                           │
│                                                                             │
│  API:                                                                       │
│  • POST   /api/auth/login                                                   │
│  • POST   /api/patients              (create patient)                       │
│  • GET    /api/patients?nin=...&phone=...&email=...  (fetch by params)      │
│  • PATCH  /api/patients/:id          (update patient)                       │
│  • POST   /api/records               (add medical record)                   │
│  • GET    /api/patients/:id/records  (get patient records)                  │
│  • POST   /api/hospitals             (register hospital – admin)            │
│  • POST   /api/hospitals/:id/doctors (add doctor to hospital)               │
│  • DELETE /api/hospitals/:id/doctors/:doctorId (revoke doctor)              │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
             ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
             │   Hospital 1 │   │   Hospital 2 │   │  NIN Service │
             │  (push/pull) │   │  (push/pull) │   │  (Phase 2)   │
             └──────────────┘   └──────────────┘   └──────────────┘
                    │                   │
                    └───────────────────┼───────────────────┘
                                        ▼
                             ┌──────────────────────┐
                             │     MongoDB          │
                             │  patients, records,  │
                             │  hospitals, doctors  │
                             └──────────────────────┘
```

---

## 4. MongoDB Schema (Flexible Structure)

### Patient

```javascript
{
  _id: ObjectId,
  nin: String | null,           // Primary ID; null if no NIN
  phoneNumber: String,          // Secondary ID; required
  email: String | null,
  firstName: String,
  lastName: String,
  dateOfBirth: Date,
  bloodType: String,
  allergies: [String],
  createdAt: Date,
  updatedAt: Date
}
// Indexes: nin (unique, sparse), phoneNumber (unique), email (unique, sparse)
```

### Medical Record (Visit)

```javascript
{
  _id: ObjectId,
  patientId: ObjectId,
  hospitalId: ObjectId,
  doctorId: ObjectId,
  visitDate: Date,
  diagnosis: String,
  notes: String,
  vitals: {
    bloodPressure: String,
    temperature: Number,
    heartRate: Number,
    weight: Number
  },
  prescriptions: [String],
  createdAt: Date,
  updatedAt: Date
}
// Index: patientId + visitDate
```

### Hospital

```javascript
{
  _id: ObjectId,
  name: String,
  type: "private" | "government",
  address: String,
  state: String,
  registrationCode: String,     // Unique
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Doctor / Nurse (Staff)

```javascript
{
  _id: ObjectId,
  uniqueId: String,             // MDCN for doctors, RON for nurses
  role: "doctor" | "nurse",
  firstName: String,
  lastName: String,
  hospitalIds: [ObjectId],      // Hospitals they work at
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### User (for login)

```javascript
{
  _id: ObjectId,
  identifier: String,           // NIN, phone, or staff ID
  role: "patient" | "provider" | "admin",
  linkedPatientId: ObjectId | null,
  linkedStaffId: ObjectId | null,
  linkedHospitalId: ObjectId | null,  // for admin
  passwordHash: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 5. Landing Page & Login Flow

### Landing Page (Already Present)

- Hero: unified medical records
- Sections: Services, Features, Security, Contact
- “Who CMRS Serves”: Patients, Providers, Hospitals
- **Get Started** → go to Login (or direct to dashboard if session exists)

### Login Flow (Target Design)

| Role | Identifier | Flow |
|------|------------|------|
| **Patient** | NIN or Phone Number | 1) Select “Patient” 2) Enter NIN or phone 3) Optional: OTP or password 4) Redirect to Patient Dashboard |
| **Provider** | Staff ID (MDCN/RON) + Hospital | 1) Select “Provider” 2) Enter Staff ID 3) Select hospital (if multiple) 4) Redirect to Provider Dashboard |
| **Admin** | Admin credentials | 1) Select “Admin” 2) Username/password 3) Redirect to Admin Dashboard |

### Suggested Login UI Tweaks

- **Patient:** “National ID (NIN) or Phone Number” input; link “No NIN? Use phone number”
- **Provider:** “Staff ID (MDCN / RON)” input
- **Admin:** Separate admin login or “Admin Login” link with username/password

---

## 6. AI Feature (Phase 2)

### Concept

An AI layer that:
- Learns from patient records (diagnoses, vitals, allergies, visit patterns)
- Suggests follow-ups, drug interactions, or preventive care

### MVP AI Approach

1. **Data pipeline**
   - Aggregate anonymized or patient-specific structured data (diagnoses, meds, vitals)
   - Store in a format suitable for ML (JSON/Parquet)

2. **Recommendation engine (simple first)**
   - Rule-based: e.g. “patient has hypertension + no visit in 6 months → suggest follow-up”
   - Later: embeddings or small ML model trained on visit history

3. **Integration points**
   - Provider dashboard: “AI Suggestions” when viewing a patient
   - Patient dashboard: “Recommended follow-ups” (optional)
   - Admin: aggregate insights (e.g. common conditions, compliance)

4. **Tech options**
   - Python microservice (FastAPI) for ML
   - Or Node.js + TensorFlow.js for in-process inference
   - Keep training/offline, inference online

---

## 7. Project Structure (Recommended)

```
CHRS/
├── client/                    # Existing Vite + React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/          # login.tsx (existing)
│   │   │   ├── body/          # home, dashboard, provider, etc.
│   │   │   └── ui/
│   │   ├── api/               # ADD: API client (fetch/axios)
│   │   ├── context/           # ADD: AuthContext
│   │   ├── hooks/             # ADD: useAuth, usePatients
│   │   └── routes/            # ADD: react-router routes
│   └── ...
├── server/                    # ADD: Backend
│   ├── src/
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # auth, RBAC, validation
│   │   ├── services/          # business logic
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   └── MVP_PLAN_AND_ROADMAP.md (this file)
└── README.md
```

---

## 8. Quick Start — Backend Template

### 1. Initialize server

```bash
mkdir server && cd server
npm init -y
npm i express mongoose cors dotenv bcryptjs jsonwebtoken
npm i -D typescript @types/node @types/express ts-node nodemon
```

### 2. Basic `server/src/index.ts`

```typescript
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/chrs";
mongoose.connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.get("/health", (_, res) => res.json({ status: "ok" }));

// TODO: Mount routes
// app.use("/api/auth", authRoutes);
// app.use("/api/patients", patientRoutes);
// app.use("/api/records", recordRoutes);
// app.use("/api/hospitals", hospitalRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
```

### 3. Patient model (`server/src/models/Patient.ts`)

```typescript
import mongoose from "mongoose";

const PatientSchema = new mongoose.Schema({
  nin: { type: String, sparse: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  email: { type: String, sparse: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: Date,
  bloodType: String,
  allergies: [String],
}, { timestamps: true });

PatientSchema.index({ nin: 1 });
PatientSchema.index({ phoneNumber: 1 });
PatientSchema.index({ email: 1 });

export default mongoose.model("Patient", PatientSchema);
```

### 4. Create patient endpoint

```typescript
// POST /api/patients
router.post("/", async (req, res) => {
  const { nin, phoneNumber, email, firstName, lastName, dateOfBirth, bloodType, allergies } = req.body;
  if (!phoneNumber || !firstName || !lastName) {
    return res.status(400).json({ error: "phoneNumber, firstName, lastName required" });
  }
  const patient = await Patient.create({
    nin: nin || null,
    phoneNumber,
    email: email || null,
    firstName,
    lastName,
    dateOfBirth,
    bloodType,
    allergies: allergies || [],
  });
  res.status(201).json(patient);
});
```

---

## 9. Frontend API Client (Add to existing app)

```typescript
// client/src/api/client.ts
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function fetchPatient(params: { nin?: string; phone?: string; email?: string }) {
  const search = new URLSearchParams(params as Record<string, string>).toString();
  const res = await fetch(`${API_BASE}/patients?${search}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createPatient(data: PatientCreate) {
  const res = await fetch(`${API_BASE}/patients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

---

## 10. Summary — MVP Checklist

- [ ] Backend API (Node + Express)
- [ ] MongoDB + Patient, Record, Hospital, Doctor schemas
- [ ] Auth (JWT) + role middleware
- [ ] Patient CRUD + search by NIN/phone/email
- [ ] Medical record create/update + link to patient
- [ ] Hospital registration (admin)
- [ ] Doctor/nurse management + revoke
- [ ] Frontend: replace mocks with API, add react-router
- [ ] Login: real auth (NIN/phone for patient, staff ID for provider)
- [ ] Landing page: keep “Get Started” → Login

---

*This plan aligns with your architecture diagram and keeps the MVP focused on core record push/pull, patient identification, and hospital/doctor management.*
