/**
 * API client for CMRS backend.
 * Uses mock data when VITE_API_URL is unset or backend is unavailable.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Helper to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("chrs_token");
};

// Helper for auth headers. Hospital portals pass their API key; dashboard users send their login token.
const getAuthHeaders = (apiKey?: string): Record<string, string> => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) {
    headers["x-api-key"] = apiKey;
    return headers;
  }
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// Calls the API and throws an Error carrying the backend's message on failure
async function request<T>(path: string, options: { method?: string; body?: unknown; apiKey?: string } = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers: getAuthHeaders(options.apiKey),
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data as T;
}

// Downloads a file (e.g. a PDF report) from an authenticated endpoint
export async function downloadFile(path: string, fallbackName: string, apiKey?: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, { headers: getAuthHeaders(apiKey) });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || `Download failed (${res.status})`);
  }
  const fileName = res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] || fallbackName;
  const url = URL.createObjectURL(await res.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

// MongoDB documents come back with _id (and id); use whichever is present
export const getId = (doc: { id?: string; _id?: string }): string => doc.id || doc._id || "";

export type UserRole = "patient" | "provider" | "admin";

export interface Patient {
  id: string;
  _id?: string;
  nin?: string | null;
  phoneNumber: string;
  email?: string | null;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  bloodType?: string;
  allergies?: string[];
  recentVisits?: Visit[];
}

export type RecordType = "diagnosis" | "lab" | "prescription" | "imaging" | "procedure";

export interface Visit {
  id: string;
  date: string;
  hospital: string;
  doctor: string;
  diagnosis: string;
  status: string;
  recordType?: RecordType;
  notes?: string;
  vitals?: { bloodPressure?: string; temperature?: number; heartRate?: number; weight?: number };
  labResults?: Record<string, string>;
  prescriptions?: { drug: string; dosage: string }[];
  imagingFindings?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  type: "government" | "private";
  state: string;
  address?: string;
  registrationCode?: string;
  apiKeyPrefix?: string;
  isActive: boolean;
  lastActivityAt?: string;
  staffCount?: number;
  activeStaffCount?: number;
}

export interface Staff {
  id: string;
  hospitalId: string;
  licenseNumber: string;
  name: string;
  role: "doctor" | "nurse";
  isActive: boolean;
  revokedAt?: string;
}

export type AccessRequestStatus = "pending" | "approved" | "rejected";

export interface AccessRequest {
  id: string;
  patientId: string;
  patientName?: string;
  patientNin?: string;
  hospitalId?: string;
  hospitalName: string;
  doctorName?: string;
  reason: string;
  status: AccessRequestStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
  createdAt: string;
}

export interface AdminStats {
  totalPatients: number;
  totalRecords: number;
  totalHospitals: number;
  activeHospitals: number;
  totalStaff: number;
  activeStaff: number;
  pendingAccessRequests: number;
  hospitals: { id: string; name: string; state: string; status: "syncing" | "idle" | "offline"; lastActivityAt?: string }[];
}

// --- API functions (with mock fallback) ---

export async function fetchPatient(params: {
  nin?: string;
  phone?: string;
  email?: string;
}): Promise<Patient | null> {
  if (API_BASE) {
    try {
      const search = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v))
      ).toString();
      const res = await fetch(`${API_BASE}/api/patients/search?${search}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return getMockPatient();
    }
  }
  return getMockPatient();
}

export async function fetchPatientById(id: string, apiKey?: string): Promise<Patient | null> {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/patients/${id}`, {
        headers: getAuthHeaders(apiKey)
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return getMockPatientById(id);
    }
  }
  return getMockPatientById(id);
}

// Search patient by NIN (returns single patient)
export async function searchPatientByNIN(nin: string, apiKey?: string): Promise<Patient | null> {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/patients/search?nin=${encodeURIComponent(nin)}`, {
        headers: getAuthHeaders(apiKey)
      });
     
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }
  return getMockPatient();
}

export async function fetchPatients(search?: string): Promise<Patient[]> {
  if (API_BASE) {
    try {
      const url = search ? `${API_BASE}/api/patients?search=${encodeURIComponent(search)}` : `${API_BASE}/api/patients`;
      const res = await fetch(url, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return getMockPatientsList();
    }
  }
  return getMockPatientsList();
}

export async function createPatient(data: Partial<Patient>, apiKey?: string): Promise<Patient | null> {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/patients`, {
        method: "POST",
        headers: getAuthHeaders(apiKey),
        body: JSON.stringify(data),
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return { ...data, id: "mock-" + Date.now() } as Patient;
    }
  }
  return { ...data, id: "mock-" + Date.now() } as Patient;
}

export async function createRecord(patientId: string, record: Partial<Visit>, apiKey?: string): Promise<Visit | null> {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/patients/${patientId}/records`, {
        method: "POST",
        headers: getAuthHeaders(apiKey),
        body: JSON.stringify(record),
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return { ...record, id: "r-" + Date.now() } as Visit;
    }
  }
  return { ...record, id: "r-" + Date.now() } as Visit;
}

export async function fetchNotifications(): Promise<Notification[]> {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/notifications`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return getMockNotifications();
    }
  }
  return getMockNotifications();
}

export async function markAllNotificationsRead(): Promise<void> {
  await request("/api/notifications/read-all", { method: "PUT" });
}

// --- Hospitals & staff (admin) ---

export const fetchHospitals = () => request<Hospital[]>("/api/hospitals");

export const createHospital = (data: { name: string; type: Hospital["type"]; state: string; address?: string }) =>
  request<{ hospital: Hospital; apiKey: string }>("/api/hospitals", { method: "POST", body: data });

export const updateHospital = (id: string, data: Partial<Pick<Hospital, "name" | "type" | "state" | "address" | "isActive">>) =>
  request<Hospital>(`/api/hospitals/${id}`, { method: "PUT", body: data });

export const regenerateHospitalApiKey = (id: string) =>
  request<{ hospital: Hospital; apiKey: string }>(`/api/hospitals/${id}/api-key`, { method: "POST" });

export const fetchHospital = (id: string) => request<Hospital>(`/api/hospitals/${id}`);

export const fetchStaff = (hospitalId: string) => request<Staff[]>(`/api/hospitals/${hospitalId}/staff`);

export const addStaff = (hospitalId: string, data: { licenseNumber: string; name: string; role: Staff["role"] }) =>
  request<Staff>(`/api/hospitals/${hospitalId}/staff`, { method: "POST", body: data });

export const setStaffActive = (hospitalId: string, staffId: string, active: boolean) =>
  request<Staff>(`/api/hospitals/${hospitalId}/staff/${staffId}/${active ? "reactivate" : "revoke"}`, { method: "PUT" });

export const fetchAdminStats = () => request<AdminStats>("/api/admin/stats");

// --- Patient self-service & access requests ---

export const fetchMyPatient = () => request<{ patient: Patient; accessApproved: boolean }>("/api/patients/me");

export const fetchAccessRequests = (status?: AccessRequestStatus) =>
  request<AccessRequest[]>(`/api/access-requests${status ? `?status=${status}` : ""}`);

export const createAccessRequest = (data: { hospitalId?: string; hospitalName?: string; doctorName?: string; reason: string }) =>
  request<AccessRequest>("/api/access-requests", { method: "POST", body: data });

export const reviewAccessRequest = (id: string, decision: "approve" | "reject", note?: string) =>
  request<AccessRequest>(`/api/access-requests/${id}/${decision}`, { method: "PUT", body: { note } });

// --- Mock data (fallback when no backend) ---

function getMockPatientById(id: string): Patient | null {
  const list = getMockPatientsList();
  const found = list.find((p) => p.id === id);
  if (found) {
    return { ...found, recentVisits: getMockPatient().recentVisits };
  }
  return getMockPatient();
}

function getMockPatient(): Patient {
  return {
    id: "p1",
    nin: "12345678901",
    phoneNumber: "+2348012345678",
    firstName: "Emmanuel",
    lastName: "Adebayo",
    bloodType: "O+",
    allergies: ["Penicillin"],
    recentVisits: [
      { id: "v1", date: "2024-11-20", hospital: "Lagos University Teaching Hospital", doctor: "Dr. Okon", diagnosis: "Malaria", status: "Treated" },
      { id: "v2", date: "2024-10-15", hospital: "Abuja National Hospital", doctor: "Dr. Musa", diagnosis: "Routine Checkup", status: "Completed" },
    ],
  };
}

function getMockPatientsList(): Patient[] {
  return [
    { id: "p1", nin: "12345678901", phoneNumber: "+2348012345678", firstName: "Emmanuel", lastName: "Adebayo", bloodType: "O+", allergies: ["Penicillin"] },
    { id: "p2", phoneNumber: "+2348098765432", firstName: "Amina", lastName: "Ibrahim", bloodType: "A-", allergies: [] },
    { id: "p3", nin: "98765432109", phoneNumber: "+2348055512345", firstName: "Chukwu", lastName: "Obi", bloodType: "B+", allergies: ["Sulfa"] },
  ];
}

function getMockNotifications(): Notification[] {
  return [
    { id: "n1", title: "Record Accessed", message: "Dr. Okon at LUTH accessed your file on 2024-11-20 at 14:30.", time: "2h ago", read: false },
    { id: "n2", title: "Appointment Reminder", message: "Upcoming visit at Lagos General on 2024-12-01.", time: "1d ago", read: true },
  ];
}
