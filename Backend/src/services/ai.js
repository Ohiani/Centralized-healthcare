// AI medical recommendations. Runs on the server so API keys stay private and
// Ollama only needs to listen on localhost (it is never exposed to browsers).

const AI_PROVIDER = () => process.env.AI_PROVIDER || 'ollama'; // 'ollama' | 'openai' | 'mock'
const OLLAMA_BASE_URL = () => process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = () => process.env.OLLAMA_MODEL || 'llama3.2:3b';
const OPENAI_MODEL = () => process.env.OPENAI_MODEL || 'gpt-4o-mini';
// CPU-only servers (e.g. EC2 without a GPU) can take a while to generate
const AI_TIMEOUT_MS = () => Number(process.env.AI_TIMEOUT_MS) || 180000;

const SYSTEM_PROMPT = `You are an AI medical assistant helping healthcare providers with diagnostic suggestions.
IMPORTANT: You are NOT replacing clinical judgment. Always emphasize that AI recommendations are supplementary tools.
Provide analysis based on presented symptoms and medical history.
Include confidence levels and clear disclaimers about the limitations of AI in medical diagnosis.
Respond in a structured format with clear sections for diagnosis, confidence, reasoning, prognosis, recommendations, and differential diagnosis.`;

const calculateAge = (dateOfBirth) => {
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return undefined;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Records are stored newest first; returns the newest record's vitals that have any values
const latestVitals = (records) => {
  for (const record of records) {
    const vitals = record.vitals ? JSON.parse(JSON.stringify(record.vitals)) : {};
    const filled = Object.fromEntries(Object.entries(vitals).filter(([, v]) => v !== undefined && v !== null && v !== ''));
    if (Object.keys(filled).length) return filled;
  }
  return undefined;
};

// Turns a Patient document into the structured summary the prompt is built from
const buildPatientData = (patient) => {
  const records = patient.recentVisits || [];
  const byType = (type) => records.filter((r) => (r.recordType || 'diagnosis') === type);

  return {
    demographics: {
      age: patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : undefined,
      bloodType: patient.bloodType,
      allergies: patient.allergies || []
    },
    medicalHistory: {
      diagnoses: byType('diagnosis').map((r) => r.diagnosis),
      medications: byType('prescription').flatMap((r) => (r.prescriptions || []).map((p) => p.drug)),
      procedures: byType('procedure').map((r) => r.diagnosis),
      labResults: byType('lab').map((r) => (r.labResults ? Object.fromEntries(r.labResults) : {})),
      imagingFindings: byType('imaging').map((r) => r.imagingFindings || '')
    },
    vitals: latestVitals(records)
  };
};

const buildMedicalPrompt = ({ demographics, medicalHistory, vitals }, currentSymptoms) => {
  const vitalsText = vitals && Object.keys(vitals).length
    ? Object.entries(vitals).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => `- ${k}: ${v}`).join('\n')
    : 'No current vitals recorded';

  return `Patient Demographics:
- Age: ${demographics.age ?? 'Unknown'}
- Gender: Unknown
- Blood Type: ${demographics.bloodType || 'Unknown'}
- Allergies: ${demographics.allergies.join(', ') || 'None reported'}

Medical History:
- Previous Diagnoses: ${medicalHistory.diagnoses.join(', ') || 'None'}
- Current Medications: ${medicalHistory.medications.join(', ') || 'None'}
- Previous Procedures: ${medicalHistory.procedures.join(', ') || 'None'}

Recent Lab Results:
${medicalHistory.labResults.map((result, index) =>
  `Result ${index + 1}: ${Object.entries(result).map(([key, value]) => `${key}: ${value}`).join(', ')}`
).join('\n') || 'No recent lab results'}

Imaging Findings:
${medicalHistory.imagingFindings.filter(Boolean).join('; ') || 'No recent imaging'}

Current Vitals:
${vitalsText}

${currentSymptoms ? `Current Symptoms/Concerns: ${currentSymptoms}` : 'No specific current symptoms reported'}

Please provide:
1. Primary diagnosis suggestion with confidence level (0-100%)
2. Clinical reasoning based on the data provided
3. Prognosis assessment
4. Recommended next steps or tests
5. Differential diagnosis considerations

Remember: This is AI-assisted analysis and should not replace clinical judgment.`;
};

const SECTION_HEADERS = [
  'Primary Diagnosis Suggestion',
  'Clinical Reasoning',
  'Prognosis Assessment',
  'Recommended Next Steps or Tests',
  'Differential Diagnosis Considerations'
];

const splitList = (content) => content
  .split(/\d+\.\s+|-\s+|\*\s+/)
  .filter((item) => item.trim())
  .map((item) => item.trim().replace(/^[*-\s]*/, ''));

// Matches a section heading at the start of a line, in any of the forms models use:
// "Clinical Reasoning", "**Clinical Reasoning:**", "2. Clinical Reasoning: text", "### Clinical Reasoning"
const headerPatterns = SECTION_HEADERS.map((header) => new RegExp(
  `^(?:#+\\s*)?(?:\\d+[.)]\\s*)?(\\*\\*)?\\s*${header}\\s*(:)?\\s*(?:\\*\\*)?\\s*(:)?\\s*(.*)$`,
  'i'
));

// Returns { index, rest } if the line is a section heading, otherwise null
const matchHeader = (line) => {
  for (let index = 0; index < headerPatterns.length; index++) {
    const match = line.match(headerPatterns[index]);
    if (!match) continue;
    const [, bold, colon, colonAfterBold, rest] = match;
    // Without bold or a colon, only a line that is exactly the heading counts,
    // so a sentence like "Clinical reasoning suggests..." stays as content
    if (bold || colon || colonAfterBold || !rest) {
      return { index, rest: rest.replace(/\*\*/g, '').trim() };
    }
  }
  return null;
};

// Parses the model's free-text answer into the fields the frontend displays
const parseAIResponse = (response) => {
  const sections = [];
  let currentSection = null;

  for (const line of response.replace(/\r/g, '').split('\n')) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const header = matchHeader(trimmedLine);
    if (header) {
      if (currentSection) sections.push(currentSection);
      currentSection = { header: SECTION_HEADERS[header.index], content: header.rest ? [header.rest] : [] };
    } else if (currentSection) {
      currentSection.content.push(trimmedLine.replace(/\*\*/g, ''));
    }
  }
  if (currentSection) sections.push(currentSection);

  let diagnosis = 'Unable to determine primary diagnosis';
  let confidence = 50;
  let reasoning = 'AI analysis inconclusive';
  let prognosis = 'Prognosis unclear';
  let recommendations = [];
  let differentialDiagnosis = [];

  for (const section of sections) {
    const content = section.content.join('\n').trim();

    switch (section.header) {
      case 'Primary Diagnosis Suggestion': {
        const diagMatch = content.match(/diagnosis of (.+?),/i);
        const confMatch = content.match(/confidence level of (\d+)%/i);
        if (diagMatch) diagnosis = diagMatch[1].trim();
        if (confMatch) confidence = parseInt(confMatch[1], 10);
        if (!diagMatch) {
          const fallbackConf = content.match(/(\d+)%/);
          if (fallbackConf) confidence = parseInt(fallbackConf[1], 10);
          diagnosis = content.replace(/\s*\([^)]*\)/, '').trim();
        }
        break;
      }
      case 'Clinical Reasoning':
        reasoning = content;
        break;
      case 'Prognosis Assessment':
        prognosis = content;
        break;
      case 'Recommended Next Steps or Tests':
        recommendations = splitList(content);
        break;
      case 'Differential Diagnosis Considerations':
        differentialDiagnosis = splitList(content);
        break;
    }
  }

  return {
    diagnosis,
    confidence: Math.min(100, Math.max(0, confidence)),
    reasoning,
    prognosis,
    recommendations: recommendations.length > 0 ? recommendations : ['Consult with supervising physician', 'Consider additional testing'],
    differentialDiagnosis: differentialDiagnosis.length > 0 ? differentialDiagnosis : ['Multiple possibilities - further evaluation needed']
  };
};

const getMockAIResponse = () => ({
  diagnosis: 'Mock diagnosis for testing (AI service unavailable)',
  confidence: 75,
  reasoning: 'This is a mock response generated because AI_PROVIDER=mock. In a real scenario, this would contain actual medical analysis based on patient data.',
  prognosis: 'Mock prognosis - requires clinical evaluation',
  recommendations: ['Consult with supervising physician', 'Consider additional testing', 'Monitor patient symptoms closely'],
  differentialDiagnosis: ['Multiple possibilities require further evaluation', 'Additional diagnostic testing recommended']
});

const callOllama = async (prompt) => {
  let response;
  try {
    response = await fetch(`${OLLAMA_BASE_URL()}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL(),
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        options: { temperature: 0.3, num_predict: 1500 },
        stream: false
      }),
      signal: AbortSignal.timeout(AI_TIMEOUT_MS())
    });
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new Error(`Ollama took longer than ${AI_TIMEOUT_MS() / 1000}s to respond`);
    }
    throw new Error(`Cannot connect to Ollama at ${OLLAMA_BASE_URL()}. Is it running?`);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Ollama error ${response.status}: ${body || response.statusText}. Is the model "${OLLAMA_MODEL()}" installed?`);
  }

  const data = await response.json();
  if (!data.message?.content) {
    throw new Error('No response content from Ollama');
  }

  return data.message.content;
};

const callOpenAI = async (prompt) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in the backend .env');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL(),
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1500,
      temperature: 0.3
    }),
    signal: AbortSignal.timeout(AI_TIMEOUT_MS())
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`OpenAI error ${response.status}: ${body || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }
  return content;
};

const getRecommendations = async (patient, currentSymptoms) => {
  const provider = AI_PROVIDER();
  if (provider === 'mock') {
    return { provider, model: 'mock', recommendation: getMockAIResponse() };
  }

  const prompt = buildMedicalPrompt(buildPatientData(patient), currentSymptoms);
  const raw = provider === 'openai' ? await callOpenAI(prompt) : await callOllama(prompt);
  const model = provider === 'openai' ? OPENAI_MODEL() : OLLAMA_MODEL();
  return { provider, model, recommendation: parseAIResponse(raw) };
};

// Reports whether the configured provider is reachable and the model is installed
const getStatus = async () => {
  const provider = AI_PROVIDER();
  if (provider === 'mock') {
    return { provider, model: 'mock', reachable: true };
  }
  if (provider === 'openai') {
    return { provider, model: OPENAI_MODEL(), reachable: Boolean(process.env.OPENAI_API_KEY), note: process.env.OPENAI_API_KEY ? undefined : 'OPENAI_API_KEY not set' };
  }

  try {
    const response = await fetch(`${OLLAMA_BASE_URL()}/api/tags`, { signal: AbortSignal.timeout(5000) });
    const data = await response.json();
    const installed = (data.models || []).map((m) => m.name);
    const modelInstalled = installed.some((name) => name === OLLAMA_MODEL() || name === `${OLLAMA_MODEL()}:latest`);
    return {
      provider,
      model: OLLAMA_MODEL(),
      reachable: true,
      modelInstalled,
      installedModels: installed,
      note: modelInstalled ? undefined : `Run: ollama pull ${OLLAMA_MODEL()}`
    };
  } catch {
    return { provider, model: OLLAMA_MODEL(), reachable: false, note: `Ollama is not running at ${OLLAMA_BASE_URL()}` };
  }
};

module.exports = { getRecommendations, getStatus, parseAIResponse, buildPatientData, buildMedicalPrompt };
