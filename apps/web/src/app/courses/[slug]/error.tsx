"use client";

export default function CourseDetailError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="page-stack">
      <section className="section-card text-center py-16">
        <p className="eyebrow" style={{ color: "var(--rust)" }}>
          Something went wrong
        </p>
        <h2 className="section-title mt-2">Could not load this course</h2>
        <p className="text-gray-500 mt-2 text-sm">{error.message}</p>
        <button
          onClick={reset}
          className="mt-6 px-6 py-2.5 bg-[#0F1C15] text-white font-['Rajdhani'] font-bold text-sm uppercase tracking-[0.2em] rounded-lg hover:bg-[#D4AF37] hover:text-[#0F1C15] transition-all"
        >
          Try Again
        </button>
      </section>
    </div>
  );
}
