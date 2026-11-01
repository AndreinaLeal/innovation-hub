# Modelo de datos (MongoDB)

Implementado con Mongoose en `servidor/src/models/`. Seis colecciones. La regla que se aplicó para decidir **embebido o referencia**:

- **Embeber** cuando el dato es pequeño, acotado, se lee siempre junto con su padre y no tiene vida propia.
- **Referenciar** cuando el dato crece sin límite, se consulta desde varios lados, se comparte entre documentos o tiene ciclo de vida propio.

```
users ──┬─────────────< user.skills[] >──────────┐
        │                                         ▼
        │                                      skills
        │                                         ▲
        ├── owner ──> initiatives ── skills[] ────┘
        │               │  └─ members[] (EMBEBIDO: { user→users, role, joinedAt })
        │               │
        ├── applicant ─> requests ── initiative ──> initiatives
        │
        └── owner ────> projects ─── initiative ──> initiatives (única)

sessions ── user ──> users
```

## Colecciones

| Colección | Campos principales | Índices |
|---|---|---|
| `users` | `name`, `email` (único), `passwordHash`, `career`, `bio`, `availability`, `skills[]` (ref) | `email` único, `name`, `skills` |
| `skills` | `name`, `key` (nombre normalizado, único) | `key` único |
| `sessions` | `tokenHash`, `user` (ref), `expiresAt` | `tokenHash` único, TTL sobre `expiresAt` |
| `initiatives` | `owner` (ref), `title`, `type`, `category`, `summary`, `description`, `problem`, `beneficiaries`, `tags[]`, `visibility`, `status`, `targetMembers`, `skills[]` (ref), `members[]` (embebido), `archived` | `owner`, `archived`, `members.user`, `skills`, `(type, category, createdAt)` |
| `requests` | `initiative` (ref), `applicant` (ref), `message`, `mainSkill`, `desiredRole`, `availability`, `status`, `resolvedAt` | `initiative`, `applicant`, único parcial `(initiative, applicant)` cuando `status = pendiente` |
| `projects` | `initiative` (ref, única), `owner` (ref), `name`, `description`, `objective`, `startDate`, `status`, `repositoryUrl` | `initiative` único, `owner` |

## Decisiones de embebido frente a referencia

| Relación | Decisión | Por qué | Costo / alternativa descartada |
|---|---|---|---|
| **Usuario ↔ competencia** (N:M) | **Referencia**: `users.skills[]` apunta a `skills` | La competencia es un concepto compartido entre usuarios e iniciativas. Con una colección propia se evita "SQL", "sql" y "Sql" como valores distintos y se puede filtrar por competencia con un índice. | Embeber el texto en cada usuario duplicaría información y haría imposible renombrar o normalizar. Se paga con una lectura extra (`populate`). |
| **Iniciativa ↔ competencia** (N:M) | **Referencia**: `initiatives.skills[]` apunta a `skills` | Misma razón; además la iniciativa y el usuario comparten el mismo catálogo, que es lo que permite decir "personas con la competencia que esta iniciativa necesita". | Igual que arriba. |
| **Iniciativa → propietario** (N:1, RN-01) | **Referencia**: `owner` | El usuario existe de forma independiente y se consulta por separado ("mis iniciativas"). | Embeber el nombre congelaría datos que cambian. |
| **Iniciativa → equipo** (1:N acotado) | **Embebido**: `members[]` con `{ user (ref), role, joinedAt }` | El equipo está acotado (`targetMembers` ≤ 20), siempre se lee junto con la iniciativa, y RN-09/RN-10 necesitan contarlo sin otra consulta. Cada miembro **referencia** al usuario para no duplicar su nombre. | Una colección `members` obligaría a un `$lookup` en cada detalle y en cada conteo. Se paga con un índice multillave `members.user` para "mis equipos". |
| **Iniciativa → solicitudes** (1:N sin límite) | **Referencia**: colección `requests` | Crecen sin límite, tienen estados y ciclo de vida propios (pendiente → aceptada…), y se consultan por dos lados: el solicitante ("mis solicitudes") y el propietario ("recibidas"). Embebidas habría que recorrer todas las iniciativas para listar las de una persona. | La unicidad "una pendiente por persona e iniciativa" se resuelve con un índice único parcial. |
| **Proyecto → iniciativa** (1:1) | **Referencia única**: `projects.initiative` | El proyecto conserva la referencia a su origen. Es único por iniciativa y tiene sus propios atributos. | **No se copia el equipo**: los miembros del proyecto se leen de la iniciativa, así no hay dos listas que mantener sincronizadas. |
| **Sesión → usuario** | **Referencia** + TTL | Las sesiones nacen y mueren independientemente del usuario; MongoDB las expira solo. | Se guarda el hash del token, no el token. |

## Reglas que el modelo ayuda a garantizar

- **RN-01**: `owner` es obligatorio y no hay endpoint que lo modifique. El propietario también está en `members` con `role = propietario`.
- **RN-05**: índice único parcial en `requests` impide dos solicitudes pendientes iguales aunque lleguen dos peticiones simultáneas.
- **RN-08**: aceptar = cambio de estado condicionado (`status = pendiente`) + `$push` condicionado a que el usuario no esté ya en `members`.
- **RN-09**: `members.length >= 2` en la iniciativa; `projects.initiative` único impide convertir dos veces.
- **RN-10**: `archived` en la iniciativa; se archiva si tiene `members.length > 1`, solicitudes o proyecto.

## Cómo se retomará en la entrega final (modelo relacional)

| MongoDB | Tablas |
|---|---|
| `skills` + `users.skills[]` + `initiatives.skills[]` | `skills`, `user_skills(user_id, skill_id)`, `initiative_skills(initiative_id, skill_id)` |
| `initiatives.members[]` embebido | `initiative_members(initiative_id, user_id, role, joined_at)` |
| `requests`, `projects`, `sessions` | Tablas con llaves foráneas; índice único parcial → `UNIQUE` filtrado (o validación + transacción) |
| Ids `ObjectId` | Ids enteros o UUID (la API ya los trata como cadenas opacas) |
| Arreglo `tags[]` | Tabla `initiative_tags` o columna JSON |

Lo más costoso de portar es el equipo embebido (pasa a tabla intermedia) y la atomicidad de aceptar una solicitud (pasa a transacción).
