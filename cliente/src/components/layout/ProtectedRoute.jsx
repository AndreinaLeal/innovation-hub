import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Spinner from "../common/Spinner.jsx";

/**
 * Evita mostrar pantallas privadas a quien no inició sesión. Es solo comodidad de interfaz:
 * la protección real está en el servidor, que revalida cada petición.
 */
export default function ProtectedRoute() {
  const { user, cargando } = useAuth();
  const ubicacion = useLocation();
  if (cargando) return <div className="container py-5"><Spinner etiqueta="Verificando sesión…" /></div>;
  if (!user) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname + ubicacion.search }} />;
  return <Outlet />;
}
