import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Database } from "../ui/icons";
import { downloadFile, fetchMyPatient } from "../../api/client";

export function DownloadReportScreen() {
  const navigate = useNavigate();
  const [accessApproved, setAccessApproved] = useState<boolean | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyPatient()
      .then((data) => setAccessApproved(data.accessApproved))
      .catch((err) => {
        setAccessApproved(false);
        setError(err.message);
      });
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    setError("");
    try {
      await downloadFile("/api/patients/me/report", "medical-report.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <Database className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Download Medical Report</h2>
        <p className="mt-2 text-slate-600">
          {accessApproved
            ? "Your unified medical history from every connected hospital, as a PDF."
            : "Your report becomes available once a hospital or doctor approves your access request."}
        </p>
        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
        {accessApproved ? (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="mt-6 rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {downloading ? "Generating..." : "Download PDF Report"}
          </button>
        ) : (
          <button
            onClick={() => navigate("/dashboard/request-access")}
            disabled={accessApproved === null}
            className="mt-6 rounded-2xl border border-emerald-300 px-6 py-3 font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
          >
            Request Access
          </button>
        )}
      </div>
    </div>
  );
}
