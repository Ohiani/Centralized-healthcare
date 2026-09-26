import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  // Activity,
  AlertCircle,
  // Calendar,
  Clock,
  FileText,
  PlusCircle,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { fetchPatient } from "../../api/client";

export function ProviderDashboardEnhanced() {
  const navigate = useNavigate();
  const [searchNIN, setSearchNIN] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handlePatientSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanedNIN = searchNIN.trim();
    if (!cleanedNIN) return;
    setSearching(true);
    setSearchError("");
    try {
      const patient = await fetchPatient({ nin: cleanedNIN });
      if (patient?.id) {
        navigate(`/dashboard/patient/${patient.id}`);
      } else {
        setSearchError("Patient not found. Verify NIN and try again.");
      }
    } catch {
      setSearchError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Patients Today</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">8</p>
              <p className="text-xs text-slate-500 mt-2">3 pending consultations</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Records Accessed</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">24</p>
              <p className="text-xs text-slate-500 mt-2">This week</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-2">
              <FileText className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Next Appointment</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">2:00 PM</p>
              <p className="text-xs text-slate-500 mt-2">Mrs. Afolabi (Follow-up)</p>
            </div>
            <div className="rounded-xl bg-violet-50 p-2">
              <Clock className="h-5 w-5 text-violet-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Today's Appointments</h3>
        <div className="space-y-3">
          <AppointmentRow time="2:00 PM" name="Mrs. Afolabi" type="Follow-up" status="Pending" onClick={() => navigate("/dashboard/patient/p1")} />
          <AppointmentRow time="3:30 PM" name="Mr. Chukwu" type="New Consultation" status="Confirmed" onClick={() => navigate("/dashboard/patient/p2")} />
          <AppointmentRow time="4:45 PM" name="Miss Okonkwo" type="Lab Review" status="Confirmed" onClick={() => navigate("/dashboard/patient/p3")} />
        </div>
      </div>

      {/* Patient Record Lookup */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Patient Record Lookup</h3>
        <p className="text-slate-600 mb-6">
          Search for a patient using their National Identity Number (NIN) to access their complete medical history across
          all Nigerian healthcare facilities.
        </p>

        <form onSubmit={handlePatientSearch} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchNIN}
              onChange={(e) => setSearchNIN(e.target.value)}
              placeholder="Enter Patient NIN (11 digits)"
              className="w-full rounded-2xl border-2 border-slate-200 py-3 pl-12 pr-4 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-900"
              maxLength={11}
              required
            />
          </div>
          {searchError && <p className="text-sm text-rose-600">{searchError}</p>}
          <button
            type="submit"
            disabled={searching}
            className="w-full rounded-2xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Shield className="h-5 w-5" /> {searching ? "Searching..." : "Verify & Access Records"}
          </button>
        </form>

        <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">NDPA Compliance Notice</p>
              <p>
                All patient record access is logged and audited. Ensure you have patient consent before accessing
                records.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Record */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 text-white shadow-lg">
        <h3 className="text-lg font-bold">New Entry</h3>
        <p className="mt-2 text-emerald-100">
          Create a new medical record (diagnosis, labs, imaging, prescriptions, procedures). Synced to central database.
        </p>
        <button
          onClick={() => navigate("/dashboard/add-record")}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-md hover:bg-emerald-50"
        >
          <PlusCircle className="h-4 w-4" /> Add Record
        </button>
      </div>
    </div>
  );
}

function AppointmentRow({
  time,
  name,
  type,
  status,
  onClick,
}: {
  time: string;
  name: string;
  type: string;
  status: "Pending" | "Confirmed";
  onClick: () => void;
}) {
  const statusStyles =
    status === "Confirmed"
      ? "bg-emerald-100 text-emerald-800"
      : "bg-amber-100 text-amber-800";
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50">
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {time} - {name}
        </p>
        <p className="text-xs text-slate-500">{type}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles}`}>{status}</span>
        <button onClick={onClick} className="text-sm font-semibold text-emerald-700 hover:underline">
          View
        </button>
      </div>
    </div>
  );
}
