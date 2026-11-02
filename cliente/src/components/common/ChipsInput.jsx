import { useId, useState } from "react";

/**
 * Lista de elementos individuales (chips) que se agregan y se quitan uno a uno.
 * El estado vive en el padre (`value` / `onChange`); aquí solo se escribe el texto pendiente.
 * Evita duplicados sin distinguir mayúsculas y usa el propio texto como key (nunca el índice).
 */
export default function ChipsInput({ name, etiqueta, value, onChange, error, ayuda, placeholder, max = 15, maxLength = 60, sugerencias = [] }) {
  const id = useId();
  const [texto, setTexto] = useState("");
  const [aviso, setAviso] = useState("");

  const disponibles = sugerencias.filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()));

  const agregar = () => {
    const limpio = texto.trim();
    if (!limpio) return;
    if (value.length >= max) { setAviso(`Máximo ${max} elementos.`); return; }
    if (value.some((v) => v.toLowerCase() === limpio.toLowerCase())) {
      setAviso(`“${limpio}” ya está en la lista.`);
      return;
    }
    setAviso("");
    onChange([...value, limpio]);
    setTexto("");
  };
  const quitar = (elemento) => onChange(value.filter((v) => v !== elemento));
  const alPulsar = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); agregar(); }
  };

  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">{etiqueta}</label>
      <div className="input-group">
        <input id={id} name={name} type="text" className={`form-control ${error ? "is-invalid" : ""}`}
          list={`${id}-sugerencias`} value={texto} maxLength={maxLength} placeholder={placeholder}
          onChange={(e) => { setTexto(e.target.value); setAviso(""); }} onKeyDown={alPulsar}
          aria-invalid={error ? "true" : undefined} aria-describedby={`${id}-ayuda`} />
        <button type="button" className="btn btn-outline-primary" onClick={agregar} disabled={!texto.trim()}>Agregar</button>
      </div>
      {disponibles.length > 0 && <datalist id={`${id}-sugerencias`}>{disponibles.map((s) => <option key={s} value={s} />)}</datalist>}
      <div className="d-flex justify-content-between gap-3">
        <div>
          {error && <div className="campo-error" role="alert">{error}</div>}
          {aviso && <div className="campo-error" role="status">{aviso}</div>}
          <div id={`${id}-ayuda`} className="form-text">{ayuda ?? `Pulsa Enter o “Agregar” para añadir cada uno. Máximo ${max}.`}</div>
        </div>
        <span className="contador-caracteres" aria-hidden="true">{value.length}/{max}</span>
      </div>
      {value.length > 0 && (
        <ul className="list-unstyled d-flex flex-wrap gap-2 mt-2 mb-0">
          {value.map((elemento) => (
            <li key={elemento} className="badge text-bg-primary d-flex align-items-center gap-2 fs-6 fw-normal">
              {elemento}
              <button type="button" className="btn-close btn-close-white" style={{ fontSize: "0.6rem" }} aria-label={`Quitar ${elemento}`} onClick={() => quitar(elemento)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
