import { Link, useLocation } from "react-router-dom";

export default function NotFoundPage() {
  const { pathname } = useLocation();
  return (
    <div className="container py-5 text-center">
      <p className="display-3 fw-bold text-primary mb-0">404</p>
      <h1 className="h3">Esta página no existe</h1>
      <p className="text-muted">No encontramos <code>{pathname}</code>. Puede que el enlace esté mal escrito o que la página se haya movido.</p>
      <div className="d-flex justify-content-center gap-2">
        <Link to="/" className="btn btn-primary">Ir al inicio</Link>
        <Link to="/iniciativas" className="btn btn-outline-primary">Ver el catálogo</Link>
      </div>
    </div>
  );
}
