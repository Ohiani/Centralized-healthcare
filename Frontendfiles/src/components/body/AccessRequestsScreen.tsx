import { useCallback, useEffect, useState } from "react";
import { Shield } from "../ui/icons";
import {
  fetchAccessRequests,
  reviewAccessRequest,
  type AccessRequest,
  type AccessRequestStatus,
} from "../../api/client";

const FILTERS: { id: AccessRequestStatus | "all"; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
];

const STATUS_STYLES: Record<AccessRequestStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

// Admins and providers review patients' requests to view their own full medical history
export function AccessRequestsScreen() {
  const [filter, setFilter] = useState<AccessRequestStatus | "all">("pending");
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchAccessRequests(filter === "all" ? undefined : filter)
      .then(setRequests)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(load, [load]);

  const review = async (id: string, decision: "approve" | "reject") => {
    setBusyId(id);
    setError("");
    try {
      await reviewAccessRequest(id, decision);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update request");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Patient Access Requests</h2>
          <p className="text-sm text-slate-500">
            Verify the patient's identity before approving. Approved patients can view and download their full history.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              filter === f.id ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
            <tr>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Hospital / Doctor</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Requested</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading requests...</td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No {filter === "all" ? "" : filter} requests.</td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{r.patientName || "Unknown patient"}</div>
                    <div className="text-xs text-slate-500">NIN: {r.patientNin || "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div>{r.hospitalName}</div>
                    {r.doctorName && <div className="text-xs text-slate-500">{r.doctorName}</div>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.reason}</td>
                  <td className="px-4 py-3 text-slate-600">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[r.status]}`}>
                      {r.status}
                    </span>
                    {r.reviewedBy && <div className="mt-1 text-xs text-slate-400">by {r.reviewedBy}</div>}
                  </td>
                  <td className="px-4 py-3">
                    {r.status === "pending" && (
                      <div className="flex gap-3 whitespace-nowrap">
                        <button
                          disabled={busyId === r.id}
                          onClick={() => review(r.id, "approve")}
                          className="text-sm font-semibold text-emerald-700 hover:underline disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          disabled={busyId === r.id}
                          onClick={() => review(r.id, "reject")}
                          className="text-sm font-semibold text-rose-600 hover:underline disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
