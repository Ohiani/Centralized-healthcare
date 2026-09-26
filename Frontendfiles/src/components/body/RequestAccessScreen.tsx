import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "../ui/icons";
import {
  createAccessRequest,
  fetchAccessRequests,
  fetchHospitals,
  type AccessRequest,
  type AccessRequestStatus,
  type Hospital,
} from "../../api/client";

const REASONS = [
  "Personal records / Download report",
  "Second opinion / Referral",
  "Insurance / Employment",
  "Other",
];

const STATUS_STYLES: Record<AccessRequestStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

export function RequestAccessScreen() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [form, setForm] = useState({ hospitalId: "", doctorName: "", reason: REASONS[0] });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const loadRequests = useCallback(() => {
    fetchAccessRequests().then(setRequests).catch(() => setRequests([]));
  }, []);

  useEffect(() => {
    fetchHospitals()
      .then((list) => setHospitals(list.filter((h) => h.isActive)))
      .catch(() => setHospitals([]));
    loadRequests();
  }, [loadRequests]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await createAccessRequest({
        hospitalId: form.hospitalId,
        doctorName: form.doctorName || undefined,
        reason: form.reason,
      });
      setSubmitted(true);
      setForm({ hospitalId: "", doctorName: "", reason: REASONS[0] });
      loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const hasApproved = requests.some((r) => r.status === "approved");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start gap-4">
          <Shield className="h-8 w-8 shrink-0 text-blue-700" />
          <div>
            <h3 className="text-lg font-bold text-blue-900">Request Access to Your Records</h3>
            <p className="mt-2 text-sm text-blue-800">
              For your privacy and security, you cannot directly access your full medical records. To view or download your
              records, please request access through your hospital or doctor. Your doctor will verify your identity and
              approve the request.
            </p>
          </div>
        </div>
      </div>

      {submitted ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="font-semibold text-emerald-800">Request submitted</p>
          <p className="mt-2 text-sm text-emerald-700">
            The hospital will verify your identity and review your request. You will get a notification when it is approved.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-4 text-sm font-semibold text-emerald-700 hover:underline"
          >
            Submit another request
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-2">Submit a Request</h3>
          <p className="text-sm text-slate-600 mb-4">
            Choose the hospital that should verify you. They will see this request and can approve it.
          </p>
          {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500">Hospital or clinic</label>
              <select
                value={form.hospitalId}
                onChange={(e) => setForm((f) => ({ ...f, hospitalId: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2"
                required
              >
                <option value="" disabled>
                  {hospitals.length ? "Select a registered hospital" : "No registered hospitals available"}
                </option>
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.state})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Your doctor (optional)</label>
              <input
                type="text"
                value={form.doctorName}
                onChange={(e) => setForm((f) => ({ ...f, doctorName: e.target.value }))}
                placeholder="e.g. Dr. Chinedu Okafor"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Reason for request</label>
              <select
                value={form.reason}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2"
              >
                {REASONS.map((reason) => (
                  <option key={reason}>{reason}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 rounded-2xl bg-emerald-600 px-6 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-slate-900">Your requests</h4>
          {hasApproved && (
            <button onClick={() => navigate("/dashboard")} className="text-sm font-semibold text-emerald-700 hover:underline">
              View my records →
            </button>
          )}
        </div>
        {requests.length === 0 ? (
          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-center text-slate-500 text-sm">
            No requests yet. Submit a request above.
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {requests.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{r.hospitalName}</p>
                  <p className="text-xs text-slate-500">
                    {r.reason} · {new Date(r.createdAt).toLocaleDateString()}
                    {r.reviewNote ? ` · "${r.reviewNote}"` : ""}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[r.status]}`}>
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
