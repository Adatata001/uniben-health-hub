// Patient + clinical records data layer (localStorage-backed)

export type Status = "Active" | "Follow-up" | "Cleared";
export type Level = "100" | "200" | "300" | "400";

export type Attachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string; // base64 data URL
  uploadedAt: string;
};

export type Patient = {
  id: string;
  matric: string;
  name: string;
  level: Level;
  gender: "Female" | "Male";
  dob: string;
  phone: string;
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  genotype: "AA" | "AS" | "AC" | "SS" | "SC";
  allergies: string;
  status: Status;
  department?: string;
  attachments?: Attachment[];
};

export type ClinicalRecord = {
  id: string;
  patientId: string;
  date: string;
  complaint: string;
  diagnosis: string;
  prescription: string;
  doctor: string;
};

export type AppointmentStatus = "Pending" | "Confirmed" | "Declined" | "Completed";

export type Appointment = {
  id: string;
  patientId: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  reason: string;
  status: AppointmentStatus;
  createdAt: string;
};

export type AuditAction = "create" | "update" | "delete";
export type AuditEntity = "patient" | "clinical" | "appointment" | "attachment";

export type AuditLogEntry = {
  id: string;
  actor: string;
  action: AuditAction;
  entity: AuditEntity;
  target: string; // human-readable
  timestamp: string;
};

const P_KEY = "uniben.csc.patients.v3";
const R_KEY = "uniben.csc.records.v2";
const A_KEY = "uniben.csc.appointments.v1";
const L_KEY = "uniben.csc.audit.v1";

const localLevels: Level[] = ["100", "200", "300", "400"];
const seedFirstNames = [
  "Amina", "Chidera", "Emeka", "Fatima", "Gbenga", "Halima", "Isaac", "Joy", "Kemi", "Leke",
  "Mercy", "Ngozi", "Ola", "Peace", "Precious", "Rasheed", "Sade", "Tosin", "Uche", "Yemi",
];
const seedLastNames = [
  "Adeyemi", "Balogun", "Chukwu", "Dairo", "Eze", "Fashola", "Ibrahim", "Johnson", "Kalu", "Lawal",
  "Muhammad", "Nwachukwu", "Okonkwo", "Olabode", "Okafor", "Oni", "Opara", "Samuel", "Udo", "Yusuf",
];
const seedBloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
const seedGenotypes = ["AA", "AS", "AC", "SS", "SC"] as const;
const seedAllergies = ["None", "Pollen", "Penicillin", "Dust", "Peanuts", "Latex", "Gluten", "Eggs", "Seafood", "Mold"];
const seedStatuses: Status[] = ["Active", "Follow-up", "Cleared"];

const basePatients: Patient[] = [
  { id: "p1", matric: "CSC/2021/0142", name: "Daniel Osaze Ighodaro", level: "400", gender: "Male", dob: "2003-09-02", phone: "0803 111 0142", bloodGroup: "A+", genotype: "AS", allergies: "Penicillin", status: "Follow-up" },
  { id: "p2", matric: "CSC/2021/0166", name: "Samuel Eghosa", level: "400", gender: "Male", dob: "2003-12-04", phone: "0803 111 0166", bloodGroup: "A-", genotype: "AS", allergies: "None", status: "Active" },
  { id: "p3", matric: "CSC/2022/0307", name: "Grace Eweka", level: "300", gender: "Female", dob: "2004-01-22", phone: "0803 111 0307", bloodGroup: "B+", genotype: "AA", allergies: "None", status: "Cleared" },
  { id: "p4", matric: "CSC/2023/0488", name: "Kelvin Aigbe", level: "200", gender: "Male", dob: "2005-06-11", phone: "0803 111 0488", bloodGroup: "O-", genotype: "AA", allergies: "Dust", status: "Active" },
  { id: "p5", matric: "CSC/2024/0521", name: "Joy Iredia", level: "100", gender: "Female", dob: "2006-03-30", phone: "0803 111 0521", bloodGroup: "AB+", genotype: "AC", allergies: "None", status: "Cleared" },
  { id: "p6", matric: "CSC/2022/0289", name: "Blessing Idahosa", level: "300", gender: "Female", dob: "2004-07-19", phone: "0803 111 0289", bloodGroup: "O+", genotype: "AA", allergies: "Peanuts", status: "Follow-up" },
  { id: "p7", matric: "CSC/2023/0098", name: "Tunde Bakare", level: "200", gender: "Male", dob: "2005-02-14", phone: "0803 111 0098", bloodGroup: "B-", genotype: "AA", allergies: "None", status: "Cleared" },
  { id: "p8", matric: "CSC/2024/0612", name: "Efosa Omoregie", level: "100", gender: "Male", dob: "2006-08-09", phone: "0803 111 0612", bloodGroup: "O+", genotype: "AA", allergies: "None", status: "Active" },
];


function createDummyPatient(index: number): Patient {
  const seq = index + 9;
  const first = seedFirstNames[seq % seedFirstNames.length];
  const last = seedLastNames[Math.floor(seq / seedFirstNames.length) % seedLastNames.length];
  const level = localLevels[seq % localLevels.length];
  const gender = seq % 2 === 0 ? "Female" : "Male";
  const bloodGroup = seedBloodGroups[seq % seedBloodGroups.length];
  const genotype = seedGenotypes[seq % seedGenotypes.length];
  const allergies = seedAllergies[seq % seedAllergies.length];
  const status = seedStatuses[seq % seedStatuses.length];
  const padded = String(seq).padStart(4, "0");
  const matric = `CSC/2024/${padded}`;
  const year = 2003 + ((seq % 4) + 1);
  const month = String((seq % 12) + 1).padStart(2, "0");
  const day = String((seq % 28) + 1).padStart(2, "0");
  return {
    id: `p${seq}`,
    matric,
    name: `${first} ${last}`,
    level,
    gender,
    dob: `${year}-${month}-${day}`,
    phone: `0803 20${String(seq).padStart(4, "0")}`,
    bloodGroup,
    genotype,
    allergies,
    status,
  };
}

const seedPatients: Patient[] = [
  ...basePatients,
  ...Array.from({ length: 192 }, (_, idx) => createDummyPatient(idx)),
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

const seedAppointments: Appointment[] = [];

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
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded (likely large attachments) — silently ignore
  }
}

export function ensureSeed() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(P_KEY)) write(P_KEY, seedPatients);
  if (!localStorage.getItem(R_KEY)) write(R_KEY, seedRecords);
  if (!localStorage.getItem(A_KEY)) write(A_KEY, seedAppointments);
  if (!localStorage.getItem(L_KEY)) write(L_KEY, []);
}

export function getPatients(): Patient[] { ensureSeed(); return read<Patient[]>(P_KEY, []); }
export function savePatients(list: Patient[]) { write(P_KEY, list); }

export function getRecords(): ClinicalRecord[] { ensureSeed(); return read<ClinicalRecord[]>(R_KEY, []); }
export function saveRecords(list: ClinicalRecord[]) { write(R_KEY, list); }

export function getAppointments(): Appointment[] { ensureSeed(); return read<Appointment[]>(A_KEY, []); }
export function saveAppointments(list: Appointment[]) { write(A_KEY, list); }

export function getAudit(): AuditLogEntry[] { ensureSeed(); return read<AuditLogEntry[]>(L_KEY, []); }
export function saveAudit(list: AuditLogEntry[]) { write(L_KEY, list); }

export function logAudit(entry: Omit<AuditLogEntry, "id" | "timestamp">) {
  const list = getAudit();
  const next: AuditLogEntry = {
    ...entry,
    id: uid("a"),
    timestamp: new Date().toISOString(),
  };
  saveAudit([next, ...list].slice(0, 500));
}

export function uid(prefix = "x") {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export const VICTORIA_ID = "p1";
export const LEVELS: Level[] = ["100", "200", "300", "400"];

/* ---------- student session (sign up / sign in) ---------- */

const S_KEY = "uniben.csc.session.v1";

export const DEPARTMENTS = ["CSC", "MTH", "PHY", "CHM", "POL", "ECO", "ACC", "LAW", "MCB", "GEO"];

export const MATRIC_REGEX = /^[A-Z]{3}\d{7}$/;

export function normalizeMatric(input: string) {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function getSessionStudentId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(S_KEY);
  } catch {
    return null;
  }
}

export function setSessionStudentId(id: string) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(S_KEY, id); } catch { /* ignore */ }
}

export function clearSessionStudentId() {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(S_KEY); } catch { /* ignore */ }
}

export type SignUpInput = {
  name: string;
  level: Level;
  department: string;
  matric: string;
};

export function signUpStudent(input: SignUpInput): { ok: true; patient: Patient } | { ok: false; error: string } {
  const name = input.name.trim();
  const matric = normalizeMatric(input.matric);
  const department = input.department.trim().toUpperCase();

  if (name.length < 3 || name.length > 100) return { ok: false, error: "Enter your full name." };
  if (!/^[A-Z]{3}$/.test(department)) return { ok: false, error: "Department must be a 3-letter code (e.g. CSC)." };
  if (!MATRIC_REGEX.test(matric)) return { ok: false, error: "Matriculation number must look like PSC2010374." };

  const list = getPatients();
  if (list.some((p) => normalizeMatric(p.matric) === matric)) {
    return { ok: false, error: "That matriculation number is already registered. Sign in instead." };
  }

  const patient: Patient = {
    id: uid("p"),
    matric,
    name,
    level: input.level,
    department,
    gender: "Female",
    dob: "",
    phone: "",
    bloodGroup: "O+",
    genotype: "AA",
    allergies: "None",
    status: "Active",
    attachments: [],
  };
  savePatients([patient, ...list]);
  logAudit({ actor: name, action: "create", entity: "patient", target: `${name} (${matric}) self-registered` });
  return { ok: true, patient };
}

export function signInStudent(name: string, matric: string): { ok: true; patient: Patient } | { ok: false; error: string } {
  const wantedName = name.trim().toLowerCase();
  const wantedMatric = normalizeMatric(matric);
  const patient = getPatients().find(
    (p) => normalizeMatric(p.matric) === wantedMatric && p.name.trim().toLowerCase() === wantedName,
  );
  if (!patient) return { ok: false, error: "No record found for that name and matriculation number." };
  return { ok: true, patient };
}
