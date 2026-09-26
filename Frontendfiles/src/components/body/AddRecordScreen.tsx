import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle } from "../ui/icons";
import { createRecord, type RecordType } from "../../api/client";

const RECORD_TYPES: { id: RecordType; label: string }[] = [
  { id: "diagnosis", label: "Diagnosis / Checkup" },
  { id: "lab", label: "Lab Results" },
  { id: "prescription", label: "Prescription" },
  { id: "imaging", label: "Imaging (X-ray, MRI, etc.)" },
  { id: "procedure", label: "Procedure" },
];

type AddRecordScreenProps = {
  patientId: string;
  patientName?: string;
};

export function AddRecordScreen({ patientId, patientName }: AddRecordScreenProps) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [recordType, setRecordType] = useState<RecordType>("diagnosis");
  const [form, setForm] = useState({
    diagnosis: "",
    notes: "",
    bloodPressure: "",
    temperature: "",
    heartRate: "",
    weight: "",
    labResults: "",
    prescriptions: "",
    imagingFindings: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const record = await createRecord(patientId, {
        date: new Date().toISOString().slice(0, 10),
        hospital: "Current Hospital",
        doctor: "Current Doctor",
        diagnosis: form.diagnosis,
        notes: form.notes,
        status: "Recorded",
        recordType,
        labResults: form.labResults ? Object.fromEntries(
          form.labResults
            .split("\n")
            .filter(Boolean)
            .map((l) => {
              const idx = l.indexOf(":");
              return idx >= 0 ? [l.slice(0, idx).trim(), l.slice(idx + 1).trim()] : null;
            })
            .filter((a): a is [string, string] => !!a && a[0].length > 0)
        ) : undefined,
        prescriptions: form.prescriptions ? form.prescriptions.split("\n").filter(Boolean).map((line) => {
          const [drug, dosage] = line.split(":").map((s) => s.trim());
          return { drug: drug || "", dosage: dosage || "" };
        }) : undefined,
        imagingFindings: form.imagingFindings || undefined,
        vitals: {
          bloodPressure: form.bloodPressure || undefined,
          temperature: form.temperature ? Number(form.temperature) : undefined,
          heartRate: form.heartRate ? Number(form.heartRate) : undefined,
          weight: form.weight ? Number(form.weight) : undefined,
        },
      });
      if (record) navigate(`/dashboard/patient/${patientId}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <PlusCircle className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Add Medical Record</h2>
          <p className="text-sm text-slate-500">
            {patientName ? `Recording for ${patientName}` : "Create a new medical record"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Record Type</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {RECORD_TYPES.map((rt) => (
              <button
                key={rt.id}
                type="button"
                onClick={() => setRecordType(rt.id)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  recordType === rt.id
                    ? "bg-emerald-600 text-white"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {rt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {recordType === "diagnosis" ? "Diagnosis / Reason" : recordType === "lab" ? "Test / Procedure" : recordType === "imaging" ? "Imaging Type" : "Title"}
          </label>
          <input
            type="text"
            value={form.diagnosis}
            onChange={(e) => setForm((f) => ({ ...f, diagnosis: e.target.value }))}
            placeholder="e.g. Malaria, Routine Checkup"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Additional notes..."
            rows={3}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        {recordType === "lab" && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Lab Results (one per line: Name: Value)</label>
            <textarea
              value={form.labResults}
              onChange={(e) => setForm((f) => ({ ...f, labResults: e.target.value }))}
              placeholder={"WBC: 7.2 x 10^9/L\nRBC: 5.1 x 10^12/L\nHemoglobin: 14.5 g/dL"}
              rows={5}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 font-mono text-sm"
            />
          </div>
        )}

        {recordType === "prescription" && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Prescriptions (one per line: Drug: Dosage)</label>
            <textarea
              value={form.prescriptions}
              onChange={(e) => setForm((f) => ({ ...f, prescriptions: e.target.value }))}
              placeholder={"Amoxicillin 500mg: 3x daily, 7 days\nCetirizine 10mg: 1x daily, 5 days"}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
            />
          </div>
        )}

        {recordType === "imaging" && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Imaging Findings</label>
            <textarea
              value={form.imagingFindings}
              onChange={(e) => setForm((f) => ({ ...f, imagingFindings: e.target.value }))}
              placeholder="e.g. No acute cardiopulmonary disease. Lung fields are clear."
              rows={4}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
            />
          </div>
        )}

        <h3 className="text-sm font-semibold text-slate-700">Vitals (optional)</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-xs font-medium text-slate-500">Blood Pressure</label>
            <input
              type="text"
              value={form.bloodPressure}
              onChange={(e) => setForm((f) => ({ ...f, bloodPressure: e.target.value }))}
              placeholder="e.g. 120/80"
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Temperature (°C)</label>
            <input
              type="number"
              step="0.1"
              value={form.temperature}
              onChange={(e) => setForm((f) => ({ ...f, temperature: e.target.value }))}
              placeholder="36.5"
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Heart Rate (bpm)</label>
            <input
              type="number"
              value={form.heartRate}
              onChange={(e) => setForm((f) => ({ ...f, heartRate: e.target.value }))}
              placeholder="72"
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={form.weight}
              onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
              placeholder="70"
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-2xl bg-emerald-600 px-6 py-2 font-semibold text-white shadow-md shadow-emerald-200/60 transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save to Central DB"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-2xl border border-slate-200 px-6 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
