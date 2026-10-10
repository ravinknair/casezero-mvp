import Link from "next/link";
import Image from "next/image";

const painPoints = [
  {
    title: "Fragmented systems",
    copy: "Email, chat, ticketing, monitoring, and spreadsheets hold disconnected fragments of the same incident.",
  },
  {
    title: "Manual investigation",
    copy: "Engineering teams lose critical time searching, reconciling context, and coordinating across tools before taking action.",
  },
  {
    title: "Ambiguous ownership",
    copy: "As issues cross teams and platforms, clear ownership and the next best action become unclear.",
  },
];

const trustPillars = [
  {
    title: "Read/write identity isolation",
    copy: "Separate read-only telemetry collection from write-back remediation authority.",
  },
  {
    title: "Customer cloud gateway",
    copy: "Run inside your network or VPC using your IAM model, service accounts, and workload identities.",
  },
  {
    title: "Decoupled autonomy policies",
    copy: "Permissions define what can be done. Policy defines when automation is allowed to execute.",
  },
];

const workflowSteps = ["Ingest", "Triage", "Route", "Act", "Verify & Escalate"];

const economics = [
  { label: "Productivity recovered", value: "$1.25M+" },
  { label: "Disruption reduction", value: "$1.00M+" },
  { label: "Simple payback", value: "~4 months" },
];

const integrations = [
  "Azure",
  "AWS",
  "Google Cloud",
  "ServiceNow",
  "Datadog",
  "Jira Service Management",
  "Microsoft Teams",
];

const commercialTiers = [
  {
    name: "Pilot phase",
    copy: "Onboard 2–3 high-volume incident classes with assisted resolution and baseline measurement.",
  },
  {
    name: "Scale expansion",
    copy: "Add policy-driven autonomy, approval gates, and broader multi-cloud coverage.",
  },
  {
    name: "Enterprise operations",
    copy: "Private gateway execution, advanced governance controls, and custom resolution packs.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <Image src="/casezero-logo.png" alt="CaseZero" width={190} height={56} priority />
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-900">
              Open Workspace
            </Link>
            <Link href="/operations" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Explore Architecture
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-300">The system of resolution</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">Turning Operational Chaos Into Action.</h1>
            <p className="mt-5 max-w-3xl text-lg text-slate-300">
              CaseZero creates one accountable operational system for incidents, work, ownership, and decisions. Detect failures, assemble live evidence, and execute governed remediation across your multi-cloud estate.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/dashboard" className="rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400">
                Open Your Workspace
              </Link>
              <Link href="/operations" className="rounded-lg border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-900">
                Explore the Architecture
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <p className="text-sm text-slate-300">
              ITSM tracks work. CaseZero resolves it. The bottleneck is no longer detection — it is coordination.
            </p>
            <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950 p-4 text-xs text-slate-400">
              Informed by leading industry analyst research and aligned with modern incident management and automation trends.
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-16">
          <h2 className="text-2xl font-bold text-white">Make the enterprise pain recognizable</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {painPoints.map((item) => (
              <article key={item.title} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm text-slate-300">{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-800 bg-slate-900/40">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <h2 className="text-2xl font-bold text-white">Autonomy with boundaries. Built for SRE control.</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {trustPillars.map((pillar) => (
                <article key={pillar.title} className="rounded-xl border border-slate-700 bg-slate-950 p-5">
                  <h3 className="text-base font-semibold text-white">{pillar.title}</h3>
                  <p className="mt-3 text-sm text-slate-300">{pillar.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="text-2xl font-bold text-white">How CaseZero works</h2>
          <p className="mt-2 text-sm text-slate-300">From signal to verified recovery in a repeatable path.</p>
          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {workflowSteps.map((step, index) => (
              <div key={step} className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
                <div className="text-xs font-semibold text-blue-300">Step {index + 1}</div>
                <div className="mt-2 text-sm font-semibold text-white">{step}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-16">
          <h2 className="text-2xl font-bold text-white">Clear customer economics</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {economics.map((item) => (
              <article key={item.label} className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <div className="text-3xl font-bold text-emerald-300">{item.value}</div>
                <div className="mt-2 text-sm text-slate-300">{item.label}</div>
              </article>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Illustrative model. Actual business case should be baseline-driven using customer-specific incident volume, labor rates, and disruption costs.
          </p>
        </section>

        <section className="border-y border-slate-800 bg-slate-900/40">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <h2 className="text-2xl font-bold text-white">Connects with your existing stack</h2>
            <p className="mt-2 text-sm text-slate-300">CaseZero acts as a vendor-neutral orchestration layer across your technology portfolio.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {integrations.map((name) => (
                <span key={name} className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-200">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="text-2xl font-bold text-white">Land with a pilot. Prove the outcome.</h2>
          <p className="mt-3 max-w-3xl text-sm text-slate-300">
            Start with 2–3 high-friction incident classes, establish a baseline, and prove measurable improvement in one operational path before expanding.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {commercialTiers.map((tier) => (
              <article key={tier.name} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <h3 className="text-base font-semibold text-white">{tier.name}</h3>
                <p className="mt-3 text-sm text-slate-300">{tier.copy}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
              Schedule a CaseZero Scoping Session
            </Link>
            <Link href="/reports/leadership-brief" className="rounded-lg border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-900">
              View Leadership Brief
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
