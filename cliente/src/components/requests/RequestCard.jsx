import { Link } from "react-router-dom";
import { EstadoSolicitud } from "../common/Badges.jsx";
import { DISPONIBILIDAD, formatearFecha } from "../../utils/labels.js";

/**
 * Tarjeta de solicitud reutilizable. Según el rol se muestran distintas acciones (children):
 * la persona solicitante ve "modificar/cancelar", el propietario ve "aceptar/rechazar".
 */
export default function RequestCard({ solicitud, mostrarSolicitante = false, children }) {
  const s = solicitud;
  return (
    <article className="card">
      <div className="card-body">
        <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
          <h3 className="h5 mb-0">
            <Link to={`/iniciativas/${s.initiative.id}`} className="text-decoration-none">{s.initiative.title}</Link>
          </h3>
          <EstadoSolicitud estado={s.status} />
        </div>
        {mostrarSolicitante && (
          <p className="mb-1"><strong>{s.applicant.name}</strong>{s.applicant.career && <span className="text-muted"> · {s.applicant.career}</span>}</p>
        )}
        <p className="mb-2" style={{ whiteSpace: "pre-line" }}>{s.message}</p>
        <ul className="list-unstyled small text-muted mb-3">
          <li><strong>Competencia:</strong> {s.mainSkill}</li>
          <li><strong>Rol deseado:</strong> {s.desiredRole}</li>
          <li><strong>Disponibilidad:</strong> {DISPONIBILIDAD[s.availability] ?? s.availability}</li>
          <li><strong>Enviada:</strong> {formatearFecha(s.createdAt)}</li>
        </ul>
        {children && <div className="d-flex flex-wrap gap-2">{children}</div>}
      </div>
    </article>
  );
}
