import type { CSSProperties } from "react";

import type { CourseDetail } from "@colonels-academy/contracts";

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0
  }).format(amount);
}

export function CourseCard({ course, href }: { course: CourseDetail; href: string }) {
  return (
    <article
      className="course-card"
      style={
        {
          "--accent": course.accentColor
        } as CSSProperties
      }
    >
      <div className="course-accent" />
      <div className="card-header-row">
        <span className="soft-pill">{course.track.toUpperCase()}</span>
        <span className="card-meta">{course.level}</span>
      </div>

      <div className="course-card__body">
        <h3>{course.title}</h3>
        <p>{course.summary}</p>
      </div>

      <div className="course-stats">
        <span>{course.durationLabel}</span>
        <span>{course.lessonCount} lessons</span>
        <span>{course.format}</span>
      </div>

      <div className="price-row">
        <strong>{formatPrice(course.priceNpr)}</strong>
        {course.originalPriceNpr ? <span>{formatPrice(course.originalPriceNpr)}</span> : null}
      </div>

      <a className="button-secondary" href={href}>
        Open syllabus
      </a>
    </article>
  );
}
