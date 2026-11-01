import { Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import ProtectedRoute from "./components/layout/ProtectedRoute.jsx";
import HomePage from "./pages/home/HomePage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import CatalogPage from "./pages/initiatives/CatalogPage.jsx";
import InitiativeDetailPage from "./pages/initiatives/InitiativeDetailPage.jsx";
import InitiativeFormPage from "./pages/initiatives/InitiativeFormPage.jsx";
import RequestFormPage from "./pages/requests/RequestFormPage.jsx";
import MyRequestsPage from "./pages/requests/MyRequestsPage.jsx";
import ReceivedRequestsPage from "./pages/requests/ReceivedRequestsPage.jsx";
import ProjectsPage from "./pages/projects/ProjectsPage.jsx";
import ProjectDetailPage from "./pages/projects/ProjectDetailPage.jsx";
import ProjectFormPage from "./pages/projects/ProjectFormPage.jsx";
import ProfilePage from "./pages/profile/ProfilePage.jsx";
import UsersPage from "./pages/profile/UsersPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Públicas: el catálogo y el detalle se ven sin sesión (el servidor decide qué se muestra) */}
        <Route index element={<HomePage />} />
        <Route path="iniciativas" element={<CatalogPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="registro" element={<RegisterPage />} />

        {/* Privadas. "nueva" va antes que ":id" y además react-router prioriza rutas estáticas */}
        <Route element={<ProtectedRoute />}>
          <Route path="iniciativas/nueva" element={<InitiativeFormPage />} />
          <Route path="iniciativas/:id/editar" element={<InitiativeFormPage />} />
          <Route path="iniciativas/:id/solicitar" element={<RequestFormPage />} />
          <Route path="iniciativas/:id/convertir" element={<ProjectFormPage />} />
          <Route path="mis-solicitudes" element={<MyRequestsPage />} />
          <Route path="mis-solicitudes/:solicitudId/editar" element={<RequestFormPage edicion />} />
          <Route path="solicitudes-recibidas" element={<ReceivedRequestsPage />} />
          <Route path="proyectos" element={<ProjectsPage />} />
          <Route path="proyectos/:id" element={<ProjectDetailPage />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="personas" element={<UsersPage />} />
        </Route>

        <Route path="iniciativas/:id" element={<InitiativeDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
