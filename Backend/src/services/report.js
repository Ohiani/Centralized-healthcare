const PDFDocument = require('pdfkit');

const RECORD_TYPE_LABELS = {
  diagnosis: 'Diagnosis / Checkup',
  lab: 'Lab Results',
  prescription: 'Prescription',
  imaging: 'Imaging',
  procedure: 'Procedure'
};

// Streams a PDF of the patient's unified medical history into the response
const streamPatientReport = (patient, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const fileName = `CHRS-report-${patient.lastName || 'patient'}-${new Date().toISOString().slice(0, 10)}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  doc.pipe(res);

  doc.fontSize(20).fillColor('#047857').text('Centralized Healthcare Record System');
  doc.fontSize(12).fillColor('#475569').text('Unified Medical History Report');
  doc.moveDown(0.3).fontSize(9).text(`Generated ${new Date().toLocaleString('en-GB')}`);
  doc.moveDown();

  doc.fontSize(14).fillColor('#0f172a').text('Patient Details', { underline: true });
  doc.moveDown(0.5).fontSize(11);
  const details = [
    ['Name', `${patient.firstName} ${patient.lastName}`],
    ['NIN', patient.nin || '—'],
    ['Phone', patient.phoneNumber || '—'],
    ['Email', patient.email || '—'],
    ['Date of Birth', patient.dateOfBirth || '—'],
    ['Blood Type', patient.bloodType || '—'],
    ['Allergies', (patient.allergies || []).join(', ') || 'None recorded']
  ];
  for (const [label, value] of details) {
    doc.font('Helvetica-Bold').text(`${label}: `, { continued: true }).font('Helvetica').text(value);
  }

  doc.moveDown();
  doc.fontSize(14).text('Medical Records', { underline: true });
  doc.moveDown(0.5);

  const records = patient.recentVisits || [];
  if (records.length === 0) {
    doc.fontSize(11).fillColor('#64748b').text('No medical records on file.');
  }

  for (const record of records) {
    if (doc.y > 700) doc.addPage();

    doc.fontSize(12).fillColor('#0f172a').font('Helvetica-Bold')
      .text(`${record.date} — ${record.diagnosis}`);
    doc.fontSize(10).font('Helvetica').fillColor('#475569')
      .text(`${RECORD_TYPE_LABELS[record.recordType] || 'Record'} · ${record.hospital} · ${record.doctor} · Status: ${record.status}`);
    doc.fillColor('#0f172a');

    if (record.notes) doc.text(`Notes: ${record.notes}`);

    const vitals = record.vitals || {};
    const vitalParts = [
      vitals.bloodPressure && `BP ${vitals.bloodPressure}`,
      vitals.temperature && `Temp ${vitals.temperature}°C`,
      vitals.heartRate && `HR ${vitals.heartRate} bpm`,
      vitals.weight && `Weight ${vitals.weight} kg`
    ].filter(Boolean);
    if (vitalParts.length) doc.text(`Vitals: ${vitalParts.join(', ')}`);

    if (record.labResults && record.labResults.size) {
      doc.text('Lab results: ' + [...record.labResults.entries()].map(([k, v]) => `${k}: ${v}`).join('; '));
    }
    if (record.prescriptions && record.prescriptions.length) {
      doc.text('Prescriptions: ' + record.prescriptions.map((p) => `${p.drug} (${p.dosage})`).join('; '));
    }
    if (record.imagingFindings) doc.text(`Imaging findings: ${record.imagingFindings}`);

    doc.moveDown(0.8);
  }

  doc.moveDown().fontSize(8).fillColor('#94a3b8')
    .text('This report was generated from the CHRS central database. Confidential medical information.', { align: 'center' });

  doc.end();
};

module.exports = { streamPatientReport };
