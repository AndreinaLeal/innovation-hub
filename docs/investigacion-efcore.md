# Investigación breve sobre EF Core

> **Máximo dos páginas.** Cada respuesta necesita el SQL real que muestra la terminal de *su* servidor y una captura. Este archivo es el esqueleto: reemplace cada `TODO` con su evidencia y con sus propias palabras.

## Cómo obtener el SQL

El servidor está configurado en desarrollo con `LogTo(Console.WriteLine, LogLevel.Information)`, así que cada petición imprime el SQL en la terminal donde corre `dotnet run`. Busque las líneas `Executed DbCommand`.
También puede usar `.ToQueryString()` sobre cualquier consulta para ver su SQL sin ejecutarla.

---

## 1. Datos relacionados: Select frente a Include

**Consulta usada:** las iniciativas públicas con el nombre de su propietario y sus competencias (la de `GET /api/initiatives`).

**Con proyección (`Select`)** — es la que usa el servidor:

```csharp
// TODO: pegue aquí el fragmento real de Program.cs
```

SQL generado:

```sql
-- TODO: pegue el SQL de la terminal
```

**Con carga (`Include`)** — pruébela en una rama aparte, sin tocar la entrega:

```csharp
var iniciativas = await bd.Initiatives
    .Include(i => i.Owner)
    .Include(i => i.Skills)
    .Where(i => !i.Archived && i.Visibility == "publica")
    .ToListAsync();
```

SQL generado:

```sql
-- TODO: pegue el SQL de la terminal
```

**Captura:** `capturas/investigacion-select-include.png` (TODO)

**Qué observé / cuándo conviene cada una:**
TODO — compare las columnas que trae cada SQL y qué consulta devuelve solo lo que pide el contrato.

**Qué papel cumple `AsNoTracking`:**
TODO — qué guarda EF Core cuando rastrea entidades y por qué una ruta de solo lectura no lo necesita.

**Fuentes:** TODO (learn.microsoft.com/ef/core, secciones de *Loading related data* y *Tracking vs. no-tracking queries*)

---

## 2. Muchos a muchos con datos propios

**Caso concreto de nuestro modelo:** `UserSkills` e `InitiativeSkills` frente a `InitiativeMembers`.

TODO — explique cuándo basta una tabla intermedia sin clase y cuándo hace falta una entidad intermedia. Incluya:

- Qué datos propios tiene `InitiativeMembers` (`Role`, `JoinedAt`) y qué no se podría guardar con una tabla sin clase.
- El fragmento de `OnModelCreating` de cada caso.
- La tabla creada en la base (pegue el resultado de `sp_help InitiativeMembers` o una captura de SSMS).

**Captura:** `capturas/investigacion-muchos-a-muchos.png` (TODO)

**Fuentes:** TODO (learn.microsoft.com/ef/core, *Many-to-many relationships*)

---

## 3. Paginación en la base

**Consulta usada:** `GET /api/initiatives?page=1&size=1`, que aplica `Skip` y `Take`.

```csharp
// TODO: pegue el fragmento real de Program.cs
```

SQL generado:

```sql
-- TODO: debe verse OFFSET ... FETCH NEXT ... y un ORDER BY
```

**Captura:** `capturas/investigacion-paginacion.png` (TODO)

**Por qué no se debe paginar en memoria:**
TODO — qué trae la base si se llama `ToListAsync()` antes de `Skip`/`Take`, qué pasa con miles de filas y qué papel cumple el `ORDER BY`.

**Fuentes:** TODO (learn.microsoft.com/ef/core, *Pagination*)
