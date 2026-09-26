import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Database, Shield } from "../ui/icons";
import { RecordTimelineItem } from "../ui/RecordTimelineItem";
import { fetchMyPatient, fetchNotifications, type Notification, type Patient } from "../../api/client";

export const PatientDashboard = () => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [accessApproved, setAccessApproved] = useState(false);
  const [lastAccess, setLastAccess] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyPatient()
      .then((data) => {
        setPatient(data.patient);
        setAccessApproved(data.accessApproved);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    fetchNotifications()
      .then((list) => setLastAccess(list.find((n) => n.title === "Record Accessed") || null))
      .catch(() => setLastAccess(null));
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-slate-500">Loading your record...</div>;
  }

  if (error || !patient) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h3 className="font-semibold text-amber-900">No medical record linked to your account</h3>
        <p className="mt-2 text-sm text-amber-800">
          Your login is matched to your record using the NIN or phone number your hospital registered. Log in again using
          that NIN or phone number, or ask your hospital to register you.
        </p>
      </div>
    );
  }

  const records = patient.recentVisits || [];

  return (
  <div className="space-y-6" >
    {/* Patient Access Notice */}
    {!accessApproved && (
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 flex items-start gap-3">
        <Shield className="h-6 w-6 shrink-0 text-blue-700" />
        <div>
          <h3 className="font-semibold text-blue-900">Your records are protected</h3>
          <p className="text-sm text-blue-800 mt-1">
            You cannot access your full medical records directly. Request access through your hospital or doctor—they will
            approve and grant access. <button onClick={() => navigate("/dashboard/request-access")} className="font-semibold underline hover:text-blue-600">Request access →</button>
          </p>
        </div>
      </div>
    )}

    {/* Quick Info (visible without full access) */}
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-700">Blood Type</p>
        <p className="mt-2 text-2xl font-bold text-blue-900">{patient.bloodType || "—"}</p>
      </div>
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-rose-700">Allergies</p>
        <p className="mt-2 text-2xl font-bold text-rose-900">{patient.allergies?.join(", ") || "None"}</p>
      </div>
      <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-700">Identified By</p>
        <p className="mt-2 text-2xl font-bold text-violet-900">{patient.nin ? `NIN ${patient.nin}` : "Phone number"}</p>
      </div>
    </div>

    {/* Request Access / Download CTA */}
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
      <h3 className="font-semibold text-emerald-900">
        {accessApproved ? "Your full medical history is available" : "Need your full medical history?"}
      </h3>
      <p className="text-sm text-emerald-800 mt-2">
        {accessApproved
          ? "Your access request was approved. You can view your unified history below and download it as a PDF."
          : "Request access via your hospital or doctor. Once approved, you can view your unified history and download reports."}
      </p>
      <div className="mt-4 flex gap-3">
        {!accessApproved && (
          <button
            onClick={() => navigate("/dashboard/request-access")}
            className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Request Access
          </button>
        )}
        <button
          onClick={() => navigate("/dashboard/download-report")}
          className={
            accessApproved
              ? "rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              : "rounded-2xl border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
          }
        >
          {accessApproved ? "Download Report" : "Download Report (after approval)"}
        </button>
      </div>
    </div>

    {/* Full history only after approval */}
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Database className="h-4 w-4 text-emerald-600" /> Unified Medical History
        </h3>
      </div>
      {accessApproved ? (
        <div className="space-y-4 p-6">
          {records.length === 0 && <p className="text-center text-slate-500">No medical records on file yet.</p>}
          {records.map((r) => (
            <RecordTimelineItem key={r.id} item={r} />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500">
          <p>Request access via your hospital or doctor to view your full medical history here.</p>
          <button onClick={() => navigate("/dashboard/request-access")} className="mt-3 text-emerald-600 font-semibold hover:underline">Request access →</button>
        </div>
      )}
    </div>

    {/* Access Log (Security Feature) */}
    {lastAccess && (
      <div className="flex items-start gap-3 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
        <Shield className="mt-1 h-5 w-5 text-amber-700" />
        <div>
          <h4 className="text-sm font-semibold">Data Access Alert</h4>
          <p className="text-sm text-amber-800">
            {lastAccess.message}
            <button
              onClick={() => navigate("/dashboard/notifications")}
              className="ml-2 font-semibold underline"
            >
              See all access alerts
            </button>
          </p>
        </div>
      </div>
    )}
  </div>
  );
};
