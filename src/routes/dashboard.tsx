import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  getPatients,
  savePatients,
  getRecords,
  saveRecords,
  getAppointments,
  saveAppointments,
  getAudit,
  logAudit,
  uid,
  LEVELS,
  type Patient,
  type ClinicalRecord,
  type Appointment,
  type AppointmentStatus,
  type AuditLogEntry,
  type Status,
  type Attachment,
} from "@/lib/records";
import { Download, Pencil, Plus, Trash2, X, Check, Paperclip } from "lucide-react";
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
  ssr: false,
  head: () => ({
    meta: [
      { title: "Health staff dashboard — UNIBEN MedRecords" },
      { name: "description", content: "Manage CSC student medical records, appointments and clinical entries." },
    ],
  }),
  component: Dashboard,
});

type Tab = "overview" | "patients" | "clinical" | "appointments" | "audit";
const STAFF = "Dr. Adeyemi";

function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [audit, setAudit] = useState<AuditLogEntry[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);

  const [patientForm, setPatientForm] = useState<Patient | null>(null);
  const [recordForm, setRecordForm] = useState<ClinicalRecord | null>(null);

  const refreshAudit = () => setAudit(getAudit());

  useEffect(() => {
    setPatients(getPatients());
    setRecords(getRecords());
    setAppointments(getAppointments());
    setAudit(getAudit());
    setReady(true);
  }, []);

  const persistPatients = (next: Patient[]) => { setPatients(next); savePatients(next); };
  const persistRecords = (next: ClinicalRecord[]) => { setRecords(next); saveRecords(next); };
  const persistAppointments = (next: Appointment[]) => { setAppointments(next); saveAppointments(next); };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => p.matric.toLowerCase().includes(q) || p.name.toLowerCase().includes(q));
  }, [query, patients]);

  const openNewPatient = () =>
    setPatientForm({
      id: "", matric: "CSC/2024/", name: "", level: "100", gender: "Female",
      dob: "", phone: "", bloodGroup: "O+", genotype: "AA", allergies: "",
      status: "Active", attachments: [],
    });

  const savePatient = (p: Patient) => {
    if (!p.name.trim() || !p.matric.trim()) return;
    if (p.id) {
      persistPatients(patients.map((x) => (x.id === p.id ? p : x)));
      logAudit({ actor: STAFF, action: "update", entity: "patient", target: `${p.matric} — ${p.name}` });
    } else {
      const created = { ...p, id: uid("p") };
      persistPatients([created, ...patients]);
      logAudit({ actor: STAFF, action: "create", entity: "patient", target: `${created.matric} — ${created.name}` });
    }
    refreshAudit();
    setPatientForm(null);
  };

  const deletePatient = (id: string) => {
    const target = patients.find((p) => p.id === id);
    if (!target) return;
    if (!confirm("Delete this patient and all their clinical entries?")) return;
    persistPatients(patients.filter((p) => p.id !== id));
    persistRecords(records.filter((r) => r.patientId !== id));
    logAudit({ actor: STAFF, action: "delete", entity: "patient", target: `${target.matric} — ${target.name}` });
    refreshAudit();
  };

  const openNewRecord = (patientId?: string) =>
    setRecordForm({
      id: "", patientId: patientId ?? patients[0]?.id ?? "",
      date: new Date().toISOString().slice(0, 10),
      complaint: "", diagnosis: "", prescription: "", doctor: STAFF,
    });

  const saveRecord = (r: ClinicalRecord) => {
    if (!r.patientId || !r.diagnosis.trim()) return;
    const pName = patients.find((p) => p.id === r.patientId)?.name ?? r.patientId;
    if (r.id) {
      persistRecords(records.map((x) => (x.id === r.id ? r : x)));
      logAudit({ actor: STAFF, action: "update", entity: "clinical", target: `${pName} · ${r.diagnosis}` });
    } else {
      persistRecords([{ ...r, id: uid("r") }, ...records]);
      logAudit({ actor: STAFF, action: "create", entity: "clinical", target: `${pName} · ${r.diagnosis}` });
    }
    refreshAudit();
    setRecordForm(null);
  };

  const deleteRecord = (id: string) => {
    const target = records.find((r) => r.id === id);
    if (!target) return;
    if (!confirm("Delete this clinical entry?")) return;
    const pName = patients.find((p) => p.id === target.patientId)?.name ?? target.patientId;
    persistRecords(records.filter((r) => r.id !== id));
    logAudit({ actor: STAFF, action: "delete", entity: "clinical", target: `${pName} · ${target.diagnosis}` });
    refreshAudit();
  };

  const updateAppointment = (id: string, status: AppointmentStatus) => {
    const target = appointments.find((a) => a.id === id);
    if (!target) return;
    persistAppointments(appointments.map((a) => (a.id === id ? { ...a, status } : a)));
    const pName = patients.find((p) => p.id === target.patientId)?.name ?? target.patientId;
    logAudit({ actor: STAFF, action: "update", entity: "appointment", target: `${pName} · ${target.date} (${status})` });
    refreshAudit();
  };

  const deleteAppointment = (id: string) => {
    const target = appointments.find((a) => a.id === id);
    if (!target) return;
    if (!confirm("Delete this appointment?")) return;
    persistAppointments(appointments.filter((a) => a.id !== id));
    const pName = patients.find((p) => p.id === target.patientId)?.name ?? target.patientId;
    logAudit({ actor: STAFF, action: "delete", entity: "appointment", target: `${pName} · ${target.date}` });
    refreshAudit();
  };

  const stats = useMemo(() => {
    const byLevel = LEVELS.map((lvl) => ({ level: `${lvl}L`, count: patients.filter((p) => p.level === lvl).length }));
    const byStatus: { name: Status; value: number }[] = (
      ["Active", "Follow-up", "Cleared"] as Status[]
    ).map((s) => ({ name: s, value: patients.filter((p) => p.status === s).length }));
    return { byLevel, byStatus };
  }, [patients]);

  const patientName = (id: string) => patients.find((p) => p.id === id)?.name ?? "—";
  const pendingCount = appointments.filter((a) => a.status === "Pending").length;

  const exportPdf = async (p: Patient) => {
    const { exportPatientPdf } = await import("@/lib/pdf");
    exportPatientPdf(p, records.filter((r) => r.patientId === p.id));
  };

  if (!ready) {
    return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3 md:px-6 md:py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-sm bg-primary text-primary-foreground">
              <span className="font-mono text-[11px]">M</span>
            </span>
            <span className="font-mono text-xs md:text-sm">MedRecords / Health staff</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="font-mono hidden text-xs uppercase tracking-widest text-muted-foreground md:inline">
              {STAFF} · UNIBEN Health Centre
            </span>
            <Link to="/auth" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground md:text-xs">
              Sign out
            </Link>
          </div>
        </div>
      </header>

      <div className="border-b border-border overflow-x-auto">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 md:px-6">
          {(["overview", "patients", "clinical", "appointments", "audit"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`font-mono whitespace-nowrap px-3 py-3 text-[11px] uppercase tracking-widest transition md:px-4 ${
                tab === t ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
              {t === "appointments" && pendingCount > 0 && (
                <span className="ml-2 inline-block rounded-full bg-foreground px-2 py-0.5 text-[9px] text-background">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        {tab === "overview" && <OverviewTab patients={patients} records={records} appointments={appointments} stats={stats} />}

        {tab === "patients" && (
          <PatientsTab
            patients={filtered} query={query} onQuery={setQuery}
            onAdd={openNewPatient} onEdit={setPatientForm} onDelete={deletePatient} onExport={exportPdf}
          />
        )}

        {tab === "clinical" && (
          <ClinicalTab records={records} patientName={patientName} onAdd={() => openNewRecord()} onEdit={setRecordForm} onDelete={deleteRecord} />
        )}

        {tab === "appointments" && (
          <AppointmentsTab appointments={appointments} patientName={patientName} onUpdate={updateAppointment} onDelete={deleteAppointment} />
        )}

        {tab === "audit" && <AuditTab entries={audit} />}
      </main>

      {patientForm && (
        <PatientModal value={patientForm} onChange={setPatientForm} onClose={() => setPatientForm(null)} onSave={savePatient} />
      )}

      {recordForm && (
        <RecordModal value={recordForm} patients={patients} onChange={setRecordForm} onClose={() => setRecordForm(null)} onSave={saveRecord} />
      )}
    </div>
  );
}

/* Overview */
function OverviewTab({ patients, records, appointments, stats }: {
  patients: Patient[]; records: ClinicalRecord[]; appointments: Appointment[];
  stats: { byLevel: { level: string; count: number }[]; byStatus: { name: Status; value: number }[] };
}) {
  const PIE_COLORS = ["#0f0f0f", "#737373", "#d4d4d4"];
  const activeCount = patients.filter((p) => p.status === "Active").length;
  const pending = appointments.filter((a) => a.status === "Pending").length;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        <KPI label="Registered patients" value={String(patients.length)} />
        <KPI label="Clinical entries" value={String(records.length)} />
        <KPI label="Active cases" value={String(activeCount)} />
        <KPI label="Pending appointments" value={String(pending)} />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-12">
        <section className="rounded-md border border-border bg-card p-6 md:col-span-7">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Patients by level</p>
          <h2 className="font-display mt-1 text-2xl">Enrolment distribution</h2>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byLevel}>
                <XAxis dataKey="level" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={{ background: "var(--background)", border: "1px solid var(--border)", fontSize: 12, color: "var(--foreground)" }} />
                <Bar dataKey="count" fill="var(--foreground)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-md border border-border bg-card p-6 md:col-span-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Patient status</p>
          <h2 className="font-display mt-1 text-2xl">Caseload breakdown</h2>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.byStatus} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {stats.byStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--background)", border: "1px solid var(--border)", fontSize: 12, color: "var(--foreground)" }} />
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

/* Patients */
function PatientsTab({ patients, query, onQuery, onAdd, onEdit, onDelete, onExport }: {
  patients: Patient[]; query: string; onQuery: (q: string) => void;
  onAdd: () => void; onEdit: (p: Patient) => void; onDelete: (id: string) => void; onExport: (p: Patient) => void;
}) {
  return (
    <section className="rounded-md border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <div className="flex-1 min-w-[220px]">
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Search by matric or name</label>
          <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="CSC/2021/0011" className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <button onClick={onAdd} className="inline-flex items-center gap-2 self-end rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90">
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
              <th className="px-4 py-3 text-left">Files</th>
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
                <td className="px-4 py-3 text-muted-foreground">{p.attachments?.length ?? 0}</td>
                <td className="px-4 py-3"><StatusPill status={p.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <IconBtn label="Export PDF" onClick={() => onExport(p)}><Download className="h-3.5 w-3.5" /></IconBtn>
                    <IconBtn label="Edit" onClick={() => onEdit(p)}><Pencil className="h-3.5 w-3.5" /></IconBtn>
                    <IconBtn label="Delete" onClick={() => onDelete(p.id)}><Trash2 className="h-3.5 w-3.5" /></IconBtn>
                  </div>
                </td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No patients match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatusPill({ status }: { status: Status }) {
  const tone =
    status === "Active" ? "bg-foreground text-background"
      : status === "Follow-up" ? "bg-muted text-foreground border border-border"
        : "bg-background text-muted-foreground border border-border";
  return <span className={`font-mono inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-widest ${tone}`}>{status}</span>;
}

function IconBtn({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="grid h-8 w-8 place-items-center rounded-md border border-border bg-background transition hover:bg-muted">
      {children}
    </button>
  );
}

/* Clinical */
function ClinicalTab({ records, patientName, onAdd, onEdit, onDelete }: {
  records: ClinicalRecord[]; patientName: (id: string) => string;
  onAdd: () => void; onEdit: (r: ClinicalRecord) => void; onDelete: (id: string) => void;
}) {
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <section className="rounded-md border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Clinical records</p>
          <h2 className="font-display mt-1 text-2xl">Consultation log</h2>
        </div>
        <button onClick={onAdd} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90">
          <Plus className="h-3.5 w-3.5" /> New entry
        </button>
      </div>

      <ul className="divide-y divide-border">
        {sorted.map((r) => (
          <li key={r.id} className="grid gap-3 px-4 py-4 md:grid-cols-12 md:px-6">
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
              <IconBtn label="Edit" onClick={() => onEdit(r)}><Pencil className="h-3.5 w-3.5" /></IconBtn>
              <IconBtn label="Delete" onClick={() => onDelete(r.id)}><Trash2 className="h-3.5 w-3.5" /></IconBtn>
            </div>
          </li>
        ))}
        {sorted.length === 0 && <li className="px-6 py-10 text-center text-sm text-muted-foreground">No clinical entries.</li>}
      </ul>
    </section>
  );
}

/* Appointments */
function AppointmentsTab({ appointments, patientName, onUpdate, onDelete }: {
  appointments: Appointment[]; patientName: (id: string) => string;
  onUpdate: (id: string, status: AppointmentStatus) => void; onDelete: (id: string) => void;
}) {
  const sorted = [...appointments].sort((a, b) => (a.status === "Pending" ? -1 : 1) - (b.status === "Pending" ? -1 : 1) || b.date.localeCompare(a.date));
  return (
    <section className="rounded-md border border-border bg-card">
      <div className="border-b border-border p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Appointment requests</p>
        <h2 className="font-display mt-1 text-2xl">Scheduling</h2>
      </div>
      <ul className="divide-y divide-border">
        {sorted.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
            <div className="min-w-0">
              <p className="text-sm font-medium">{patientName(a.patientId)}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{a.date} · {a.time}</p>
              <p className="mt-1 max-w-2xl text-xs text-muted-foreground">{a.reason}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-mono inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-widest ${
                a.status === "Confirmed" ? "bg-foreground text-background"
                : a.status === "Pending" ? "bg-muted text-foreground border border-border"
                : "bg-background text-muted-foreground border border-border"
              }`}>{a.status}</span>
              {a.status === "Pending" && (
                <>
                  <IconBtn label="Confirm" onClick={() => onUpdate(a.id, "Confirmed")}><Check className="h-3.5 w-3.5" /></IconBtn>
                  <IconBtn label="Decline" onClick={() => onUpdate(a.id, "Declined")}><X className="h-3.5 w-3.5" /></IconBtn>
                </>
              )}
              {a.status === "Confirmed" && (
                <IconBtn label="Mark completed" onClick={() => onUpdate(a.id, "Completed")}><Check className="h-3.5 w-3.5" /></IconBtn>
              )}
              <IconBtn label="Delete" onClick={() => onDelete(a.id)}><Trash2 className="h-3.5 w-3.5" /></IconBtn>
            </div>
          </li>
        ))}
        {sorted.length === 0 && <li className="px-6 py-10 text-center text-sm text-muted-foreground">No appointments yet.</li>}
      </ul>
    </section>
  );
}

/* Audit */
function AuditTab({ entries }: { entries: AuditLogEntry[] }) {
  return (
    <section className="rounded-md border border-border bg-card">
      <div className="border-b border-border p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Audit trail</p>
        <h2 className="font-display mt-1 text-2xl">Recent activity</h2>
      </div>
      <ul className="divide-y divide-border">
        {entries.map((e) => (
          <li key={e.id} className="grid gap-2 px-4 py-3 md:grid-cols-12 md:px-6">
            <p className="font-mono text-[11px] text-muted-foreground md:col-span-3">{new Date(e.timestamp).toLocaleString()}</p>
            <p className="md:col-span-2 text-xs"><span className="font-mono uppercase tracking-widest">{e.action}</span> · {e.entity}</p>
            <p className="md:col-span-4 text-sm">{e.target}</p>
            <p className="md:col-span-3 text-xs text-muted-foreground">by {e.actor}</p>
          </li>
        ))}
        {entries.length === 0 && <li className="px-6 py-10 text-center text-sm text-muted-foreground">No activity yet.</li>}
      </ul>
    </section>
  );
}

/* Modals */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" onClick={onClose}>
      <div className="w-full max-w-xl overflow-hidden rounded-md border border-border bg-background shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="font-display text-xl">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
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

function PatientModal({ value, onChange, onClose, onSave }: {
  value: Patient; onChange: (p: Patient) => void; onClose: () => void; onSave: (p: Patient) => void;
}) {
  const set = <K extends keyof Patient>(k: K, v: Patient[K]) => onChange({ ...value, [k]: v });

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const existing = value.attachments ?? [];
    const added: Attachment[] = [];
    for (const file of Array.from(files)) {
      if (file.size > 2 * 1024 * 1024) {
        alert(`${file.name} is over 2MB — please upload a smaller file.`);
        continue;
      }
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      added.push({
        id: uid("att"), name: file.name, type: file.type, size: file.size,
        dataUrl, uploadedAt: new Date().toISOString(),
      });
    }
    set("attachments", [...existing, ...added]);
  };

  const removeAttachment = (id: string) => {
    set("attachments", (value.attachments ?? []).filter((a) => a.id !== id));
  };

  return (
    <Modal title={value.id ? "Edit patient" : "Register patient"} onClose={onClose}>
      <div className="grid grid-cols-2 gap-4">
        <L label="Matriculation no."><input className={inputCls} value={value.matric} onChange={(e) => set("matric", e.target.value)} /></L>
        <L label="Full name"><input className={inputCls} value={value.name} onChange={(e) => set("name", e.target.value)} /></L>
        <L label="Level">
          <select className={inputCls} value={value.level} onChange={(e) => set("level", e.target.value as Patient["level"])}>
            {LEVELS.map((l) => <option key={l} value={l}>{l} Level</option>)}
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

      <div className="mt-6 border-t border-border pt-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Medical documents / images</p>
        <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-4 py-3 text-xs hover:bg-muted">
          <Paperclip className="h-3.5 w-3.5" />
          <span>Click to attach files (max 2MB each)</span>
          <input type="file" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
        </label>
        {(value.attachments ?? []).length > 0 && (
          <ul className="mt-3 divide-y divide-border rounded-md border border-border">
            {(value.attachments ?? []).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
                <div className="min-w-0">
                  <p className="truncate">{a.name}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{Math.round(a.size / 1024)} KB</p>
                </div>
                <div className="flex items-center gap-2">
                  <a href={a.dataUrl} download={a.name} className="font-mono text-[10px] uppercase tracking-widest hover:underline">Open</a>
                  <button onClick={() => removeAttachment(a.id)} aria-label="Remove" className="rounded p-1 hover:bg-muted"><X className="h-3.5 w-3.5" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-md border border-border bg-background px-4 py-2 text-xs font-medium hover:bg-muted">Cancel</button>
        <button onClick={() => onSave(value)} className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90">Save patient</button>
      </div>
    </Modal>
  );
}

function RecordModal({ value, patients, onChange, onClose, onSave }: {
  value: ClinicalRecord; patients: Patient[]; onChange: (r: ClinicalRecord) => void;
  onClose: () => void; onSave: (r: ClinicalRecord) => void;
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
        <div className="col-span-2"><L label="Complaint"><textarea rows={2} className={inputCls} value={value.complaint} onChange={(e) => set("complaint", e.target.value)} /></L></div>
        <div className="col-span-2"><L label="Prescription / treatment"><textarea rows={2} className={inputCls} value={value.prescription} onChange={(e) => set("prescription", e.target.value)} /></L></div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-md border border-border bg-background px-4 py-2 text-xs font-medium hover:bg-muted">Cancel</button>
        <button onClick={() => onSave(value)} className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90">Save entry</button>
      </div>
    </Modal>
  );
}
