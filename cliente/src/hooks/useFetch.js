import { useCallback, useEffect, useState } from "react";

/**
 * Consulta la API y expone { data, loading, error, reload }.
 *  - `fetcher(signal)` debe devolver una promesa; se llama de nuevo cuando cambian `deps`.
 *  - El efecto cancela la petición anterior (AbortController) al cambiar las dependencias
 *    o al desmontar, para no actualizar estado de un componente que ya no existe
 *    ni mostrar una respuesta vieja sobre una nueva.
 */
export function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetcher(controller.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ data: null, loading: false, error });
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { ...state, reload };
}
