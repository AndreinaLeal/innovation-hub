import { useState } from "react";
import { usersApi } from "../../api/index.js";
import AsyncContent from "../../components/common/AsyncContent.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import { useDebounced } from "../../hooks/useDebounced.js";
import { useFetch } from "../../hooks/useFetch.js";
import { DISPONIBILIDAD } from "../../utils/labels.js";

const INICIAL = { q: "", skill: "", career: "", availability: "" };

export default function UsersPage() {
  const [filtros, setFiltros] = useState(INICIAL);
  const [pagina, setPagina] = useState(1);
  const q = useDebounced(filtros.q);
  const skill = useDebounced(filtros.skill);
  const career = useDebounced(filtros.career);

  const cambiar = (e) => { setFiltros((prev) => ({ ...prev, [e.target.name]: e.target.value })); setPagina(1); };
  const { data, loading, error, reload } = useFetch(
    (signal) => usersApi.search({ q, skill, career, availability: filtros.availability, page: pagina, size: 9 }, signal),
    [q, skill, career, filtros.availability, pagina]
  );
  const hayFiltros = Boolean(q || skill || career || filtros.availability);

  return (
    <div className="container py-4">
      <PageHeader titulo="Personas" descripcion="Encuentra personas por nombre, competencia, carrera o disponibilidad." />
      <form className="card mb-4" onSubmit={(e) => e.preventDefault()} role="search">
        <div className="card-body row g-3">
          <div className="col-md-3"><label htmlFor="u-q" className="form-label">Nombre</label><input id="u-q" name="q" className="form-control" value={filtros.q} onChange={cambiar} /></div>
          <div className="col-md-3"><label htmlFor="u-skill" className="form-label">Competencia</label><input id="u-skill" name="skill" className="form-control" value={filtros.skill} onChange={cambiar} placeholder="Nombre exacto, ej: SQL" /></div>
          <div className="col-md-3"><label htmlFor="u-career" className="form-label">Carrera</label><input id="u-career" name="career" className="form-control" value={filtros.career} onChange={cambiar} /></div>
          <div className="col-md-3">
            <label htmlFor="u-disp" className="form-label">Disponibilidad</label>
            <select id="u-disp" name="availability" className="form-select" value={filtros.availability} onChange={cambiar}>
              <option value="">Cualquiera</option>
              {Object.entries(DISPONIBILIDAD).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </div>
        </div>
      </form>
      <AsyncContent loading={loading} error={error} onRetry={reload} loadingLabel="Buscando personas…"
        isEmpty={data?.data.length === 0}
        emptyTitle={hayFiltros ? "Nadie coincide con esa búsqueda" : "Todavía no hay personas registradas"}
        emptyMessage={hayFiltros ? "Prueba con otros filtros." : undefined}
        emptyAction={hayFiltros ? <button type="button" className="btn btn-outline-primary" onClick={() => { setFiltros(INICIAL); setPagina(1); }}>Limpiar filtros</button> : undefined}>
        <div className="row g-4">
          {data?.data.map((u) => (
            <div className="col-md-6 col-lg-4" key={u.id}>
              <article className="card h-100">
                <div className="card-body">
                  <h3 className="h5">{u.name}</h3>
                  <p className="text-muted small mb-2">{u.career || "Carrera sin indicar"} · Disponibilidad {u.availability}</p>
                  {u.bio && <p>{u.bio}</p>}
                  <div className="d-flex flex-wrap gap-1">{u.skills.map((s) => <span key={s} className="badge text-bg-primary">{s}</span>)}</div>
                </div>
              </article>
            </div>
          ))}
        </div>
        <Pagination page={data?.page ?? 1} totalPages={data?.totalPages ?? 1} onChange={setPagina} />
      </AsyncContent>
    </div>
  );
}
