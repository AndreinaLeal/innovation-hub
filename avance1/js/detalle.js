// avance1/js/detalle.js
import { cargarIniciativas } from "./datos.js";

const ESTADOS = {
  "en-progreso":     "En progreso",
  "buscando-equipo": "Buscando equipo",
  "pausada":         "Pausada",
  "completada":      "Completada",
};

const TIPOS = { idea: "Idea", necesidad: "Necesidad", reto: "Reto" };

const VISIBILIDAD = {
  publica: "Pública",
  institucional: "Institucional",
  restringida: "Restringida",
  privada: "Privada",
};

function obtenerIdDeUrl() {
  const parametros = new URLSearchParams(window.location.search);
  return Number(parametros.get("id"));
}

function mostrarError(mensaje) {
  document.getElementById("contenido-iniciativa").innerHTML =
    `<p class="text-danger">${mensaje}</p>`;
}

function renderizarIniciativa(iniciativa) {
  document.getElementById("contenido-iniciativa").classList.add("d-none");
  document.getElementById("layout-iniciativa").classList.remove("d-none");

  document.getElementById("miga-titulo").textContent = iniciativa.titulo;
  document.getElementById("ini-titulo").textContent = iniciativa.titulo;
  document.getElementById("ini-autor").textContent =
    `Publicado por ${iniciativa.autor}`;
  document.getElementById("ini-estado").textContent = ESTADOS[iniciativa.estado] ?? iniciativa.estado;
  document.getElementById("ini-miembros").textContent =
    `${iniciativa.miembrosActuales} de ${iniciativa.miembrosMeta}`;
  document.getElementById("modal-titulo-iniciativa").textContent = iniciativa.titulo;
  document.getElementById("enlace-editar").href = `publicar.html?editar=1&id=${iniciativa.id}`;

  document.getElementById("ini-etiquetas").innerHTML = `
    <span class="badge text-bg-primary">${TIPOS[iniciativa.tipo]}</span>
    <span class="badge text-bg-light border">${VISIBILIDAD[iniciativa.visibilidad]}</span>
  `;

  const esRestringida = iniciativa.visibilidad === "restringida";
  document.getElementById("ini-nota-restringida").classList.toggle("d-none", !esRestringida);
  document.getElementById("ini-cuerpo-completo").classList.toggle("d-none", esRestringida);

  if (esRestringida) {
    document.getElementById("ini-nota-restringida").textContent =
      `Resumen: ${iniciativa.resumen} — El contenido completo no está disponible porque esta iniciativa es de visibilidad restringida.`;
  } else {
    document.getElementById("ini-descripcion").textContent = iniciativa.descripcion;
    document.getElementById("ini-competencias").innerHTML = iniciativa.competencias
      .map((competencia) => `<li class="list-group-item">${competencia}</li>`)
      .join("");
  }

  document.getElementById("btn-confirmar-eliminar").addEventListener("click", () => {
    const eliminadas = JSON.parse(localStorage.getItem("iniciativasEliminadas") || "[]");
    eliminadas.push(iniciativa.id);
    localStorage.setItem("iniciativasEliminadas", JSON.stringify(eliminadas));
    window.location.href = "catalogo.html";
  });
}

async function iniciar() {
  const id = obtenerIdDeUrl();

  if (!id) {
    mostrarError("No se especificó qué iniciativa mostrar.");
    return;
  }

  const resultado = await cargarIniciativas();

  if (resultado.estado === "error") {
    mostrarError(`No se pudo cargar la iniciativa: ${resultado.mensaje}`);
    return;
  }

  if (resultado.estado === "vacio") {
    mostrarError("No hay iniciativas registradas.");
    return;
  }

  const iniciativa = resultado.datos.find((i) => i.id === id);

  if (!iniciativa) {
    mostrarError("Esa iniciativa no existe o fue eliminada.");
    return;
  }

  renderizarIniciativa(iniciativa);
}

document.addEventListener("DOMContentLoaded", iniciar);