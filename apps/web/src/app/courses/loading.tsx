export default function CoursesLoading() {
  return (
    <div className="page-stack">
      <section className="section-card animate-pulse">
        <div className="section-heading">
          <div className="space-y-3">
            <div className="h-3 w-16 bg-gray-200 rounded" />
            <div className="h-7 w-96 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="grid-3">
          {["a", "b", "c", "d", "e", "f"].map((id) => (
            <div key={id} className="h-52 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </section>
    </div>
  );
}
