import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getPatients, getRecords, type Patient } from "@/lib/records";
import { exportPatientPdf } from "@/lib/pdf";
import { Download } from "lucide-react";

export const Route = createFileRoute("/student")({
  head: () => ({
    meta: [
      { title: "Student portal — UNIBEN MedRecords" },
      { name: "description", content: "View your medical profile and clinical history." },
    ],
  }),
  component: StudentPage,
});

function StudentPage() {
  const patients = useMemo(() => getPatients(), []);
  const records = useMemo(() => getRecords(), []);
  const [selectedId, setSelectedId] = useState<string>(patients[0]?.id ?? "");

  const me: Patient | undefined = patients.find((p) => p.id === selectedId);
  const myRecords = records.filter((r) => r.patientId === selectedId).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-sm bg-primary text-primary-foreground">
              <span className="font-mono text-[11px]">M</span>
            </span>
            <span className="font-mono text-sm">MedRecords / Student</span>
          </Link>
          <div className="flex items-center gap-3">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="font-mono rounded-md border border-input bg-background px-3 py-1.5 text-xs"
              aria-label="Signed in as"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.matric} — {p.name}
                </option>
              ))}
            </select>
            <Link to="/auth" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
              Switch
            </Link>
          </div>
        </div>
      </header>

      {me && (
        <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
          <section className="rounded-md border border-border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Signed in as
                </p>
                <h1 className="font-display mt-2 text-3xl md:text-4xl">{me.name}</h1>
                <p className="font-mono mt-1 text-xs text-muted-foreground">{me.matric} · {me.level} Level · Computer Science</p>
              </div>
              <button
                onClick={() => exportPatientPdf(me, myRecords)}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
              >
                <Download className="h-3.5 w-3.5" /> Download record (PDF)
              </button>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
              <Field k="Gender" v={me.gender} />
              <Field k="Date of birth" v={me.dob} />
              <Field k="Phone" v={me.phone} />
              <Field k="Blood group" v={me.bloodGroup} />
              <Field k="Genotype" v={me.genotype} />
              <Field k="Allergies" v={me.allergies || "None"} />
              <Field k="Status" v={me.status} />
            </dl>
          </section>

          <section className="rounded-md border border-border bg-card">
            <div className="border-b border-border p-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Clinical history
              </p>
              <h2 className="font-display mt-1 text-2xl">Past visits</h2>
            </div>
            {myRecords.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No clinical entries recorded.</p>
            ) : (
              <ul className="divide-y divide-border">
                {myRecords.map((r) => (
                  <li key={r.id} className="grid gap-2 px-6 py-4 md:grid-cols-12">
                    <p className="font-mono text-xs text-muted-foreground md:col-span-2">{r.date}</p>
                    <div className="md:col-span-10">
                      <p className="text-sm font-medium">{r.diagnosis}</p>
                      <p className="text-xs text-muted-foreground">Complaint · {r.complaint}</p>
                      <p className="text-xs text-muted-foreground">Rx · {r.prescription}</p>
                      <p className="font-mono mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{r.doctor}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      )}
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
