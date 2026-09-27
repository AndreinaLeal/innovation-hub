// avance1/js/datos.js

const CLAVE_ELIMINADAS = "iniciativasEliminadas";
const CLAVE_NUEVAS = "iniciativasNuevas";
const CLAVE_MODIFICADAS = "iniciativasModificadas";

function leerLista(clave) {
  return JSON.parse(localStorage.getItem(clave) || "[]");
}

function leerMapa(clave) {
  return JSON.parse(localStorage.getItem(clave) || "{}");
}

/**
 * Carga las iniciativas desde el archivo JSON del repositorio y les
 * aplica, en este orden: las nuevas publicadas, las modificaciones
 * guardadas, y finalmente quita las eliminadas.
 * Devuelve un objeto con el estado de la operación, para que quien
 * lo use pueda mostrar "cargando", un error, o los datos.
 */
export async function cargarIniciativas() {
  try {
    const respuesta = await fetch("../datos/iniciativas.json");

    if (!respuesta.ok) {
      throw new Error(`No se pudo cargar el catálogo (código ${respuesta.status})`);
    }

    const datosBase = await respuesta.json();

    if (!Array.isArray(datosBase)) {
      throw new Error("El archivo de datos no tiene el formato esperado.");
    }

    const nuevas = leerLista(CLAVE_NUEVAS);
    const modificadas = leerMapa(CLAVE_MODIFICADAS);
    const eliminadas = leerLista(CLAVE_ELIMINADAS);

    const combinadas = [...datosBase, ...nuevas]
      .map((iniciativa) =>
        modificadas[iniciativa.id]
          ? { ...iniciativa, ...modificadas[iniciativa.id] }
          : iniciativa
      )
      .filter((iniciativa) => !eliminadas.includes(iniciativa.id));

    if (combinadas.length === 0) {
      return { estado: "vacio", datos: [] };
    }

    return { estado: "listo", datos: combinadas };

  } catch (error) {
    return { estado: "error", mensaje: error.message };
  }
}

/** Calcula el siguiente id disponible a partir de una lista de iniciativas. */
export function obtenerSiguienteId(datos) {
  return datos.length ? Math.max(...datos.map((i) => i.id)) + 1 : 1;
}

/** Guarda una iniciativa nueva (creada desde el formulario de publicar). */
export function guardarNuevaIniciativa(iniciativa) {
  const nuevas = leerLista(CLAVE_NUEVAS);
  nuevas.push(iniciativa);
  localStorage.setItem(CLAVE_NUEVAS, JSON.stringify(nuevas));
}

/** Guarda cambios sobre una iniciativa existente (creada aquí o del JSON base). */
export function guardarModificacion(id, cambios) {
  const modificadas = leerMapa(CLAVE_MODIFICADAS);
  modificadas[id] = { ...(modificadas[id] || {}), ...cambios };
  localStorage.setItem(CLAVE_MODIFICADAS, JSON.stringify(modificadas));
}

/** Marca una iniciativa como eliminada (se archiva, no se borra físicamente). */
export function eliminarIniciativa(id) {
  const eliminadas = leerLista(CLAVE_ELIMINADAS);
  if (!eliminadas.includes(id)) {
    eliminadas.push(id);
    localStorage.setItem(CLAVE_ELIMINADAS, JSON.stringify(eliminadas));
  }
}