import { Link, useNavigate, useParams } from "react-router-dom";
import { initiativesApi } from "../../api/index.js";
import AsyncContent from "../../components/common/AsyncContent.jsx";
import InitiativeForm, { aValoresFormulario } from "../../components/initiatives/InitiativeForm.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useFetch } from "../../hooks/useFetch.js";

/** Una sola pantalla para publicar (/iniciativas/nueva) y editar (/iniciativas/:id/editar). */
export default function InitiativeFormPage() {
  const { id } = useParams();
  const modoEdicion = Boolean(id);
  const toast = useToast();
  const navegar = useNavigate();

  const { data, loading, error, reload } = useFetch(
    (signal) => (modoEdicion ? initiativesApi.get(id, signal) : Promise.resolve(null)),
    [id]
  );

  const guardar = async (cuerpo) => {
    const resultado = modoEdicion ? await initiativesApi.update(id, cuerpo) : await initiativesApi.create(cuerpo);
    toast.exito(modoEdicion ? "Cambios guardados." : "Iniciativa publicada.");
    navegar(`/iniciativas/${resultado.id}`);
  };

  // Aunque la interfaz oculte la acción, el servidor es quien impide editar iniciativas ajenas (403).
  const sinPermiso = modoEdicion && data && !data.isOwner;

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="h2">{modoEdicion ? "Editar iniciativa" : "Publicar una iniciativa"}</h1>
          <p className="text-muted mb-4">Comparte una idea, una necesidad o un reto, y describe qué competencias necesitas para llevarla adelante.</p>
          <AsyncContent loading={modoEdicion && loading} error={modoEdicion ? error : null} onRetry={reload} loadingLabel="Cargando iniciativa…">
            {sinPermiso ? (
              <div className="alert alert-warning">Solo el propietario puede editar esta iniciativa. <Link to={`/iniciativas/${id}`}>Volver al detalle</Link></div>
            ) : (
              <InitiativeForm key={id ?? "nueva"} modoEdicion={modoEdicion}
                valoresIniciales={data ? aValoresFormulario(data) : undefined}
                onGuardar={guardar} onCancelar={() => navegar(modoEdicion ? `/iniciativas/${id}` : "/iniciativas")} />
            )}
          </AsyncContent>
        </div>
      </div>
    </div>
  );
}
