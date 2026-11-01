import { Link, useParams } from "react-router-dom";
import { projectsApi } from "../../api/index.js";
import AsyncContent from "../../components/common/AsyncContent.jsx";
import { EstadoProyecto } from "../../components/common/Badges.jsx";
import GitHubRepoInfo from "../../components/projects/GitHubRepoInfo.jsx";
import MemberList from "../../components/initiatives/MemberList.jsx";
import { useFetch } from "../../hooks/useFetch.js";
import { formatearFecha } from "../../utils/labels.js";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { data: p, loading, error, reload } = useFetch((signal) => projectsApi.get(id, signal), [id]);
  const errorMostrado = error?.status === 404 ? { ...error, message: "Ese proyecto no existe o no tienes acceso a él." } : error;

  return (
    <div className="container py-4">
      <nav aria-label="Ruta de navegación">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/proyectos">Proyectos</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{p?.name ?? "Detalle"}</li>
        </ol>
      </nav>
      <AsyncContent loading={loading} error={errorMostrado} onRetry={reload} loadingLabel="Cargando proyecto…">
        {p && (
          <div className="row g-4">
            <article className="col-lg-7">
              <EstadoProyecto estado={p.status} />
              <h1 className="h2 mt-2">{p.name}</h1>
              <p className="text-muted">Inició el {formatearFecha(p.startDate)} · Responsable: {p.owner.name}</p>
              <section className="mt-4 pt-3 border-top" aria-labelledby="desc-proy">
                <h2 id="desc-proy" className="h5">Descripción</h2>
                <p style={{ whiteSpace: "pre-line" }}>{p.description}</p>
              </section>
              <section className="mt-4 pt-3 border-top" aria-labelledby="obj-proy">
                <h2 id="obj-proy" className="h5">Objetivo</h2>
                <p>{p.objective}</p>
              </section>
              <section className="mt-4 pt-3 border-top" aria-labelledby="origen-proy">
                <h2 id="origen-proy" className="h5">Iniciativa de origen</h2>
                <Link to={`/iniciativas/${p.initiative.id}`}>{p.initiative.title}</Link>
              </section>
              <section className="mt-4 pt-3 border-top" aria-labelledby="equipo-proy">
                <h2 id="equipo-proy" className="h5">Equipo ({p.members.length})</h2>
                <MemberList miembros={p.members} />
              </section>
            </article>
            <aside className="col-lg-5">
              {p.repositoryUrl
                ? <GitHubRepoInfo repositoryUrl={p.repositoryUrl} />
                : <div className="card"><div className="card-body"><h2 className="h5">Repositorio en GitHub</h2><p className="text-muted mb-0">Este proyecto todavía no tiene un repositorio asociado.</p></div></div>}
            </aside>
          </div>
        )}
      </AsyncContent>
    </div>
  );
}
