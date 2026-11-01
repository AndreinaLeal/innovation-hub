import { useState } from "react";
import { Link } from "react-router-dom";
import { initiativesApi } from "../../api/index.js";
import AsyncContent from "../../components/common/AsyncContent.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import InitiativeCard from "../../components/initiatives/InitiativeCard.jsx";
import InitiativeFilters from "../../components/initiatives/InitiativeFilters.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useDebounced } from "../../hooks/useDebounced.js";
import { useFetch } from "../../hooks/useFetch.js";

const FILTROS_INICIALES = { q: "", type: "", category: "", skill: "", sort: "newest", ambito: "" };

export default function CatalogPage() {
  const { user } = useAuth();
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [pagina, setPagina] = useState(1);

  // El texto se envía con retraso para no consultar el servidor en cada tecla.
  const q = useDebounced(filtros.q);
  const skill = useDebounced(filtros.skill);

  const cambiar = (parcial) => {
    setFiltros((prev) => ({ ...prev, ...parcial }));
    setPagina(1);
  };
  const limpiar = () => { setFiltros(FILTROS_INICIALES); setPagina(1); };

  const params = {
    q, skill, type: filtros.type, category: filtros.category, sort: filtros.sort,
    page: pagina, size: 6,
    owner: user && (filtros.ambito === "owner" || filtros.ambito === "archived") ? "me" : undefined,
    archived: user && filtros.ambito === "archived" ? "true" : undefined,
    member: user && filtros.ambito === "member" ? "me" : undefined,
  };

  const { data, loading, error, reload } = useFetch(
    (signal) => initiativesApi.list(params, signal),
    [q, skill, filtros.type, filtros.category, filtros.sort, filtros.ambito, pagina, user?.id]
  );
  const hayFiltros = Boolean(q || skill || filtros.type || filtros.category || filtros.ambito);

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <h1 className="h2 mb-0">Catálogo de iniciativas</h1>
        <Link to="/iniciativas/nueva" className="btn btn-primary">Publicar iniciativa</Link>
      </div>
      {!user && (
        <p className="alert alert-info">Estás viendo solo las iniciativas públicas. <Link to="/login">Inicia sesión</Link> para ver las institucionales y restringidas.</p>
      )}
      <div className="row g-4">
        <aside className="col-lg-3" aria-label="Filtros">
          <InitiativeFilters filtros={filtros} onCambio={cambiar} onLimpiar={limpiar} conSesion={Boolean(user)} />
        </aside>
        <section className="col-lg-9" aria-labelledby="titulo-resultados">
          <h2 id="titulo-resultados" className="h5 mb-3">
            {data ? `${data.total} ${data.total === 1 ? "iniciativa encontrada" : "iniciativas encontradas"}` : "Resultados"}
          </h2>
          <AsyncContent loading={loading} error={error} onRetry={reload} loadingLabel="Cargando iniciativas…"
            isEmpty={data?.data.length === 0}
            emptyTitle={hayFiltros ? "Ninguna iniciativa coincide con tu búsqueda" : "Todavía no hay iniciativas"}
            emptyMessage={hayFiltros ? "Prueba con otros filtros." : "Sé la primera persona en publicar una."}
            emptyAction={hayFiltros
              ? <button type="button" className="btn btn-outline-primary" onClick={limpiar}>Limpiar filtros</button>
              : <Link to="/iniciativas/nueva" className="btn btn-primary">Publicar iniciativa</Link>}>
            <div className="row row-cols-1 row-cols-md-2 g-4">
              {data?.data.map((i) => <div className="col" key={i.id}><InitiativeCard iniciativa={i} /></div>)}
            </div>
            <Pagination page={data?.page ?? 1} totalPages={data?.totalPages ?? 1} onChange={setPagina} />
          </AsyncContent>
        </section>
      </div>
    </div>
  );
}
