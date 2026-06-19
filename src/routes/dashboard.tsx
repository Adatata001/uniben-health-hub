import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  getPatients,
  savePatients,
  getRecords,
  saveRecords,
  uid,
  type Patient,
  type ClinicalRecord,
  type Status,
} from "@/lib/records";
import { exportPatientPdf } from "@/lib/pdf";
import { Download, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Health staff dashboard — UNIBEN MedRecords" },
      { name: "description", content: "Manage CSC student medical records, clinical entries and analytics." },
    ],
  }),
  component: Dashboard,
});

type Tab = "overview" | "patients" | "clinical";

function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [query, setQuery] = useState("");

  // modals
  const [patientForm, setPatientForm] = useState<Patient | null>(null);
  const [recordForm, setRecordForm] = useState<ClinicalRecord | null>(null);

  useEffect(() => {
    setPatients(getPatients());
    setRecords(getRecords());
  }, []);

  const persistPatients = (next: Patient[]) => {
    setPatients(next);
    savePatients(next);
  };
  const persistRecords = (next: ClinicalRecord[]) => {
    setRecords(next);
    saveRecords(next);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) => p.matric.toLowerCase().includes(q) || p.name.toLowerCase().includes(q),
    );
  }, [query, patients]);

  // CRUD patients
  const openNewPatient = () =>
    setPatientForm({
      id: "",
      matric: "CSC/2024/",
      name: "",
      level: "100",
      gender: "Female",
      dob: "",
      phone: "",
      bloodGroup: "O+",
      genotype: "AA",
      allergies: "",
      status: "Active",
    });

  const savePatient = (p: Patient) => {
    if (!p.name.trim() || !p.matric.trim()) return;
    if (p.id) {
      persistPatients(patients.map((x) => (x.id === p.id ? p : x)));
    } else {
      persistPatients([{ ...p, id: uid("p") }, ...patients]);
    }
    setPatientForm(null);
  };

  const deletePatient = (id: string) => {
    if (!confirm("Delete this patient and all their clinical entries?")) return;
    persistPatients(patients.filter((p) => p.id !== id));
    persistRecords(records.filter((r) => r.patientId !== id));
  };

  // CRUD clinical
  const openNewRecord = (patientId?: string) =>
    setRecordForm({
      id: "",
      patientId: patientId ?? patients[0]?.id ?? "",
      date: new Date().toISOString().slice(0, 10),
      complaint: "",
      diagnosis: "",
      prescription: "",
      doctor: "Dr. Adeyemi",
    });

  const saveRecord = (r: ClinicalRecord) => {
    if (!r.patientId || !r.diagnosis.trim()) return;
    if (r.id) {
      persistRecords(records.map((x) => (x.id === r.id ? r : x)));
    } else {
      persistRecords([{ ...r, id: uid("r") }, ...records]);
    }
    setRecordForm(null);
  };

  const deleteRecord = (id: string) => {
    if (!confirm("Delete this clinical entry?")) return;
    persistRecords(records.filter((r) => r.id !== id));
  };

  // Stats
  const stats = useMemo(() => {
    const byLevel = ["100", "200", "300", "400", "500"].map((lvl) => ({
      level: `${lvl}L`,
      count: patients.filter((p) => p.level === lvl).length,
    }));
    const byStatus: { name: Status; value: number }[] = (
      ["Active", "Follow-up", "Cleared"] as Status[]
    ).map((s) => ({ name: s, value: patients.filter((p) => p.status === s).length }));
    return { byLevel, byStatus };
  }, [patients]);

  const patientName = (id: string) => patients.find((p) => p.id === id)?.name ?? "—";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-sm bg-primary text-primary-foreground">
              <span className="font-mono text-[11px]">M</span>
            </span>
            <span className="font-mono text-sm">MedRecords / Health staff</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="font-mono hidden text-xs uppercase tracking-widest text-muted-foreground md:inline">
              Dr. Adeyemi · UNIBEN Health Centre
            </span>
            <Link to="/auth" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
              Switch
            </Link>
          </div>
        </div>
      </header>

      <div className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-6">
          {(["overview", "patients", "clinical"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`font-mono px-4 py-3 text-[11px] uppercase tracking-widest transition ${
                tab === t
                  ? "border-b-2 border-foreground text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {tab === "overview" && (
          <OverviewTab patients={patients} records={records} stats={stats} />
        )}

        {tab === "patients" && (
          <PatientsTab
            patients={filtered}
            allRecords={records}
            query={query}
            onQuery={setQuery}
            onAdd={openNewPatient}
            onEdit={setPatientForm}
            onDelete={deletePatient}
          />
        )}

        {tab === "clinical" && (
          <ClinicalTab
            records={records}
            patientName={patientName}
            onAdd={() => openNewRecord()}
            onEdit={setRecordForm}
            onDelete={deleteRecord}
          />
        )}
      </main>

      {patientForm && (
        <PatientModal
          value={patientForm}
          onChange={setPatientForm}
          onClose={() => setPatientForm(null)}
          onSave={savePatient}
        />
      )}

      {recordForm && (
        <RecordModal
          value={recordForm}
          patients={patients}
          onChange={setRecordForm}
          onClose={() => setRecordForm(null)}
          onSave={saveRecord}
        />
      )}
    </div>
  );
}

/* ----------------------------- Overview tab ----------------------------- */

function OverviewTab({
  patients,
  records,
  stats,
}: {
  patients: Patient[];
  records: ClinicalRecord[];
  stats: { byLevel: { level: string; count: number }[]; byStatus: { name: Status; value: number }[] };
}) {
  const PIE_COLORS = ["#0f0f0f", "#737373", "#d4d4d4"];
  const activeCount = patients.filter((p) => p.status === "Active").length;
  const followUpCount = patients.filter((p) => p.status === "Follow-up").length;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        <KPI label="Registered patients" value={String(patients.length)} />
        <KPI label="Clinical entries" value={String(records.length)} />
        <KPI label="Active cases" value={String(activeCount)} />
        <KPI label="Follow-ups due" value={String(followUpCount)} />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-12">
        <section className="rounded-md border border-border bg-card p-6 md:col-span-7">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Patients by level
          </p>
          <h2 className="font-display mt-1 text-2xl">Enrolment distribution</h2>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byLevel}>
                <XAxis dataKey="level" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                <Tooltip cursor={{ fill: "hsl(var(--muted))" }} contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                <Bar dataKey="count" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-md border border-border bg-card p-6 md:col-span-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Patient status
          </p>
          <h2 className="font-display mt-1 text-2xl">Caseload breakdown</h2>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.byStatus} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {stats.byStatus.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 grid grid-cols-3 gap-2 text-center">
            {stats.byStatus.map((s, i) => (
              <li key={s.name}>
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                <p className="font-mono mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{s.name}</p>
                <p className="text-sm">{s.value}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-display mt-3 text-3xl">{value}</p>
    </div>
  );
}

/* ----------------------------- Patients tab ----------------------------- */

function PatientsTab({
  patients,
  allRecords,
  query,
  onQuery,
  onAdd,
  onEdit,
  onDelete,
}: {
  patients: Patient[];
  allRecords: ClinicalRecord[];
  query: string;
  onQuery: (q: string) => void;
  onAdd: () => void;
  onEdit: (p: Patient) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section className="rounded-md border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <div className="flex-1 min-w-[220px]">
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Search by matric or name
          </label>
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="CSC/2020/0011"
            className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 self-end rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" /> Register patient
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left">Matric</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Level</th>
              <th className="px-4 py-3 text-left">Blood / Geno</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{p.matric}</td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{p.level}L</td>
                <td className="px-4 py-3 text-muted-foreground">{p.bloodGroup} · {p.genotype}</td>
                <td className="px-4 py-3"><StatusPill status={p.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <IconBtn label="Export PDF" onClick={() => exportPatientPdf(p, allRecords.filter((r) => r.patientId === p.id))}>
                      <Download className="h-3.5 w-3.5" />
                    </IconBtn>
                    <IconBtn label="Edit" onClick={() => onEdit(p)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </IconBtn>
                    <IconBtn label="Delete" onClick={() => onDelete(p.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconBtn>
                  </div>
                </td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No patients match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatusPill({ status }: { status: Status }) {
  const tone =
    status === "Active"
      ? "bg-foreground text-background"
      : status === "Follow-up"
        ? "bg-muted text-foreground border border-border"
        : "bg-background text-muted-foreground border border-border";
  return (
    <span className={`font-mono inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-widest ${tone}`}>
      {status}
    </span>
  );
}

function IconBtn({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-8 w-8 place-items-center rounded-md border border-border bg-background transition hover:bg-muted"
    >
      {children}
    </button>
  );
}

/* ----------------------------- Clinical tab ----------------------------- */

function ClinicalTab({
  records,
  patientName,
  onAdd,
  onEdit,
  onDelete,
}: {
  records: ClinicalRecord[];
  patientName: (id: string) => string;
  onAdd: () => void;
  onEdit: (r: ClinicalRecord) => void;
  onDelete: (id: string) => void;
}) {
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <section className="rounded-md border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Clinical records
          </p>
          <h2 className="font-display mt-1 text-2xl">Consultation log</h2>
        </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" /> New entry
        </button>
      </div>

      <ul className="divide-y divide-border">
        {sorted.map((r) => (
          <li key={r.id} className="grid gap-3 px-6 py-4 md:grid-cols-12">
            <div className="md:col-span-2">
              <p className="font-mono text-xs text-muted-foreground">{r.date}</p>
              <p className="font-mono mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{r.doctor}</p>
            </div>
            <div className="md:col-span-8">
              <p className="text-sm font-medium">{patientName(r.patientId)} — {r.diagnosis}</p>
              <p className="text-xs text-muted-foreground">Complaint · {r.complaint}</p>
              <p className="text-xs text-muted-foreground">Rx · {r.prescription}</p>
            </div>
            <div className="flex items-start justify-end gap-2 md:col-span-2">
              <IconBtn label="Edit" onClick={() => onEdit(r)}>
                <Pencil className="h-3.5 w-3.5" />
              </IconBtn>
              <IconBtn label="Delete" onClick={() => onDelete(r.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </IconBtn>
            </div>
          </li>
        ))}
        {sorted.length === 0 && (
          <li className="px-6 py-10 text-center text-sm text-muted-foreground">No clinical entries.</li>
        )}
      </ul>
    </section>
  );
}

/* -------------------------------- Modals -------------------------------- */

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-xl overflow-hidden rounded-md border border-border bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="font-display text-xl">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputCls = "w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

function PatientModal({
  value,
  onChange,
  onClose,
  onSave,
}: {
  value: Patient;
  onChange: (p: Patient) => void;
  onClose: () => void;
  onSave: (p: Patient) => void;
}) {
  const set = <K extends keyof Patient>(k: K, v: Patient[K]) => onChange({ ...value, [k]: v });
  return (
    <Modal title={value.id ? "Edit patient" : "Register patient"} onClose={onClose}>
      <div className="grid grid-cols-2 gap-4">
        <L label="Matriculation no."><input className={inputCls} value={value.matric} onChange={(e) => set("matric", e.target.value)} /></L>
        <L label="Full name"><input className={inputCls} value={value.name} onChange={(e) => set("name", e.target.value)} /></L>
        <L label="Level">
          <select className={inputCls} value={value.level} onChange={(e) => set("level", e.target.value as Patient["level"])}>
            {["100", "200", "300", "400", "500"].map((l) => <option key={l} value={l}>{l} Level</option>)}
          </select>
        </L>
        <L label="Gender">
          <select className={inputCls} value={value.gender} onChange={(e) => set("gender", e.target.value as Patient["gender"])}>
            <option>Female</option><option>Male</option>
          </select>
        </L>
        <L label="Date of birth"><input type="date" className={inputCls} value={value.dob} onChange={(e) => set("dob", e.target.value)} /></L>
        <L label="Phone"><input className={inputCls} value={value.phone} onChange={(e) => set("phone", e.target.value)} /></L>
        <L label="Blood group">
          <select className={inputCls} value={value.bloodGroup} onChange={(e) => set("bloodGroup", e.target.value as Patient["bloodGroup"])}>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => <option key={b}>{b}</option>)}
          </select>
        </L>
        <L label="Genotype">
          <select className={inputCls} value={value.genotype} onChange={(e) => set("genotype", e.target.value as Patient["genotype"])}>
            {["AA", "AS", "AC", "SS", "SC"].map((g) => <option key={g}>{g}</option>)}
          </select>
        </L>
        <L label="Allergies"><input className={inputCls} value={value.allergies} onChange={(e) => set("allergies", e.target.value)} /></L>
        <L label="Status">
          <select className={inputCls} value={value.status} onChange={(e) => set("status", e.target.value as Status)}>
            <option>Active</option><option>Follow-up</option><option>Cleared</option>
          </select>
        </L>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-md border border-border bg-background px-4 py-2 text-xs font-medium hover:bg-muted">Cancel</button>
        <button onClick={() => onSave(value)} className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90">Save patient</button>
      </div>
    </Modal>
  );
}

function RecordModal({
  value,
  patients,
  onChange,
  onClose,
  onSave,
}: {
  value: ClinicalRecord;
  patients: Patient[];
  onChange: (r: ClinicalRecord) => void;
  onClose: () => void;
  onSave: (r: ClinicalRecord) => void;
}) {
  const set = <K extends keyof ClinicalRecord>(k: K, v: ClinicalRecord[K]) => onChange({ ...value, [k]: v });
  return (
    <Modal title={value.id ? "Edit clinical entry" : "New clinical entry"} onClose={onClose}>
      <div className="grid grid-cols-2 gap-4">
        <L label="Patient">
          <select className={inputCls} value={value.patientId} onChange={(e) => set("patientId", e.target.value)}>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.matric} — {p.name}</option>)}
          </select>
        </L>
        <L label="Date"><input type="date" className={inputCls} value={value.date} onChange={(e) => set("date", e.target.value)} /></L>
        <L label="Doctor"><input className={inputCls} value={value.doctor} onChange={(e) => set("doctor", e.target.value)} /></L>
        <L label="Diagnosis"><input className={inputCls} value={value.diagnosis} onChange={(e) => set("diagnosis", e.target.value)} /></L>
        <div className="col-span-2">
          <L label="Complaint"><textarea rows={2} className={inputCls} value={value.complaint} onChange={(e) => set("complaint", e.target.value)} /></L>
        </div>
        <div className="col-span-2">
          <L label="Prescription"><textarea rows={2} className={inputCls} value={value.prescription} onChange={(e) => set("prescription", e.target.value)} /></L>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-md border border-border bg-background px-4 py-2 text-xs font-medium hover:bg-muted">Cancel</button>
        <button onClick={() => onSave(value)} className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90">Save entry</button>
      </div>
    </Modal>
  );
}
