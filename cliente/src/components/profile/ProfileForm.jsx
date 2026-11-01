import { useState } from "react";
import { CampoAreaTexto, CampoSelect, CampoTexto } from "../common/Campos.jsx";
import SkillsInput from "../common/SkillsInput.jsx";
import { useForm } from "../../hooks/useForm.js";
import { fieldErrors } from "../../api/http.js";

const DISPONIBILIDAD = [
  { valor: "alta", texto: "Alta — más de 6 horas semanales" },
  { valor: "media", texto: "Media — entre 3 y 6 horas semanales" },
  { valor: "baja", texto: "Baja — menos de 3 horas semanales" },
];

function validar(v) {
  const e = {};
  if (v.name.trim().length < 2) e.name = "El nombre debe tener al menos 2 caracteres.";
  if (!v.availability) e.availability = "Selecciona tu disponibilidad.";
  return e;
}

export default function ProfileForm({ usuario, onGuardar, onCancelar }) {
  const [errorGeneral, setErrorGeneral] = useState("");
  const form = useForm({
    initialValues: { name: usuario.name, career: usuario.career, bio: usuario.bio, availability: usuario.availability, skills: usuario.skills },
    validate: validar,
  });
  const c = (name) => ({ name, value: form.values[name], onChange: form.handleChange, onBlur: form.handleBlur, error: form.errors[name] });

  const enviar = form.handleSubmit(async (v) => {
    setErrorGeneral("");
    try {
      // El correo no se envía: es el identificador y no se modifica desde el perfil.
      await onGuardar({ name: v.name.trim(), career: v.career.trim(), bio: v.bio.trim(), availability: v.availability, skills: v.skills });
    } catch (e) {
      const campos = fieldErrors(e);
      form.setServerErrors(campos);
      if (Object.keys(campos).length === 0) setErrorGeneral(e.message);
    }
  });

  return (
    <form onSubmit={enviar} noValidate>
      {errorGeneral && <div className="alert alert-danger" role="alert">{errorGeneral}</div>}
      <div className="mb-3">
        <label htmlFor="perfil-correo" className="form-label">Correo</label>
        <input id="perfil-correo" className="form-control" value={usuario.email} readOnly disabled aria-describedby="perfil-correo-ayuda" />
        <div id="perfil-correo-ayuda" className="form-text">El correo es tu identificador y no se puede modificar.</div>
      </div>
      <CampoTexto {...c("name")} etiqueta="Nombre" maxLength={80} />
      <CampoTexto {...c("career")} etiqueta="Carrera" maxLength={80} />
      <CampoAreaTexto {...c("bio")} etiqueta="Presentación" filas={3} maxLength={400} />
      <CampoSelect {...c("availability")} etiqueta="Disponibilidad" opciones={DISPONIBILIDAD} />
      <SkillsInput etiqueta="Mis competencias" value={form.values.skills} onChange={(lista) => form.setValue("skills", lista)} error={form.errors.skills} max={20} />
      <div className="d-flex gap-3">
        <button type="submit" className="btn btn-primary" disabled={form.submitting}>{form.submitting ? "Guardando…" : "Guardar cambios"}</button>
        <button type="button" className="btn btn-link text-muted" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  );
}
