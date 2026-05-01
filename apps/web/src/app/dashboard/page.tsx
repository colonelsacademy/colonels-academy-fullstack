import { upcomingSessions } from "@colonels-academy/contracts";
import { DecisionCard } from "@colonels-academy/ui";

import { getDashboardOverview } from "@/lib/api";

export default async function DashboardPage() {
  const dashboard = await getDashboardOverview();

  return (
    <div className="page-stack">
      <section className="section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow" style={{ color: "var(--navy)" }}>
              Learner dashboard
            </p>
            <h1 className="section-title">A course command center, not a separate learning service.</h1>
          </div>
          <span className="banner-note">{dashboard.note}</span>
        </div>

        <div className="dashboard-grid">
          <article className="dashboard-card">
            <p className="dashboard-label">Progress</p>
            <p className="dashboard-value">{dashboard.overview.progressPercent}%</p>
            <p>Tie this to lesson completion and replay views once writes are live.</p>
          </article>
          <article className="dashboard-card">
            <p className="dashboard-label">Enrolled tracks</p>
            <p className="dashboard-value">{dashboard.overview.enrolledCourses}</p>
            <p>One learner profile can span public catalog, checkout, and course access.</p>
          </article>
          <article className="dashboard-card">
            <p className="dashboard-label">Upcoming sessions</p>
            <p className="dashboard-value">{dashboard.overview.upcomingSessionCount}</p>
            <p>HTTP plus revalidation is enough until live classroom presence becomes central.</p>
          </article>
          <article className="dashboard-card">
            <p className="dashboard-label">Pending tasks</p>
            <p className="dashboard-value">{dashboard.overview.pendingTasks}</p>
            <p>Use BullMQ for reminders, replays, and operational nudges.</p>
          </article>
        </div>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow" style={{ color: "var(--olive)" }}>
              Live schedule
            </p>
            <h2 className="section-title">Live sessions without premature realtime plumbing.</h2>
          </div>
        </div>

        <div className="grid-3">
          {upcomingSessions.map((session) => (
            <DecisionCard
              key={session.id}
              layer={session.deliveryMode}
              title={session.title}
              note={`${new Date(session.startsAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })} | ${
                session.replayAvailable ? "Replay expected after class." : "Live-only until replay is uploaded."
              }`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
