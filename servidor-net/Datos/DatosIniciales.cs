using Microsoft.EntityFrameworkCore;
using ServidorNet.Modelos;

namespace ServidorNet.Datos;

public static class DatosIniciales
{
    // Tablas intermedias sin clase: se siembran con objetos anonimos desde UsingEntity (ver el DbContext)
    public static readonly object[] UsuariosCompetencias =
    [
        new { UserId = 1, SkillId = 1 }, new { UserId = 1, SkillId = 5 }, new { UserId = 1, SkillId = 4 },
        new { UserId = 2, SkillId = 2 }, new { UserId = 2, SkillId = 3 },
        new { UserId = 3, SkillId = 4 },
        new { UserId = 4, SkillId = 5 }
    ];

    public static readonly object[] IniciativasCompetencias =
    [
        new { InitiativeId = 1, SkillId = 1 }, new { InitiativeId = 1, SkillId = 3 },
        new { InitiativeId = 2, SkillId = 1 }, new { InitiativeId = 2, SkillId = 5 },
        new { InitiativeId = 3, SkillId = 2 }, new { InitiativeId = 3, SkillId = 3 }, new { InitiativeId = 3, SkillId = 4 },
        new { InitiativeId = 4, SkillId = 5 }
    ];

    private static DateTime Utc(int dia, int hora = 15) => new(2026, 10, dia, hora, 0, 0, DateTimeKind.Utc);

    public static void Sembrar(ModelBuilder mb)
    {
        // Usuarios sin contrasena: la autenticacion se agrega en la entrega final
        mb.Entity<User>().HasData(
            new User { Id = 1, Name = "Andreina Leal", Email = "andreina.leal@example.com", Career = "Ingenieria de Software", Bio = "", Availability = "media", CreatedAt = Utc(1, 10), UpdatedAt = Utc(1, 10) },
            new User { Id = 2, Name = "Tatiana Solis", Email = "tatiana.solis@example.com", Career = "Ingenieria de Software", Bio = "", Availability = "alta", CreatedAt = Utc(1, 11), UpdatedAt = Utc(1, 11) },
            new User { Id = 3, Name = "Carlos Mora", Email = "carlos.mora@example.com", Career = "Administracion de Empresas", Bio = "", Availability = "baja", CreatedAt = Utc(1, 12), UpdatedAt = Utc(1, 12) },
            new User { Id = 4, Name = "Daniela Rojas", Email = "daniela.rojas@example.com", Career = "Diseno Grafico", Bio = "", Availability = "media", CreatedAt = Utc(1, 13), UpdatedAt = Utc(1, 13) }
        );

        mb.Entity<Skill>().HasData(
            new Skill { Id = 1, Name = "React", Key = "react" },
            new Skill { Id = 2, Name = "SQL", Key = "sql" },
            new Skill { Id = 3, Name = "Bases de datos", Key = "bases de datos" },
            new Skill { Id = 4, Name = "Node.js", Key = "node.js" },
            new Skill { Id = 5, Name = "Diseño de interfaces", Key = "diseno de interfaces" }
        );

        // Una por cada nivel de visibilidad (RN-03)
        mb.Entity<Initiative>().HasData(
            new Initiative
            {
                Id = 1, OwnerId = 3, Title = "Voluntariado Conectado", Type = "reto", Category = "impacto-social",
                Summary = "Plataforma para organizar turnos de voluntariado y registrar horas.",
                Description = "Plataforma para publicar turnos de voluntariado, asignar participantes y registrar las horas cumplidas.",
                Problem = "", Beneficiaries = "", Visibility = "publica", Status = "en-progreso",
                TargetMembers = 5, Archived = false, CreatedAt = Utc(1, 15), UpdatedAt = Utc(1, 15)
            },
            new Initiative
            {
                Id = 2, OwnerId = 1, Title = "Biblioteca de recursos abiertos", Type = "idea", Category = "educacion",
                Summary = "Repositorio compartido de material de estudio entre carreras.",
                Description = "Repositorio donde estudiantes publican y valoran material de estudio de libre acceso.",
                Problem = "", Beneficiaries = "", Visibility = "institucional", Status = "buscando-equipo",
                TargetMembers = 4, Archived = false, CreatedAt = Utc(2, 15), UpdatedAt = Utc(2, 15)
            },
            new Initiative
            {
                Id = 3, OwnerId = 2, Title = "Laboratorio de datos del campus", Type = "necesidad", Category = "tecnologia",
                Summary = "Panel con datos abiertos del campus para investigacion estudiantil.",
                Description = "Un panel que reune datos anonimizados del campus para que estudiantes analicen y propongan mejoras.",
                Problem = "", Beneficiaries = "", Visibility = "restringida", Status = "buscando-equipo",
                TargetMembers = 6, Archived = false, CreatedAt = Utc(3, 15), UpdatedAt = Utc(3, 15)
            },
            new Initiative
            {
                Id = 4, OwnerId = 4, Title = "Huerta universitaria", Type = "reto", Category = "sostenibilidad",
                Summary = "Huerta comunitaria cuidada por estudiantes de varias carreras.",
                Description = "Disenar y mantener una huerta en el campus con turnos de cuidado y registro de cosechas.",
                Problem = "", Beneficiaries = "", Visibility = "privada", Status = "buscando-equipo",
                TargetMembers = 3, Archived = false, CreatedAt = Utc(4, 15), UpdatedAt = Utc(4, 15)
            }
        );

        mb.Entity<InitiativeTag>().HasData(
            new InitiativeTag { InitiativeId = 1, Value = "voluntariado" },
            new InitiativeTag { InitiativeId = 1, Value = "comunidad" },
            new InitiativeTag { InitiativeId = 2, Value = "educacion" },
            new InitiativeTag { InitiativeId = 3, Value = "datos" },
            new InitiativeTag { InitiativeId = 4, Value = "sostenibilidad" }
        );

        // Equipo: el propietario siempre esta como miembro con rol propietario
        mb.Entity<InitiativeMember>().HasData(
            new InitiativeMember { InitiativeId = 1, UserId = 3, Role = "propietario", JoinedAt = Utc(1, 15) },
            new InitiativeMember { InitiativeId = 1, UserId = 1, Role = "miembro", JoinedAt = Utc(3, 9) },
            new InitiativeMember { InitiativeId = 1, UserId = 2, Role = "miembro", JoinedAt = Utc(4, 9) },
            new InitiativeMember { InitiativeId = 2, UserId = 1, Role = "propietario", JoinedAt = Utc(2, 15) },
            new InitiativeMember { InitiativeId = 3, UserId = 2, Role = "propietario", JoinedAt = Utc(3, 15) },
            new InitiativeMember { InitiativeId = 3, UserId = 4, Role = "miembro", JoinedAt = Utc(5, 9) },
            new InitiativeMember { InitiativeId = 4, UserId = 4, Role = "propietario", JoinedAt = Utc(4, 15) }
        );

        mb.Entity<Request>().HasData(
            new Request
            {
                Id = 1, InitiativeId = 2, ApplicantId = 2,
                Message = "Me interesa aportar con el diseño del modelo de datos del proyecto.",
                MainSkill = "Bases de datos", DesiredRole = "Diseñadora de base de datos", Availability = "alta",
                Status = "pendiente", CreatedAt = Utc(6, 10), UpdatedAt = Utc(6, 10), ResolvedAt = null
            },
            new Request
            {
                Id = 2, InitiativeId = 3, ApplicantId = 1,
                Message = "Quiero construir la interfaz de visualizacion de datos con React.",
                MainSkill = "React", DesiredRole = "Desarrolladora frontend", Availability = "media",
                Status = "rechazada", CreatedAt = Utc(6, 11), UpdatedAt = Utc(7, 9), ResolvedAt = Utc(7, 9)
            }
        );

        // RN-09: la iniciativa 1 tiene 3 miembros, puede ser proyecto
        mb.Entity<Project>().HasData(
            new Project
            {
                Id = 1, InitiativeId = 1, OwnerId = 3, Name = "Voluntariado Conectado",
                Description = "Plataforma para publicar turnos de voluntariado, asignar participantes y registrar las horas cumplidas.",
                Objective = "Reducir los turnos duplicados y automatizar el registro de horas para certificados.",
                StartDate = new DateOnly(2026, 10, 10), Status = "activo",
                RepositoryUrl = "https://github.com/vitejs/vite", CreatedAt = Utc(8, 15)
            }
        );
    }
}
