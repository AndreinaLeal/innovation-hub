import { useState } from "react";
import { skillsApi } from "../../api/index.js";
import { useFetch } from "../../hooks/useFetch.js";

/**
 * Lista de competencias (chips). El estado vive en el formulario padre (`value`/`onChange`);
 * aquí solo se escribe el texto pendiente. Las sugerencias vienen de GET /api/skills.
 * Cada chip usa su propio nombre como key (único en la lista), nunca el índice.
 */
export default function SkillsInput({ value, onChange, error, etiqueta = "Competencias", ayuda, max = 15 }) {
  const [texto, setTexto] = useState("");
  const { data } = useFetch((signal) => skillsApi.list("", signal), []);
  const sugerencias = (data?.data ?? []).filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()));

  const agregar = () => {
    const limpio = texto.trim();
    if (!limpio || value.length >= max) return;
    if (!value.some((v) => v.toLowerCase() === limpio.toLowerCase())) onChange([...value, limpio]);
    setTexto("");
  };
  const quitar = (nombre) => onChange(value.filter((v) => v !== nombre));

  const alPulsar = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); agregar(); }
  };

  return (
    <div className="mb-3">
      <label htmlFor="entrada-competencia" className="form-label">{etiqueta}</label>
      <div className="input-group">
        <input id="entrada-competencia" name="skills" type="text" className={`form-control ${error ? "is-invalid" : ""}`}
          list="lista-sugerencias" value={texto} maxLength={60} placeholder="Ej: SQL, Bases de datos, Programación orientada a objetos"
          onChange={(e) => setTexto(e.target.value)} onKeyDown={alPulsar} aria-describedby="competencias-ayuda" />
        <button type="button" className="btn btn-outline-primary" onClick={agregar} disabled={!texto.trim() || value.length >= max}>Agregar</button>
      </div>
      <datalist id="lista-sugerencias">
        {sugerencias.map((s) => <option key={s} value={s} />)}
      </datalist>
      {error && <div className="campo-error" role="alert">{error}</div>}
      <div id="competencias-ayuda" className="form-text">{ayuda ?? `Pulsa Enter o "Agregar" para añadir cada una. Máximo ${max}.`}</div>
      {value.length > 0 && (
        <ul className="list-unstyled d-flex flex-wrap gap-2 mt-2 mb-0">
          {value.map((nombre) => (
            <li key={nombre} className="badge text-bg-primary d-flex align-items-center gap-2 fs-6 fw-normal">
              {nombre}
              <button type="button" className="btn-close btn-close-white" style={{ fontSize: "0.6rem" }} aria-label={`Quitar ${nombre}`} onClick={() => quitar(nombre)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
