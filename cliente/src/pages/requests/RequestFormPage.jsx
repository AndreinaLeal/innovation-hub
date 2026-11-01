import { Link, useNavigate, useParams } from "react-router-dom";
import { initiativesApi, requestsApi } from "../../api/index.js";
import AsyncContent from "../../components/common/AsyncContent.jsx";
import RequestForm from "../../components/requests/RequestForm.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useFetch } from "../../hooks/useFetch.js";

/** Crear solicitud (/iniciativas/:id/solicitar) o modificar una pendiente (/mis-solicitudes/:solicitudId/editar). */
export default function RequestFormPage({ edicion = false }) {
  const { id, solicitudId } = useParams();
  const toast = useToast();
  const navegar = useNavigate();

  const { data, loading, error, reload } = useFetch(
    (signal) => (edicion ? requestsApi.get(solicitudId, signal) : initiativesApi.get(id, signal)),
    [edicion, id, solicitudId]
  );
  const tituloIniciativa = edicion ? data?.initiative.title : data?.title;
  const propietario = !edicion ? data?.owner.name : null;

  const guardar = async (cuerpo) => {
    if (edicion) {
      await requestsApi.update(solicitudId, cuerpo);
      toast.exito("Solicitud actualizada.");
    } else {
      await requestsApi.create(id, cuerpo);
      toast.exito("Solicitud enviada. El propietario la revisará.");
    }
    navegar("/mis-solicitudes");
  };

  const sinEditar = edicion && data && data.status !== "pendiente";
  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <nav aria-label="Ruta de navegación">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/iniciativas">Iniciativas</Link></li>
              <li className="breadcrumb-item active" aria-current="page">{edicion ? "Modificar solicitud" : "Solicitar participación"}</li>
            </ol>
          </nav>
          <h1 className="h2">{edicion ? "Modificar solicitud" : "Solicitar participación"}</h1>
          <AsyncContent loading={loading} error={error} onRetry={reload}>
            {data && (
              <>
                <p className="text-muted mb-4">
                  {edicion ? "Tu solicitud para unirte al equipo de " : "Le estás pidiendo a "}
                  {propietario && <><strong>{propietario}</strong> unirte al equipo de </>}
                  <strong>“{tituloIniciativa}”</strong>.
                </p>
                {sinEditar ? (
                  <div className="alert alert-warning">Esta solicitud ya está {data.status} y no se puede modificar. <Link to="/mis-solicitudes">Volver</Link></div>
                ) : (
                  <RequestForm
                    key={solicitudId ?? id}
                    valoresIniciales={edicion ? { message: data.message, mainSkill: data.mainSkill, desiredRole: data.desiredRole, availability: data.availability } : undefined}
                    textoEnviar={edicion ? "Guardar cambios" : "Enviar solicitud"}
                    ayudaMensaje="Cuéntale al propietario por qué te interesa esta iniciativa."
                    onGuardar={guardar}
                    onCancelar={() => navegar(edicion ? "/mis-solicitudes" : `/iniciativas/${id}`)} />
                )}
              </>
            )}
          </AsyncContent>
        </div>
      </div>
    </div>
  );
}
