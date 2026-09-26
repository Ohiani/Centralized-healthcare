import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./components/body/home";
import { DashboardLayout } from "./components/body/DashboardLayout";
import { DashboardHome } from "./components/body/DashboardHome";
import { ProfileScreen } from "./components/body/ProfileScreen";
import { SettingsScreen } from "./components/body/SettingsScreen";
import { PatientsScreen } from "./components/body/PatientsScreen";
import { NotificationsScreen } from "./components/body/NotificationsScreen";
import { PatientDetailScreen } from "./components/body/PatientDetailScreen";
import { AddRecordScreen } from "./components/body/AddRecordScreen";
import { AddRecordSelectScreen } from "./components/body/AddRecordSelectScreen";
import { DownloadReportScreen } from "./components/body/DownloadReportScreen";
import { HospitalsScreen } from "./components/body/HospitalsScreen";
import { HospitalDoctorsScreen } from "./components/body/HospitalDoctorsScreen";
import { RequestAccessScreen } from "./components/body/RequestAccessScreen";
import { AccessRequestsScreen } from "./components/body/AccessRequestsScreen";
import { LoginScreen } from "./components/auth/login";
import { useAuth } from "./context/useAuth";
import { HospitalADashboard, HospitalBDashboard } from "./components/body/HospitalDashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginWithNav />} />

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="profile" element={<ProfileScreen />} />
            <Route path="settings" element={<SettingsScreen />} />
            <Route path="patients" element={<PatientsScreen />} />
            <Route path="notifications" element={<NotificationsScreen />} />
            <Route path="patient/:id" element={<PatientDetailScreen />} />
            <Route path="add-record" element={<AddRecordSelectScreen />} />
            <Route path="add-record/:patientId" element={<AddRecordRoute />} />
            <Route path="download-report" element={<DownloadReportScreen />} />
            <Route path="hospitals" element={<HospitalsScreen />} />
            <Route path="hospitals/:hospitalId/doctors" element={<HospitalDoctorsScreen />} />
            <Route path="request-access" element={<RequestAccessScreen />} />
            <Route path="access-requests" element={<AccessRequestsScreen />} />
          </Route>

          {/* Standalone Hospital Dashboards with unique layouts */}
          <Route path="/hospital-a" element={<HospitalADashboard />} />
          <Route path="/hospital-b" element={<HospitalBDashboard />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function LoginWithNav() {
  const { login } = useAuth();
  const navigate = useNavigate();
  return (
    <LoginScreen
      onLogin={async (role, name) => {
        const error = await login(role, name);
        if (!error) navigate("/dashboard");
        return error;
      }}
      onBackHome={() => navigate("/")}
    />
  );
}

function AddRecordRoute() {
  const { patientId } = useParams<{ patientId: string }>();
  return <AddRecordScreen patientId={patientId || ""} />;
}

export default App;
