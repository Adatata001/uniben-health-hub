import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  getPatients,
  getRecords,
  getAppointments,
  saveAppointments,
  uid,
  VICTORIA_ID,
  type Patient,
  type ClinicalRecord,
  type Appointment,
  type AppointmentStatus,
} from "@/lib/records";
import { Download, CalendarPlus, X } from "lucide-react";

export const Route = createFileRoute("/student")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Student portal — UNIBEN MedRecords" },
      { name: "description", content: "View your medical profile and book appointments." },
    ],
  }),
  component: StudentPage,
});

function StudentPage() {
  const [me, setMe] = useState<Patient | undefined>(undefined);
  const [myRecords, setMyRecords] = useState<ClinicalRecord[]>([]);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [booking, setBooking] = useState(false);
  const [ready, setReady] = useState(false);

  const refresh = () => {
    const patient = getPatients().find((p) => p.id === VICTORIA_ID);
    setMe(patient);
    setMyRecords(
      getRecords()
        .filter((r) => r.patientId === VICTORIA_ID)
        .sort((a, b) => b.date.localeCompare(a.date)),
    );
    setMyAppointments(
      getAppointments()
        .filter((a) => a.patientId === VICTORIA_ID)
        .sort((a, b) => b.date.localeCompare(a.date)),
    );
  };

  useEffect(() => {
    refresh();
    setReady(true);
  }, []);

  const downloadPdf = async () => {
    if (!me) return;
    const { exportPatientPdf } = await import("@/lib/pdf");
    exportPatientPdf(me, myRecords);
  };

  const submitBooking = (date: string, time: string, reason: string) => {
    const list = getAppointments();
    const next: Appointment = {
      id: uid("apt"),
      patientId: VICTORIA_ID,
      date,
      time,
      reason,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };
    saveAppointments([next, ...list]);
    setBooking(false);
    refresh();
  };

  if (!ready) {
    return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3 md:px-6 md:py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-sm bg-primary text-primary-foreground">
              <span className="font-mono text-[11px]">M</span>
            </span>
            <span className="font-mono text-xs md:text-sm">MedRecords / Student</span>
          </Link>
          <Link to="/auth" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground md:text-xs">
            Sign out
          </Link>
        </div>
      </header>

      {me && (
        <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 md:px-6 md:py-10">
          <section className="rounded-md border border-border bg-card p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Signed in as
                </p>
                <h1 className="font-display mt-2 text-2xl md:text-4xl">{me.name}</h1>
                <p className="font-mono mt-1 text-xs text-muted-foreground">
                  {me.matric} · {me.level} Level · Computer Science
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setBooking(true)}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-muted"
                >
                  <CalendarPlus className="h-3.5 w-3.5" /> Book appointment
                </button>
                <button
                  onClick={downloadPdf}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
                >
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </button>
              </div>
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
            <div className="border-b border-border p-5 md:p-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Appointments
              </p>
              <h2 className="font-display mt-1 text-xl md:text-2xl">My bookings</h2>
            </div>
            {myAppointments.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground md:p-6">No appointments booked yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {myAppointments.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 md:px-6">
                    <div>
                      <p className="text-sm font-medium">{a.date} · {a.time}</p>
                      <p className="text-xs text-muted-foreground">{a.reason}</p>
                    </div>
                    <AppointmentPill status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-md border border-border bg-card">
            <div className="border-b border-border p-5 md:p-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Clinical history
              </p>
              <h2 className="font-display mt-1 text-xl md:text-2xl">Past visits</h2>
            </div>
            {myRecords.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground md:p-6">No clinical entries recorded.</p>
            ) : (
              <ul className="divide-y divide-border">
                {myRecords.map((r) => (
                  <li key={r.id} className="grid gap-2 px-5 py-4 md:grid-cols-12 md:px-6">
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

          {me.attachments && me.attachments.length > 0 && (
            <section className="rounded-md border border-border bg-card">
              <div className="border-b border-border p-5 md:p-6">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Documents
                </p>
                <h2 className="font-display mt-1 text-xl md:text-2xl">On file</h2>
              </div>
              <ul className="divide-y divide-border">
                {me.attachments.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-3 md:px-6">
                    <div className="min-w-0">
                      <p className="truncate text-sm">{a.name}</p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {Math.round(a.size / 1024)} KB · {new Date(a.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <a href={a.dataUrl} download={a.name} className="font-mono text-[10px] uppercase tracking-widest text-foreground hover:underline">
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
      )}

      {booking && <BookingModal onClose={() => setBooking(false)} onSubmit={submitBooking} />}
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

function AppointmentPill({ status }: { status: AppointmentStatus }) {
  const tone =
    status === "Confirmed"
      ? "bg-foreground text-background"
      : status === "Pending"
        ? "bg-muted text-foreground border border-border"
        : status === "Declined"
          ? "bg-background text-muted-foreground border border-border line-through"
          : "bg-background text-muted-foreground border border-border";
  return (
    <span className={`font-mono inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-widest ${tone}`}>
      {status}
    </span>
  );
}

function BookingModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (date: string, time: string, reason: string) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("09:00");
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-md border border-border bg-background shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="font-display text-lg">Book an appointment</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Date</span>
            <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Time</span>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Reason</span>
            <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Persistent headache for three days" className="mt-1 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm" />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
          <button onClick={onClose} className="rounded-md border border-border bg-background px-4 py-2 text-xs font-medium hover:bg-muted">Cancel</button>
          <button
            onClick={() => reason.trim() && onSubmit(date, time, reason.trim())}
            className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
          >
            Submit request
          </button>
        </div>
      </div>
    </div>
  );
}
