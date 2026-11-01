import { Link } from "react-router-dom";
import { CATEGORIAS, TIPOS, formatearFecha } from "../../utils/labels.js";
import { EstadoIniciativa } from "../common/Badges.jsx";

export default function InitiativeCard({ iniciativa }) {
  const { id, title, type, category, summary, owner, createdAt, skills, status, memberCount, targetMembers, restricted, visibility, archived } = iniciativa;
  return (
    <article className="card h-100">
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <h3 className="h5 card-title">{title}</h3>
          {archived && <span className="badge text-bg-dark">Archivada</span>}
        </div>
        <p className="text-muted small mb-2">{TIPOS[type]} · {CATEGORIAS[category] ?? category}</p>
        <p className="card-text">{summary}</p>
        <p className="small">Publicado por <strong>{owner.name}</strong> el <time dateTime={createdAt}>{formatearFecha(createdAt)}</time></p>
        {skills.length > 0 && (
          <>
            <h4 className="h6">Competencias requeridas</h4>
            <ul className="mb-3 lista-competencias">{skills.map((s) => <li key={s}>{s}</li>)}</ul>
          </>
        )}
        {visibility === "restringida" && <p className="small text-muted fst-italic">Visibilidad restringida: solo se muestra el resumen.</p>}
        <p className="mb-3">
          <EstadoIniciativa estado={status} />
          <span className="text-muted small ms-1">· {memberCount} de {targetMembers} miembros</span>
        </p>
        <Link to={`/iniciativas/${id}`} className="btn btn-outline-primary mt-auto" aria-label={`Ver la iniciativa ${title}`}>Ver la iniciativa</Link>
      </div>
    </article>
  );
}
