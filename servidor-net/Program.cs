using Microsoft.EntityFrameworkCore;
using ServidorNet.Datos;

var builder = WebApplication.CreateBuilder(args);

// La cadena de conexion sale de user-secrets (clave ConnectionStrings:InnovationHub),
// nunca del codigo ni de appsettings.json
builder.Services.AddDbContext<InnovationHubDbContext>(opciones =>
    opciones.UseSqlServer(builder.Configuration.GetConnectionString("InnovationHub")));

var app = builder.Build();

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

app.Run();
