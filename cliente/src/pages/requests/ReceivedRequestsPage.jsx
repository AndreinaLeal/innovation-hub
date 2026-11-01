import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { requestsApi } from "../../api/index.js";
import AsyncContent from "../../components/common/AsyncContent.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import RequestCard from "../../components/requests/RequestCard.jsx";
import StatusFilter from "../../components/requests/StatusFilter.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useFetch } from "../../hooks/useFetch.js";

export default function ReceivedRequestsPage() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const iniciativa = params.get("iniciativa") ?? "";
  const [estado, setEstado] = useState("pendiente");
  const [pagina, setPagina] = useState(1);
  const [resolviendo, setResolviendo] = useState(null); // id de la solicitud en proceso

  const { data, loading, error, reload } = useFetch(
    (signal) => requestsApi.received({ status: estado, initiative: iniciativa, page: pagina, size: 6 }, signal),
    [estado, iniciativa, pagina]
  );

  const resolver = async (solicitud, decision) => {
    setResolviendo(solicitud.id);
    try {
      await (decision === "accept" ? requestsApi.accept(solicitud.id) : requestsApi.reject(solicitud.id));
      toast.exito(decision === "accept" ? `${solicitud.applicant.name} se incorporó al equipo.` : "Solicitud rechazada.");
      reload();
    } catch (e) { toast.error(e.message); reload(); }
    finally { setResolviendo(null); }
  };

  return (
    <div className="container py-4">
      <PageHeader titulo="Solicitudes recibidas" descripcion="Personas que quieren unirse a tus iniciativas." />
      {iniciativa && (
        <p className="alert alert-info d-flex justify-content-between align-items-center">
          Mostrando solo las solicitudes de una iniciativa.
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => { setParams({}); setPagina(1); }}>Ver todas</button>
        </p>
      )}
      <StatusFilter value={estado} onChange={(v) => { setEstado(v); setPagina(1); }} />
      <AsyncContent loading={loading} error={error} onRetry={reload} loadingLabel="Cargando solicitudes…"
        isEmpty={data?.data.length === 0}
        emptyTitle={estado === "pendiente" ? "No tienes solicitudes pendientes" : "No hay solicitudes con ese estado"}
        emptyMessage="Cuando alguien pida unirse a una de tus iniciativas la verás aquí."
        emptyAction={<Link to="/iniciativas" className="btn btn-outline-primary">Ver mis iniciativas</Link>}>
        <div className="vstack gap-3">
          {data?.data.map((s) => (
            <RequestCard key={s.id} solicitud={s} mostrarSolicitante>
              {s.status === "pendiente" && (
                <>
                  <button type="button" className="btn btn-sm btn-primary" disabled={resolviendo === s.id} onClick={() => resolver(s, "accept")}>Aceptar</button>
                  <button type="button" className="btn btn-sm btn-outline-danger" disabled={resolviendo === s.id} onClick={() => resolver(s, "reject")}>Rechazar</button>
                </>
              )}
            </RequestCard>
          ))}
        </div>
        <Pagination page={data?.page ?? 1} totalPages={data?.totalPages ?? 1} onChange={setPagina} />
      </AsyncContent>
    </div>
  );
}
