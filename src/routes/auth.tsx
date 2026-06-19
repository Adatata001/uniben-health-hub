import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Stethoscope, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — UNIBEN MedRecords" },
      { name: "description", content: "Choose your portal to continue." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-sm bg-primary text-primary-foreground">
              <span className="font-mono text-[11px]">M</span>
            </span>
            <span className="font-mono text-sm tracking-tight">MedRecords / UNIBEN</span>
          </Link>
          <Link to="/" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
            ← Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-20 md:py-28">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Sign in
        </p>
        <h1 className="font-display mt-4 text-4xl md:text-5xl">Choose your portal.</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Tap a card to continue into the appropriate dashboard.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <button
            onClick={() => navigate({ to: "/student" })}
            className="group flex flex-col items-start rounded-md border border-border bg-card p-8 text-left transition hover:border-foreground hover:bg-muted"
          >
            <span className="grid h-12 w-12 place-items-center rounded-md border border-border bg-background">
              <GraduationCap className="h-5 w-5" />
            </span>
            <p className="font-mono mt-6 text-[10px] uppercase tracking-widest text-muted-foreground">
              Portal 01
            </p>
            <h2 className="font-display mt-2 text-2xl">Student</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              View your personal medical profile, clinical history and download a
              copy of your medical record.
            </p>
            <span className="mt-8 font-mono text-xs uppercase tracking-widest text-foreground transition group-hover:translate-x-1">
              Enter →
            </span>
          </button>

          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="group flex flex-col items-start rounded-md border border-border bg-card p-8 text-left transition hover:border-foreground hover:bg-muted"
          >
            <span className="grid h-12 w-12 place-items-center rounded-md bg-primary text-primary-foreground">
              <Stethoscope className="h-5 w-5" />
            </span>
            <p className="font-mono mt-6 text-[10px] uppercase tracking-widest text-muted-foreground">
              Portal 02
            </p>
            <h2 className="font-display mt-2 text-2xl">Health staff</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Register patients, update clinical notes, view department analytics
              and export medical records as PDF.
            </p>
            <span className="mt-8 font-mono text-xs uppercase tracking-widest text-foreground transition group-hover:translate-x-1">
              Enter →
            </span>
          </button>
        </div>
      </main>
    </div>
  );
}
