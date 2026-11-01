import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../../components/auth/AuthShell.jsx";
import { CampoTexto } from "../../components/common/Campos.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useForm } from "../../hooks/useForm.js";
import { fieldErrors } from "../../api/http.js";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validar(v) {
  const e = {};
  if (v.name.trim().length < 2) e.name = "El nombre debe tener al menos 2 caracteres.";
  if (!v.email.trim()) e.email = "Escribe tu correo.";
  else if (!EMAIL.test(v.email.trim())) e.email = "El correo no tiene un formato válido.";
  if (v.password.length < 8) e.password = "La contraseña debe tener al menos 8 caracteres.";
  else if (!/[A-Za-z]/.test(v.password) || !/\d/.test(v.password)) e.password = "Debe incluir letras y números.";
  if (v.confirmacion !== v.password) e.confirmacion = "Las contraseñas no coinciden.";
  return e;
}

export default function RegisterPage() {
  const { registrar } = useAuth();
  const toast = useToast();
  const navegar = useNavigate();
  const [errorGeneral, setErrorGeneral] = useState("");
  const form = useForm({ initialValues: { name: "", email: "", career: "", password: "", confirmacion: "" }, validate: validar });

  const enviar = form.handleSubmit(async (v) => {
    setErrorGeneral("");
    try {
      await registrar({ name: v.name.trim(), email: v.email.trim(), password: v.password, career: v.career.trim() });
      toast.exito("Cuenta creada. ¡Bienvenida a Innovation Hub!");
      navegar("/perfil", { replace: true });
    } catch (e) {
      const campos = fieldErrors(e);
      form.setServerErrors(e.code === "EMAIL_TAKEN" ? { email: e.message } : campos);
      if (Object.keys(campos).length === 0 && e.code !== "EMAIL_TAKEN") setErrorGeneral(e.message);
    }
  });

  const c = (name) => ({ name, value: form.values[name], onChange: form.handleChange, onBlur: form.handleBlur, error: form.errors[name] });

  return (
    <AuthShell titulo="Crear cuenta" descripcion="Únete a la comunidad para compartir y sumarte a iniciativas."
      pie={<>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></>}>
      <form onSubmit={enviar} noValidate>
        {errorGeneral && <div className="alert alert-danger" role="alert">{errorGeneral}</div>}
        <CampoTexto {...c("name")} etiqueta="Nombre completo" maxLength={80} autoComplete="name" />
        <CampoTexto {...c("email")} type="email" etiqueta="Correo" maxLength={120} autoComplete="email" ayuda="Será tu identificador y no se podrá cambiar después." />
        <CampoTexto {...c("career")} etiqueta="Carrera (opcional)" maxLength={80} />
        <CampoTexto {...c("password")} type="password" etiqueta="Contraseña" autoComplete="new-password" maxLength={72} ayuda="Mínimo 8 caracteres, con letras y números." />
        <CampoTexto {...c("confirmacion")} type="password" etiqueta="Confirmar contraseña" autoComplete="new-password" maxLength={72} />
        <button type="submit" className="btn btn-primary w-100" disabled={form.submitting}>{form.submitting ? "Creando…" : "Crear cuenta"}</button>
      </form>
    </AuthShell>
  );
}
