/* =====================================================================
   consultas.sql - Innovation Hub (SQL Server)
   Base: InnovationHub  |  Datos: los de siembra (HasData)
   Ejecutar con SSMS, Azure Data Studio o:
     sqlcmd -S .\SQLEXPRESS -E -d InnovationHub -i sql/consultas.sql
   ===================================================================== */

/* ---------------------------------------------------------------------
   1) JOIN sobre una relacion 1 a muchos: iniciativa -> propietario
   Un usuario puede ser propietario de muchas iniciativas; cada iniciativa
   tiene un solo propietario (RN-01), por la clave foranea OwnerId.

   Resultado esperado (4 filas):
     Id | Title                            | Owner
     1  | Voluntariado Conectado           | Carlos Mora
     2  | Biblioteca de recursos abiertos  | Andreina Leal
     3  | Laboratorio de datos del campus  | Tatiana Solis
     4  | Huerta universitaria             | Daniela Rojas
   --------------------------------------------------------------------- */
SELECT i.Id, i.Title, u.Name AS Owner
FROM Initiatives AS i
JOIN Users AS u ON u.Id = i.OwnerId
ORDER BY i.Id;

/* ---------------------------------------------------------------------
   2) Recorrido de una relacion muchos a muchos: iniciativa -> competencias
   Pasa por la tabla intermedia InitiativeSkills.

   Resultado esperado (8 filas):
     Title                            | Skill
     Voluntariado Conectado           | React
     Voluntariado Conectado           | Bases de datos
     Biblioteca de recursos abiertos  | React
     Biblioteca de recursos abiertos  | Diseño de interfaces
     Laboratorio de datos del campus  | SQL
     Laboratorio de datos del campus  | Bases de datos
     Laboratorio de datos del campus  | Node.js
     Huerta universitaria             | Diseño de interfaces
   --------------------------------------------------------------------- */
SELECT i.Title, s.Name AS Skill
FROM Initiatives AS i
JOIN InitiativeSkills AS isk ON isk.InitiativeId = i.Id
JOIN Skills AS s ON s.Id = isk.SkillId
ORDER BY i.Id, s.Id;

/* ---------------------------------------------------------------------
   3) Conteo con GROUP BY: miembros por iniciativa (entidad intermedia
   InitiativeMembers, que tiene rol y fecha de ingreso).

   Resultado esperado (4 filas):
     Title                            | Members
     Voluntariado Conectado           | 3
     Biblioteca de recursos abiertos  | 1
     Laboratorio de datos del campus  | 2
     Huerta universitaria             | 1
   --------------------------------------------------------------------- */
SELECT i.Title, COUNT(m.UserId) AS Members
FROM Initiatives AS i
LEFT JOIN InitiativeMembers AS m ON m.InitiativeId = i.Id
GROUP BY i.Id, i.Title
ORDER BY i.Id;

/* ---------------------------------------------------------------------
   4) Intentos que violan una restriccion (cada uno se ejecuta POR SEPARADO
   y debe fallar; no se guarda ninguna fila).

   4a) CHECK: estado de solicitud fuera del catalogo.
   Resultado esperado: error 547
     The INSERT statement conflicted with the CHECK constraint "CK_Requests_Status".
   --------------------------------------------------------------------- */
INSERT INTO Requests (InitiativeId, ApplicantId, Message, MainSkill, DesiredRole, Availability, Status)
VALUES (2, 3, 'Mensaje de prueba con mas de veinte caracteres', 'React', 'Desarrollador', 'alta', 'inventado');

/* 4b) Indice unico filtrado (RN-05): segunda solicitud PENDIENTE de la misma
   persona (Tatiana, id 2) a la misma iniciativa (2). Ya existe la solicitud 1.
   Resultado esperado: error 2601
     Cannot insert duplicate key row in object 'dbo.Requests' with unique index
     'IX_Requests_InitiativeId_ApplicantId'. */
INSERT INTO Requests (InitiativeId, ApplicantId, Message, MainSkill, DesiredRole, Availability, Status)
VALUES (2, 2, 'Segunda solicitud pendiente de la misma persona', 'SQL', 'Analista', 'media', 'pendiente');

/* 4c) Clave foranea con Restrict: borrar un usuario que es propietario de una iniciativa.
   Resultado esperado: error 547
     The DELETE statement conflicted with the REFERENCE constraint "FK_Initiatives_Users_OwnerId". */
DELETE FROM Users WHERE Id = 3;
