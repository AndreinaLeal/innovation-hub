export default function Spinner({ etiqueta = "Cargando…" }) {
  return (
    <div className="d-flex align-items-center gap-2 text-muted py-4" role="status">
      <div className="spinner-border spinner-border-sm" aria-hidden="true" />
      <span>{etiqueta}</span>
    </div>
  );
}
