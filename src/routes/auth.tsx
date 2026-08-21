import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Stethoscope, GraduationCap, ArrowLeft } from "lucide-react";
import unibenLogo from "@/assets/uniben-logo.png";
import {
  DEPARTMENTS,
  LEVELS,
  normalizeMatric,
  setSessionStudentId,
  signInStudent,
  signUpStudent,
  type Level,
} from "@/lib/records";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — UNIBEN MedRecords" },
      { name: "description", content: "Sign in or register to access your medical records." },
      { property: "og:title", content: "Sign in — UNIBEN MedRecords" },
      { property: "og:description", content: "Sign in or register to access your medical records." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const inputCls =
  "mt-1 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:border-foreground";

function AuthPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<"choose" | "student">("choose");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 md:px-6 md:py-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={unibenLogo} alt="University of Benin logo" width={28} height={28} className="h-7 w-7 shrink-0 object-contain" />
            <span className="font-mono text-xs tracking-tight md:text-sm">MedRecords / UNIBEN</span>
          </Link>
          <Link to="/" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground md:text-xs">
            ← Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-24">
        {view === "choose" ? (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Sign in</p>
            <h1 className="font-display mt-4 text-3xl md:text-5xl">Choose your portal.</h1>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Tap a card to continue into the appropriate dashboard.
            </p>

            <div className="mt-10 grid gap-6 md:mt-12 md:grid-cols-2">
              <button
                onClick={() => setView("student")}
                className="group flex flex-col items-start rounded-md border border-border bg-card p-6 text-left transition hover:border-foreground hover:bg-muted md:p-8"
              >
                <span className="grid h-12 w-12 place-items-center rounded-md border border-border bg-background">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <p className="font-mono mt-6 text-[10px] uppercase tracking-widest text-muted-foreground">Portal 01</p>
                <h2 className="font-display mt-2 text-2xl">Student</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Register or sign in with your name and matriculation number to view your medical profile
                  and clinical history.
                </p>
                <span className="mt-8 font-mono text-xs uppercase tracking-widest text-foreground transition group-hover:translate-x-1">
                  Continue →
                </span>
              </button>

              <button
                onClick={() => navigate({ to: "/dashboard" })}
                className="group flex flex-col items-start rounded-md border border-border bg-card p-6 text-left transition hover:border-foreground hover:bg-muted md:p-8"
              >
                <span className="grid h-12 w-12 place-items-center rounded-md bg-primary text-primary-foreground">
                  <Stethoscope className="h-5 w-5" />
                </span>
                <p className="font-mono mt-6 text-[10px] uppercase tracking-widest text-muted-foreground">Portal 02</p>
                <h2 className="font-display mt-2 text-2xl">Health staff</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Register patients, update clinical notes, view department analytics and export medical
                  records as PDF.
                </p>
                <span className="mt-8 font-mono text-xs uppercase tracking-widest text-foreground transition group-hover:translate-x-1">
                  Enter →
                </span>
              </button>
            </div>
          </>
        ) : (
          <StudentAccess onBack={() => setView("choose")} onDone={() => navigate({ to: "/student" })} />
        )}
      </main>
    </div>
  );
}

function StudentAccess({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [matric, setMatric] = useState("");
  const [level, setLevel] = useState<Level>("100");
  const [department, setDepartment] = useState("CSC");
  const [error, setError] = useState("");

  const submit = () => {
    setError("");
    const result =
      mode === "signup"
        ? signUpStudent({ name, level, department, matric })
        : signInStudent(name, matric);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSessionStudentId(result.patient.id);
    onDone();
  };

  return (
    <div className="mx-auto max-w-md">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Portals
      </button>

      <h1 className="font-display mt-6 text-3xl md:text-4xl">
        {mode === "signup" ? "Create your student record." : "Student sign in."}
      </h1>

      <div className="mt-6 inline-flex rounded-md border border-border p-1">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(""); }}
            className={`rounded-sm px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest ${
              mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "signin" ? "Sign in" : "Sign up"}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4 rounded-md border border-border bg-card p-5 md:p-6">
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Full name</span>
          <input
            className={inputCls}
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Akhazogie Victoria Precious"
          />
        </label>

        {mode === "signup" && (
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Level</span>
              <select className={inputCls} value={level} onChange={(e) => setLevel(e.target.value as Level)}>
                {LEVELS.map((l) => <option key={l} value={l}>{l} Level</option>)}
              </select>
            </label>
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Department</span>
              <input
                className={inputCls}
                list="dept-options"
                maxLength={3}
                value={department}
                onChange={(e) => setDepartment(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
                placeholder="CSC"
              />
              <datalist id="dept-options">
                {DEPARTMENTS.map((d) => <option key={d} value={d} />)}
              </datalist>
            </label>
          </div>
        )}

        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Matriculation number
          </span>
          <input
            className={`${inputCls} font-mono uppercase`}
            maxLength={10}
            value={matric}
            onChange={(e) => setMatric(normalizeMatric(e.target.value))}
            placeholder="PSC2010374"
          />
        </label>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <button
          onClick={submit}
          className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          {mode === "signup" ? "Register & continue" : "Sign in"}
        </button>
        <p className="text-xs text-muted-foreground">
          {mode === "signup"
            ? "Your record is added to the health centre database immediately."
            : "Use the same name and matriculation number you registered with."}
        </p>
      </div>
    </div>
  );
}
