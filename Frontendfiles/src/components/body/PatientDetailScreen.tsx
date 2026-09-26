import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Activity, Download } from "lucide-react";
import { downloadFile, fetchPatientById, type Patient, type RecordType } from "../../api/client";
import { useAuth } from "../../context/useAuth";
import { AIRecommendationTool } from "../ui/AIRecommendationTool";
import { RecordTimelineItem } from "../ui/RecordTimelineItem";

const RECORD_TABS: { id: RecordType | "all"; label: string }[] = [
  { id: "all", label: "All Records" },
  { id: "diagnosis", label: "Diagnoses" },
  { id: "lab", label: "Lab Results" },
  { id: "prescription", label: "Prescriptions" },
  { id: "imaging", label: "Imaging" },
  { id: "procedure", label: "Procedures" },
];

export function PatientDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RecordType | "all">("all");
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchPatientById(id).then(setPatient).finally(() => setLoading(false));
  }, [id]);

  const fullName = patient ? `${patient.firstName} ${patient.lastName}` : "Patient";
  const isProvider = user?.role === "provider" || user?.role === "admin";
  const records = patient?.recentVisits || [];
  const timeline = records.filter((t) => activeTab === "all" || (t.recordType || "diagnosis") === activeTab);
  // Diagnoses still marked "Ongoing" are treated as chronic/active conditions
  const ongoingConditions = [
    ...new Set(records.filter((r) => r.status?.toLowerCase() === "ongoing").map((r) => r.diagnosis)),
  ];
  const lastVisit = records[0]?.date;

  const handleExport = async () => {
    if (!id) return;
    setExportError("");
    try {
      await downloadFile(`/api/patients/${id}/report`, "patient-report.pdf");
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Export failed");
    }
  };

  if (loading && !patient) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500">Loading patient...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-600 p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center">
              <span className="text-2xl font-bold text-emerald-700">
                {patient?.firstName?.charAt(0)}
                {patient?.lastName?.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{fullName}</h2>
              <p className="text-emerald-100">NIN: {patient?.nin || "—"}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/30"
            >
              Back to Dashboard
            </button>
            {isProvider && (
              <button
                onClick={() => navigate(`/dashboard/add-record/${id}`)}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                Add Record
              </button>
            )}
          </div>
        </div>
      </div>

      {patient && (
        <>
          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoCard label="Blood Type" value={patient.bloodType || "—"} />
            <InfoCard label="Allergies" value={patient.allergies?.join(", ") || "None"} />
            <InfoCard label="Ongoing Conditions" value={ongoingConditions.join(", ") || "None"} />
            <InfoCard label="Last Visit" value={lastVisit || "No visits yet"} />
          </div>

          {/* Critical Alerts */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-rose-700 font-bold">Allergies</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(patient.allergies || []).map((a) => (
                  <span key={a} className="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-800">
                    {a}
                  </span>
                ))}
                {(!patient.allergies || patient.allergies.length === 0) && (
                  <span className="text-rose-600">None recorded</span>
                )}
              </div>
            </div>
            <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-5 w-5 text-amber-700" />
                <span className="font-bold text-amber-900">Ongoing Conditions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ongoingConditions.map((c) => (
                  <span key={c} className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                    {c}
                  </span>
                ))}
                {ongoingConditions.length === 0 && <span className="text-amber-700">None recorded</span>}
              </div>
            </div>
          </div>

          {/* Medical Records Tabs */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 pt-4">
              <div className="flex gap-4 overflow-x-auto">
                {RECORD_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
                      activeTab === tab.id
                        ? "border-emerald-600 text-emerald-600"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900">Medical History Timeline</h3>
                {isProvider && (
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    <Download className="h-4 w-4" /> Export PDF
                  </button>
                )}
              </div>
              {exportError && <p className="mb-4 text-sm text-rose-600">{exportError}</p>}

              <div className="space-y-6">
                {timeline.map((t) => (
                  <RecordTimelineItem key={t.id} item={t} />
                ))}
              </div>

              {timeline.length === 0 && (
                <div className="py-12 text-center text-slate-500">
                  No records in this category.
                </div>
              )}
            </div>
          </div>

          {/* AI Medical Assistant (Provider only) */}
          {isProvider && (
            <AIRecommendationTool
              patient={patient}
              medicalRecords={records}
            />
          )}

          {/* Add New Record (Provider only) */}
          {isProvider && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Add New Record</h3>
              <p className="text-sm text-slate-600 mb-4">
                Add diagnosis, lab results, prescriptions, imaging, or procedures. Records sync to the central database.
              </p>
              <button
                onClick={() => navigate(`/dashboard/add-record/${id}`)}
                className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700 flex items-center justify-center gap-2"
              >
                Create New Medical Entry
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
