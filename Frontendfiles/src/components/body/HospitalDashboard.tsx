import { useState } from "react";
import { Search, PlusCircle, Shield, Activity } from "../ui/icons";
import {
  createPatient,
  searchPatientByNIN,
  createRecord,
  fetchPatientById,
  type Patient,
  type RecordType,
} from "../../api/client";
import { AIRecommendationTool } from "../ui/AIRecommendationTool";

interface HospitalDashboardProps {
  hospitalName: string;
  // The hospital's CMRS API key. A real hospital would keep this in its own backend;
  // the demo portals read it from Frontendfiles/.env (printed by "npm run seed" in Backend).
  apiKey?: string;
  primaryColor: string;
  accentColor: string;
  bgGradient: string;
  buttonGradient: string;
}

// Hospital A Dashboard - Teal/Cyan Theme
export function HospitalADashboard() {
  return (
    <HospitalDashboardWrapper
      hospitalName="City General Hospital"
      apiKey={import.meta.env.VITE_HOSPITAL_A_API_KEY}
      primaryColor="teal"
      accentColor="emerald"
      bgGradient="from-teal-600 to-cyan-600"
      buttonGradient="from-teal-600 to-teal-700"
    />
  );
}

// Hospital B Dashboard - Indigo/Purple Theme
export function HospitalBDashboard() {
  return (
    <HospitalDashboardWrapper
      hospitalName="Metropolitan Medical Center"
      apiKey={import.meta.env.VITE_HOSPITAL_B_API_KEY}
      primaryColor="indigo"
      accentColor="violet"
      bgGradient="from-indigo-600 to-purple-600"
      buttonGradient="from-indigo-600 to-indigo-700"
    />
  );
}

// Record types from AddRecordScreen
const RECORD_TYPES: { id: RecordType; label: string }[] = [
  { id: "diagnosis", label: "Diagnosis / Checkup" },
  { id: "lab", label: "Lab Results" },
  { id: "prescription", label: "Prescription" },
  { id: "imaging", label: "Imaging (X-ray, MRI, etc.)" },
  { id: "procedure", label: "Procedure" },
];

function HospitalDashboardWrapper({
  hospitalName,
  apiKey,
  primaryColor,
  accentColor,
  bgGradient,
  buttonGradient,
}: HospitalDashboardProps) {
  const [activeTab, setActiveTab] = useState<"search" | "register" | "patient">(
    "search",
  );
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [showAddRecord, setShowAddRecord] = useState(false);

  // Search state
  const [searchNIN, setSearchNIN] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searching, setSearching] = useState(false);

  // Registration form state
  const [formData, setFormData] = useState({
    nin: "",
    phoneNumber: "",
    email: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    bloodType: "",
    allergies: "",
  });
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registering, setRegistering] = useState(false);

  // Add Record form state
  const [recordForm, setRecordForm] = useState({
    diagnosis: "",
    notes: "",
    bloodPressure: "",
    temperature: "",
    heartRate: "",
    weight: "",
    labResults: "",
    prescriptions: "",
    imagingFindings: "",
  });
  const [recordType, setRecordType] = useState<RecordType>("diagnosis");
  const [savingRecord, setSavingRecord] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchNIN.trim()) return;

    setSearching(true);
    setSearchError("");

    try {
      const result = await searchPatientByNIN(searchNIN.trim(), apiKey);
      if (result) {
        setViewingPatient(result);
        setActiveTab("patient");
      } else {
        setSearchError(
          "No patient found with this NIN. Please register the patient first.",
        );
      }
    } catch {
      setSearchError("Error searching for patient. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccess(false);
    setRegistering(true);

    try {
      const allergiesArray = formData.allergies
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a);

      const patientData = {
        nin: formData.nin || undefined,
        phoneNumber: formData.phoneNumber,
        email: formData.email || undefined,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth || undefined,
        bloodType: formData.bloodType || undefined,
        allergies: allergiesArray,
      };

      const result = await createPatient(patientData, apiKey);
      if (result) {
        setRegisterSuccess(true);
        setFormData({
          nin: "",
          phoneNumber: "",
          email: "",
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          bloodType: "",
          allergies: "",
        });
      } else {
        setRegisterError("Failed to create patient. Please try again.");
      }
    } catch {
      setRegisterError("Error creating patient. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingPatient) return;

    setSavingRecord(true);
    try {
      const patientId = viewingPatient._id || viewingPatient.id;
      const record = await createRecord(patientId, {
        date: new Date().toISOString().slice(0, 10),
        hospital: hospitalName,
        doctor: "Doctor on Duty",
        diagnosis: recordForm.diagnosis,
        notes: recordForm.notes,
        status: "Recorded",
        recordType,
        labResults: recordForm.labResults
          ? Object.fromEntries(
              recordForm.labResults
                .split("\n")
                .filter(Boolean)
                .map((l) => {
                  const idx = l.indexOf(":");
                  return idx >= 0
                    ? [l.slice(0, idx).trim(), l.slice(idx + 1).trim()]
                    : null;
                })
                .filter((a): a is [string, string] => !!a && a[0].length > 0),
            )
          : undefined,
        prescriptions: recordForm.prescriptions
          ? recordForm.prescriptions
              .split("\n")
              .filter(Boolean)
              .map((line) => {
                const [drug, dosage] = line.split(":").map((s) => s.trim());
                return { drug: drug || "", dosage: dosage || "" };
              })
          : undefined,
        imagingFindings: recordForm.imagingFindings || undefined,
        vitals: {
          bloodPressure: recordForm.bloodPressure || undefined,
          temperature: recordForm.temperature
            ? Number(recordForm.temperature)
            : undefined,
          heartRate: recordForm.heartRate
            ? Number(recordForm.heartRate)
            : undefined,
          weight: recordForm.weight ? Number(recordForm.weight) : undefined,
        },
      }, apiKey);

      if (record) {
        // Refresh patient data to show new record
        const updatedPatient = await fetchPatientById(patientId, apiKey);
        if (updatedPatient) {
          setViewingPatient(updatedPatient);
        }
        setShowAddRecord(false);
        setRecordForm({
          diagnosis: "",
          notes: "",
          bloodPressure: "",
          temperature: "",
          heartRate: "",
          weight: "",
          labResults: "",
          prescriptions: "",
          imagingFindings: "",
        });
      }
    } catch (error) {
      console.error("Error adding record:", error);
    } finally {
      setSavingRecord(false);
    }
  };

  const handleBackToSearch = () => {
    setViewingPatient(null);
    setActiveTab("search");
    setShowAddRecord(false);
  };

  // Render patient detail view
  if (activeTab === "patient" && viewingPatient) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header
          className={`bg-gradient-to-r ${bgGradient} text-white shadow-lg`}
        >
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {hospitalName}
                </h1>
                <p className="text-white/80 text-sm mt-1">Patient Record</p>
              </div>
              <button
                onClick={handleBackToSearch}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition"
              >
                ← Back to Search
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 py-6">
          {/* Patient Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`h-16 w-16 rounded-full bg-${accentColor}-100 flex items-center justify-center text-2xl font-bold text-${accentColor}-600`}
                >
                  {viewingPatient.firstName?.charAt(0)}
                  {viewingPatient.lastName?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {viewingPatient.firstName} {viewingPatient.lastName}
                  </h2>
                  <p className="text-slate-500">
                    NIN: {viewingPatient.nin || "Not provided"}
                  </p>
                  <div className="flex gap-4 mt-1">
                    <span className="text-sm text-slate-500">
                      📞 {viewingPatient.phoneNumber}
                    </span>
                    {viewingPatient.email && (
                      <span className="text-sm text-slate-500">
                        ✉️ {viewingPatient.email}
                      </span>
                    )}
                    {viewingPatient.bloodType && (
                      <span className="text-sm text-slate-500">
                        🩸 {viewingPatient.bloodType}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAddRecord(!showAddRecord)}
                className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${buttonGradient} text-white rounded-xl font-medium transition`}
              >
                <PlusCircle className="h-4 w-4" /> Add Record
              </button>
            </div>
          </div>

          {/* Add Record Form (inline) */}
          {showAddRecord && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Add Medical Record
                </h3>
                <button
                  onClick={() => setShowAddRecord(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddRecord} className="space-y-4">
                {/* Record Type */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Record Type
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {RECORD_TYPES.map((rt) => (
                      <button
                        key={rt.id}
                        type="button"
                        onClick={() => setRecordType(rt.id)}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                          recordType === rt.id
                            ? `bg-gradient-to-r ${buttonGradient} text-white`
                            : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {rt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Diagnosis */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {recordType === "diagnosis"
                      ? "Diagnosis / Reason"
                      : recordType === "lab"
                        ? "Test / Procedure"
                        : recordType === "imaging"
                          ? "Imaging Type"
                          : "Title"}
                  </label>
                  <input
                    type="text"
                    value={recordForm.diagnosis}
                    onChange={(e) =>
                      setRecordForm((f) => ({
                        ...f,
                        diagnosis: e.target.value,
                      }))
                    }
                    placeholder="e.g. Malaria, Routine Checkup"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-slate-400 focus:outline-none"
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Notes
                  </label>
                  <textarea
                    value={recordForm.notes}
                    onChange={(e) =>
                      setRecordForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    placeholder="Additional notes..."
                    rows={2}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-slate-400 focus:outline-none"
                  />
                </div>

                {/* Vitals */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                    Vitals (optional)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        ♥ BP
                      </label>
                      <input
                        type="text"
                        value={recordForm.bloodPressure}
                        onChange={(e) =>
                          setRecordForm((f) => ({
                            ...f,
                            bloodPressure: e.target.value,
                          }))
                        }
                        placeholder="120/80"
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        ☀ Temp (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={recordForm.temperature}
                        onChange={(e) =>
                          setRecordForm((f) => ({
                            ...f,
                            temperature: e.target.value,
                          }))
                        }
                        placeholder="36.5"
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <Activity className="h-3 w-3" /> HR
                      </label>
                      <input
                        type="number"
                        value={recordForm.heartRate}
                        onChange={(e) =>
                          setRecordForm((f) => ({
                            ...f,
                            heartRate: e.target.value,
                          }))
                        }
                        placeholder="72"
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        ⚖ Weight
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={recordForm.weight}
                        onChange={(e) =>
                          setRecordForm((f) => ({
                            ...f,
                            weight: e.target.value,
                          }))
                        }
                        placeholder="70"
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={savingRecord}
                    className={`px-6 py-2 bg-gradient-to-r ${buttonGradient} text-white rounded-xl font-medium transition disabled:opacity-50`}
                  >
                    {savingRecord ? "Saving..." : "Save Record"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddRecord(false)}
                    className="px-6 py-2 border border-slate-200 text-slate-700 rounded-xl font-medium transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Medical Records History */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Medical Records History
            </h3>
            {!viewingPatient.recentVisits ||
            viewingPatient.recentVisits.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p className="text-4xl mb-2 opacity-50">📋</p>
                <p>No medical records found. Add the first record above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {viewingPatient.recentVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              visit.recordType === "diagnosis"
                                ? "bg-blue-100 text-blue-700"
                                : visit.recordType === "lab"
                                  ? "bg-purple-100 text-purple-700"
                                  : visit.recordType === "prescription"
                                    ? "bg-green-100 text-green-700"
                                    : visit.recordType === "imaging"
                                      ? "bg-orange-100 text-orange-700"
                                      : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {visit.recordType}
                          </span>
                          <span className="text-sm font-medium text-slate-900">
                            {visit.diagnosis}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">
                          {visit.hospital} • {visit.doctor}
                        </p>
                        {visit.notes && (
                          <p className="text-sm text-slate-600 mt-2">
                            {visit.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            visit.status === "Completed" ||
                            visit.status === "Recorded" ||
                            visit.status === "Treated"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {visit.status}
                        </span>
                        <p className="text-xs text-slate-400 mt-1">
                          {visit.date}
                        </p>
                      </div>
                    </div>
                    {/* Vitals display */}
                    {visit.vitals && (
                      <div className="mt-3 pt-3 border-t border-slate-200 flex gap-4 text-xs text-slate-500">
                        {visit.vitals.bloodPressure && (
                          <span>BP: {visit.vitals.bloodPressure}</span>
                        )}
                        {visit.vitals.temperature && (
                          <span>Temp: {visit.vitals.temperature}°C</span>
                        )}
                        {visit.vitals.heartRate && (
                          <span>HR: {visit.vitals.heartRate} bpm</span>
                        )}
                        {visit.vitals.weight && (
                          <span>Weight: {visit.vitals.weight} kg</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <AIRecommendationTool
            patient={viewingPatient}
            medicalRecords={viewingPatient.recentVisits || []}
            apiKey={apiKey}
          />
        </div>
      </div>
    );
  }

  // Main search/register view
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className={`bg-gradient-to-r ${bgGradient} text-white shadow-lg`}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {hospitalName}
              </h1>
              <p className="text-white/80 text-sm mt-1">
                Centralized Healthcare Record System
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div
                className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 text-sm"
                title={apiKey ? "Requests are authenticated with this hospital's CMRS API key" : "Set this hospital's API key in Frontendfiles/.env"}
              >
                <span className="font-semibold flex items-center gap-1">
                  <Activity className="h-4 w-4" /> {apiKey ? "Connected via API key" : "No API key configured"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div
                className={`h-12 w-12 rounded-xl bg-${accentColor}-100 flex items-center justify-center`}
              >
                <Search className={`h-6 w-6 text-${accentColor}-600`} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Search Patients</p>
                <p className="text-2xl font-bold text-slate-900">By NIN</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Medical Records</p>
                <p className="text-2xl font-bold text-slate-900">Centralized</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Access</p>
                <p className="text-2xl font-bold text-slate-900">24/7</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("search")}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              activeTab === "search"
                ? `bg-gradient-to-r ${buttonGradient} text-white shadow-lg shadow-${primaryColor}/30`
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4" /> Search Patient
            </span>
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              activeTab === "register"
                ? `bg-gradient-to-r ${buttonGradient} text-white shadow-lg shadow-${primaryColor}/30`
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" /> Register Patient
            </span>
          </button>
        </div>

        {/* Search Panel */}
        {activeTab === "search" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">
                Search Patient by NIN
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Enter the patient's National Identification Number to retrieve
                their records
              </p>
            </div>
            <div className="p-6">
              <form onSubmit={handleSearch} className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchNIN}
                    onChange={(e) => setSearchNIN(e.target.value)}
                    placeholder="Enter National Identification Number (NIN)"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching || !searchNIN.trim()}
                  className={`px-8 bg-gradient-to-r ${buttonGradient} text-white rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {searching ? "Searching..." : "Search"}
                </button>
              </form>

              {searchError && (
                <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                  <p className="text-rose-700 font-medium">{searchError}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Register Panel */}
        {activeTab === "register" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">
                Register New Patient
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Add a new patient to the centralized healthcare system
              </p>
            </div>
            <div className="p-6">
              {registerSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-emerald-700 font-medium">
                    Patient Registered Successfully!
                  </p>
                </div>
              )}

              {registerError && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                  <p className="text-rose-700 font-medium">{registerError}</p>
                </div>
              )}

              <form
                onSubmit={handleRegister}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    placeholder="+2348012345678"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    National ID (NIN)
                  </label>
                  <input
                    type="text"
                    value={formData.nin}
                    onChange={(e) =>
                      setFormData({ ...formData, nin: e.target.value })
                    }
                    placeholder="11-digit NIN"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="patient@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Blood Type
                  </label>
                  <select
                    value={formData.bloodType}
                    onChange={(e) =>
                      setFormData({ ...formData, bloodType: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition"
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Allergies
                  </label>
                  <input
                    type="text"
                    value={formData.allergies}
                    onChange={(e) =>
                      setFormData({ ...formData, allergies: e.target.value })
                    }
                    placeholder="Penicillin, Sulfa (comma-separated)"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={registering}
                    className={`w-full px-8 py-4 bg-gradient-to-r ${buttonGradient} text-white rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {registering ? "Registering..." : "Register Patient"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HospitalDashboardWrapper;
