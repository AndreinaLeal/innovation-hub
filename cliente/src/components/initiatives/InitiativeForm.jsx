import { useState } from "react";
import { CampoAreaTexto, CampoOpciones, CampoSelect, CampoTexto } from "../common/Campos.jsx";
import SkillsInput from "../common/SkillsInput.jsx";
import { useForm } from "../../hooks/useForm.js";
import { fieldErrors } from "../../api/http.js";
import { CATEGORIAS, ESTADOS, TIPOS, VISIBILIDADES } from "../../utils/labels.js";

// Mismos nombres de campo que el contrato de la API, para mapear errores del servidor 1 a 1.
const VACIO = {
  title: "", type: "", category: "", summary: "", description: "", problem: "", beneficiaries: "",
  targetMembers: "", skills: [], visibility: "", tags: "", status: "buscando-equipo",
};

function validar(v) {
  const e = {};
  if (v.title.trim().length < 5) e.title = "El título debe tener al menos 5 caracteres.";
  if (!v.type) e.type = "Selecciona el tipo.";
  if (!v.category) e.category = "Selecciona la categoría.";
  if (v.summary.trim().length < 10) e.summary = "El resumen debe tener al menos 10 caracteres.";
  if (v.description.trim().length < 20) e.description = "La descripción debe tener al menos 20 caracteres.";
  const n = Number(v.targetMembers);
  if (v.targetMembers === "") e.targetMembers = "Indica la cantidad de participantes.";
  else if (!Number.isInteger(n) || n < 1 || n > 20) e.targetMembers = "Debe ser un número entero entre 1 y 20.";
  if (v.skills.length === 0) e.skills = "Agrega al menos una competencia necesaria.";
  if (!v.visibility) e.visibility = "Selecciona un nivel de visibilidad.";
  return e;
}

export const aValoresFormulario = (ini) => ({
  ...VACIO,
  title: ini.title, type: ini.type, category: ini.category, summary: ini.summary,
  description: ini.description ?? "", problem: ini.problem ?? "", beneficiaries: ini.beneficiaries ?? "",
  targetMembers: String(ini.targetMembers), skills: ini.skills, visibility: ini.visibility,
  tags: (ini.tags ?? []).join(", "), status: ini.status,
});

export default function InitiativeForm({ valoresIniciales = VACIO, modoEdicion = false, onGuardar, onCancelar }) {
  const [errorGeneral, setErrorGeneral] = useState("");
  const form = useForm({ initialValues: valoresIniciales, validate: validar });
  const c = (name) => ({ name, value: form.values[name], onChange: form.handleChange, onBlur: form.handleBlur, error: form.errors[name] });

  const enviar = form.handleSubmit(async (v) => {
    setErrorGeneral("");
    const cuerpo = {
      title: v.title.trim(), type: v.type, category: v.category, summary: v.summary.trim(),
      description: v.description.trim(), problem: v.problem.trim(), beneficiaries: v.beneficiaries.trim(),
      targetMembers: Number(v.targetMembers), skills: v.skills, visibility: v.visibility,
      tags: v.tags.split(",").map((t) => t.trim()).filter(Boolean),
      ...(modoEdicion ? { status: v.status } : {}),
    };
    try {
      await onGuardar(cuerpo);
    } catch (e) {
      const campos = fieldErrors(e);
      form.setServerErrors(campos);
      if (Object.keys(campos).length === 0) setErrorGeneral(e.message);
    }
  });

  return (
    <form onSubmit={enviar} noValidate>
      {errorGeneral && <div className="alert alert-danger" role="alert">{errorGeneral}</div>}

      <fieldset className="mb-4 pb-3 border-bottom">
        <legend className="h5">Información general</legend>
        <CampoTexto {...c("title")} etiqueta="Título" maxLength={120} ayuda="Un nombre breve y claro para tu iniciativa." />
        <div className="row">
          <div className="col-md-6"><CampoSelect {...c("type")} etiqueta="Tipo" opciones={Object.entries(TIPOS).map(([valor, texto]) => ({ valor, texto }))} /></div>
          <div className="col-md-6"><CampoSelect {...c("category")} etiqueta="Categoría" opciones={Object.entries(CATEGORIAS).map(([valor, texto]) => ({ valor, texto }))} /></div>
        </div>
        <CampoAreaTexto {...c("summary")} etiqueta="Resumen" filas={2} maxLength={160} ayuda="Es lo que se muestra en el catálogo." />
      </fieldset>

      <fieldset className="mb-4 pb-3 border-bottom">
        <legend className="h5">Detalle</legend>
        <CampoAreaTexto {...c("description")} etiqueta="Descripción completa" filas={5} maxLength={4000} />
        <CampoAreaTexto {...c("problem")} etiqueta="Problema identificado (opcional)" filas={3} maxLength={1500} />
        <CampoTexto {...c("beneficiaries")} etiqueta="Beneficiarios (opcional)" maxLength={300} ayuda="¿Quién se beneficia si esta iniciativa se desarrolla?" />
      </fieldset>

      <fieldset className="mb-4 pb-3 border-bottom">
        <legend className="h5">Equipo y competencias</legend>
        <div className="col-md-6">
          <CampoTexto {...c("targetMembers")} type="number" min="1" max="20" etiqueta="Cantidad estimada de participantes" />
        </div>
        <SkillsInput etiqueta="Competencias necesarias" value={form.values.skills} error={form.errors.skills}
          onChange={(lista) => { form.setValue("skills", lista); form.touch("skills"); }} />
      </fieldset>

      <fieldset className="mb-4">
        <legend className="h5">Visibilidad y estado</legend>
        <CampoOpciones name="visibility" leyenda="¿Quién puede ver esta iniciativa?" value={form.values.visibility} onChange={(e) => { form.handleChange(e); form.touch("visibility"); }}
          error={form.errors.visibility}
          opciones={Object.entries(VISIBILIDADES).map(([valor, v]) => ({ valor, texto: `${v.texto} — ${v.ayuda}` }))} />
        <CampoTexto {...c("tags")} etiqueta="Etiquetas (opcional)" maxLength={200} ayuda="Sepáralas con comas, por ejemplo: educación, movilidad, voluntariado." />
        {modoEdicion && (
          <div className="col-md-6">
            <CampoSelect {...c("status")} etiqueta="Estado" opciones={Object.entries(ESTADOS).map(([valor, e]) => ({ valor, texto: e.texto }))} />
          </div>
        )}
      </fieldset>

      <div className="d-flex gap-3">
        <button type="submit" className="btn btn-primary" disabled={form.submitting}>
          {form.submitting ? "Guardando…" : modoEdicion ? "Guardar cambios" : "Publicar iniciativa"}
        </button>
        <button type="button" className="btn btn-link text-muted" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  );
}
