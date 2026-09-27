// avance1/js/publicar.js
import { cargarIniciativas, guardarNuevaIniciativa, guardarModificacion, obtenerSiguienteId } from "./datos.js";

let modoEdicion = false;
let idEnEdicion = null;
let datosActuales = [];

function crearFilaCompetencia(valor = "") {
  const fila = document.createElement("div");
  fila.className = "input-group mb-2";
  fila.innerHTML = `
    <input type="text" name="competencia[]" class="form-control" placeholder="Ej: Diseño UX" aria-label="Competencia" value="${valor}">
    <button type="button" class="btn btn-outline-danger boton-quitar" aria-label="Quitar esta competencia">×</button>
  `;
  return fila;
}

function inicializarCompetencias() {
  const lista = document.getElementById("lista-competencias");
  const botonAgregar = document.getElementById("agregar-competencia");

  botonAgregar.addEventListener("click", () => {
    lista.appendChild(crearFilaCompetencia());
  });

  // Delegación de eventos: un solo listener para todos los botones "×",
  // incluso los que se agregan o se vuelven a dibujar después.
  lista.addEventListener("click", (evento) => {
    if (!evento.target.classList.contains("boton-quitar")) return;

    const filas = lista.querySelectorAll(".input-group");
    if (filas.length <= 1) {
      evento.target.closest(".input-group").querySelector("input").value = "";
      return;
    }
    evento.target.closest(".input-group").remove();
  });
}

function mostrarError(campo, mensaje) {
  campo.classList.add("is-invalid");
  let ayuda = campo.parentElement.querySelector(".invalid-feedback");
  if (!ayuda) {
    ayuda = document.createElement("div");
    ayuda.className = "invalid-feedback";
    campo.parentElement.appendChild(ayuda);
  }
  ayuda.textContent = mensaje;
}

function limpiarError(campo) {
  campo.classList.remove("is-invalid");
}

function validarFormulario(formulario) {
  let esValido = true;

  const requeridos = formulario.querySelectorAll("[required]");
  requeridos.forEach((campo) => {
    limpiarError(campo);

    if (campo.type === "radio") {
      const grupo = formulario.querySelectorAll(`[name="${campo.name}"]`);
      const algunoMarcado = Array.from(grupo).some((r) => r.checked);
      if (!algunoMarcado) {
        mostrarError(grupo[grupo.length - 1], "Selecciona una opción de visibilidad.");
        esValido = false;
      }
      return;
    }

    if (!campo.value.trim()) {
      mostrarError(campo, "Este campo es obligatorio.");
      esValido = false;
    }
  });

  const resumen = document.getElementById("resumen");
  if (resumen.value.trim().length > 160) {
    mostrarError(resumen, "El resumen no puede superar los 160 caracteres.");
    esValido = false;
  }

  const participantes = document.getElementById("participantes");
  const cantidad = Number(participantes.value);
  if (participantes.value && (cantidad < 1 || cantidad > 20)) {
    mostrarError(participantes, "La cantidad de participantes debe estar entre 1 y 20.");
    esValido = false;
  }

  const competencias = formulario.querySelectorAll('input[name="competencia[]"]');
  const algunaCompetenciaLlena = Array.from(competencias).some((c) => c.value.trim());
  if (!algunaCompetenciaLlena) {
    mostrarError(competencias[0], "Agrega al menos una competencia necesaria.");
    esValido = false;
  }

  return esValido;
}

function leerFormulario(formulario) {
  const competencias = Array.from(formulario.querySelectorAll('input[name="competencia[]"]'))
    .map((c) => c.value.trim())
    .filter((valor) => valor);

  const etiquetas = document.getElementById("etiquetas").value
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e);

  const visibilidad = formulario.querySelector('input[name="visibilidad"]:checked')?.value;

  return {
    titulo: document.getElementById("titulo").value.trim(),
    tipo: document.getElementById("tipo").value,
    categoria: document.getElementById("categoria").value,
    resumen: document.getElementById("resumen").value.trim(),
    descripcion: document.getElementById("descripcion").value.trim(),
    problema: document.getElementById("problema").value.trim(),
    beneficiarios: document.getElementById("beneficiarios").value.trim(),
    competencias,
    visibilidad,
    etiquetas,
    miembrosMeta: Number(document.getElementById("participantes").value),
  };
}

function precargarFormulario(iniciativa) {
  document.getElementById("titulo-formulario").textContent = "Editar iniciativa";
  document.getElementById("boton-enviar").textContent = "Guardar cambios";

  document.getElementById("titulo").value = iniciativa.titulo ?? "";
  document.getElementById("tipo").value = iniciativa.tipo ?? "";
  document.getElementById("categoria").value = iniciativa.categoria ?? "";
  document.getElementById("resumen").value = iniciativa.resumen ?? "";
  document.getElementById("descripcion").value = iniciativa.descripcion ?? "";
  document.getElementById("problema").value = iniciativa.problema ?? "";
  document.getElementById("beneficiarios").value = iniciativa.beneficiarios ?? "";
  document.getElementById("participantes").value = iniciativa.miembrosMeta ?? "";
  document.getElementById("etiquetas").value = (iniciativa.etiquetas ?? []).join(", ");

  if (iniciativa.visibilidad) {
    const radio = document.querySelector(`input[name="visibilidad"][value="${iniciativa.visibilidad}"]`);
    if (radio) radio.checked = true;
  }

  const lista = document.getElementById("lista-competencias");
  lista.innerHTML = "";
  const competencias = iniciativa.competencias?.length ? iniciativa.competencias : [""];
  competencias.forEach((competencia) => {
    lista.appendChild(crearFilaCompetencia(competencia));
  });
}

function inicializarValidacionYEnvio(formulario) {
  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    if (!validarFormulario(formulario)) {
      return;
    }

    const datosFormulario = leerFormulario(formulario);

    if (modoEdicion) {
      guardarModificacion(idEnEdicion, datosFormulario);
      alert("Cambios guardados.");
      window.location.href = `detalle.html?id=${idEnEdicion}`;
    } else {
      const nuevaIniciativa = {
        id: obtenerSiguienteId(datosActuales),
        autor: "Tú",
        fecha: new Date().toISOString().slice(0, 10),
        estado: "buscando-equipo",
        miembrosActuales: 1,
        miembros: ["Tú"],
        ...datosFormulario,
      };
      guardarNuevaIniciativa(nuevaIniciativa);
      alert("Iniciativa publicada.");
      window.location.href = "catalogo.html";
    }
  });

  formulario.addEventListener("input", (evento) => {
    if (evento.target.classList.contains("is-invalid")) {
      limpiarError(evento.target);
    }
  });
}

async function iniciar() {
  const parametros = new URLSearchParams(window.location.search);
  const idParametro = Number(parametros.get("id"));
  modoEdicion = parametros.get("editar") === "1" && Boolean(idParametro);

  const resultado = await cargarIniciativas();
  datosActuales = resultado.estado === "listo" ? resultado.datos : [];

  const formulario = document.querySelector("form");

  if (modoEdicion) {
    const iniciativa = datosActuales.find((i) => i.id === idParametro);
    if (iniciativa) {
      idEnEdicion = idParametro;
      precargarFormulario(iniciativa);
    } else {
      modoEdicion = false; // no existe: se trata como publicación nueva
    }
  }

  inicializarCompetencias();
  inicializarValidacionYEnvio(formulario);
}

document.addEventListener("DOMContentLoaded", iniciar);