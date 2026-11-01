import { useEffect } from "react";

/** Diálogo de confirmación con marcado de Bootstrap (sin depender del JS de Bootstrap). */
export default function ConfirmModal({ abierto, titulo, children, textoConfirmar = "Confirmar", variante = "danger", ocupado = false, onConfirmar, onCancelar }) {
  useEffect(() => {
    if (!abierto) return undefined;
    const alPulsar = (e) => { if (e.key === "Escape" && !ocupado) onCancelar(); };
    document.addEventListener("keydown", alPulsar);
    return () => document.removeEventListener("keydown", alPulsar);
  }, [abierto, ocupado, onCancelar]);

  if (!abierto) return null;
  return (
    <>
      <div className="fondo-modal" onClick={ocupado ? undefined : onCancelar} />
      <div className="modal mostrar" role="dialog" aria-modal="true" aria-labelledby="titulo-confirmacion" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title h5" id="titulo-confirmacion">{titulo}</h2>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={onCancelar} disabled={ocupado} />
            </div>
            <div className="modal-body">{children}</div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onCancelar} disabled={ocupado}>Cancelar</button>
              <button type="button" className={`btn btn-${variante}`} onClick={onConfirmar} disabled={ocupado}>
                {ocupado ? "Procesando…" : textoConfirmar}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
