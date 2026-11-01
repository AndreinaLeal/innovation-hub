import { useState } from "react";
import { usersApi } from "../../api/index.js";
import ProfileForm from "../../components/profile/ProfileForm.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { DISPONIBILIDAD } from "../../utils/labels.js";

const iniciales = (nombre) => nombre.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");

export default function ProfilePage() {
  const { user, actualizarUsuario } = useAuth();
  const toast = useToast();
  const [editando, setEditando] = useState(false);

  const guardar = async (cuerpo) => {
    const actualizado = await usersApi.updateMe(cuerpo);
    actualizarUsuario(actualizado);
    toast.exito("Perfil actualizado.");
    setEditando(false);
  };

  return (
    <div className="container py-5">
      <div className="row g-4">
        <aside className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body text-center p-4">
              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 90, height: 90, fontSize: "1.5rem" }} aria-hidden="true">
                {iniciales(user.name)}
              </div>
              <h1 className="h3 mb-1">{user.name}</h1>
              <p className="text-muted mb-1">{user.career || "Carrera sin indicar"}</p>
              <p className="small text-muted">{user.email}</p>
              <p>{user.bio || "Aún no has escrito una presentación."}</p>
              <p className="small"><strong>Disponibilidad:</strong><br />{DISPONIBILIDAD[user.availability]}</p>
              {!editando && <button type="button" className="btn btn-outline-primary w-100" onClick={() => setEditando(true)}>Editar perfil</button>}
            </div>
          </div>
        </aside>
        <div className="col-lg-8">
          {editando ? (
            <section className="card shadow-sm" aria-labelledby="titulo-editar-perfil">
              <div className="card-body p-4">
                <h2 id="titulo-editar-perfil" className="h4 mb-3">Editar perfil</h2>
                <ProfileForm usuario={user} onGuardar={guardar} onCancelar={() => setEditando(false)} />
              </div>
            </section>
          ) : (
            <section className="card shadow-sm" aria-labelledby="titulo-competencias">
              <div className="card-body p-4">
                <h2 id="titulo-competencias" className="h4">Mis competencias</h2>
                <p className="text-muted">Áreas en las que puedo aportar a diferentes iniciativas.</p>
                {user.skills.length === 0
                  ? <p className="mb-0">Todavía no agregaste competencias. Usa “Editar perfil” para añadirlas: tenerlas completas ayuda a que te encuentren.</p>
                  : <div className="d-flex flex-wrap gap-2">{user.skills.map((s) => <span key={s} className="badge text-bg-primary">{s}</span>)}</div>}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
