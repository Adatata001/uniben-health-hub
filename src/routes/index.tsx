import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UNIBEN MedRecords — Automated Student Medical Records" },
      { name: "description", content: "A secure, web-based medical records system for the University of Benin Health Centre, Department of Computer Science." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 pt-16 pb-20 md:grid-cols-12 md:pt-24 md:pb-28">
          <div className="md:col-span-7">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              UNIBEN Health Centre · Computer Science
            </p>
            <h1 className="font-display mt-6 text-5xl leading-[1.05] md:text-7xl">
              Student medical records,<br />
              <span className="italic text-muted-foreground">quietly modernised.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              A secure web platform that replaces paper folders with instant,
              role-based access to student health data — built for the staff
              and students of the UNIBEN Health Centre.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Get started →
              </Link>
            </div>

            <dl className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-8">
              <Stat k="< 2s" v="record lookup" />
              <Stat k="256-bit" v="encryption" />
              <Stat k="2" v="role-based portals" />
            </dl>
          </div>

          <div className="md:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-border bg-muted">
              <img
                src={hero}
                alt="Hospital corridor"
                width={1600}
                height={1100}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 rounded-md bg-background/90 p-4 backdrop-blur">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  A final-year project
                </p>
                <p className="mt-1 font-display text-2xl">Paper to pixels.</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Quiet, modern record-keeping for a busy university clinic.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-sm bg-primary text-primary-foreground">
            <span className="font-mono text-[11px]">M</span>
          </span>
          <span className="font-mono text-sm tracking-tight">MedRecords / UNIBEN</span>
        </Link>
        <Link
          to="/auth"
          className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
        >
          Get started
        </Link>
      </div>
    </header>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="font-display text-2xl md:text-3xl">{k}</dt>
      <dd className="font-mono mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
        {v}
      </dd>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p className="font-mono uppercase tracking-widest">© 2026 · UNIBEN MedRecords</p>
        <p>Department of Computer Science · University of Benin</p>
      </div>
    </footer>
  );
}
