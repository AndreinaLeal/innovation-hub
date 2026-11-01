import { ESTADOS_SOLICITUD } from "../../utils/labels.js";

export default function StatusFilter({ value, onChange }) {
  return (
    <div className="mb-3" style={{ maxWidth: 260 }}>
      <label htmlFor="filtro-estado" className="form-label">Filtrar por estado</label>
      <select id="filtro-estado" className="form-select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Todos</option>
        {Object.entries(ESTADOS_SOLICITUD).map(([v, e]) => <option key={v} value={v}>{e.texto}</option>)}
      </select>
    </div>
  );
}
