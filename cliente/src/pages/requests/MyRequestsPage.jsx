import { useState } from "react";
import { Link } from "react-router-dom";
import { requestsApi } from "../../api/index.js";
import AsyncContent from "../../components/common/AsyncContent.jsx";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import RequestCard from "../../components/requests/RequestCard.jsx";
import StatusFilter from "../../components/requests/StatusFilter.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useFetch } from "../../hooks/useFetch.js";

export default function MyRequestsPage() {
  const toast = useToast();
  const [estado, setEstado] = useState("");
  const [pagina, setPagina] = useState(1);
  const [aCancelar, setACancelar] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  const { data, loading, error, reload } = useFetch(
    (signal) => requestsApi.mine({ status: estado, page: pagina, size: 6 }, signal),
    [estado, pagina]
  );

  const cancelar = async () => {
    setOcupado(true);
    try {
      await requestsApi.cancel(aCancelar.id);
      toast.exito("Solicitud cancelada.");
      reload();
    } catch (e) { toast.error(e.message); }
    finally { setOcupado(false); setACancelar(null); }
  };

  return (
    <div className="container py-4">
      <PageHeader titulo="Mis solicitudes" descripcion="Solicitudes de participación que has enviado." />
      <StatusFilter value={estado} onChange={(v) => { setEstado(v); setPagina(1); }} />
      <AsyncContent loading={loading} error={error} onRetry={reload} loadingLabel="Cargando tus solicitudes…"
        isEmpty={data?.data.length === 0}
        emptyTitle={estado ? "No tienes solicitudes con ese estado" : "Aún no has enviado solicitudes"}
        emptyMessage="Explora el catálogo y pide unirte a una iniciativa."
        emptyAction={<Link to="/iniciativas" className="btn btn-primary">Ir al catálogo</Link>}>
        <div className="vstack gap-3">
          {data?.data.map((s) => (
            <RequestCard key={s.id} solicitud={s}>
              {s.status === "pendiente" && (
                <>
                  <Link to={`/mis-solicitudes/${s.id}/editar`} className="btn btn-sm btn-outline-secondary">Modificar</Link>
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setACancelar(s)}>Cancelar solicitud</button>
                </>
              )}
            </RequestCard>
          ))}
        </div>
        <Pagination page={data?.page ?? 1} totalPages={data?.totalPages ?? 1} onChange={setPagina} />
      </AsyncContent>
      <ConfirmModal abierto={Boolean(aCancelar)} titulo="¿Cancelar la solicitud?" textoConfirmar="Cancelar solicitud" ocupado={ocupado}
        onConfirmar={cancelar} onCancelar={() => setACancelar(null)}>
        <p className="mb-0">Tu solicitud para “{aCancelar?.initiative.title}” pasará a cancelada.</p>
      </ConfirmModal>
    </div>
  );
}
