import { useCallback, useMemo, useState } from "react";

/**
 * Formulario controlado con validación en el cliente (la del servidor sigue siendo la que manda).
 *
 * Criterio de visualización (pedido por el docente: no marcar todo en rojo):
 *  - Un campo solo muestra error si el usuario ya salió de él (blur) o intentó enviar.
 *  - Solo se marcan los campos que realmente tienen error; los válidos quedan neutros.
 *  - Mientras se escribe en un campo con error, el mensaje se actualiza o desaparece al corregirlo.
 *
 * `validate(values)` devuelve { campo: "mensaje" } solo con los campos inválidos.
 */
export function useForm({ initialValues, validate }) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const allErrors = useMemo(() => validate(values), [validate, values]);

  // Errores visibles: del cliente si el campo fue tocado, o del servidor si aún no se editó ese campo.
  const errors = useMemo(() => {
    const visible = {};
    Object.entries(allErrors).forEach(([name, msg]) => { if (touched[name]) visible[name] = msg; });
    Object.entries(serverErrors).forEach(([name, msg]) => { if (!visible[name]) visible[name] = msg; });
    return visible;
  }, [allErrors, touched, serverErrors]);

  const setValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setServerErrors((prev) => {
      if (!(name in prev)) return prev;
      const { [name]: _quitado, ...resto } = prev;
      return resto;
    });
  }, []);

  const handleChange = useCallback((e) => setValue(e.target.name, e.target.value), [setValue]);
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }));
  }, []);
  const touch = useCallback((name) => setTouched((prev) => ({ ...prev, [name]: true })), []);

  const handleSubmit = (onSubmit) => async (e) => {
    e.preventDefault();
    const names = Object.keys(allErrors);
    if (names.length > 0) {
      // Se marcan como tocados solo los campos con error y se enfoca el primero.
      setTouched((prev) => ({ ...prev, ...Object.fromEntries(names.map((n) => [n, true])) }));
      const first = document.querySelector(`[name="${names[0]}"]`);
      first?.focus?.();
      return;
    }
    setSubmitting(true);
    try { await onSubmit(values); } finally { setSubmitting(false); }
  };

  return {
    values, errors, submitting,
    setValue, handleChange, handleBlur, touch, handleSubmit,
    setServerErrors, reset: () => { setValues(initialValues); setTouched({}); setServerErrors({}); },
  };
}
