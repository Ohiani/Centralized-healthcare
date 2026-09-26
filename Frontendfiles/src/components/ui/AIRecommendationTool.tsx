import { useState, useEffect, useCallback, useRef } from 'react';
import { Brain, AlertTriangle, Loader2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { getMedicalRecommendations, type AIRecommendation } from '../../services/aiService';
import { getId, type Patient, type Visit } from '../../api/client';

interface AIRecommendationProps {
  patient: Patient;
  medicalRecords: Visit[];
  currentSymptoms?: string;
  // Hospital portals authenticate with their API key instead of a login token
  apiKey?: string;
}

export function AIRecommendationTool({ patient, medicalRecords, currentSymptoms, apiKey }: AIRecommendationProps) {
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);
  const patientId = getId(patient);

  const generateRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // The backend loads the patient's records itself, so only the ID is sent
      const result = await getMedicalRecommendations(patientId, currentSymptoms, apiKey);
      setRecommendation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  }, [patientId, currentSymptoms, apiKey]);

  useEffect(() => {
    // Auto-generate recommendations when component mounts with sufficient data
    if (!hasFetched.current && patientId && medicalRecords.length > 0) {
      hasFetched.current = true;
      generateRecommendations();
    }
  }, [patientId, medicalRecords.length, generateRecommendations]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return <CheckCircle className="h-4 w-4" />;
    if (confidence >= 60) return <AlertTriangle className="h-4 w-4" />;
    return <XCircle className="h-4 w-4" />;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <Brain className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">AI Medical Assistant</h3>
              <p className="text-sm text-slate-600">AI-powered diagnosis and prognosis insights</p>
            </div>
          </div>
          <button
            onClick={generateRecommendations}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {loading ? 'Analyzing...' : 'Refresh Analysis'}
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Disclaimer */}
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Medical Disclaimer</p>
              <p>
                AI recommendations are supplementary tools and should not replace clinical judgment,
                professional medical advice, or physician expertise. Always consult with qualified
                healthcare providers for diagnosis and treatment decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-800">Analysis Failed</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !recommendation && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-slate-600">Analyzing patient data and generating recommendations...</p>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendation && (
          <div className="space-y-6">
            {/* Primary Diagnosis */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-bold text-slate-900">Primary Diagnosis Suggestion</h4>
                <div className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${getConfidenceColor(recommendation.confidence)}`}>
                  {getConfidenceIcon(recommendation.confidence)}
                  {recommendation.confidence}% Confidence
                </div>
              </div>
              <p className="text-slate-800 font-medium">{recommendation.diagnosis}</p>
            </div>

            {/* Clinical Reasoning */}
            <div className="rounded-xl border border-slate-200 p-5">
              <h4 className="text-lg font-bold text-slate-900 mb-3">Clinical Reasoning</h4>
              <p className="text-slate-700 leading-relaxed">{recommendation.reasoning}</p>
            </div>

            {/* Prognosis */}
            <div className="rounded-xl border border-slate-200 bg-emerald-50 p-5">
              <h4 className="text-lg font-bold text-emerald-900 mb-3">Prognosis Assessment</h4>
              <p className="text-emerald-800">{recommendation.prognosis}</p>
            </div>

            {/* Recommendations */}
            <div className="rounded-xl border border-slate-200 p-5">
              <h4 className="text-lg font-bold text-slate-900 mb-3">Recommended Actions</h4>
              <ul className="space-y-2">
                {recommendation.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-100 p-1 mt-1">
                      <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                    </div>
                    <span className="text-slate-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Differential Diagnosis */}
            <div className="rounded-xl border border-slate-200 p-5">
              <h4 className="text-lg font-bold text-slate-900 mb-3">Differential Diagnosis</h4>
              <div className="grid gap-2">
                {recommendation.differentialDiagnosis.map((diagnosis: string, index: number) => (
                  <div key={index} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {diagnosis}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

