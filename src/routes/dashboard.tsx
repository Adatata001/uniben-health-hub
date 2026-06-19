import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Demo Dashboard — UNIBEN MedRecords" },
      { name: "description", content: "Interactive demo of the UNIBEN student medical records dashboard." },
    ],
  }),
  component: Dashboard,
});

type Patient = {
  matric: string;
  name: string;
  faculty: string;
  level: string;
  bloodGroup: string;
  genotype: string;
  allergies: string;
  lastVisit: string;
  status: "Active" | "Follow-up" | "Cleared";
};

const PATIENTS: Patient[] = [
  { matric: "ENG/2020/1234", name: "Akhazogie Victoria Precious", faculty: "Engineering", level: "500", bloodGroup: "O+", genotype: "AA", allergies: "None", lastVisit: "2026-06-12", status: "Active" },
  { matric: "SCI/2021/0421", name: "Daniel Osaze Ighodaro", faculty: "Sciences", level: "400", bloodGroup: "A+", genotype: "AS", allergies: "Penicillin", lastVisit: "2026-06-09", status: "Follow-up" },
  { matric: "MED/2019/0088", name: "Grace Eweka", faculty: "Medicine", level: "600", bloodGroup: "B+", genotype: "AA", allergies: "None", lastVisit: "2026-05-30", status: "Cleared" },
  { matric: "ART/2022/0917", name: "Kelvin Aigbe", faculty: "Arts", level: "300", bloodGroup: "O-", genotype: "AA", allergies: "Dust", lastVisit: "2026-06-15", status: "Active" },
  { matric: "LAW/2023/0202", name: "Joy Iredia", faculty: "Law", level: "200", bloodGroup: "AB+", genotype: "AC", allergies: "None", lastVisit: "2026-06-01", status: "Cleared" },
];

const VISITS = [
  { date: "2026-06-12", reason: "Malaria · prescribed Coartem", doctor: "Dr. Adeyemi" },
  { date: "2026-03-04", reason: "Routine check-up", doctor: "Dr. Okafor" },
  { date: "2025-11-20", reason: "Sprained ankle · physiotherapy", doctor: "Dr. Adeyemi" },
  { date: "2025-08-02", reason: "Fresher's medical screening", doctor: "Dr. Bello" },
];

function Dashboard() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Patient>(PATIENTS[0]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PATIENTS;
    return PATIENTS.filter(
      (p) => p.matric.toLowerCase().includes(q) || p.name.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-sm bg-primary text-primary-foreground">
              <span className="font-mono text-[11px]">M</span>
            </span>
            <span className="font-mono text-sm">MedRecords / UNIBEN</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="font-mono hidden text-xs uppercase tracking-widest text-muted-foreground md:inline">
              Dr. Adeyemi · Consulting room
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-muted text-xs">DA</div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:grid-cols-12">
        {/* Search list */}
        <aside className="md:col-span-4">
          <div className="rounded-md border border-border bg-card">
            <div className="border-b border-border p-4">
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Search by matric or name
              </label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ENG/2020/1234"
                className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="font-mono mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                {filtered.length} result{filtered.length === 1 ? "" : "s"}
              </p>
            </div>
            <ul className="max-h-[60vh] divide-y divide-border overflow-y-auto">
              {filtered.map((p) => {
                const active = p.matric === selected.matric;
                return (
                  <li key={p.matric}>
                    <button
                      onClick={() => setSelected(p)}
                      className={`flex w-full flex-col items-start gap-1 px-4 py-3 text-left transition ${
                        active ? "bg-muted" : "hover:bg-muted/60"
                      }`}
                    >
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {p.matric}
                      </span>
                      <span className="text-sm font-medium">{p.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {p.faculty} · {p.level}L
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Patient detail */}
        <main className="md:col-span-8">
          <section className="rounded-md border border-border bg-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Patient profile
                </p>
                <h1 className="font-display mt-2 text-3xl md:text-4xl">{selected.name}</h1>
                <p className="font-mono mt-1 text-xs text-muted-foreground">{selected.matric}</p>
              </div>
              <StatusPill status={selected.status} />
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
              <Field k="Faculty" v={selected.faculty} />
              <Field k="Level" v={`${selected.level} Level`} />
              <Field k="Blood group" v={selected.bloodGroup} />
              <Field k="Genotype" v={selected.genotype} />
              <Field k="Allergies" v={selected.allergies} />
              <Field k="Last visit" v={selected.lastVisit} />
            </dl>
          </section>

          <section className="mt-6 rounded-md border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Visit history
                </p>
                <h2 className="font-display mt-1 text-2xl">Clinical notes</h2>
              </div>
              <button className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90">
                + New entry
              </button>
            </div>
            <ul className="divide-y divide-border">
              {VISITS.map((v) => (
                <li key={v.date} className="flex flex-col gap-1 px-6 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm">{v.reason}</p>
                    <p className="text-xs text-muted-foreground">{v.doctor}</p>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">{v.date}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 grid gap-6 md:grid-cols-2">
            <MiniCard title="Active prescription" body="Coartem 80/480mg — 1 tab BD × 3 days" foot="Issued 12 Jun 2026 · Dispensed at pharmacy" />
            <MiniCard title="Next appointment" body="Follow-up review" foot="22 Jun 2026 · 10:30 AM" />
          </section>
        </main>
      </div>
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{k}</dt>
      <dd className="mt-1 text-sm">{v}</dd>
    </div>
  );
}

function StatusPill({ status }: { status: Patient["status"] }) {
  const tone =
    status === "Active"
      ? "bg-foreground text-background"
      : status === "Follow-up"
        ? "bg-muted text-foreground border border-border"
        : "bg-background text-muted-foreground border border-border";
  return (
    <span className={`font-mono rounded-full px-3 py-1 text-[10px] uppercase tracking-widest ${tone}`}>
      {status}
    </span>
  );
}

function MiniCard({ title, body, foot }: { title: string; body: string; foot: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-6">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{title}</p>
      <p className="mt-3 text-base">{body}</p>
      <p className="mt-4 text-xs text-muted-foreground">{foot}</p>
    </div>
  );
}
