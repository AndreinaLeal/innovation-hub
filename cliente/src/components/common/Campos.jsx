import { useId } from "react";

/** Contador "37/160": dice cuántos caracteres lleva y cuántos admite el campo. */
export function Contador({ actual, maximo }) {
  const cerca = actual >= maximo * 0.9;
  return (
    <span className={`contador-caracteres ${cerca ? "contador-caracteres--alerta" : ""}`} aria-hidden="true">
      {actual}/{maximo}
    </span>
  );
}

/** Estructura común: etiqueta, control, ayuda, error y contador. Solo el campo inválido se marca. */
function Envoltorio({ id, name, etiqueta, ayuda, error, contador, children }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">{etiqueta}</label>
      {children}
      <div className="d-flex justify-content-between gap-3">
        <div>
          {error && <div id={`${id}-error`} className="campo-error" role="alert">{error}</div>}
          {ayuda && <div id={`${id}-ayuda`} className="form-text mt-1">{ayuda}</div>}
        </div>
        {contador}
      </div>
    </div>
  );
}

const describedBy = (id, error, ayuda) => [error && `${id}-error`, ayuda && `${id}-ayuda`].filter(Boolean).join(" ") || undefined;

export function CampoTexto({ name, etiqueta, value, onChange, onBlur, error, ayuda, maxLength, type = "text", ...resto }) {
  const id = useId();
  return (
    <Envoltorio id={id} name={name} etiqueta={etiqueta} ayuda={ayuda} error={error}
      contador={maxLength ? <Contador actual={value.length} maximo={maxLength} /> : null}>
      <input id={id} name={name} type={type} value={value} onChange={onChange} onBlur={onBlur}
        maxLength={maxLength} className={`form-control ${error ? "is-invalid" : ""}`}
        aria-invalid={error ? "true" : undefined} aria-describedby={describedBy(id, error, ayuda)} {...resto} />
    </Envoltorio>
  );
}

export function CampoAreaTexto({ name, etiqueta, value, onChange, onBlur, error, ayuda, maxLength, filas = 4, ...resto }) {
  const id = useId();
  return (
    <Envoltorio id={id} name={name} etiqueta={etiqueta} ayuda={ayuda} error={error}
      contador={maxLength ? <Contador actual={value.length} maximo={maxLength} /> : null}>
      <textarea id={id} name={name} rows={filas} value={value} onChange={onChange} onBlur={onBlur}
        maxLength={maxLength} className={`form-control ${error ? "is-invalid" : ""}`}
        aria-invalid={error ? "true" : undefined} aria-describedby={describedBy(id, error, ayuda)} {...resto} />
    </Envoltorio>
  );
}

export function CampoSelect({ name, etiqueta, value, onChange, onBlur, error, ayuda, opciones, placeholder = "Selecciona una opción" }) {
  const id = useId();
  return (
    <Envoltorio id={id} name={name} etiqueta={etiqueta} ayuda={ayuda} error={error}>
      <select id={id} name={name} value={value} onChange={onChange} onBlur={onBlur}
        className={`form-select ${error ? "is-invalid" : ""}`}
        aria-invalid={error ? "true" : undefined} aria-describedby={describedBy(id, error, ayuda)}>
        <option value="">{placeholder}</option>
        {opciones.map((o) => <option key={o.valor} value={o.valor}>{o.texto}</option>)}
      </select>
    </Envoltorio>
  );
}

/** Grupo de opciones (radio). `opciones`: [{ valor, texto }]. */
export function CampoOpciones({ name, leyenda, value, onChange, error, opciones }) {
  const base = useId();
  return (
    <fieldset className="mb-3">
      <legend className="form-label fs-6">{leyenda}</legend>
      {opciones.map((o) => (
        <div className="form-check" key={o.valor}>
          <input className="form-check-input" type="radio" name={name} id={`${base}-${o.valor}`}
            value={o.valor} checked={value === o.valor} onChange={onChange} aria-invalid={error ? "true" : undefined} />
          <label className="form-check-label" htmlFor={`${base}-${o.valor}`}>{o.texto}</label>
        </div>
      ))}
      {error && <div className="campo-error" role="alert">{error}</div>}
    </fieldset>
  );
}
