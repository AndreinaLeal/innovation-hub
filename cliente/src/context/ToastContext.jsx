import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ToastContext = createContext(null);
let siguienteId = 1;

function Aviso({ aviso, onCerrar }) {
  // El aviso se cierra solo; el efecto limpia su temporizador al desmontarse.
  useEffect(() => {
    const id = setTimeout(() => onCerrar(aviso.id), 5000);
    return () => clearTimeout(id);
  }, [aviso.id, onCerrar]);

  return (
    <div className={`toast show align-items-center text-bg-${aviso.variante} border-0`} role="status" aria-live="polite">
      <div className="d-flex">
        <div className="toast-body">{aviso.mensaje}</div>
        <button type="button" className="btn-close btn-close-white me-2 m-auto" aria-label="Cerrar aviso" onClick={() => onCerrar(aviso.id)} />
      </div>
    </div>
  );
}

/** Avisos en pantalla. Sustituyen a window.alert(), que bloquea la página y no se puede estilizar. */
export function ToastProvider({ children }) {
  const [avisos, setAvisos] = useState([]);

  const cerrar = useCallback((id) => setAvisos((prev) => prev.filter((a) => a.id !== id)), []);
  const avisar = useCallback((mensaje, variante = "success") => {
    setAvisos((prev) => [...prev, { id: siguienteId++, mensaje, variante }]);
  }, []);

  const value = useMemo(() => ({
    exito: (m) => avisar(m, "success"),
    error: (m) => avisar(m, "danger"),
  }), [avisar]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="contenedor-avisos">
        {avisos.map((a) => <Aviso key={a.id} aviso={a} onCerrar={cerrar} />)}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
};
