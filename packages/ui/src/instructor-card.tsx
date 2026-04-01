import type { InstructorProfile } from "@colonels-academy/contracts";

export function InstructorCard({ instructor }: { instructor: InstructorProfile }) {
  return (
    <article className="instructor-card">
      <div className="avatar-badge">{instructor.name.slice(0, 2).toUpperCase()}</div>
      <div className="instructor-copy">
        <p className="eyebrow">{instructor.branch}</p>
        <h3>{instructor.name}</h3>
        <p className="instructor-meta">
          {instructor.experience} | {instructor.specialization}
        </p>
        <p>{instructor.bio}</p>
      </div>
    </article>
  );
}
