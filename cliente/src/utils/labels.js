// Etiquetas legibles de los catálogos cerrados del contrato.
export const TIPOS = { idea: "Idea", necesidad: "Necesidad", reto: "Reto" };

export const CATEGORIAS = {
  tecnologia: "Tecnología",
  educacion: "Educación",
  sostenibilidad: "Sostenibilidad",
  "impacto-social": "Impacto social",
  "negocios-emprendimiento": "Negocios y emprendimiento",
  "salud-bienestar": "Salud y bienestar",
  "cultura-creatividad": "Cultura y creatividad",
  otro: "Otro",
};

export const ESTADOS = {
  "buscando-equipo": { texto: "Buscando equipo", clase: "text-bg-info" },
  "en-progreso": { texto: "En progreso", clase: "text-bg-warning" },
  pausada: { texto: "Pausada", clase: "text-bg-secondary" },
  completada: { texto: "Completada", clase: "text-bg-success" },
};

export const VISIBILIDADES = {
  publica: { texto: "Pública", ayuda: "cualquiera puede verla, sin iniciar sesión" },
  institucional: { texto: "Institucional", ayuda: "visible para cualquier usuario autenticado" },
  restringida: { texto: "Restringida", ayuda: "solo se muestra un resumen a quien no es del equipo" },
  privada: { texto: "Privada", ayuda: "visible solo para ti y tu equipo" },
};

export const ESTADOS_SOLICITUD = {
  pendiente: { texto: "Pendiente", clase: "text-bg-warning" },
  aceptada: { texto: "Aceptada", clase: "text-bg-success" },
  rechazada: { texto: "Rechazada", clase: "text-bg-danger" },
  cancelada: { texto: "Cancelada", clase: "text-bg-secondary" },
};

export const DISPONIBILIDAD = {
  alta: "Alta — más de 6 horas semanales",
  media: "Media — entre 3 y 6 horas semanales",
  baja: "Baja — menos de 3 horas semanales",
};

export const ESTADOS_PROYECTO = {
  planificacion: { texto: "En planificación", clase: "text-bg-warning" },
  activo: { texto: "Activo", clase: "text-bg-success" },
  finalizado: { texto: "Finalizado", clase: "text-bg-secondary" },
};

const fmt = new Intl.DateTimeFormat("es-CR", { day: "numeric", month: "long", year: "numeric" });
export const formatearFecha = (iso) => {
  if (!iso) return "";
  const fecha = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  return Number.isNaN(fecha.getTime()) ? "" : fmt.format(fecha);
};
