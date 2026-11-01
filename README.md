# Innovation Hub

Proyecto del curso SOFT-12 — Programación web avanzada.

**Estudiantes:** Andreina Leal y Tatiana Solis
**Sección:** SCV2 · **Periodo:** III cuatrimestre 2026
**Docente:** Álvaro Cordero Peña

Innovation Hub es una aplicación web para la comunidad universitaria: permite publicar ideas, necesidades y retos, identificar las competencias necesarias y formar equipos interdisciplinarios que luego pueden convertirse en proyectos.

## Estado del proyecto

| Avance | Contenido | Carpeta |
|---|---|---|
| 1 | Prototipo estático (HTML, Bootstrap, Sass, JSON simulado) | `avance1/` (se conserva) |
| **2** | **Cliente React + API Express + MongoDB** | `cliente/`, `servidor/` |
| 3 | Entrega final: mismo cliente sobre un servidor en otro lenguaje y modelo relacional | pendiente |

## Arquitectura

```
React (Vite)  ──HTTP/JSON──▶  API Node.js + Express  ──▶  MongoDB
```

El cliente nunca toca la base de datos: reglas de negocio, permisos y validación viven en el servidor.

```
innovation-hub/
├── README.md
├── docs/
│   ├── api-contract.md     contrato de la API (CONGELADO)
│   └── modelo-datos.md     modelo MongoDB y decisiones embebido/referencia
├── avance1/                prototipo del avance 1
├── cliente/                aplicación React (Vite)
│   └── src/  api/ components/ context/ hooks/ pages/ styles/ utils/
├── servidor/               API Express
│   └── src/  routes/ controllers/ services/ repositories/ models/ middleware/ utils/
└── pruebas/                colección de Postman
```

Capas del servidor: **routes** (enrutamiento y middleware) → **controllers** (HTTP) → **services** (reglas de negocio y validación) → **repositories** (acceso a datos con Mongoose) → **models**.

## Requisitos

- Node.js 18 o superior (recomendado 20+)
- MongoDB 6 o superior, local o en Atlas

## Instalación y ejecución

### 1. Instalar dependencias

```bash
cd servidor && npm install
cd ../cliente && npm install
```

### 2. Variables de entorno

Los archivos `.env` **no se suben al repositorio**. Copia las plantillas:

```bash
cp servidor/.env.example servidor/.env
cp cliente/.env.example cliente/.env
```

| Archivo | Variable | Para qué sirve | Valor de ejemplo |
|---|---|---|---|
| servidor/.env | `PORT` | Puerto de la API | `4000` |
| servidor/.env | `MONGODB_URI` | Conexión a MongoDB | `mongodb://127.0.0.1:27017/innovation_hub` |
| servidor/.env | `CORS_ORIGIN` | Origen(es) del cliente permitidos | `http://localhost:5173` |
| servidor/.env | `SESSION_HOURS` | Duración de la sesión | `12` |
| servidor/.env | `BCRYPT_ROUNDS` | Costo del hash de contraseñas | `10` |
| cliente/.env | `VITE_API_URL` | Dirección de la API | `http://localhost:4000/api` |
| cliente/.env | `VITE_GITHUB_API_URL` | API pública de GitHub | `https://api.github.com` |

### 3. Levantar la base de datos

Con MongoDB instalado como servicio, basta con que esté corriendo (`mongod`). Con Docker:

```bash
docker run -d --name innovation-mongo -p 27017:27017 mongo:7
```

Con Atlas, pon la cadena de conexión en `MONGODB_URI` (solo en tu `.env`).

### 4. Cargar datos de prueba

```bash
cd servidor
npm run seed
```

Borra y recrea las colecciones con los datos del Avance 1 más usuarios, solicitudes y un proyecto de ejemplo. **Todos los usuarios de prueba usan la contraseña `Password123`**:

| Usuario | Para qué sirve |
|---|---|
| `tatiana.solis@example.com` | Tiene solicitudes enviadas (pendiente y rechazada) |
| `andreina.leal@example.com` | Tiene una solicitud pendiente |
| `diego.fernandez@example.com` | Propietario de una iniciativa con solicitud recibida |
| `ana.rojas@example.com` | Propietaria de una iniciativa con equipo y un proyecto |

### 5. Ejecutar el servidor

```bash
cd servidor
npm run dev        # o: npm start
```

Verifica en `http://localhost:4000/api/health`.

### 6. Ejecutar el cliente

```bash
cd cliente
npm run dev
```

Abre `http://localhost:5173`.

## Pruebas de la API

Importa `pruebas/innovation-hub.postman_collection.json` en Postman (o Thunder Client) y ejecútala **en orden** con el Collection Runner, después de `npm run seed`. Cada recurso incluye una petición correcta, una con datos inválidos, una sobre un recurso inexistente y una sin autorización, con verificación automática del código de estado y del formato de error.

## Documentación

- Contrato de la API: [`docs/api-contract.md`](docs/api-contract.md) — congelado desde esta entrega.
- Modelo de datos y justificación embebido/referencia: [`docs/modelo-datos.md`](docs/modelo-datos.md).

## Funcionalidad implementada en el avance 2

- Registro, inicio y cierre de sesión (hash con bcrypt; el cierre invalida el token en el servidor).
- Perfil editable (el correo no se modifica) y búsqueda de personas por nombre, competencia, carrera y disponibilidad.
- Competencias como relación N:M entre usuarios e iniciativas.
- Iniciativas: crear, editar, listar, detalle, archivar/eliminar (RN-10), cuatro niveles de visibilidad (RN-03) y modificación solo del propietario (RN-04). Búsqueda, filtros combinados, orden y paginación en el servidor.
- Solicitudes: crear, modificar mientras están pendientes, cancelar, consultar las propias; el propietario las lista, filtra, acepta y rechaza. Al aceptar, el solicitante entra al equipo.
- Equipos: lista de miembros y retiro por el propietario (no puede retirarse a sí mismo).
- Proyectos: conversión con la regla RN-09 verificada en el servidor, listado y detalle.
- Detalle de proyecto con datos de la API pública de GitHub, con manejo de repositorio inexistente, privado, respuesta inválida, límite de solicitudes y servicio caído.

### Correcciones pedidas por el docente en el avance 1

- Los formularios ya no marcan todo en rojo: solo se marca el campo inválido, y únicamente después de salir de él o de intentar enviar.
- Los campos con límite muestran un contador de caracteres (por ejemplo `37/160`).
- Se eliminó `alert()`: los mensajes se muestran con avisos en pantalla.

## Decisiones de diseño

- **Contrato primero:** ids opacos en texto, competencias como listas de nombres, formato de error único y datos derivados (`memberCount`, `isOwner`) para que la API se pueda reimplementar sobre tablas sin cambiar el cliente.
- **Seguridad:** contraseñas con bcrypt y nunca devueltas; sesiones con token opaco guardado como hash en MongoDB; CORS limitado al origen del cliente; validación repetida en el servidor; errores genéricos sin trazas; verificación de propiedad y visibilidad en cada petición.
- **Interfaz:** componentes por dominio, estado inmutable, formularios controlados, `useFetch` con `AbortController` y estados explícitos de carga, error y vacío en cada pantalla.

## Resumen de commits

| Fecha | Hash | Mensaje |
|---|---|---|
| 2026-09-26 | c6258e8 | agrega perfil proyectos y completa navegacion del prototipo |
| 2026-09-16 | ebe51c1 | Add Tatiana Solis to student list |
| 2026-09-16 | 85e128a | Agrega validacion al formulario de solicitud |
| 2026-09-16 | 61902eb | Agrega competencias dinamicas y validacion en publicar iniciativa |
| 2026-09-16 | 382e2b7 | Agrega renderizado dinamico del detalle con visibilidad y eliminacion |
| 2026-09-16 | 9bbc052 | Actualiza datos con visibilidad y descripcion, y enlaza detalle por id |
| 2026-09-10 | 52f0641 | Agrega carga de datos y renderizado dinamico del catalogo |
| 2026-09-10 | 2525473 | Crea el formulario de publicar iniciativa en Bootstrap |
| 2026-09-10 | ea99b7c | Convierte el detalle de iniciativa a Bootstrap |
| 2026-09-10 | 50f2b28 | Convierte el catalogo a Bootstrap |
| 2026-09-10 | 0510b6f | Renombra paginas para coincidir con los enlaces del catalogo |
| 2026-09-09 | 76a6366 | Agrega formulario de solicitud de participacion |
| 2026-09-08 | 25a4561 | Agrega página de detalle de iniciativa |
| 2026-09-07 | 6c74fe6 | Completar la estructura semantica del catalogo |
| 2026-09-07 | 160e80f | Agregar las tarjetas de resultados del catalogo |
| 2026-09-07 | 02a0108 | Agregar el main con h1 y el panel de filtros del catalogo |
| 2026-09-07 | adf0472 | Maquetar el encabezado y la navegacion del catalogo |
| 2026-09-06 | 49bc187 | Agregar tabla de resumen de commits al README |
| 2026-09-06 | 452e4db | Merge branch main of innovation-hub |
| 2026-09-06 | 086c9d0 | Crear estructura del avance 1 y documentacion inicial |
| 2026-09-06 | e002bac | Initialize README with project information |
| 2026-09-06 | 3900e20 | Delete README.md |
| 2026-09-06 | d21a70a | Initial commit |
