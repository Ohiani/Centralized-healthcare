import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Search } from "../ui/icons";

const MOCK_QUEUE = [
  { id: "p1", initials: "EA", label: "Patient #1234", reason: "Checkup" },
  { id: "p2", initials: "AI", label: "Patient #5678", reason: "Follow-up" },
  { id: "p3", initials: "CO", label: "Patient #9012", reason: "Consultation" },
];

export const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/dashboard/patients?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/dashboard/patients");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Find Patient Record</h3>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter Patient NIN or Name..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
          <button
            onClick={handleSearch}
            className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-200/60 transition hover:bg-emerald-700"
          >
            Search Central DB
          </button>
        </div>
      </div>

      {/* Doctor Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Patient Queue</h3>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase text-amber-700">
              3 Waiting
            </span>
          </div>
          <ul className="space-y-3">
            {MOCK_QUEUE.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center">
                    {p.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{p.label}</p>
                    <p className="text-xs text-slate-500">{p.reason}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/dashboard/patient/${p.id}`)}
                  className="text-sm font-semibold text-emerald-700 hover:underline"
                >
                  View Profile
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 text-white shadow-soft">
          <h3 className="text-base font-semibold">New Entry</h3>
          <p className="mt-2 text-sm text-emerald-100">
            Create a new medical record. This will be instantly synced to the
            central database.
          </p>
          <button
            onClick={() => navigate("/dashboard/add-record")}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-md shadow-emerald-900/20 transition hover:bg-emerald-50"
          >
            <PlusCircle className="h-4 w-4" /> Add Record
          </button>
        </div>
      </div>
    </div>
  );
};
