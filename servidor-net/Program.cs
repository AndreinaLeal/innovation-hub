using System.Globalization;
using Microsoft.EntityFrameworkCore;
using ServidorNet.Datos;

var builder = WebApplication.CreateBuilder(args);

// La cadena de conexion sale de user-secrets (clave ConnectionStrings:InnovationHub),
// nunca del codigo ni de appsettings.json
builder.Services.AddDbContext<InnovationHubDbContext>(opciones =>
{
    opciones.UseSqlServer(builder.Configuration.GetConnectionString("InnovationHub"));
    // Muestra en la terminal el SQL que genera EF Core (se usa en docs/investigacion-efcore.md)
    if (builder.Environment.IsDevelopment())
        opciones.LogTo(Console.WriteLine, LogLevel.Information);
});

var app = builder.Build();

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

// Fecha ISO 8601 UTC con milisegundos, igual que la devuelve Express (toISOString)
static string Iso(DateTime fecha) =>
    DateTime.SpecifyKind(fecha, DateTimeKind.Utc)
        .ToString("yyyy-MM-dd'T'HH:mm:ss.fff'Z'", CultureInfo.InvariantCulture);

// Igual que parsePaging de Express: valores ausentes, cero o no numericos usan el valor por defecto;
// los que quedan fuera de rango se corrigen en lugar de dar error
static int Entero(string? texto, int porDefecto) =>
    int.TryParse(texto, out var n) && n != 0 ? n : porDefecto;

static IResult Error(int estado, string codigo, string mensaje) =>
    Results.Json(new { error = new { code = codigo, message = mensaje } }, statusCode: estado);

// GET /api/initiatives (sin sesion: solo iniciativas publicas y no archivadas)
// Datos de dos relaciones: propietario (1:N) y competencias (N:M)
app.MapGet("/api/initiatives", async (InnovationHubDbContext bd, string? page, string? size) =>
{
    var pagina = Math.Max(1, Entero(page, 1));
    var tamano = Math.Min(50, Math.Max(1, Entero(size, 9)));

    var consulta = bd.Initiatives
        .AsNoTracking()
        .Where(i => !i.Archived && i.Visibility == "publica");

    var total = await consulta.CountAsync();

    var filas = await consulta
        .OrderByDescending(i => i.CreatedAt).ThenByDescending(i => i.Id)
        .Skip((pagina - 1) * tamano)
        .Take(tamano)
        .Select(i => new
        {
            i.Id,
            i.Title,
            i.Type,
            i.Category,
            i.Summary,
            i.Visibility,
            i.Status,
            i.Archived,
            i.TargetMembers,
            MemberCount = i.Members.Count,
            Skills = i.Skills.OrderBy(s => s.Id).Select(s => s.Name).ToList(),
            OwnerId = i.OwnerId,
            OwnerName = i.Owner.Name,
            i.CreatedAt,
            i.UpdatedAt
        })
        .ToListAsync();

    var data = filas.Select(i => new
    {
        id = i.Id.ToString(),
        title = i.Title,
        type = i.Type,
        category = i.Category,
        summary = i.Summary,
        visibility = i.Visibility,
        status = i.Status,
        archived = i.Archived,
        targetMembers = i.TargetMembers,
        memberCount = i.MemberCount,
        skills = i.Skills,
        owner = new { id = i.OwnerId.ToString(), name = i.OwnerName },
        createdAt = Iso(i.CreatedAt),
        updatedAt = Iso(i.UpdatedAt)
    });

    return Results.Ok(new
    {
        data,
        page = pagina,
        size = tamano,
        total,
        totalPages = Math.Max(1, (int)Math.Ceiling(total / (double)tamano))
    });
});

// GET /api/initiatives/{id}/members (sin sesion: solo equipos de iniciativas publicas)
// Relacion N:M usuario-iniciativa con datos propios (rol y fecha de ingreso)
app.MapGet("/api/initiatives/{id}/members", async (string id, InnovationHubDbContext bd) =>
{
    // Un id mal formado se trata como recurso inexistente (404), como en Express
    if (!int.TryParse(id, out var iniciativaId))
        return Error(404, "NOT_FOUND", "El recurso no existe.");

    var iniciativa = await bd.Initiatives
        .AsNoTracking()
        .Where(i => i.Id == iniciativaId)
        .Select(i => new { i.Visibility, i.Archived })
        .FirstOrDefaultAsync();

    if (iniciativa is null || iniciativa.Archived || iniciativa.Visibility == "privada")
        return Error(404, "NOT_FOUND", "La iniciativa no existe.");

    // Institucional y restringida exigen sesion; la autenticacion llega en la entrega final
    if (iniciativa.Visibility != "publica")
        return Error(401, "UNAUTHORIZED", "Debes iniciar sesión para ver esta iniciativa.");

    var filas = await bd.InitiativeMembers
        .AsNoTracking()
        .Where(m => m.InitiativeId == iniciativaId)
        .OrderBy(m => m.JoinedAt).ThenBy(m => m.UserId)
        .Select(m => new { m.UserId, m.User.Name, m.Role, m.JoinedAt })
        .ToListAsync();

    return Results.Ok(new
    {
        data = filas.Select(m => new
        {
            userId = m.UserId.ToString(),
            name = m.Name,
            role = m.Role,
            joinedAt = Iso(m.JoinedAt)
        })
    });
});

app.Run();
