# Contrato de la API — Innovation Hub

> **Versión 1.0 — CONGELADO desde la entrega 2.** No se modifica en la entrega final: el mismo cliente React debe funcionar sobre un servidor escrito en otro lenguaje y sobre un modelo relacional.

## 1. Convenciones generales

| Tema | Regla |
|---|---|
| Base | `/api`. Formato `application/json; charset=utf-8` en peticiones y respuestas. |
| Identificadores | Cadenas **opacas** (`"id": "665f…"`). El cliente nunca asume su formato ni que sean numéricos. Un id mal formado se trata como recurso inexistente (404). |
| Fechas | Marcas de tiempo en ISO 8601 UTC (`2026-10-31T18:00:00.000Z`). Las fechas de calendario (`startDate`) son `AAAA-MM-DD`. |
| Nombres de campo | `camelCase`, en inglés. Los valores de los catálogos cerrados (tipo, categoría, estado…) van en español, en minúsculas y con guiones. |
| Autenticación | Cabecera `Authorization: Bearer <token>`. El token se obtiene en registro o inicio de sesión y es opaco (el cliente no lo interpreta). |
| Competencias | En la API siempre son **listas de nombres** (`["SQL", "React"]`). El servidor crea las competencias nuevas; la comparación ignora mayúsculas y tildes. |
| Respuestas de lista | `{ "data": [...], "page": 1, "size": 9, "total": 42, "totalPages": 5 }` |
| Paginación | `page` (desde 1, por defecto 1) y `size` (por defecto según recurso, máximo 50). Los valores fuera de rango se corrigen, no generan error. |
| Respuestas de recurso | El objeto directamente (sin envoltorio). |
| Secretos | Ninguna respuesta incluye contraseñas, hashes, tokens ajenos, cadenas de conexión ni trazas. |

### Formato de error (uniforme en toda la API)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Los datos enviados no son válidos.",
    "details": [ { "field": "title", "message": "El título es obligatorio." } ]
  }
}
```

`details` solo aparece en errores 400 de validación. `code` es estable y pensado para máquinas; `message` está en español para personas.

### Códigos de estado usados

| Código | Cuándo | `error.code` típicos |
|---|---|---|
| 200 | Lectura o modificación correcta con cuerpo | — |
| 201 | Recurso creado (cuerpo = recurso creado) | — |
| 204 | Operación correcta sin cuerpo | — |
| 400 | Datos inválidos, filtro inválido, JSON mal formado | `VALIDATION_ERROR`, `INVALID_JSON` |
| 401 | Falta sesión válida, o el recurso exige sesión | `UNAUTHORIZED` |
| 403 | Hay sesión, el recurso es visible para ella, pero no tiene permiso para la acción (p. ej. no es el propietario) | `FORBIDDEN`, `CORS_FORBIDDEN` |
| 404 | No existe **o no es visible para quien consulta** (las iniciativas privadas no revelan su existencia) | `NOT_FOUND` |
| 409 | La acción choca con el estado actual o una regla de negocio | ver cada endpoint |
| 500 | Error inesperado del servidor (mensaje genérico) | `INTERNAL_ERROR` |

## 2. Catálogos cerrados

| Campo | Valores |
|---|---|
| `type` | `idea`, `necesidad`, `reto` |
| `category` | `tecnologia`, `educacion`, `sostenibilidad`, `impacto-social`, `negocios-emprendimiento`, `salud-bienestar`, `cultura-creatividad`, `otro` |
| `visibility` | `publica`, `institucional`, `restringida`, `privada` |
| iniciativa `status` | `buscando-equipo`, `en-progreso`, `pausada`, `completada` |
| solicitud `status` | `pendiente`, `aceptada`, `rechazada`, `cancelada` |
| `availability` | `alta`, `media`, `baja` |
| proyecto `status` | `planificacion`, `activo`, `finalizado` |

## 3. Reglas de negocio que el contrato expresa

| Regla | Cómo se refleja en la API |
|---|---|
| **RN-01** Propietario único | `owner` se fija al crear con el usuario autenticado; ningún endpoint permite cambiarlo. |
| **RN-03** Cuatro niveles de visibilidad | Ver tabla de visibilidad abajo. |
| **RN-04** Solo el propietario modifica | `PUT/DELETE` de iniciativa, retirar miembros, resolver solicitudes y convertir en proyecto devuelven **403** a cualquier otra persona. |
| **RN-05** Una solicitud pendiente por persona e iniciativa; no se solicita a la propia iniciativa ni siendo miembro | 409 `DUPLICATE_REQUEST`, `OWN_INITIATIVE`, `ALREADY_MEMBER`. |
| **RN-06** Solo se modifica o cancela una solicitud mientras está pendiente, y solo quien la envió | 409 `REQUEST_NOT_PENDING`; 403 si no es el solicitante. |
| **RN-07** Solo el propietario acepta o rechaza, y solo solicitudes pendientes | 403 / 409 `REQUEST_NOT_PENDING`. |
| **RN-08** Al aceptar, el solicitante entra al equipo | `POST /requests/{id}/accept` agrega al miembro en la misma operación. |
| **RN-09** Conversión en proyecto con ≥ 1 miembro además del propietario | 409 `RN09_NOT_ENOUGH_MEMBERS`. |
| **RN-10** Archivar en lugar de eliminar si hay información relacionada | `DELETE /initiatives/{id}` archiva si hay otros miembros, solicitudes o proyecto; si no, elimina. Ambos devuelven 204. |

> Nota: el documento general del proyecto define el texto exacto de RN-05 a RN-08; aquí se documenta la interpretación implementada.

### Visibilidad de una iniciativa (RN-03)

| Visibilidad | Anónimo | Autenticado (no miembro) | Miembro / propietario |
|---|---|---|---|
| `publica` | Completa | Completa | Completa |
| `institucional` | 401 | Completa | Completa |
| `restringida` | 401 | **Solo resumen** (`restricted: true`) | Completa |
| `privada` | 404 | 404 | Completa |

Una iniciativa **archivada** solo es visible para su propietario; para el resto es 404. Los listados aplican la misma regla en el servidor: nunca devuelven elementos que el detalle ocultaría.

## 4. Recursos

### 4.1 Autenticación

| Verbo y ruta | Auth | Cuerpo | Éxito | Errores |
|---|---|---|---|---|
| `POST /api/auth/register` | No | `{ name, email, password, career? }` | **201** `{ user, token }` | 400, 409 `EMAIL_TAKEN` |
| `POST /api/auth/login` | No | `{ email, password }` | **200** `{ user, token }` | 400, 401 (mensaje único para correo o contraseña incorrectos) |
| `POST /api/auth/logout` | Sí | — | **204** (invalida el token en el servidor) | 401 |
| `GET /api/auth/me` | Sí | — | **200** `User` (privado) | 401 |

Reglas: `name` 2–80; `email` formato válido, único, insensible a mayúsculas; `password` 8–72 con letras y números; `career` ≤ 80.

### 4.2 Usuarios y competencias

| Verbo y ruta | Auth | Descripción | Éxito | Errores |
|---|---|---|---|---|
| `GET /api/users?q=&skill=&career=&availability=&page=&size=` | Sí | Búsqueda combinada. `q` = nombre (contiene), `skill` = nombre exacto de competencia, `career` = contiene, `availability` = catálogo. Orden por nombre. `size` por defecto 12. | 200 lista de `User` (público) | 401 |
| `GET /api/users/{id}` | Sí | Perfil público | 200 | 401, 404 |
| `PUT /api/users/me` | Sí | Reemplaza el perfil: `{ name, career?, bio?, availability, skills[] }`. **El correo no se modifica**: si se envía distinto → 400 en `details[].field = "email"`. | 200 `User` (privado) | 400, 401 |
| `GET /api/skills?q=` | No | Sugerencias de competencias (máx. 50), orden alfabético | 200 `{ "data": ["SQL", ...] }` | — |

**User (público)**: `{ id, name, career, bio, availability, skills[] }`. **User (privado)** agrega `email` y `createdAt`.

### 4.3 Iniciativas

| Verbo y ruta | Auth | Éxito | Errores |
|---|---|---|---|
| `GET /api/initiatives?type=&category=&skill=&q=&status=&owner=&member=&archived=&sort=&page=&size=` | Opcional | 200 lista de `InitiativeSummary` | 400 (filtro inválido), 401 (`owner`/`member` sin sesión) |
| `GET /api/initiatives/{id}` | Opcional | 200 `Initiative` | 401, 404 |
| `POST /api/initiatives` | Sí | **201** `Initiative` | 400, 401 |
| `PUT /api/initiatives/{id}` | Sí (propietario) | 200 `Initiative` | 400, 401, **403**, 404, 409 `INITIATIVE_ARCHIVED` |
| `DELETE /api/initiatives/{id}` | Sí (propietario) | **204** (archiva o elimina, RN-10) | 401, **403**, 404 |
| `GET /api/initiatives/{id}/members` | Opcional | 200 `{ data: Member[] }` | 401, 403 (solo resumen), 404 |
| `DELETE /api/initiatives/{id}/members/{userId}` | Sí (propietario) | **204** | 401, **403**, 404, 409 `OWNER_CANNOT_LEAVE` |

**Filtros de listado** (todos combinables, resueltos en el servidor):
`type`, `category`, `status` ∈ catálogos; `skill` = nombre exacto de competencia; `q` = texto contenido en título, resumen o etiquetas (sin distinguir mayúsculas); `owner=me` = las mías (con `archived=true` solo las archivadas); `member=me` = donde formo parte del equipo; `sort` ∈ `newest` (por defecto), `oldest`, `title`. `size` por defecto 9. Por defecto los listados excluyen archivadas.

**Cuerpo de `POST` / `PUT`** (el `PUT` reemplaza todos los campos editables):

```json
{
  "title": "5–120", "type": "idea", "category": "educacion",
  "summary": "10–160", "description": "20–4000",
  "problem": "≤1500, opcional", "beneficiaries": "≤300, opcional",
  "visibility": "publica", "targetMembers": 5,
  "skills": ["React", "SQL"],            // 1–15, obligatorio
  "tags": ["educación"],                  // 0–10, opcional
  "status": "buscando-equipo"            // opcional; por defecto buscando-equipo al crear
}
```
`targetMembers` es 1–20 y no puede ser menor que los miembros actuales.

**InitiativeSummary**: `{ id, title, type, category, summary, visibility, status, archived, targetMembers, memberCount, skills[], owner:{id,name}, createdAt, updatedAt }`. Si la visibilidad es restringida y quien consulta no es miembro, `skills` va vacío.

**Initiative** = `InitiativeSummary` + `{ restricted, isOwner, isMember }` y, **cuando `restricted` es `false`**, además `{ description, problem, beneficiaries, tags[], members: Member[] }`. Con `restricted: true` esos cinco campos no se envían.

**Member**: `{ userId, name, role: "propietario"|"miembro", joinedAt }`. El propietario aparece siempre en el equipo.

### 4.4 Solicitudes de participación

| Verbo y ruta | Auth | Descripción | Éxito | Errores |
|---|---|---|---|---|
| `POST /api/initiatives/{id}/requests` | Sí | Crea. Cuerpo: `{ message (20–600), mainSkill (≤60), desiredRole (≤80), availability }` | **201** `Request` | 400, 401, 404, 409 `OWN_INITIATIVE` / `ALREADY_MEMBER` / `DUPLICATE_REQUEST` / `INITIATIVE_CLOSED` |
| `GET /api/initiatives/{id}/requests?status=&page=&size=` | Sí (propietario) | Solicitudes de esa iniciativa | 200 lista | 400, 401, 403, 404 |
| `GET /api/requests/mine?status=&page=&size=` | Sí | Las que envié | 200 lista | 400, 401 |
| `GET /api/requests/received?status=&initiative=&page=&size=` | Sí | Las de mis iniciativas | 200 lista | 400, 401 |
| `GET /api/requests/{id}` | Sí | Solo solicitante o propietario; para los demás 404 | 200 | 401, 404 |
| `PUT /api/requests/{id}` | Sí (solicitante) | Modifica mientras esté pendiente (mismo cuerpo que crear) | 200 | 400, 401, 403, 404, 409 `REQUEST_NOT_PENDING` |
| `POST /api/requests/{id}/cancel` | Sí (solicitante) | Pasa a `cancelada` | 200 | 401, 403, 404, 409 |
| `POST /api/requests/{id}/accept` | Sí (propietario) | Pasa a `aceptada` e incorpora al solicitante al equipo | 200 | 401, 403, 404, 409 |
| `POST /api/requests/{id}/reject` | Sí (propietario) | Pasa a `rechazada` | 200 | 401, 403, 404, 409 |

**Request**: `{ id, initiative:{id,title}, applicant:{id,name,career}, message, mainSkill, desiredRole, availability, status, createdAt, updatedAt, resolvedAt }`. Tamaño por defecto de página: 10.

### 4.5 Proyectos

| Verbo y ruta | Auth | Descripción | Éxito | Errores |
|---|---|---|---|---|
| `POST /api/projects` | Sí (propietario de la iniciativa) | Convierte una iniciativa en proyecto | **201** `Project` | 400, 401, 403, 404, 409 `RN09_NOT_ENOUGH_MEMBERS` / `PROJECT_EXISTS` / `INITIATIVE_ARCHIVED` |
| `GET /api/projects?status=&page=&size=` | Sí | Proyectos accesibles al usuario | 200 lista de `Project` | 400, 401 |
| `GET /api/projects/{id}` | Sí | Detalle con equipo | 200 `Project` | 401, 404 |

Cuerpo de `POST`: `{ initiativeId, name (3–120), description (20–2000), objective (10–500), startDate "AAAA-MM-DD", status? (por defecto planificacion), repositoryUrl? }`. `repositoryUrl` es opcional y debe ser `https://github.com/{usuario}/{repositorio}`.

**Project**: `{ id, initiative:{id,title}, owner:{id,name}, name, description, objective, startDate, status, repositoryUrl, memberCount, createdAt }` y, solo en el detalle y en la creación, `members: Member[]`. `repositoryUrl` es `""` si no hay repositorio. Al convertir, la iniciativa pasa a `en-progreso`.

**Proyectos accesibles**: los de iniciativas `publica` o `institucional` (con sesión) y los de cualquier iniciativa donde el usuario es miembro. Los demás responden 404.

La modificación, el archivado, la búsqueda y el filtrado de proyectos pertenecen a la entrega final y **no** forman parte de este contrato.

### 4.6 Salud

`GET /api/health` → 200 `{ "status": "ok" }`.

## 5. Notas para reimplementar sobre otro lenguaje y un modelo relacional

- Los ids son opacos: pueden ser enteros convertidos a texto o UUID.
- Las competencias son N:M (tablas `skills`, `user_skills`, `initiative_skills`); la API ya las expone como nombres.
- El equipo es una tabla intermedia `initiative_members`; el propietario es un miembro con `role = propietario`.
- `memberCount`, `isOwner`, `isMember` y `restricted` son datos **derivados**: se calculan, no se almacenan.
- La búsqueda por texto es "contiene, sin distinguir mayúsculas" (`LIKE`/`ILIKE`), no búsqueda de texto completo.
- Las sesiones son registros en servidor (tabla `sessions` con hash del token y expiración); cerrar sesión borra el registro.
- Aceptar una solicitud debe ser atómico (transacción): cambiar estado + insertar miembro.
