// avance1/js/datos.js

/**
 * Carga las iniciativas desde el archivo JSON del repositorio.
 * Devuelve un objeto con el estado de la operación, para que quien
 * lo use pueda mostrar "cargando", un error, o los datos.
 */
export async function cargarIniciativas() {
  try {
    const respuesta = await fetch("../datos/iniciativas.json");

    if (!respuesta.ok) {
      throw new Error(`No se pudo cargar el catálogo (código ${respuesta.status})`);
    }

    const datos = await respuesta.json();

    if (!Array.isArray(datos) || datos.length === 0) {
      return { estado: "vacio", datos: [] };
    }

    return { estado: "listo", datos };

  } catch (error) {
    return { estado: "error", mensaje: error.message };
  }
}