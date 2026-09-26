import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Search } from "../ui/icons";
import { fetchPatients, type Patient } from "../../api/client";

export function AddRecordSelectScreen() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!search.trim()) {
      setPatients([]);
      return;
    }
    setLoading(true);
    fetchPatients(search)
      .then(setPatients)
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <PlusCircle className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Add Medical Record</h2>
          <p className="text-sm text-slate-500">Search for a patient to add a new record</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by NIN, name, or phone..."
            className="w-full rounded-2xl border border-slate-200 py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </div>

      {loading && <div className="text-center text-slate-500">Searching...</div>}

      {!loading && search && (
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {patients.length === 0 ? (
            <p className="py-4 text-center text-slate-500">No patients found</p>
          ) : (
            patients.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/dashboard/add-record/${p.id}`)}
                className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-left transition hover:bg-emerald-50"
              >
                <span className="font-medium text-slate-900">
                  {p.firstName} {p.lastName}
                </span>
                <span className="text-sm text-slate-500">{p.phoneNumber}</span>
              </button>
            ))
          )}
        </div>
      )}

      <button
        onClick={() => navigate(-1)}
        className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Cancel
      </button>
    </div>
  );
}
