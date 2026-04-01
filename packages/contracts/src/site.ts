import type { ArchitectureDecision, SiteMetric } from "./types";

export const siteMetrics: SiteMetric[] = [
  {
    label: "Active tracks",
    value: "5",
    context: "Army, staff, police, APF, and mission prep"
  },
  {
    label: "Faculty depth",
    value: "25+ yrs",
    context: "Retired officers and command-track mentors"
  },
  {
    label: "Delivery modes",
    value: "3",
    context: "Cohort, hybrid, and self-paced learning"
  }
];

export const architectureDecisions: ArchitectureDecision[] = [
  {
    layer: "Web",
    choice: "Next.js App Router",
    note: "Marketing, learning, and admin surfaces can live in one product shell."
  },
  {
    layer: "API",
    choice: "Fastify modular monolith",
    note: "Keep domain logic centralized until scale or team boundaries force a split."
  },
  {
    layer: "Data",
    choice: "Postgres + Prisma",
    note: "A relational core fits enrollments, schedules, orders, and access rules."
  },
  {
    layer: "Identity",
    choice: "Firebase Auth",
    note: "Fast sign-in UX on the web, with server-side verification in Fastify."
  },
  {
    layer: "Async",
    choice: "Redis + BullMQ",
    note: "Use queues for video sync, notifications, and expensive fan-out jobs."
  },
  {
    layer: "Realtime",
    choice: "Not default",
    note: "Add WebSockets only for true live-classroom presence or collaboration."
  }
];

export const realtimePolicy =
  "Use WebSockets only when a feature genuinely needs realtime collaboration. The default platform stays on HTTP, jobs, and targeted revalidation.";
