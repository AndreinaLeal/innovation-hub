/** Encabezado de página con título, descripción y acciones (children). */
export default function PageHeader({ titulo, descripcion, children }) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 className="h2 mb-1">{titulo}</h1>
        {descripcion && <p className="text-muted mb-0">{descripcion}</p>}
      </div>
      {children}
    </div>
  );
}
