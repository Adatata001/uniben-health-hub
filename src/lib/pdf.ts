import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Patient, ClinicalRecord } from "./records";

export function exportPatientPdf(patient: Patient, records: ClinicalRecord[]) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  // Header band
  doc.setFillColor(15, 15, 15);
  doc.rect(0, 0, pageW, 28, "F");
  doc.setTextColor(255);
  doc.setFontSize(14);
  doc.text("UNIBEN Health Centre", 14, 12);
  doc.setFontSize(9);
  doc.text("Medical Record — Department of Computer Science", 14, 19);
  doc.text(new Date().toLocaleDateString(), pageW - 14, 19, { align: "right" });

  doc.setTextColor(15);
  doc.setFontSize(18);
  doc.text(patient.name, 14, 44);
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`${patient.matric} · ${patient.level} Level · ${patient.gender}`, 14, 51);

  autoTable(doc, {
    startY: 60,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [240, 240, 240], textColor: 30 },
    head: [["Field", "Value"]],
    body: [
      ["Date of birth", patient.dob],
      ["Phone", patient.phone],
      ["Blood group", patient.bloodGroup],
      ["Genotype", patient.genotype],
      ["Allergies", patient.allergies || "None"],
      ["Status", patient.status],
    ],
  });

  const afterProfile = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setTextColor(15);
  doc.text("Clinical history", 14, afterProfile);

  autoTable(doc, {
    startY: afterProfile + 4,
    theme: "striped",
    styles: { fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: [15, 15, 15], textColor: 255 },
    head: [["Date", "Complaint", "Diagnosis", "Prescription", "Doctor"]],
    body: records.length
      ? records.map((r) => [r.date, r.complaint, r.diagnosis, r.prescription, r.doctor])
      : [["—", "No clinical entries recorded", "", "", ""]],
  });

  const safe = patient.matric.replace(/[^a-z0-9]+/gi, "_");
  doc.save(`medical_record_${safe}.pdf`);
}
