export default function CourseDetailLoading() {
  return (
    <div className="page-stack animate-pulse">
      <section className="detail-panel detail-panel--dark">
        <div className="h-3 w-24 bg-white/20 rounded" />
        <div className="h-10 w-3/4 bg-white/20 rounded mt-3" />
        <div className="h-4 w-full bg-white/10 rounded mt-4" />
        <div className="h-4 w-2/3 bg-white/10 rounded mt-2" />
      </section>
      <div className="detail-grid">
        <section className="detail-panel">
          <div className="h-64 bg-gray-100 rounded-xl" />
        </section>
        <section className="detail-panel">
          <div className="h-64 bg-gray-100 rounded-xl" />
        </section>
      </div>
    </div>
  );
}
