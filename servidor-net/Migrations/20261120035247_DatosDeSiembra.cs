using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ServidorNet.Migrations
{
    /// <inheritdoc />
    public partial class DatosDeSiembra : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Skills",
                columns: new[] { "Id", "Key", "Name" },
                values: new object[,]
                {
                    { 1, "react", "React" },
                    { 2, "sql", "SQL" },
                    { 3, "bases de datos", "Bases de datos" },
                    { 4, "node.js", "Node.js" },
                    { 5, "diseno de interfaces", "Diseño de interfaces" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Availability", "Bio", "Career", "CreatedAt", "Email", "Name", "PasswordHash", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "media", "", "Ingenieria de Software", new DateTime(2026, 10, 1, 10, 0, 0, 0, DateTimeKind.Utc), "andreina.leal@example.com", "Andreina Leal", null, new DateTime(2026, 10, 1, 10, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, "alta", "", "Ingenieria de Software", new DateTime(2026, 10, 1, 11, 0, 0, 0, DateTimeKind.Utc), "tatiana.solis@example.com", "Tatiana Solis", null, new DateTime(2026, 10, 1, 11, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, "baja", "", "Administracion de Empresas", new DateTime(2026, 10, 1, 12, 0, 0, 0, DateTimeKind.Utc), "carlos.mora@example.com", "Carlos Mora", null, new DateTime(2026, 10, 1, 12, 0, 0, 0, DateTimeKind.Utc) },
                    { 4, "media", "", "Diseno Grafico", new DateTime(2026, 10, 1, 13, 0, 0, 0, DateTimeKind.Utc), "daniela.rojas@example.com", "Daniela Rojas", null, new DateTime(2026, 10, 1, 13, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.InsertData(
                table: "Initiatives",
                columns: new[] { "Id", "Archived", "Beneficiaries", "Category", "CreatedAt", "Description", "OwnerId", "Problem", "Status", "Summary", "TargetMembers", "Title", "Type", "UpdatedAt", "Visibility" },
                values: new object[,]
                {
                    { 1, false, "", "impacto-social", new DateTime(2026, 10, 1, 15, 0, 0, 0, DateTimeKind.Utc), "Plataforma para publicar turnos de voluntariado, asignar participantes y registrar las horas cumplidas.", 3, "", "en-progreso", "Plataforma para organizar turnos de voluntariado y registrar horas.", 5, "Voluntariado Conectado", "reto", new DateTime(2026, 10, 1, 15, 0, 0, 0, DateTimeKind.Utc), "publica" },
                    { 2, false, "", "educacion", new DateTime(2026, 10, 2, 15, 0, 0, 0, DateTimeKind.Utc), "Repositorio donde estudiantes publican y valoran material de estudio de libre acceso.", 1, "", "buscando-equipo", "Repositorio compartido de material de estudio entre carreras.", 4, "Biblioteca de recursos abiertos", "idea", new DateTime(2026, 10, 2, 15, 0, 0, 0, DateTimeKind.Utc), "institucional" },
                    { 3, false, "", "tecnologia", new DateTime(2026, 10, 3, 15, 0, 0, 0, DateTimeKind.Utc), "Un panel que reune datos anonimizados del campus para que estudiantes analicen y propongan mejoras.", 2, "", "buscando-equipo", "Panel con datos abiertos del campus para investigacion estudiantil.", 6, "Laboratorio de datos del campus", "necesidad", new DateTime(2026, 10, 3, 15, 0, 0, 0, DateTimeKind.Utc), "restringida" },
                    { 4, false, "", "sostenibilidad", new DateTime(2026, 10, 4, 15, 0, 0, 0, DateTimeKind.Utc), "Disenar y mantener una huerta en el campus con turnos de cuidado y registro de cosechas.", 4, "", "buscando-equipo", "Huerta comunitaria cuidada por estudiantes de varias carreras.", 3, "Huerta universitaria", "reto", new DateTime(2026, 10, 4, 15, 0, 0, 0, DateTimeKind.Utc), "privada" }
                });

            migrationBuilder.InsertData(
                table: "UserSkills",
                columns: new[] { "SkillId", "UserId" },
                values: new object[,]
                {
                    { 1, 1 },
                    { 2, 2 },
                    { 3, 2 },
                    { 4, 1 },
                    { 4, 3 },
                    { 5, 1 },
                    { 5, 4 }
                });

            migrationBuilder.InsertData(
                table: "InitiativeMembers",
                columns: new[] { "InitiativeId", "UserId", "JoinedAt", "Role" },
                values: new object[,]
                {
                    { 1, 1, new DateTime(2026, 10, 3, 9, 0, 0, 0, DateTimeKind.Utc), "miembro" },
                    { 1, 2, new DateTime(2026, 10, 4, 9, 0, 0, 0, DateTimeKind.Utc), "miembro" },
                    { 1, 3, new DateTime(2026, 10, 1, 15, 0, 0, 0, DateTimeKind.Utc), "propietario" },
                    { 2, 1, new DateTime(2026, 10, 2, 15, 0, 0, 0, DateTimeKind.Utc), "propietario" },
                    { 3, 2, new DateTime(2026, 10, 3, 15, 0, 0, 0, DateTimeKind.Utc), "propietario" },
                    { 3, 4, new DateTime(2026, 10, 5, 9, 0, 0, 0, DateTimeKind.Utc), "miembro" },
                    { 4, 4, new DateTime(2026, 10, 4, 15, 0, 0, 0, DateTimeKind.Utc), "propietario" }
                });

            migrationBuilder.InsertData(
                table: "InitiativeSkills",
                columns: new[] { "InitiativeId", "SkillId" },
                values: new object[,]
                {
                    { 1, 1 },
                    { 1, 3 },
                    { 2, 1 },
                    { 2, 5 },
                    { 3, 2 },
                    { 3, 3 },
                    { 3, 4 },
                    { 4, 5 }
                });

            migrationBuilder.InsertData(
                table: "InitiativeTags",
                columns: new[] { "InitiativeId", "Value" },
                values: new object[,]
                {
                    { 1, "comunidad" },
                    { 1, "voluntariado" },
                    { 2, "educacion" },
                    { 3, "datos" },
                    { 4, "sostenibilidad" }
                });

            migrationBuilder.InsertData(
                table: "Projects",
                columns: new[] { "Id", "CreatedAt", "Description", "InitiativeId", "Name", "Objective", "OwnerId", "RepositoryUrl", "StartDate", "Status" },
                values: new object[] { 1, new DateTime(2026, 10, 8, 15, 0, 0, 0, DateTimeKind.Utc), "Plataforma para publicar turnos de voluntariado, asignar participantes y registrar las horas cumplidas.", 1, "Voluntariado Conectado", "Reducir los turnos duplicados y automatizar el registro de horas para certificados.", 3, "https://github.com/vitejs/vite", new DateOnly(2026, 10, 10), "activo" });

            migrationBuilder.InsertData(
                table: "Requests",
                columns: new[] { "Id", "ApplicantId", "Availability", "CreatedAt", "DesiredRole", "InitiativeId", "MainSkill", "Message", "ResolvedAt", "Status", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, 2, "alta", new DateTime(2026, 10, 6, 10, 0, 0, 0, DateTimeKind.Utc), "Diseñadora de base de datos", 2, "Bases de datos", "Me interesa aportar con el diseño del modelo de datos del proyecto.", null, "pendiente", new DateTime(2026, 10, 6, 10, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, 1, "media", new DateTime(2026, 10, 6, 11, 0, 0, 0, DateTimeKind.Utc), "Desarrolladora frontend", 3, "React", "Quiero construir la interfaz de visualizacion de datos con React.", new DateTime(2026, 10, 7, 9, 0, 0, 0, DateTimeKind.Utc), "rechazada", new DateTime(2026, 10, 7, 9, 0, 0, 0, DateTimeKind.Utc) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "InitiativeMembers",
                keyColumns: new[] { "InitiativeId", "UserId" },
                keyValues: new object[] { 1, 1 });

            migrationBuilder.DeleteData(
                table: "InitiativeMembers",
                keyColumns: new[] { "InitiativeId", "UserId" },
                keyValues: new object[] { 1, 2 });

            migrationBuilder.DeleteData(
                table: "InitiativeMembers",
                keyColumns: new[] { "InitiativeId", "UserId" },
                keyValues: new object[] { 1, 3 });

            migrationBuilder.DeleteData(
                table: "InitiativeMembers",
                keyColumns: new[] { "InitiativeId", "UserId" },
                keyValues: new object[] { 2, 1 });

            migrationBuilder.DeleteData(
                table: "InitiativeMembers",
                keyColumns: new[] { "InitiativeId", "UserId" },
                keyValues: new object[] { 3, 2 });

            migrationBuilder.DeleteData(
                table: "InitiativeMembers",
                keyColumns: new[] { "InitiativeId", "UserId" },
                keyValues: new object[] { 3, 4 });

            migrationBuilder.DeleteData(
                table: "InitiativeMembers",
                keyColumns: new[] { "InitiativeId", "UserId" },
                keyValues: new object[] { 4, 4 });

            migrationBuilder.DeleteData(
                table: "InitiativeSkills",
                keyColumns: new[] { "InitiativeId", "SkillId" },
                keyValues: new object[] { 1, 1 });

            migrationBuilder.DeleteData(
                table: "InitiativeSkills",
                keyColumns: new[] { "InitiativeId", "SkillId" },
                keyValues: new object[] { 1, 3 });

            migrationBuilder.DeleteData(
                table: "InitiativeSkills",
                keyColumns: new[] { "InitiativeId", "SkillId" },
                keyValues: new object[] { 2, 1 });

            migrationBuilder.DeleteData(
                table: "InitiativeSkills",
                keyColumns: new[] { "InitiativeId", "SkillId" },
                keyValues: new object[] { 2, 5 });

            migrationBuilder.DeleteData(
                table: "InitiativeSkills",
                keyColumns: new[] { "InitiativeId", "SkillId" },
                keyValues: new object[] { 3, 2 });

            migrationBuilder.DeleteData(
                table: "InitiativeSkills",
                keyColumns: new[] { "InitiativeId", "SkillId" },
                keyValues: new object[] { 3, 3 });

            migrationBuilder.DeleteData(
                table: "InitiativeSkills",
                keyColumns: new[] { "InitiativeId", "SkillId" },
                keyValues: new object[] { 3, 4 });

            migrationBuilder.DeleteData(
                table: "InitiativeSkills",
                keyColumns: new[] { "InitiativeId", "SkillId" },
                keyValues: new object[] { 4, 5 });

            migrationBuilder.DeleteData(
                table: "InitiativeTags",
                keyColumns: new[] { "InitiativeId", "Value" },
                keyValues: new object[] { 1, "comunidad" });

            migrationBuilder.DeleteData(
                table: "InitiativeTags",
                keyColumns: new[] { "InitiativeId", "Value" },
                keyValues: new object[] { 1, "voluntariado" });

            migrationBuilder.DeleteData(
                table: "InitiativeTags",
                keyColumns: new[] { "InitiativeId", "Value" },
                keyValues: new object[] { 2, "educacion" });

            migrationBuilder.DeleteData(
                table: "InitiativeTags",
                keyColumns: new[] { "InitiativeId", "Value" },
                keyValues: new object[] { 3, "datos" });

            migrationBuilder.DeleteData(
                table: "InitiativeTags",
                keyColumns: new[] { "InitiativeId", "Value" },
                keyValues: new object[] { 4, "sostenibilidad" });

            migrationBuilder.DeleteData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Requests",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Requests",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "UserSkills",
                keyColumns: new[] { "SkillId", "UserId" },
                keyValues: new object[] { 1, 1 });

            migrationBuilder.DeleteData(
                table: "UserSkills",
                keyColumns: new[] { "SkillId", "UserId" },
                keyValues: new object[] { 2, 2 });

            migrationBuilder.DeleteData(
                table: "UserSkills",
                keyColumns: new[] { "SkillId", "UserId" },
                keyValues: new object[] { 3, 2 });

            migrationBuilder.DeleteData(
                table: "UserSkills",
                keyColumns: new[] { "SkillId", "UserId" },
                keyValues: new object[] { 4, 1 });

            migrationBuilder.DeleteData(
                table: "UserSkills",
                keyColumns: new[] { "SkillId", "UserId" },
                keyValues: new object[] { 4, 3 });

            migrationBuilder.DeleteData(
                table: "UserSkills",
                keyColumns: new[] { "SkillId", "UserId" },
                keyValues: new object[] { 5, 1 });

            migrationBuilder.DeleteData(
                table: "UserSkills",
                keyColumns: new[] { "SkillId", "UserId" },
                keyValues: new object[] { 5, 4 });

            migrationBuilder.DeleteData(
                table: "Initiatives",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Initiatives",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Initiatives",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Initiatives",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Skills",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Skills",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Skills",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Skills",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Skills",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4);
        }
    }
}
