# Investigación breve sobre EF Core

> **BORRADOR — reescriba cada párrafo con sus propias palabras y bórrese esta nota antes de entregar.**
> El SQL y las capturas son de nuestro proyecto (`ServidorNet`, base `InnovationHub` en SQL Server Express). Se obtuvieron con `LogTo(Console.WriteLine, LogLevel.Information)` activo en desarrollo.

---

## 1. Datos relacionados: `Select` frente a `Include`

**Consulta comparada:** las iniciativas públicas con su propietario y sus competencias (la de `GET /api/initiatives`).

**Con proyección (`Select`)** — es la que usa la ruta:

```csharp
bd.Initiatives.AsNoTracking()
    .Where(i => !i.Archived && i.Visibility == "publica")
    .OrderByDescending(i => i.CreatedAt).ThenByDescending(i => i.Id)
    .Skip((pagina - 1) * tamano).Take(tamano)
    .Select(i => new { i.Id, i.Title, /* ... campos del contrato ... */
        MemberCount = i.Members.Count,
        Skills = i.Skills.OrderBy(s => s.Id).Select(s => s.Name).ToList(),
        OwnerName = i.Owner.Name });
```

```sql
SELECT [i0].[Id], [i0].[Title], [i0].[Type], [i0].[Category], [i0].[Summary], [i0].[Visibility],
       [i0].[Status], [i0].[Archived], [i0].[TargetMembers],
       (SELECT COUNT(*) FROM [InitiativeMembers] AS [i1] WHERE [i0].[Id] = [i1].[InitiativeId]),
       [u].[Id], [s0].[Name], [s0].[InitiativeId], [s0].[SkillId], [s0].[Id],
       [i0].[OwnerId], [u].[Name], [i0].[CreatedAt], [i0].[UpdatedAt]
FROM (
    SELECT [i].[Id], [i].[Archived], [i].[Category], [i].[CreatedAt], [i].[OwnerId], [i].[Status],
           [i].[Summary], [i].[TargetMembers], [i].[Title], [i].[Type], [i].[UpdatedAt], [i].[Visibility]
    FROM [Initiatives] AS [i]
    WHERE [i].[Archived] = CAST(0 AS bit) AND [i].[Visibility] = N'publica'
    ORDER BY [i].[CreatedAt] DESC, [i].[Id] DESC
    OFFSET @p ROWS FETCH NEXT @p1 ROWS ONLY
) AS [i0]
INNER JOIN [Users] AS [u] ON [i0].[OwnerId] = [u].[Id]
LEFT JOIN (
    SELECT [s].[Name], [i2].[InitiativeId], [i2].[SkillId], [s].[Id]
    FROM [InitiativeSkills] AS [i2]
    INNER JOIN [Skills] AS [s] ON [i2].[SkillId] = [s].[Id]
) AS [s0] ON [i0].[Id] = [s0].[InitiativeId]
ORDER BY [i0].[CreatedAt] DESC, [i0].[Id] DESC, [u].[Id], [s0].[Id], [s0].[InitiativeId]
```

**Con carga (`Include`)** — probada en una rama aparte, con el mismo filtro (sin `Skip`/`Take` y sin `AsNoTracking`, para ver el conjunto completo):

```csharp
bd.Initiatives.Include(i => i.Owner).Include(i => i.Skills)
    .Where(i => !i.Archived && i.Visibility == "publica").ToListAsync();
```

```sql
SELECT [i].[Id], [i].[Archived], [i].[Beneficiaries], [i].[Category], [i].[CreatedAt], [i].[Description],
       [i].[OwnerId], [i].[Problem], [i].[Status], [i].[Summary], [i].[TargetMembers], [i].[Title],
       [i].[Type], [i].[UpdatedAt], [i].[Visibility],
       [u].[Id], [u].[Availability], [u].[Bio], [u].[Career], [u].[CreatedAt], [u].[Email],
       [u].[Name], [u].[PasswordHash], [u].[UpdatedAt],
       [s0].[InitiativeId], [s0].[SkillId], [s0].[Id], [s0].[Key], [s0].[Name]
FROM [Initiatives] AS [i]
INNER JOIN [Users] AS [u] ON [i].[OwnerId] = [u].[Id]
LEFT JOIN (
    SELECT [i0].[InitiativeId], [i0].[SkillId], [s].[Id], [s].[Key], [s].[Name]
    FROM [InitiativeSkills] AS [i0]
    INNER JOIN [Skills] AS [s] ON [i0].[SkillId] = [s].[Id]
) AS [s0] ON [i].[Id] = [s0].[InitiativeId]
WHERE [i].[Archived] = CAST(0 AS bit) AND [i].[Visibility] = N'publica'
ORDER BY [i].[Id], [u].[Id], [s0].[InitiativeId], [s0].[SkillId]
```

**Capturas:** `capturas/investigacion-select.png`, `capturas/investigacion-include.png` y `capturas/investigacion-select-include.png`.

**Qué se observa**

- `Select` pide solo las columnas del contrato más el nombre del propietario y de cada competencia. `Include` trae 15 columnas de `Initiatives`, 9 de `Users` y 5 de `Skills`, entre ellas `Description`, `Email` y **`PasswordHash`**, que el contrato nunca expone.
- Las dos consultas hacen un `LEFT JOIN` con las competencias, así que cada iniciativa aparece en una fila por competencia. Con `Include` esa repetición arrastra todas las columnas anchas; con `Select` solo repite las pocas del contrato.
- En `Select`, el `OFFSET ... FETCH` va dentro de una subconsulta sobre `Initiatives`, antes de los `JOIN`: se paginan iniciativas y no filas repetidas.

**Cuándo conviene cada una.** `Select` conviene en las rutas de solo lectura que devuelven el contrato: trae lo mínimo y no filtra datos sensibles por accidente. `Include` conviene cuando se necesita la entidad completa para modificarla y guardarla con `SaveChanges`. La propia documentación advierte que cargar una colección con `Include` en una sola consulta puede causar problemas de rendimiento.

**Papel de `AsNoTracking`.** Por defecto, una consulta que devuelve entidades las registra en el *change tracker* para detectar cambios y resolver identidades. En una ruta de solo lectura eso es trabajo inútil; según la documentación, las consultas sin seguimiento suelen ejecutarse más rápido. `AsNoTracking` no cambia el SQL (los dos SQL de arriba son iguales con o sin él): cambia lo que EF hace con los resultados. Además, una proyección a un tipo anónimo con valores simples, como la nuestra, no contiene entidades y no se rastrea de todos modos; lo dejamos explícito para dejar clara la intención.

**Fuentes:**
- https://learn.microsoft.com/en-us/ef/core/querying/related-data/eager
- https://learn.microsoft.com/en-us/ef/core/querying/tracking

---

## 2. Muchos a muchos con datos propios

**Cuándo basta una tabla intermedia sin clase.** Cuando la tabla solo une dos claves y no guarda nada más. En `UserSkills` (usuario–competencia) e `InitiativeSkills` (iniciativa–competencia) cada fila solo dice «esta persona (o iniciativa) tiene esta competencia». EF Core administra la tabla en segundo plano y expone una navegación directa (`i.Skills`), como se ve en el SQL de arriba, donde `InitiativeSkills` aparece solo como paso intermedio del `JOIN`.

**Cuándo hace falta una entidad intermedia.** Cuando la relación tiene datos propios o se necesita consultarla por esos datos. Es el caso de `InitiativeMembers` (usuario–iniciativa): además de las dos claves guarda `Role` (propietario o miembro) y `JoinedAt` (fecha de ingreso). Esos datos no pertenecen ni al usuario ni a la iniciativa, sino a la pareja, y una tabla sin clase no tiene dónde ponerlos. Por eso existe la clase `InitiativeMember`, con clave primaria compuesta `(InitiativeId, UserId)`.

**Evidencia en la base:** la tabla tiene las columnas `InitiativeId`, `UserId`, `Role` y `JoinedAt`; un `CHECK` limita `Role` a `'propietario'` y `'miembro'`; la clave foránea hacia `Initiatives` borra en cascada (`CASCADE`) y la de `Users` no (`NO_ACTION`, que es lo que SQL Server crea con `Restrict`).

**Capturas:** `capturas/investigacion-muchos-a-muchos-columnas.png` y `capturas/investigacion-muchos-a-muchos-fk.png`.

**Fuente:** https://learn.microsoft.com/en-us/ef/core/modeling/relationships/many-to-many

---

## 3. Paginación en la base

**Consulta:** `GET /api/initiatives?page=1&size=1`, que aplica `Skip((pagina - 1) * tamano).Take(tamano)` después de un orden fijo (`CreatedAt DESC, Id DESC`). EF Core genera el `OFFSET ... FETCH NEXT` ya visto en el apartado 1 (`OFFSET @p ROWS FETCH NEXT @p1 ROWS ONLY`, con los dos valores como parámetros enteros) y una consulta aparte para el total:

```sql
SELECT COUNT(*)
FROM [Initiatives] AS [i]
WHERE [i].[Archived] = CAST(0 AS bit) AND [i].[Visibility] = N'publica'
```

**Captura:** `capturas/investigacion-paginacion.png`.

**Por qué no se debe paginar en memoria.** Si se llamara a `ToListAsync()` antes de `Skip` y `Take`, la base enviaría todas las filas al servidor y la página se recortaría en C#: se transfiere y se guarda en memoria toda la tabla para devolver unas pocas filas, y el costo crece con los datos. Paginar en la base devuelve solo la página pedida y permite aprovechar el `ORDER BY` y los índices. La documentación señala además dos límites del `OFFSET`: la base igual procesa las filas que se saltan, y si hay cambios simultáneos pueden saltarse o repetirse elementos. Por eso el orden debe ser único (el nuestro termina en `Id`) y, para volúmenes grandes, recomienda la paginación por clave (*keyset*). Aquí usamos `OFFSET` porque el contrato exige acceso directo a cualquier página (`page`).

**Fuente:** https://learn.microsoft.com/en-us/ef/core/querying/pagination
