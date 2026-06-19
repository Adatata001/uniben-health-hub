import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import doctorImg from "@/assets/feature-doctor.jpg";
import pharmacyImg from "@/assets/feature-pharmacy.jpg";
import studentImg from "@/assets/student.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UNIBEN MedRecords — Automated Student Medical Records" },
      { name: "description", content: "A secure, web-based medical records system for the University of Benin Health Centre." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 pt-16 pb-20 md:grid-cols-12 md:pt-24 md:pb-28">
          <div className="md:col-span-7">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              UNIBEN Health Centre · Final Year Project
            </p>
            <h1 className="font-display mt-6 text-5xl leading-[1.05] md:text-7xl">
              Student medical records,<br />
              <span className="italic text-muted-foreground">quietly modernised.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              A secure, web-based system that automates the storage, retrieval and
              management of student health data at the University of Benin Health Centre —
              replacing paper folders with near-instant access.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                View live demo →
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                Learn more
              </a>
            </div>

            <dl className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-8">
              <Stat k="< 2s" v="record lookup" />
              <Stat k="256-bit" v="encryption" />
              <Stat k="3" v="role-based modules" />
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
                  Patient · ENG/2020/1234
                </p>
                <p className="mt-1 font-display text-2xl">Akhazogie Victoria Precious</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Blood group O+ · No known allergies · Last visit 12 Jun 2026
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                01 — The problem
              </p>
            </div>
            <div className="md:col-span-8">
              <h2 className="font-display text-3xl md:text-5xl">
                Paper folders cost hours. In emergencies, they can cost more.
              </h2>
              <p className="mt-6 max-w-2xl text-muted-foreground">
                Students queue for hours to retrieve files. Critical details — blood group,
                allergies, prior history — can be inaccessible during emergencies. Physical
                records wear, burn, and leak.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-14 flex items-end justify-between gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                02 — Modules
              </p>
              <h2 className="font-display mt-3 text-3xl md:text-5xl">Three connected workflows.</h2>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Feature
              num="01"
              title="Reception"
              text="Capture bio-data and matriculation details on intake. One profile per student, accessible across the centre."
            />
            <Feature
              num="02"
              title="Consulting room"
              text="Doctors add diagnoses, clinical notes and prescriptions in real time — no paper in the loop."
              image={doctorImg}
            />
            <Feature
              num="03"
              title="Pharmacy"
              text="Dispense against the active prescription. Medication history is appended automatically."
              image={pharmacyImg}
            />
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                03 — Objectives
              </p>
              <h2 className="font-display mt-3 text-3xl md:text-4xl">What the system sets out to do.</h2>
            </div>
            <div className="md:col-span-8">
              <ol className="divide-y divide-border border-y border-border">
                {[
                  "Design a centralised database for comprehensive student medical profiles.",
                  "Build a clean interface for healthcare providers to update notes and prescriptions in real time.",
                  "Enforce secure authentication so only authorised personnel reach sensitive data.",
                  "Deliver search and retrieval by matriculation number in seconds, not hours.",
                ].map((t, i) => (
                  <li key={i} className="flex gap-6 py-5">
                    <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                    <p className="text-base leading-relaxed">{t}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Author */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid items-center gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="aspect-[4/5] max-w-sm overflow-hidden rounded-md border border-border bg-muted">
                <img
                  src={studentImg}
                  alt="Akhazogie Victoria Precious"
                  loading="lazy"
                  width={800}
                  height={1000}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="md:col-span-7">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Researcher
              </p>
              <h2 className="font-display mt-3 text-4xl md:text-5xl">
                Akhazogie Victoria Precious
              </h2>
              <p className="mt-6 max-w-xl text-muted-foreground">
                Final year undergraduate, University of Benin. This project is submitted in
                partial fulfilment of the requirements for a Bachelor's degree — proposing a
                pragmatic, secure step away from paper at the UNIBEN Health Centre.
              </p>
              <p className="font-mono mt-8 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Supervised submission · 2026
              </p>
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
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Modules</a>
          <a href="#features" className="hover:text-foreground">Objectives</a>
          <Link to="/dashboard" className="hover:text-foreground">Demo</Link>
        </nav>
        <Link
          to="/dashboard"
          className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
        >
          Open demo
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

function Feature({
  num,
  title,
  text,
  image,
}: {
  num: string;
  title: string;
  text: string;
  image?: string;
}) {
  return (
    <article className="group flex flex-col rounded-md border border-border bg-card p-6">
      {image && (
        <div className="mb-6 aspect-[4/3] overflow-hidden rounded-sm bg-muted">
          <img
            src={image}
            alt={title}
            loading="lazy"
            width={1200}
            height={900}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        </div>
      )}
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {num}
      </p>
      <h3 className="font-display mt-2 text-2xl">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
    </article>
  );
}

function Footer() {
  return (
    <footer className="bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p className="font-mono uppercase tracking-widest">
          © 2026 · UNIBEN MedRecords
        </p>
        <p>Designed & researched by Akhazogie Victoria Precious.</p>
      </div>
    </footer>
  );
}
