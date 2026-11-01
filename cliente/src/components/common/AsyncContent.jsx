import Spinner from "./Spinner.jsx";

/**
 * Distingue SIEMPRE los tres estados de una pantalla que consulta la API:
 * cargando, error (con reintento) y resultado vacío. Si no aplica ninguno, muestra `children`.
 */
export default function AsyncContent({
  loading, error, isEmpty, onRetry,
  loadingLabel, emptyTitle = "No hay resultados", emptyMessage, emptyAction, children,
}) {
  if (loading) return <Spinner etiqueta={loadingLabel} />;

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <p className="mb-2"><strong>No se pudo cargar la información.</strong> {error.message}</p>
        {onRetry && <button type="button" className="btn btn-sm btn-outline-danger" onClick={onRetry}>Reintentar</button>}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="text-center text-muted border rounded bg-white py-5 px-3">
        <p className="h5 mb-2">{emptyTitle}</p>
        {emptyMessage && <p className="mb-3">{emptyMessage}</p>}
        {emptyAction}
      </div>
    );
  }
  return children;
}
