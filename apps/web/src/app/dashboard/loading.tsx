export default function DashboardLoading() {
  return (
    <div className="page-stack animate-pulse">
      <section className="section-card">
        <div className="section-heading">
          <div className="space-y-3">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-7 w-80 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="dashboard-grid">
          {["a", "b", "c", "d"].map((id) => (
            <div key={id} className="dashboard-card animate-pulse">
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="h-10 w-16 bg-gray-200 rounded mt-2" />
              <div className="h-3 w-full bg-gray-100 rounded mt-3" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
