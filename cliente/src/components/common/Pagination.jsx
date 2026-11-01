/** Paginación impulsada por la respuesta del servidor ({ page, totalPages, total }). */
export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Paginación" className="mt-4">
      <ul className="pagination justify-content-center mb-0">
        <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
          <button type="button" className="page-link" onClick={() => onChange(page - 1)} disabled={page <= 1}>Anterior</button>
        </li>
        <li className="page-item disabled"><span className="page-link">Página {page} de {totalPages}</span></li>
        <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
          <button type="button" className="page-link" onClick={() => onChange(page + 1)} disabled={page >= totalPages}>Siguiente</button>
        </li>
      </ul>
    </nav>
  );
}
