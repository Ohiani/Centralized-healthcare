import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Users } from "../ui/icons";
import { fetchPatients, type Patient } from "../../api/client";

export function PatientsScreen() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    fetchPatients(search || undefined).then(setPatients).finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Patients</h2>
          <p className="text-sm text-slate-500">Search and view patient records</p>
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

      {loading ? (
        <div className="py-8 text-center text-slate-500">Loading...</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">NIN</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Blood Type</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {p.firstName} {p.lastName}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.nin || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{p.phoneNumber}</td>
                  <td className="px-4 py-3 text-slate-600">{p.bloodType || "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/dashboard/patient/${p._id}`)}
                      className="text-sm font-semibold text-emerald-700 hover:underline"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && patients.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
          No patients found
        </div>
      )}
    </div>
  );
}
