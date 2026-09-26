import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LoginScreen } from "../auth/login";
import {
  Activity,
  Bell,
  Database,
  Hospital,
  LogOut,
  Settings,
  Shield,
  User,
  Users,
} from "../ui/icons";
import { useAuth } from "../../context/useAuth";

export function DashboardLayout() {
  const { user, login, logout, loading } = useAuth();
  const navigate = useNavigate();

  // While signing in, the login form stays mounted (it shows its own progress and any error)
  if (loading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginScreen
        onLogin={(role, name) => login(role, name)}
        onBackHome={() => navigate("/")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-slate-100">
        <div className="p-6 flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-sm font-bold tracking-[0.2em] text-emerald-200">CMRS</span>
        </div>

        <nav className="px-4 space-y-2">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition ${
                isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Activity className="h-4 w-4" /> Dashboard
          </NavLink>
          {user.role === "patient" && (
            <NavLink
              to="/dashboard/request-access"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition ${
                  isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Database className="h-4 w-4" /> Request Access
            </NavLink>
          )}
          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition ${
                isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <User className="h-4 w-4" /> Profile
          </NavLink>
          {user.role !== "patient" && (
            <NavLink
              to="/dashboard/patients"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition ${
                  isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Users className="h-4 w-4" /> Patients
            </NavLink>
          )}
          {user.role !== "patient" && (
            <NavLink
              to="/dashboard/access-requests"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition ${
                  isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Shield className="h-4 w-4" /> Access Requests
            </NavLink>
          )}
          {user.role === "admin" && (
            <NavLink
              to="/dashboard/hospitals"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition ${
                  isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Hospital className="h-4 w-4" /> Hospitals
            </NavLink>
          )}
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition ${
                isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Settings className="h-4 w-4" /> Settings
          </NavLink>
        </nav>

        <div className="mt-auto p-4 border-t border-white/10">
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/80 backdrop-blur border-b border-slate-200 flex items-center justify-between px-6">
          <h2 className="text-lg font-bold text-slate-900 capitalize">{user.role} Dashboard</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard/notifications")}
              className="relative h-10 w-10 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 transition"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right text-xs uppercase tracking-wide text-slate-500 hidden sm:block">
                <div className="text-[11px] text-slate-400">Welcome</div>
                <div className="text-sm font-semibold text-slate-900 normal-case">{user.name}</div>
              </div>
              <button
                onClick={() => navigate("/dashboard/profile")}
                className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center border border-emerald-200 hover:ring-2 hover:ring-emerald-300 transition"
              >
                {user.name.charAt(0)}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
