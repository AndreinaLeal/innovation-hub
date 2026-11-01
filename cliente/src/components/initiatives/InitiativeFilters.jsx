import { CATEGORIAS, TIPOS } from "../../utils/labels.js";

/**
 * Filtros controlados. El estado vive en la página (se eleva al ancestro común, que es quien consulta la API).
 * Cualquier cambio de filtro vuelve a pedir datos al servidor; aquí no se filtra nada en el cliente.
 */
export default function InitiativeFilters({ filtros, onCambio, onLimpiar, conSesion }) {
  const cambiar = (e) => onCambio({ [e.target.name]: e.target.value });
  return (
    <div className="card">
      <div className="card-body">
        <h2 className="h5 card-title">Filtrar iniciativas</h2>
        <form onSubmit={(e) => e.preventDefault()} role="search">
          <div className="mb-3">
            <label htmlFor="filtro-q" className="form-label">Buscar por texto</label>
            <input id="filtro-q" type="search" name="q" className="form-control" value={filtros.q} onChange={cambiar} />
          </div>
          <div className="mb-3">
            <label htmlFor="filtro-type" className="form-label">Tipo</label>
            <select id="filtro-type" name="type" className="form-select" value={filtros.type} onChange={cambiar}>
              <option value="">Todos</option>
              {Object.entries(TIPOS).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="filtro-category" className="form-label">Categoría</label>
            <select id="filtro-category" name="category" className="form-select" value={filtros.category} onChange={cambiar}>
              <option value="">Todas</option>
              {Object.entries(CATEGORIAS).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="filtro-skill" className="form-label">Competencia requerida</label>
            <input id="filtro-skill" type="text" name="skill" className="form-control" value={filtros.skill} onChange={cambiar} placeholder="Nombre exacto, ej: SQL" />
          </div>
          <div className="mb-3">
            <label htmlFor="filtro-sort" className="form-label">Ordenar por</label>
            <select id="filtro-sort" name="sort" className="form-select" value={filtros.sort} onChange={cambiar}>
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguas</option>
              <option value="title">Título (A-Z)</option>
            </select>
          </div>
          {conSesion && (
            <div className="mb-3">
              <label htmlFor="filtro-ambito" className="form-label">Mostrar</label>
              <select id="filtro-ambito" name="ambito" className="form-select" value={filtros.ambito} onChange={cambiar}>
                <option value="">Todas las visibles</option>
                <option value="owner">Mis iniciativas</option>
                <option value="archived">Mis iniciativas archivadas</option>
                <option value="member">Donde participo</option>
              </select>
            </div>
          )}
          <button type="button" className="btn btn-outline-secondary w-100" onClick={onLimpiar}>Limpiar filtros</button>
        </form>
      </div>
    </div>
  );
}
