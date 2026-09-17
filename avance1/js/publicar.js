// avance1/js/publicar.js

function crearFilaCompetencia() {
  const fila = document.createElement("div");
  fila.className = "input-group mb-2";
  fila.innerHTML = `
    <input type="text" name="competencia[]" class="form-control" placeholder="Ej: Diseño UX" aria-label="Competencia">
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
  // incluso los que se agregan después.
  lista.addEventListener("click", (evento) => {
    if (!evento.target.classList.contains("boton-quitar")) return;

    const filas = lista.querySelectorAll(".input-group");
    if (filas.length <= 1) {
      // Siempre debe quedar al menos una fila de competencia
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

function inicializarValidacion() {
  const formulario = document.querySelector("form");

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    if (!validarFormulario(formulario)) {
      return;
    }

    // Simulación de guardado: como no hay servidor en este avance,
    // solo confirmamos y regresamos al catálogo.
    alert("Iniciativa publicada (simulado). En el Avance 2 esto se guardará en el servidor.");
    window.location.href = "catalogo.html";
  });

  // Quita el mensaje de error apenas la persona corrige el campo
  formulario.addEventListener("input", (evento) => {
    if (evento.target.classList.contains("is-invalid")) {
      limpiarError(evento.target);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  inicializarCompetencias();
  inicializarValidacion();
});