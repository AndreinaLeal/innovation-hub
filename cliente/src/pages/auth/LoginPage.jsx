import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../../components/auth/AuthShell.jsx";
import { CampoTexto } from "../../components/common/Campos.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useForm } from "../../hooks/useForm.js";
import { fieldErrors } from "../../api/http.js";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validar(v) {
  const e = {};
  if (!v.email.trim()) e.email = "Escribe tu correo.";
  else if (!EMAIL.test(v.email.trim())) e.email = "El correo no tiene un formato válido.";
  if (!v.password) e.password = "Escribe tu contraseña.";
  return e;
}

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const [errorGeneral, setErrorGeneral] = useState("");
  const form = useForm({ initialValues: { email: "", password: "" }, validate: validar });

  const enviar = form.handleSubmit(async (valores) => {
    setErrorGeneral("");
    try {
      const u = await login({ email: valores.email.trim(), password: valores.password });
      toast.exito(`Bienvenida, ${u.name}.`);
      navegar(ubicacion.state?.desde ?? "/iniciativas", { replace: true });
    } catch (e) {
      form.setServerErrors(fieldErrors(e));
      setErrorGeneral(e.status === 401 || e.status === 400 ? e.message : "No se pudo iniciar sesión: " + e.message);
    }
  });

  return (
    <AuthShell titulo="Iniciar sesión" descripcion="Accede para publicar iniciativas y solicitar participar."
      pie={<>¿No tienes cuenta? <Link to="/registro">Crea una</Link></>}>
      <form onSubmit={enviar} noValidate>
        {errorGeneral && <div className="alert alert-danger" role="alert">{errorGeneral}</div>}
        <CampoTexto name="email" type="email" etiqueta="Correo" value={form.values.email} onChange={form.handleChange} onBlur={form.handleBlur} error={form.errors.email} autoComplete="email" maxLength={120} />
        <CampoTexto name="password" type="password" etiqueta="Contraseña" value={form.values.password} onChange={form.handleChange} onBlur={form.handleBlur} error={form.errors.password} autoComplete="current-password" />
        <button type="submit" className="btn btn-primary w-100" disabled={form.submitting}>{form.submitting ? "Ingresando…" : "Ingresar"}</button>
      </form>
    </AuthShell>
  );
}
