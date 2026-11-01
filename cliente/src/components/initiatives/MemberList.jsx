/** Lista del equipo. Si se pasa `onRetirar`, el propietario ve el botón para retirar a cada miembro (excepto a sí mismo). */
export default function MemberList({ miembros, onRetirar }) {
  return (
    <ul className="list-group list-group-flush">
      {miembros.map((m) => (
        <li key={m.userId} className="list-group-item d-flex justify-content-between align-items-center px-0">
          <span>
            {m.name} {m.role === "propietario" && <span className="badge text-bg-secondary ms-1">Propietario</span>}
          </span>
          {onRetirar && m.role !== "propietario" && (
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onRetirar(m)} aria-label={`Retirar a ${m.name} del equipo`}>Retirar</button>
          )}
        </li>
      ))}
    </ul>
  );
}
