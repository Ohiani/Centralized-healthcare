import { Settings } from "../ui/icons";

export function SettingsScreen() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Settings</h2>
          <p className="text-sm text-slate-500">Manage your preferences and security</p>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Preferences</h3>
        <label className="flex items-center justify-between">
          <span className="text-sm text-slate-700">Email notifications</span>
          <input type="checkbox" defaultChecked className="rounded border-slate-300" />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-sm text-slate-700">SMS reminders</span>
          <input type="checkbox" defaultChecked className="rounded border-slate-300" />
        </label>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Security</h3>
        <p className="mt-2 text-sm text-slate-600">Change your password or enable two-factor authentication.</p>
        <button className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">
          Change Password
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Data & Privacy</h3>
        <p className="mt-2 text-sm text-slate-600">Download your data or manage consent.</p>
        <button className="mt-4 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          Download My Data
        </button>
      </div>
    </div>
  );
}
