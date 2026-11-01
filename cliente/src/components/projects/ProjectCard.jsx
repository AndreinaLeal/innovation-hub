import { Link } from "react-router-dom";
import { EstadoProyecto } from "../common/Badges.jsx";
import { formatearFecha } from "../../utils/labels.js";

export default function ProjectCard({ proyecto }) {
  const p = proyecto;
  return (
    <article className="card h-100 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between mb-3">
          <span className="badge text-bg-primary">{p.memberCount} {p.memberCount === 1 ? "miembro" : "miembros"}</span>
          <EstadoProyecto estado={p.status} />
        </div>
        <h3 className="h5">{p.name}</h3>
        <p className="text-muted">{p.description.length > 160 ? `${p.description.slice(0, 157)}…` : p.description}</p>
        <p className="small mb-1"><strong>Origen:</strong> {p.initiative.title}</p>
        <p className="small mb-0"><strong>Inicio:</strong> {formatearFecha(p.startDate)}</p>
      </div>
      <div className="card-footer bg-white border-0">
        <Link to={`/proyectos/${p.id}`} className="btn btn-outline-primary w-100">Ver proyecto</Link>
      </div>
    </article>
  );
}
