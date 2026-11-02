import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { initiativesApi } from "../../api/index.js";
import AsyncContent from "../../components/common/AsyncContent.jsx";
import { EstadoIniciativa, EtiquetaTipo, EtiquetaVisibilidad } from "../../components/common/Badges.jsx";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";
import MemberList from "../../components/initiatives/MemberList.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useFetch } from "../../hooks/useFetch.js";
import { CATEGORIAS, formatearFecha } from "../../utils/labels.js";

export default function InitiativeDetailPage() {
  const { id } = useParams(); // el detalle se genera a partir del parámetro de la ruta
  const { user } = useAuth();
  const toast = useToast();
  const navegar = useNavigate();
  const { data: ini, loading, error, reload } = useFetch((signal) => initiativesApi.get(id, signal), [id, user?.id]);

  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [miembroARetirar, setMiembroARetirar] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  const eliminar = async () => {
    setOcupado(true);
    try {
      await initiativesApi.remove(id);
      toast.exito("La iniciativa se archivó o eliminó correctamente.");
      navegar("/iniciativas");
    } catch (e) {
      toast.error(e.message);
      setConfirmarEliminar(false);
    } finally { setOcupado(false); }
  };

  const retirar = async () => {
    setOcupado(true);
    try {
      await initiativesApi.removeMember(id, miembroARetirar.userId);
      toast.exito(`${miembroARetirar.name} fue retirado del equipo.`);
      setMiembroARetirar(null);
      reload();
    } catch (e) {
      toast.error(e.message);
      setMiembroARetirar(null);
    } finally { setOcupado(false); }
  };

  // Mensajes específicos según el código que devuelve el servidor.
  const errorDetalle = error && (error.status === 401
    ? { ...error, message: "Esta iniciativa solo la ven personas con sesión iniciada." }
    : error.status === 404 ? { ...error, message: "Esa iniciativa no existe, fue archivada o no tienes acceso a ella." } : error);

  return (
    <div className="container py-4">
      <nav aria-label="Ruta de navegación">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/iniciativas">Iniciativas</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{ini?.title ?? "Detalle"}</li>
        </ol>
      </nav>

      <AsyncContent loading={loading} error={errorDetalle} onRetry={reload} loadingLabel="Cargando iniciativa…">
        {ini && (
          <div className="row g-4">
            <article className="col-lg-8">
              <div className="mb-2 d-flex flex-wrap gap-2">
                <EtiquetaTipo tipo={ini.type} />
                <EtiquetaVisibilidad visibilidad={ini.visibility} />
                {ini.archived && <span className="badge text-bg-dark">Archivada</span>}
              </div>
              <h1 className="h2">{ini.title}</h1>
              <p className="text-muted">
                Publicado por {ini.owner.name} el {formatearFecha(ini.createdAt)} · {CATEGORIAS[ini.category] ?? ini.category}
              </p>

              {ini.restricted ? (
                <div className="alert alert-secondary mt-4">
                  <p className="mb-1"><strong>Resumen:</strong> {ini.summary}</p>
                  <p className="mb-0">El contenido completo no está disponible porque esta iniciativa es de visibilidad restringida. Solo su equipo puede verlo.</p>
                </div>
              ) : (
                <>
                  <p className="lead mt-4 mb-0">{ini.summary}</p>
                  <section aria-labelledby="descripcion-titulo" className="mt-4 pt-3 border-top">
                    <h2 id="descripcion-titulo" className="h5">Descripción</h2>
                    <p style={{ whiteSpace: "pre-line" }}>{ini.description}</p>
                  </section>
                  {ini.problem && (
                    <section className="mt-4 pt-3 border-top" aria-labelledby="problema-titulo">
                      <h2 id="problema-titulo" className="h5">Problema identificado</h2>
                      <p style={{ whiteSpace: "pre-line" }}>{ini.problem}</p>
                    </section>
                  )}
                  {ini.beneficiaries && (
                    <section className="mt-4 pt-3 border-top" aria-labelledby="benef-titulo">
                      <h2 id="benef-titulo" className="h5">Beneficiarios</h2>
                      <p>{ini.beneficiaries}</p>
                    </section>
                  )}
                  <section aria-labelledby="competencias-titulo" className="mt-4 pt-3 border-top">
                    <h2 id="competencias-titulo" className="h5">Competencias requeridas</h2>
                    <ul className="list-group list-group-flush">{ini.skills.map((s) => <li key={s} className="list-group-item">{s}</li>)}</ul>
                  </section>
                  {ini.tags.length > 0 && (
                    <p className="mt-4 d-flex flex-wrap gap-2">{ini.tags.map((t) => <span key={t} className="badge text-bg-light border">#{t}</span>)}</p>
                  )}
                  <section aria-labelledby="equipo-titulo" className="mt-4 pt-3 border-top">
                    <h2 id="equipo-titulo" className="h5">Equipo ({ini.members.length} de {ini.targetMembers})</h2>
                    <MemberList miembros={ini.members} onRetirar={ini.isOwner && !ini.archived ? setMiembroARetirar : undefined} />
                  </section>
                </>
              )}
            </article>

            <aside className="col-lg-4" aria-label="Acciones sobre la iniciativa">
              <div className="card">
                <div className="card-body">
                  <dl className="row mb-3">
                    <dt className="col-6 text-muted fw-normal">Estado</dt>
                    <dd className="col-6 text-end"><EstadoIniciativa estado={ini.status} /></dd>
                    <dt className="col-6 text-muted fw-normal">Miembros</dt>
                    <dd className="col-6 text-end fw-semibold">{ini.memberCount} de {ini.targetMembers}</dd>
                  </dl>

                  {!user && <Link to="/login" state={{ desde: `/iniciativas/${id}` }} className="btn btn-primary w-100">Inicia sesión para participar</Link>}
                  {user && !ini.isOwner && !ini.isMember && !ini.archived && (
                    <>
                      <Link to={`/iniciativas/${id}/solicitar`} className="btn btn-primary w-100">Solicitar participación</Link>
                      <p className="form-text mt-2">El propietario revisará tu solicitud antes de aceptarte en el equipo.</p>
                    </>
                  )}
                  {user && ini.isMember && !ini.isOwner && <p className="alert alert-success mb-0">Formas parte de este equipo.</p>}

                  {ini.isOwner && (
                    <div className="mt-3 pt-3 border-top d-grid gap-2">
                      <p className="text-muted small mb-1">Acciones del propietario</p>
                      {!ini.archived && <Link to={`/iniciativas/${id}/editar`} className="btn btn-outline-secondary">Editar iniciativa</Link>}
                      <Link to={`/solicitudes-recibidas?iniciativa=${id}`} className="btn btn-outline-secondary">Ver solicitudes recibidas</Link>
                      {!ini.archived && <Link to={`/iniciativas/${id}/convertir`} className="btn btn-outline-primary">Convertir en proyecto</Link>}
                      {!ini.archived && <button type="button" className="btn btn-outline-danger" onClick={() => setConfirmarEliminar(true)}>Archivar / eliminar</button>}
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}
      </AsyncContent>

      <ConfirmModal abierto={confirmarEliminar} titulo="¿Archivar o eliminar la iniciativa?" textoConfirmar="Sí, continuar" ocupado={ocupado}
        onConfirmar={eliminar} onCancelar={() => setConfirmarEliminar(false)}>
        <p className="mb-0">Si la iniciativa tiene equipo, solicitudes o un proyecto, se <strong>archivará</strong> y dejará de aparecer en el catálogo. Si no tiene información relacionada, se <strong>eliminará</strong> definitivamente.</p>
      </ConfirmModal>
      <ConfirmModal abierto={Boolean(miembroARetirar)} titulo="¿Retirar del equipo?" textoConfirmar="Retirar" ocupado={ocupado}
        onConfirmar={retirar} onCancelar={() => setMiembroARetirar(null)}>
        <p className="mb-0">{miembroARetirar?.name} dejará de formar parte del equipo.</p>
      </ConfirmModal>
    </div>
  );
}
