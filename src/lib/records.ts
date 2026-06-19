// Patient + clinical records data layer (localStorage-backed)

export type Status = "Active" | "Follow-up" | "Cleared";

export type Patient = {
  id: string;
  matric: string;
  name: string;
  level: "100" | "200" | "300" | "400" | "500";
  gender: "Female" | "Male";
  dob: string; // yyyy-mm-dd
  phone: string;
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  genotype: "AA" | "AS" | "AC" | "SS" | "SC";
  allergies: string;
  status: Status;
};

export type ClinicalRecord = {
  id: string;
  patientId: string;
  date: string; // yyyy-mm-dd
  complaint: string;
  diagnosis: string;
  prescription: string;
  doctor: string;
};

const P_KEY = "uniben.csc.patients.v1";
const R_KEY = "uniben.csc.records.v1";

const seedPatients: Patient[] = [
  { id: "p1", matric: "CSC/2020/0011", name: "Akhazogie Victoria Precious", level: "500", gender: "Female", dob: "2002-04-18", phone: "0803 111 0011", bloodGroup: "O+", genotype: "AA", allergies: "None", status: "Active" },
  { id: "p2", matric: "CSC/2021/0142", name: "Daniel Osaze Ighodaro", level: "400", gender: "Male", dob: "2003-09-02", phone: "0803 111 0142", bloodGroup: "A+", genotype: "AS", allergies: "Penicillin", status: "Follow-up" },
  { id: "p3", matric: "CSC/2022/0307", name: "Grace Eweka", level: "300", gender: "Female", dob: "2004-01-22", phone: "0803 111 0307", bloodGroup: "B+", genotype: "AA", allergies: "None", status: "Cleared" },
  { id: "p4", matric: "CSC/2023/0488", name: "Kelvin Aigbe", level: "200", gender: "Male", dob: "2005-06-11", phone: "0803 111 0488", bloodGroup: "O-", genotype: "AA", allergies: "Dust", status: "Active" },
  { id: "p5", matric: "CSC/2024/0521", name: "Joy Iredia", level: "100", gender: "Female", dob: "2006-03-30", phone: "0803 111 0521", bloodGroup: "AB+", genotype: "AC", allergies: "None", status: "Cleared" },
  { id: "p6", matric: "CSC/2021/0166", name: "Samuel Eghosa", level: "400", gender: "Male", dob: "2003-12-04", phone: "0803 111 0166", bloodGroup: "A-", genotype: "AS", allergies: "None", status: "Active" },
  { id: "p7", matric: "CSC/2022/0289", name: "Blessing Idahosa", level: "300", gender: "Female", dob: "2004-07-19", phone: "0803 111 0289", bloodGroup: "O+", genotype: "AA", allergies: "Peanuts", status: "Follow-up" },
  { id: "p8", matric: "CSC/2020/0098", name: "Tunde Bakare", level: "500", gender: "Male", dob: "2002-02-14", phone: "0803 111 0098", bloodGroup: "B-", genotype: "AA", allergies: "None", status: "Cleared" },
];

const seedRecords: ClinicalRecord[] = [
  { id: "r1", patientId: "p1", date: "2026-06-12", complaint: "Fever and headache", diagnosis: "Malaria", prescription: "Coartem 80/480mg — 1 tab BD × 3 days", doctor: "Dr. Adeyemi" },
  { id: "r2", patientId: "p1", date: "2026-03-04", complaint: "Routine check-up", diagnosis: "Healthy", prescription: "Multivitamins daily", doctor: "Dr. Okafor" },
  { id: "r3", patientId: "p2", date: "2026-06-09", complaint: "Persistent cough", diagnosis: "Upper respiratory infection", prescription: "Amoxicillin 500mg — 1 cap TDS × 5 days", doctor: "Dr. Adeyemi" },
  { id: "r4", patientId: "p3", date: "2026-05-30", complaint: "Sprained ankle", diagnosis: "Grade 1 sprain", prescription: "Ibuprofen 400mg PRN; rest", doctor: "Dr. Bello" },
  { id: "r5", patientId: "p4", date: "2026-06-15", complaint: "Itchy eyes, sneezing", diagnosis: "Allergic rhinitis", prescription: "Loratadine 10mg OD × 7 days", doctor: "Dr. Okafor" },
  { id: "r6", patientId: "p6", date: "2026-06-10", complaint: "Stomach pain", diagnosis: "Gastritis", prescription: "Omeprazole 20mg OD × 14 days", doctor: "Dr. Adeyemi" },
  { id: "r7", patientId: "p7", date: "2026-06-05", complaint: "Skin rash", diagnosis: "Contact dermatitis", prescription: "Hydrocortisone cream BD × 7 days", doctor: "Dr. Bello" },
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function ensureSeed() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(P_KEY)) write(P_KEY, seedPatients);
  if (!localStorage.getItem(R_KEY)) write(R_KEY, seedRecords);
}

export function getPatients(): Patient[] {
  ensureSeed();
  return read<Patient[]>(P_KEY, []);
}

export function savePatients(list: Patient[]) {
  write(P_KEY, list);
}

export function getRecords(): ClinicalRecord[] {
  ensureSeed();
  return read<ClinicalRecord[]>(R_KEY, []);
}

export function saveRecords(list: ClinicalRecord[]) {
  write(R_KEY, list);
}

export function uid(prefix = "x") {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
