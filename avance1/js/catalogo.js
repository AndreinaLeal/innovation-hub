// avance1/js/catalogo.js
import { cargarIniciativas } from "./datos.js";

const ESTADOS = {
  "en-progreso":     { texto: "En progreso",     clase: "text-bg-warning" },
  "buscando-equipo":  { texto: "Buscando equipo", clase: "text-bg-info" },
  "pausada":          { texto: "Pausada",         clase: "text-bg-secondary" },
  "completada":       { texto: "Completada",      clase: "text-bg-success" },
};

const TIPOS = { idea: "Idea", necesidad: "Necesidad", reto: "Reto" };
const CATEGORIAS = {
  educacion: "Educación",
  ambiente: "Ambiente",
  comunidad: "Gestión comunitaria",
  academico: "Académico",
  social: "Social",
  tecnologico: "Tecnológico",
  sostenibilidad: "Sostenibilidad",
};

const formateadorFecha = new Intl.DateTimeFormat("es-CR", {
  day: "numeric", month: "long", year: "numeric",
});

let todasLasIniciativas = [];

function crearTarjeta(iniciativa) {
  const estado = ESTADOS[iniciativa.estado] ?? { texto: iniciativa.estado, clase: "text-bg-light" };
  const fecha = formateadorFecha.format(new Date(iniciativa.fecha));

  const competenciasHTML = iniciativa.competencias
    .map((competencia) => `<li>${competencia}</li>`)
    .join("");

  const columna = document.createElement("div");
  columna.className = "col";
  columna.innerHTML = `
    <article class="card h-100">
      <div class="card-body d-flex flex-column">
        <h3 class="h5 card-title">${iniciativa.titulo}</h3>
        <p class="text-muted small mb-2">${TIPOS[iniciativa.tipo]} · ${CATEGORIAS[iniciativa.categoria]}</p>
        <p class="card-text">${iniciativa.resumen}</p>
        <p class="small">Publicado por <strong>${iniciativa.autor}</strong> el <time datetime="${iniciativa.fecha}">${fecha}</time></p>
        <h4 class="h6">Competencias requeridas</h4>
        <ul class="mb-3">${competenciasHTML}</ul>
        <p class="mb-3">
          <span class="badge ${estado.clase}"><span aria-hidden="true">●</span> ${estado.texto}</span>
          <span class="text-muted small ms-1">· ${iniciativa.miembrosActuales} de ${iniciativa.miembrosMeta} miembros</span>
        </p>
        <a href="detalle.html" class="btn btn-outline-primary mt-auto">Ver la iniciativa ${iniciativa.titulo}</a>
      </div>
    </article>
  `;
  return columna;
}

function renderizarResultados(lista) {
  const contenedor = document.getElementById("contenedor-resultados");
  const mensajeVacio = document.getElementById("mensaje-sin-resultados");
  const contadorTexto = document.getElementById("cantidad-resultados");

  contenedor.innerHTML = "";
  contadorTexto.textContent = lista.length;

  if (lista.length === 0) {
    mensajeVacio.classList.remove("d-none");
    return;
  }
  mensajeVacio.classList.add("d-none");

  lista.forEach((iniciativa) => {
    contenedor.appendChild(crearTarjeta(iniciativa));
  });
}

function aplicarFiltros() {
  const texto = document.getElementById("filtro-texto").value.trim().toLowerCase();
  const tipo = document.getElementById("filtro-tipo").value;
  const categoria = document.getElementById("filtro-categoria").value;
  const competencia = document.getElementById("filtro-competencia").value.trim().toLowerCase();

  const resultado = todasLasIniciativas.filter((iniciativa) => {
    const coincideTexto = !texto ||
      iniciativa.titulo.toLowerCase().includes(texto) ||
      iniciativa.resumen.toLowerCase().includes(texto);

    const coincideTipo = !tipo || iniciativa.tipo === tipo;
    const coincideCategoria = !categoria || iniciativa.categoria === categoria;
    const coincideCompetencia = !competencia ||
      iniciativa.competencias.some((c) => c.toLowerCase().includes(competencia));

    return coincideTexto && coincideTipo && coincideCategoria && coincideCompetencia;
  });

  renderizarResultados(resultado);
}

async function iniciar() {
  const contenedor = document.getElementById("contenedor-resultados");
  contenedor.innerHTML = `<p class="text-muted">Cargando iniciativas...</p>`;

  const resultado = await cargarIniciativas();

  if (resultado.estado === "error") {
    contenedor.innerHTML = `<p class="text-danger">No se pudieron cargar las iniciativas: ${resultado.mensaje}</p>`;
    return;
  }

  if (resultado.estado === "vacio") {
    contenedor.innerHTML = `<p class="text-muted">No hay iniciativas registradas todavía.</p>`;
    return;
  }

  todasLasIniciativas = resultado.datos;
  renderizarResultados(todasLasIniciativas);

  const formularioFiltros = document.querySelector("aside form");
  formularioFiltros.addEventListener("submit", (evento) => {
    evento.preventDefault();
    aplicarFiltros();
  });

  formularioFiltros.addEventListener("input", aplicarFiltros);
}

document.addEventListener("DOMContentLoaded", iniciar);