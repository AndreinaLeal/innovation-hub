import { ESTADOS, ESTADOS_SOLICITUD, ESTADOS_PROYECTO, TIPOS, VISIBILIDADES } from "../../utils/labels.js";

export const EstadoIniciativa = ({ estado }) => {
  const e = ESTADOS[estado] ?? { texto: estado, clase: "text-bg-light" };
  return <span className={`badge ${e.clase}`}><span aria-hidden="true">●</span> {e.texto}</span>;
};
export const EstadoSolicitud = ({ estado }) => {
  const e = ESTADOS_SOLICITUD[estado] ?? { texto: estado, clase: "text-bg-light" };
  return <span className={`badge ${e.clase}`}>{e.texto}</span>;
};
export const EstadoProyecto = ({ estado }) => {
  const e = ESTADOS_PROYECTO[estado] ?? { texto: estado, clase: "text-bg-light" };
  return <span className={`badge ${e.clase}`}>{e.texto}</span>;
};
export const EtiquetaTipo = ({ tipo }) => <span className="badge text-bg-primary">{TIPOS[tipo] ?? tipo}</span>;
export const EtiquetaVisibilidad = ({ visibilidad }) => (
  <span className="badge text-bg-light border">{VISIBILIDADES[visibilidad]?.texto ?? visibilidad}</span>
);
