import { CourseCard } from "@colonels-academy/ui";

import { getCourses } from "@/lib/api";

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="page-stack">
      <section className="section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow" style={{ color: "var(--olive)" }}>
              Catalog
            </p>
            <h1 className="section-title">
              Training tracks across army, police, APF, staff, and mission prep.
            </h1>
          </div>
          <p>
            These are starter records shared between the web experience, the API fallback layer, and
            the Prisma seed path.
          </p>
        </div>

        <div className="grid-3">
          {courses.map((course) => (
            <CourseCard key={course.slug} course={course} href={`/courses/${course.slug}`} />
          ))}
        </div>
      </section>
    </div>
  );
}
