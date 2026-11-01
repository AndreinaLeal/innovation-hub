import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/index.js";
import { tokenStore, setUnauthorizedHandler } from "../api/http.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cargando, setCargando] = useState(Boolean(tokenStore.get()));

  const limpiarSesion = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  // Si el servidor responde 401 a una petición con token, la sesión ya no es válida.
  useEffect(() => { setUnauthorizedHandler(limpiarSesion); }, [limpiarSesion]);

  // Al abrir la aplicación se valida el token guardado contra el servidor.
  useEffect(() => {
    if (!tokenStore.get()) return undefined;
    const controller = new AbortController();
    authApi.me(controller.signal)
      .then(setUser)
      .catch((e) => { if (e.name !== "AbortError") limpiarSesion(); })
      .finally(() => { if (!controller.signal.aborted) setCargando(false); });
    return () => controller.abort();
  }, [limpiarSesion]);

  const abrirSesion = ({ user: u, token }) => {
    tokenStore.set(token);
    setUser(u);
    return u;
  };

  const value = useMemo(() => ({
    user,
    cargando,
    login: async (credenciales) => abrirSesion(await authApi.login(credenciales)),
    registrar: async (datos) => abrirSesion(await authApi.register(datos)),
    logout: async () => {
      try { await authApi.logout(); } catch { /* aun si falla el servidor, se cierra la sesión local */ }
      limpiarSesion();
    },
    actualizarUsuario: setUser,
  }), [user, cargando, limpiarSesion]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
};
