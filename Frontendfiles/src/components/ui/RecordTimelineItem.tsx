import { Eye } from "lucide-react";
import type { RecordType, Visit } from "../../api/client";

const TYPE_COLORS: Record<string, string> = {
  diagnosis: "bg-amber-100 text-amber-800",
  lab: "bg-blue-100 text-blue-800",
  prescription: "bg-emerald-100 text-emerald-800",
  imaging: "bg-violet-100 text-violet-800",
  procedure: "bg-rose-100 text-rose-800",
};

export function RecordTimelineItem({ item }: { item: Visit & { recordType?: RecordType } }) {
  const type = item.recordType || "diagnosis";
  const color = TYPE_COLORS[type] || "bg-slate-100 text-slate-800";
  // Records from the database contain empty [] / {} for fields that were not filled in
  const labResults = Object.entries(item.labResults || {});
  const prescriptions = item.prescriptions || [];
  const vitals = item.vitals || {};
  const vitalParts = [
    vitals.bloodPressure && `BP ${vitals.bloodPressure}`,
    vitals.temperature && `Temp ${vitals.temperature}°C`,
    vitals.heartRate && `HR ${vitals.heartRate} bpm`,
    vitals.weight && `Weight ${vitals.weight} kg`,
  ].filter(Boolean);
  return (
    <div className="rounded-xl border border-slate-100 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">{item.date}</p>
          <h4 className="text-sm font-semibold text-slate-900">{item.hospital}</h4>
          <p className="text-xs text-slate-500">Attending: {item.doctor}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${color}`}>
          {type}
        </span>
      </div>
      <div className="mt-4">
        <h4 className="font-semibold text-slate-900 mb-2">{item.diagnosis}</h4>
        {labResults.length > 0 && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {labResults.map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-slate-600">{k}:</span>
                <span className="font-semibold">{v}</span>
              </div>
            ))}
          </div>
        )}
        {prescriptions.length > 0 && (
          <div className="rounded-lg bg-slate-50 p-3 space-y-2 text-sm">
            {prescriptions.map((p, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-slate-700">{p.drug}</span>
                <span className="font-semibold">{p.dosage}</span>
              </div>
            ))}
          </div>
        )}
        {item.imagingFindings && (
          <>
            <p className="text-sm text-slate-700">{item.imagingFindings}</p>
            <button type="button" className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
              <Eye className="h-4 w-4" /> View Image
            </button>
          </>
        )}
        {item.notes && <p className="mt-2 text-sm text-slate-600">{item.notes}</p>}
        {vitalParts.length > 0 && <p className="mt-2 text-xs text-slate-500">Vitals: {vitalParts.join(" · ")}</p>}
      </div>
    </div>
  );
}
