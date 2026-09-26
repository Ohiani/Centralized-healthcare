import { AdminDashboard } from "./adminDashboard";
import { PatientDashboard } from "./patientDashboard";
import { ProviderDashboardEnhanced } from "./ProviderDashboardEnhanced";
import { useAuth } from "../../context/useAuth";

export function DashboardHome() {
  const { user } = useAuth();
  if (!user) return null;

  if (user.role === "patient") return <PatientDashboard />;
  if (user.role === "provider") return <ProviderDashboardEnhanced />;
  if (user.role === "admin") return <AdminDashboard />;

  return null;
}
