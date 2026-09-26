import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Hospital } from "../ui/icons";
import {
  createHospital,
  fetchHospitals,
  regenerateHospitalApiKey,
  updateHospital,
  type Hospital as HospitalType,
} from "../../api/client";

export function HospitalsScreen() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<HospitalType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", type: "government" as "government" | "private", state: "", address: "" });
  // The raw API key is only returned once, right after registering or regenerating
  const [issuedKey, setIssuedKey] = useState<{ hospitalName: string; apiKey: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchHospitals()
      .then(setHospitals)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { hospital, apiKey } = await createHospital({
        name: form.name,
        type: form.type,
        state: form.state,
        address: form.address || undefined,
      });
      setIssuedKey({ hospitalName: hospital.name, apiKey });
      setCopied(false);
      setForm({ name: "", type: "government", state: "", address: "" });
      setShowAddForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register hospital");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (h: HospitalType) => {
    setError("");
    try {
      await updateHospital(h.id, { isActive: !h.isActive });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update hospital");
    }
  };

  const handleRegenerateKey = async (h: HospitalType) => {
    setError("");
    try {
      const { apiKey } = await regenerateHospitalApiKey(h.id);
      setIssuedKey({ hospitalName: h.name, apiKey });
      setCopied(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to regenerate API key");
    }
  };

  const copyKey = async () => {
    if (!issuedKey) return;
    await navigator.clipboard.writeText(issuedKey.apiKey);
    setCopied(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Hospital className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Registered Hospitals</h2>
            <p className="text-sm text-slate-500">Register facilities and issue the API keys they use to connect to CMRS</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-emerald-700"
        >
          {showAddForm ? "Cancel" : "+ Register Hospital"}
        </button>
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      {issuedKey && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-semibold text-amber-900">API key for {issuedKey.hospitalName}</h3>
              <p className="mt-1 text-sm text-amber-800">
                Copy this key now and give it to the hospital. It will not be shown again. The hospital sends it in the{" "}
                <code className="rounded bg-amber-100 px-1">x-api-key</code> header on every API request.
              </p>
              <code className="mt-3 block break-all rounded-xl bg-white px-4 py-3 font-mono text-sm text-slate-900 border border-amber-200">
                {issuedKey.apiKey}
              </code>
            </div>
            <button onClick={() => setIssuedKey(null)} className="text-sm font-semibold text-amber-700 hover:underline">
              Dismiss
            </button>
          </div>
          <button
            onClick={copyKey}
            className="mt-3 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            {copied ? "Copied" : "Copy key"}
          </button>
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAdd} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Register New Hospital</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-slate-500">Hospital Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. General Hospital, Ikeja"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "government" | "private" }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2"
              >
                <option value="government">Government</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">State</label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                placeholder="e.g. Lagos"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Address (optional)</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="e.g. 1 Marina Road"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-4 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Registering..." : "Register & Issue API Key"}
          </button>
        </form>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
            <tr>
              <th className="px-4 py-3">Hospital</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">State</th>
              <th className="px-4 py-3">Staff</th>
              <th className="px-4 py-3">API Key</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">Loading hospitals...</td>
              </tr>
            ) : hospitals.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No hospitals registered yet. Register one above.
                </td>
              </tr>
            ) : (
              hospitals.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <Hospital className="h-4 w-4 text-slate-400" /> {h.name}
                    </div>
                    {h.registrationCode && <div className="ml-6 text-xs text-slate-400">{h.registrationCode}</div>}
                  </td>
                  <td className="px-4 py-3 text-slate-600 capitalize">{h.type}</td>
                  <td className="px-4 py-3 text-slate-600">{h.state}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {h.activeStaffCount ?? 0} / {h.staffCount ?? 0} active
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{h.apiKeyPrefix ? `${h.apiKeyPrefix}…` : "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                        h.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {h.isActive ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-3 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/dashboard/hospitals/${h.id}/doctors`)}
                        className="text-sm font-semibold text-emerald-700 hover:underline"
                      >
                        Manage Staff
                      </button>
                      <button
                        onClick={() => handleRegenerateKey(h)}
                        className="text-sm font-semibold text-slate-600 hover:underline"
                      >
                        New Key
                      </button>
                      <button
                        onClick={() => handleToggleActive(h)}
                        className={`text-sm font-semibold hover:underline ${h.isActive ? "text-rose-600" : "text-emerald-600"}`}
                      >
                        {h.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <strong>How hospitals connect:</strong> each registered hospital builds its own system and calls the CMRS API
        with its key. "New Key" immediately disables the old key; "Deactivate" blocks the hospital entirely. See{" "}
        <a
          href={`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api-docs`}
          target="_blank"
          rel="noreferrer"
          className="font-semibold underline"
        >
          the API documentation
        </a>
        .
      </div>
    </div>
  );
}
