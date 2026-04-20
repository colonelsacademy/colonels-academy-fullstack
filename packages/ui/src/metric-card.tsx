export function MetricCard({
  value,
  label,
  context
}: { value: string; label: string; context: string }) {
  return (
    <article className="metric-card">
      <strong>{value}</strong>
      <div>{label}</div>
      <p>{context}</p>
    </article>
  );
}
