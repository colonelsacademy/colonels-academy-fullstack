import { architectureDecisions } from "@colonels-academy/contracts";
import { DecisionCard } from "@colonels-academy/ui";

export default function AdminPage() {
  return (
    <div className="page-stack">
      <section className="section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow" style={{ color: "var(--rust)" }}>
              Admin surface
            </p>
            <h1 className="section-title">Admin stays in the same web app for now.</h1>
          </div>
          <p>
            That keeps auth, deployment, shared UI, and feature ownership straightforward while the
            product is still one tightly connected platform.
          </p>
        </div>

        <div className="admin-grid">
          <article className="admin-card">
            <h3>Catalog operations</h3>
            <p>Course, faculty, pricing, and landing-page updates belong here first.</p>
          </article>
          <article className="admin-card">
            <h3>Learning operations</h3>
            <p>Manage lessons, replays, and live-session schedules from the same product shell.</p>
          </article>
          <article className="admin-card">
            <h3>Media pipeline</h3>
            <p>
              Queue Bunny Stream sync tasks and status checks with BullMQ instead of blocking web
              requests.
            </p>
          </article>
          <article className="admin-card">
            <h3>Learner support</h3>
            <p>
              Handle enrollments, reminders, and exceptions before splitting operational tooling
              further.
            </p>
          </article>
        </div>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow" style={{ color: "var(--navy)" }}>
              Decision recap
            </p>
            <h2 className="section-title">
              The platform is modular, but still intentionally one backend.
            </h2>
          </div>
        </div>

        <div className="grid-3">
          {architectureDecisions.map((decision) => (
            <DecisionCard
              key={decision.layer}
              layer={decision.layer}
              title={decision.choice}
              note={decision.note}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
