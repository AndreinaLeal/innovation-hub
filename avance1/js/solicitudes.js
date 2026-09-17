// avance1/js/solicitudes.js

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

  const mensaje = document.getElementById("mensaje");
  limpiarError(mensaje);
  if (!mensaje.value.trim()) {
    mostrarError(mensaje, "Escribe un mensaje de presentación.");
    esValido = false;
  } else if (mensaje.value.trim().length < 20) {
    mostrarError(mensaje, "El mensaje debe tener al menos 20 caracteres.");
    esValido = false;
  }

  const competencia = document.getElementById("competencia-principal");
  limpiarError(competencia);
  if (!competencia.value) {
    mostrarError(competencia, "Selecciona una competencia principal.");
    esValido = false;
  }

  const rol = document.getElementById("rol");
  limpiarError(rol);
  if (!rol.value.trim()) {
    mostrarError(rol, "Indica el rol que te gustaría cumplir.");
    esValido = false;
  }

  const disponibilidad = formulario.querySelectorAll('input[name="disponibilidad"]');
  const algunaMarcada = Array.from(disponibilidad).some((r) => r.checked);
  const ultimaDisponibilidad = disponibilidad[disponibilidad.length - 1];
  limpiarError(ultimaDisponibilidad);
  if (!algunaMarcada) {
    mostrarError(ultimaDisponibilidad, "Selecciona tu disponibilidad.");
    esValido = false;
  }

  return esValido;
}

function inicializar() {
  const formulario = document.querySelector("form");

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    if (!validarFormulario(formulario)) {
      return;
    }

    alert("Solicitud enviada (simulado). En el Avance 2 esto se guardará en el servidor.");
    window.location.href = "detalle.html?id=1";
  });

  formulario.addEventListener("input", (evento) => {
    if (evento.target.classList.contains("is-invalid")) {
      limpiarError(evento.target);
    }
  });
}

document.addEventListener("DOMContentLoaded", inicializar);