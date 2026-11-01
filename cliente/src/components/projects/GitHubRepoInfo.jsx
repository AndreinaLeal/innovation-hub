import { fetchRepoInfo, parseRepoUrl } from "../../api/github.js";
import { useFetch } from "../../hooks/useFetch.js";
import { formatearFecha } from "../../utils/labels.js";
import Spinner from "../common/Spinner.jsx";

const TITULOS = {
  inexistente: "Repositorio no encontrado",
  privado: "Repositorio privado",
  limite: "Límite de solicitudes alcanzado",
  invalida: "Respuesta inválida de GitHub",
  "no-disponible": "GitHub no disponible",
  config: "Configuración incompleta",
  url: "Dirección inválida",
};

/** Información pública del repositorio, consumida desde el cliente. Cubre los cinco casos de error pedidos. */
export default function GitHubRepoInfo({ repositoryUrl }) {
  const valida = Boolean(parseRepoUrl(repositoryUrl));
  const { data, loading, error, reload } = useFetch((signal) => fetchRepoInfo(repositoryUrl, signal), [repositoryUrl]);

  return (
    <section className="card" aria-labelledby="titulo-repo">
      <div className="card-body">
        <h2 id="titulo-repo" className="h5">Repositorio en GitHub</h2>
        {loading && <Spinner etiqueta="Consultando GitHub…" />}
        {error && (
          <div className="alert alert-warning mb-0" role="alert">
            <p className="mb-1"><strong>{TITULOS[error.tipo] ?? "No se pudo consultar el repositorio"}.</strong></p>
            <p className="mb-2">{error.message}</p>
            <div className="d-flex gap-2">
              {["limite", "no-disponible"].includes(error.tipo) && <button type="button" className="btn btn-sm btn-outline-secondary" onClick={reload}>Reintentar</button>}
              {valida && <a className="btn btn-sm btn-outline-primary" href={repositoryUrl} target="_blank" rel="noopener noreferrer">Abrir en GitHub</a>}
            </div>
          </div>
        )}
        {data && (
          <>
            <dl className="row mb-3">
              <dt className="col-sm-5 text-muted fw-normal">Nombre</dt><dd className="col-sm-7">{data.name}</dd>
              <dt className="col-sm-5 text-muted fw-normal">Propietario</dt><dd className="col-sm-7">{data.owner}</dd>
              <dt className="col-sm-5 text-muted fw-normal">Descripción</dt><dd className="col-sm-7">{data.description || "Sin descripción"}</dd>
              <dt className="col-sm-5 text-muted fw-normal">Lenguaje principal</dt><dd className="col-sm-7">{data.language || "No indicado"}</dd>
              <dt className="col-sm-5 text-muted fw-normal">Rama principal</dt><dd className="col-sm-7">{data.defaultBranch || "No indicada"}</dd>
              <dt className="col-sm-5 text-muted fw-normal">Última actualización</dt><dd className="col-sm-7">{formatearFecha(data.updatedAt) || "No disponible"}</dd>
              <dt className="col-sm-5 text-muted fw-normal">Asuntos abiertos</dt><dd className="col-sm-7">{data.openIssues}</dd>
            </dl>
            <a className="btn btn-outline-primary btn-sm" href={data.url} target="_blank" rel="noopener noreferrer">Abrir en GitHub</a>
          </>
        )}
      </div>
    </section>
  );
}
