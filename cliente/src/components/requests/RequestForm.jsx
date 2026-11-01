import { useState } from "react";
import { CampoAreaTexto, CampoOpciones, CampoTexto } from "../common/Campos.jsx";
import { useForm } from "../../hooks/useForm.js";
import { fieldErrors } from "../../api/http.js";
import { DISPONIBILIDAD } from "../../utils/labels.js";

const VACIO = { message: "", mainSkill: "", desiredRole: "", availability: "" };

function validar(v) {
  const e = {};
  if (v.message.trim().length < 20) e.message = "El mensaje debe tener al menos 20 caracteres.";
  if (!v.mainSkill.trim()) e.mainSkill = "Indica la competencia principal que aportas.";
  if (!v.desiredRole.trim()) e.desiredRole = "Indica el rol que te gustaría cumplir.";
  if (!v.availability) e.availability = "Selecciona tu disponibilidad.";
  return e;
}

/** Formulario de solicitud: sirve para crear y para modificar una solicitud pendiente. */
export default function RequestForm({ valoresIniciales = VACIO, textoEnviar = "Enviar solicitud", onGuardar, onCancelar, ayudaMensaje }) {
  const [errorGeneral, setErrorGeneral] = useState("");
  const form = useForm({ initialValues: valoresIniciales, validate: validar });
  const c = (name) => ({ name, value: form.values[name], onChange: form.handleChange, onBlur: form.handleBlur, error: form.errors[name] });

  const enviar = form.handleSubmit(async (v) => {
    setErrorGeneral("");
    try {
      await onGuardar({ message: v.message.trim(), mainSkill: v.mainSkill.trim(), desiredRole: v.desiredRole.trim(), availability: v.availability });
    } catch (e) {
      const campos = fieldErrors(e);
      form.setServerErrors(campos);
      if (Object.keys(campos).length === 0) setErrorGeneral(e.message);
    }
  });

  return (
    <form onSubmit={enviar} noValidate>
      {errorGeneral && <div className="alert alert-danger" role="alert">{errorGeneral}</div>}
      <CampoAreaTexto {...c("message")} etiqueta="Mensaje de presentación" filas={4} maxLength={600} ayuda={ayudaMensaje} />
      <CampoTexto {...c("mainSkill")} etiqueta="Competencia principal que aportas" maxLength={60} ayuda="Ej: Bases de datos, SQL, Programación orientada a objetos." />
      <CampoTexto {...c("desiredRole")} etiqueta="Rol deseado en el equipo" maxLength={80} ayuda="Ej: Diseñadora UX, desarrollador backend, analista." />
      <CampoOpciones name="availability" leyenda="Disponibilidad" value={form.values.availability} error={form.errors.availability}
        onChange={(e) => { form.handleChange(e); form.touch("availability"); }}
        opciones={Object.entries(DISPONIBILIDAD).map(([valor, texto]) => ({ valor, texto }))} />
      <div className="d-flex gap-3">
        <button type="submit" className="btn btn-primary" disabled={form.submitting}>{form.submitting ? "Enviando…" : textoEnviar}</button>
        <button type="button" className="btn btn-link text-muted" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  );
}
