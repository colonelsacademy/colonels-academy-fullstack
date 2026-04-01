export function DecisionCard({
  layer,
  title,
  note
}: {
  layer: string;
  title: string;
  note: string;
}) {
  return (
    <article className="decision-card">
      <span className="decision-layer">{layer}</span>
      <strong>{title}</strong>
      <p>{note}</p>
    </article>
  );
}
