import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Hospital } from "../ui/icons";
import { fetchAdminStats, type AdminStats } from "../../api/client";

const STATUS_STYLES: Record<AdminStats["hospitals"][number]["status"], string> = {
  syncing: "bg-emerald-100 text-emerald-700",
  idle: "bg-slate-100 text-slate-600",
  offline: "bg-rose-100 text-rose-700",
};

const formatLastActivity = (date?: string) => {
  if (!date) return "Never connected";
  const minutes = Math.round((Date.now() - new Date(date).getTime()) / 60000);
  if (minutes < 1) return "Active just now";
  if (minutes < 60) return `Active ${minutes}m ago`;
  if (minutes < 60 * 24) return `Active ${Math.round(minutes / 60)}h ago`;
  return `Last active ${new Date(date).toLocaleDateString()}`;
};

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  const tiles = [
    { label: "Total Patients", value: stats?.totalPatients },
    { label: "Records Synced", value: stats?.totalRecords },
    { label: "Connected Hospitals", value: stats ? `${stats.activeHospitals} / ${stats.totalHospitals}` : undefined },
    { label: "Active Doctors & Nurses", value: stats?.activeStaff },
  ];

  return (
  <div className="space-y-6">
    {error && (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        Could not load system statistics: {error}
      </div>
    )}

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{tile.label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{tile.value ?? "—"}</p>
        </div>
      ))}
    </div>

    {stats && stats.pendingAccessRequests > 0 && (
      <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
        <p className="text-sm font-medium text-amber-900">
          {stats.pendingAccessRequests} patient access request{stats.pendingAccessRequests === 1 ? "" : "s"} awaiting review
        </p>
        <button
          onClick={() => navigate("/dashboard/access-requests")}
          className="text-sm font-semibold text-amber-800 hover:underline"
        >
          Review →
        </button>
      </div>
    )}

    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">
          Hospital Connectivity Status
        </h3>
        <button
          onClick={() => navigate("/dashboard/hospitals")}
          className="text-sm font-semibold text-emerald-600 hover:underline"
        >
          Manage Hospitals →
        </button>
      </div>
      <div className="space-y-3 p-6">
        {stats && stats.hospitals.length === 0 && (
          <p className="text-center text-sm text-slate-500">No hospitals registered yet.</p>
        )}
        {stats?.hospitals.map((h) => (
          <div key={h.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <span className="flex items-center gap-2 font-medium text-slate-800">
              <Hospital className="h-4 w-4 text-slate-400" /> {h.name}
              <span className="text-xs font-normal text-slate-400">{formatLastActivity(h.lastActivityAt)}</span>
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${STATUS_STYLES[h.status]}`}>
              {h.status}
            </span>
          </div>
        ))}
        {stats && stats.hospitals.length > 0 && (
          <p className="pt-1 text-xs text-slate-400">
            Syncing = used its API key in the last 24 hours · Idle = registered but quiet · Offline = deactivated
          </p>
        )}
      </div>
    </div>
  </div>
  );
};
