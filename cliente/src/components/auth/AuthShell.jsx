/** Contenedor común de las pantallas de login y registro. */
export default function AuthShell({ titulo, descripcion, children, pie }) {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-5">
          <h1 className="h2">{titulo}</h1>
          <p className="text-muted mb-4">{descripcion}</p>
          <div className="card"><div className="card-body p-4">{children}</div></div>
          <p className="text-center mt-3 mb-0">{pie}</p>
        </div>
      </div>
    </div>
  );
}
