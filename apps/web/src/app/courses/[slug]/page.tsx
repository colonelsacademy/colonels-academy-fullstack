import { notFound } from "next/navigation";
import { instructors as fallbackInstructors } from "@colonels-academy/contracts";
import { InstructorCard } from "@colonels-academy/ui";

import { getCourseBySlug, getInstructors } from "@/lib/api";

type CoursePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = await params;
  const [course, faculty] = await Promise.all([getCourseBySlug(slug), getInstructors()]);

  if (!course) {
    notFound();
  }

  const courseFaculty = (faculty.length ? faculty : fallbackInstructors).filter((instructor) =>
    course.instructorSlugs.includes(instructor.slug)
  );

  return (
    <div className="page-stack">
      <section className="detail-panel detail-panel--dark">
        <p className="eyebrow">Course detail</p>
        <h1 className="detail-title">{course.title}</h1>
        <p className="detail-copy">{course.description}</p>
        <div className="cta-row">
          <span className="soft-pill">{course.track.toUpperCase()}</span>
          <span className="soft-pill">{course.level}</span>
          <span className="soft-pill">{course.durationLabel}</span>
        </div>
      </section>

      <div className="detail-grid">
        <section className="detail-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow" style={{ color: "var(--olive)" }}>
                Outcomes
              </p>
              <h2 className="section-title">What learners should leave with</h2>
            </div>
          </div>

          <ul>
            {course.outcomeBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="detail-panel">
          <div className="detail-stack">
            <div>
              <p className="eyebrow" style={{ color: "var(--navy)" }}>
                Delivery
              </p>
              <h3>{course.format}</h3>
              <p>{course.liveSupport}</p>
            </div>
            <div>
              <p className="eyebrow" style={{ color: "var(--rust)" }}>
                Pricing
              </p>
              <h3>NPR {course.priceNpr.toLocaleString("en-NP")}</h3>
              <p>{course.lessonCount} lessons in the starter syllabus map.</p>
            </div>
          </div>
        </section>
      </div>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow" style={{ color: "var(--brass)" }}>
              Syllabus
            </p>
            <h2 className="section-title">A clean starter outline that can grow into lesson-level CMS data.</h2>
          </div>
        </div>

        <div className="grid-3">
          {course.syllabus.map((item) => (
            <article key={item} className="decision-card">
              <strong>{item}</strong>
              <p>Model this as lessons and sections in Prisma once admin authoring is in place.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow" style={{ color: "var(--navy)" }}>
              Faculty match
            </p>
            <h2 className="section-title">This course is still anchored in instructor credibility.</h2>
          </div>
        </div>

        <div className="grid-3">
          {courseFaculty.map((instructor) => (
            <InstructorCard key={instructor.slug} instructor={instructor} />
          ))}
        </div>
      </section>
    </div>
  );
}
