export default function AdminLoading() {
  return (
    <div className="page-stack animate-pulse">
      <section className="section-card">
        <div className="section-heading">
          <div className="space-y-3">
            <div className="h-3 w-20 bg-gray-200 rounded" />
            <div className="h-7 w-72 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="admin-grid">
          {["a", "b", "c", "d"].map((id) => (
            <div key={id} className="admin-card h-28 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </section>
    </div>
  );
}
