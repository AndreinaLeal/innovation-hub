import { useState } from "react";
import { Link } from "react-router-dom";
import { projectsApi } from "../../api/index.js";
import AsyncContent from "../../components/common/AsyncContent.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import ProjectCard from "../../components/projects/ProjectCard.jsx";
import { useFetch } from "../../hooks/useFetch.js";

export default function ProjectsPage() {
  const [pagina, setPagina] = useState(1);
  const { data, loading, error, reload } = useFetch((signal) => projectsApi.list({ page: pagina, size: 6 }, signal), [pagina]);

  return (
    <div className="container py-4">
      <PageHeader titulo="Proyectos" descripcion="Proyectos que nacen de iniciativas con equipo formado.">
        <Link to="/iniciativas" className="btn btn-primary">Ir al catálogo</Link>
      </PageHeader>
      <AsyncContent loading={loading} error={error} onRetry={reload} loadingLabel="Cargando proyectos…"
        isEmpty={data?.data.length === 0}
        emptyTitle="Todavía no hay proyectos"
        emptyMessage="Un proyecto se crea cuando el propietario de una iniciativa con equipo la convierte en proyecto.">
        <div className="row g-4">
          {data?.data.map((p) => <div className="col-md-6 col-lg-4" key={p.id}><ProjectCard proyecto={p} /></div>)}
        </div>
        <Pagination page={data?.page ?? 1} totalPages={data?.totalPages ?? 1} onChange={setPagina} />
      </AsyncContent>
    </div>
  );
}
