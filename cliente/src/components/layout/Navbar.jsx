import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

const enlaces = [
  { a: "/", texto: "Inicio", fin: true },
  { a: "/iniciativas", texto: "Catálogo", fin: true },
  { a: "/iniciativas/nueva", texto: "Publicar iniciativa", privado: true },
  { a: "/proyectos", texto: "Proyectos", privado: true },
  { a: "/mis-solicitudes", texto: "Mis solicitudes", privado: true },
  { a: "/solicitudes-recibidas", texto: "Recibidas", privado: true },
  { a: "/personas", texto: "Personas", privado: true },
  { a: "/perfil", texto: "Mi perfil", privado: true },
];

export default function Navbar() {
  const [abierto, setAbierto] = useState(false);
  const { user, logout } = useAuth();
  const toast = useToast();
  const navegar = useNavigate();
  const cerrarMenu = () => setAbierto(false);

  const salir = async () => {
    cerrarMenu();
    await logout();
    toast.exito("Cerraste sesión.");
    navegar("/");
  };

  return (
    <header className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 fw-bold" aria-label="Innovation Hub, inicio" onClick={cerrarMenu}>
          <span className="marca-simbolo" aria-hidden="true"><span></span><span></span><span></span><span></span></span>
          <span>Innovation Hub<small className="marca-subtitulo d-block">Universidad CENFOTEC</small></span>
        </Link>
        <button className="navbar-toggler" type="button" aria-controls="navPrincipal" aria-expanded={abierto} aria-label="Abrir navegación" onClick={() => setAbierto((v) => !v)}>
          <span className="navbar-toggler-icon"></span>
        </button>
        <nav className={`navbar-collapse collapse ${abierto ? "show" : ""}`} id="navPrincipal" aria-label="Navegación principal">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            {enlaces.filter((e) => !e.privado || user).map((e) => (
              <li className="nav-item" key={e.a}>
                <NavLink to={e.a} end={e.fin ?? false} className="nav-link" onClick={cerrarMenu}>{e.texto}</NavLink>
              </li>
            ))}
            {user ? (
              <li className="nav-item ms-lg-2">
                <button type="button" className="btn btn-outline-primary btn-sm" onClick={salir}>Cerrar sesión</button>
              </li>
            ) : (
              <>
                <li className="nav-item"><NavLink to="/login" className="nav-link" onClick={cerrarMenu}>Iniciar sesión</NavLink></li>
                <li className="nav-item ms-lg-2"><Link to="/registro" className="btn btn-primary btn-sm" onClick={cerrarMenu}>Crear cuenta</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
