import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { initiativesApi, projectsApi } from "../../api/index.js";
import AsyncContent from "../../components/common/AsyncContent.jsx";
import { CampoAreaTexto, CampoSelect, CampoTexto } from "../../components/common/Campos.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useFetch } from "../../hooks/useFetch.js";
import { useForm } from "../../hooks/useForm.js";
import { fieldErrors } from "../../api/http.js";
import { ESTADOS_PROYECTO } from "../../utils/labels.js";

const REPO = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/;

function validar(v) {
  const e = {};
  if (v.name.trim().length < 3) e.name = "El nombre debe tener al menos 3 caracteres.";
  if (v.description.trim().length < 20) e.description = "La descripción debe tener al menos 20 caracteres.";
  if (v.objective.trim().length < 10) e.objective = "El objetivo debe tener al menos 10 caracteres.";
  if (!v.startDate) e.startDate = "Indica la fecha de inicio.";
  if (v.repositoryUrl.trim() && !REPO.test(v.repositoryUrl.trim())) e.repositoryUrl = "Usa el formato https://github.com/usuario/repositorio.";
  return e;
}

function ConversionForm({ iniciativa }) {
  const toast = useToast();
  const navegar = useNavigate();
  const [errorGeneral, setErrorGeneral] = useState("");
  const form = useForm({
    initialValues: { name: iniciativa.title, description: iniciativa.description, objective: "", startDate: new Date().toISOString().slice(0, 10), status: "planificacion", repositoryUrl: "" },
    validate: validar,
  });
  const c = (name) => ({ name, value: form.values[name], onChange: form.handleChange, onBlur: form.handleBlur, error: form.errors[name] });

  const enviar = form.handleSubmit(async (v) => {
    setErrorGeneral("");
    try {
      const proyecto = await projectsApi.create({
        initiativeId: iniciativa.id, name: v.name.trim(), description: v.description.trim(), objective: v.objective.trim(),
        startDate: v.startDate, status: v.status, repositoryUrl: v.repositoryUrl.trim(),
      });
      toast.exito("La iniciativa se convirtió en proyecto.");
      navegar(`/proyectos/${proyecto.id}`);
    } catch (e) {
      const campos = fieldErrors(e);
      form.setServerErrors(campos);
      // Un 409 (por ejemplo RN-09) se explica arriba, porque no pertenece a un campo concreto.
      if (Object.keys(campos).length === 0) setErrorGeneral(e.message);
    }
  });

  return (
    <form onSubmit={enviar} noValidate>
      {errorGeneral && <div className="alert alert-danger" role="alert">{errorGeneral}</div>}
      <CampoTexto {...c("name")} etiqueta="Nombre del proyecto" maxLength={120} />
      <CampoAreaTexto {...c("description")} etiqueta="Descripción" filas={4} maxLength={2000} />
      <CampoAreaTexto {...c("objective")} etiqueta="Objetivo" filas={2} maxLength={500} />
      <div className="row">
        <div className="col-md-6"><CampoTexto {...c("startDate")} type="date" etiqueta="Fecha de inicio" /></div>
        <div className="col-md-6"><CampoSelect {...c("status")} etiqueta="Estado" opciones={Object.entries(ESTADOS_PROYECTO).map(([valor, e]) => ({ valor, texto: e.texto }))} /></div>
      </div>
      <CampoTexto {...c("repositoryUrl")} etiqueta="Repositorio en GitHub (opcional)" maxLength={200} placeholder="https://github.com/usuario/repositorio" />
      <div className="d-flex gap-3">
        <button type="submit" className="btn btn-primary" disabled={form.submitting}>{form.submitting ? "Creando…" : "Crear proyecto"}</button>
        <button type="button" className="btn btn-link text-muted" onClick={() => navegar(`/iniciativas/${iniciativa.id}`)}>Cancelar</button>
      </div>
    </form>
  );
}

export default function ProjectFormPage() {
  const { id } = useParams();
  const { data, loading, error, reload } = useFetch((signal) => initiativesApi.get(id, signal), [id]);
  const soloDueno = data && !data.isOwner;
  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <h1 className="h2">Convertir en proyecto</h1>
          <p className="text-muted mb-4">La iniciativa necesita al menos un miembro además de ti. El servidor lo verifica al crear el proyecto.</p>
          <AsyncContent loading={loading} error={error} onRetry={reload} loadingLabel="Cargando iniciativa…">
            {soloDueno
              ? <div className="alert alert-warning">Solo el propietario puede convertir la iniciativa. <Link to={`/iniciativas/${id}`}>Volver</Link></div>
              : data && <ConversionForm key={data.id} iniciativa={data} />}
          </AsyncContent>
        </div>
      </div>
    </div>
  );
}
