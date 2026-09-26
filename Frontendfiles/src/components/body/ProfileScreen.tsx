import { User } from "../ui/icons";

export function ProfileScreen() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <User className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Profile</h2>
            <p className="text-sm text-slate-500">View and manage your account information</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">First Name</label>
            <p className="mt-2 text-slate-900">—</p>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last Name</label>
            <p className="mt-2 text-slate-900">—</p>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
            <p className="mt-2 text-slate-900">—</p>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</label>
            <p className="mt-2 text-slate-900">—</p>
          </div>
        </div>

        <button className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">
          Edit Profile
        </button>
      </div>
    </div>
  );
}
