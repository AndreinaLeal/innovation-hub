// Carga datos de prueba. Uso: npm run seed   (BORRA y recrea las colecciones)
// Reutiliza los datos simulados del Avance 1 (avance1/datos/iniciativas.json).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { env } from "../src/config/env.js";
import { User } from "../src/models/User.js";
import { Skill, normalizeSkill } from "../src/models/Skill.js";
import { Session } from "../src/models/Session.js";
import { Initiative } from "../src/models/Initiative.js";
import { Request } from "../src/models/Request.js";
import { Project } from "../src/models/Project.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const avance1 = JSON.parse(fs.readFileSync(path.join(here, "../../avance1/datos/iniciativas.json"), "utf8"));
const PASSWORD = "Password123";

const slug = (n) => normalizeSkill(n).replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "");

await mongoose.connect(env.mongoUri);
await Promise.all([User, Skill, Session, Initiative, Request, Project].map((m) => m.deleteMany({})));

// Competencias (incluye las que pidió el docente como ejemplo)
const extraSkills = ["Bases de datos", "SQL", "Programación orientada a objetos", "Node.js", "React", "Diseño de interfaces"];
const allSkillNames = [...new Set([...extraSkills, ...avance1.flatMap((i) => i.competencias)])];
const skills = {};
for (const name of allSkillNames) {
  skills[name] = await Skill.create({ name, key: normalizeSkill(name) });
}

// Usuarios: autores y miembros del Avance 1 + las estudiantes del equipo
const names = [...new Set([...avance1.map((i) => i.autor), ...avance1.flatMap((i) => i.miembros ?? []), "Tatiana Solis", "Andreina Leal"])];
const passwordHash = await bcrypt.hash(PASSWORD, 10);
const users = {};
const userSkills = {
  "Tatiana Solis": ["Bases de datos", "SQL", "Programación orientada a objetos"],
  "Andreina Leal": ["React", "Diseño de interfaces", "Node.js"],
};
for (const name of names) {
  users[name] = await User.create({
    name,
    email: `${slug(name)}@example.com`,
    passwordHash,
    career: "Ingeniería de Software",
    availability: ["alta", "media", "baja"][name.length % 3],
    skills: (userSkills[name] ?? ["Node.js"]).map((s) => skills[s]._id),
  });
}

// Iniciativas
const byOldId = {};
for (const old of avance1) {
  const owner = users[old.autor];
  const memberNames = [...new Set([old.autor, ...(old.miembros ?? [])])];
  byOldId[old.id] = await Initiative.create({
    owner: owner._id,
    title: old.titulo,
    type: old.tipo,
    category: old.categoria,
    summary: old.resumen.slice(0, 160),
    description: old.descripcion,
    visibility: old.visibilidad,
    status: old.estado,
    targetMembers: old.miembrosMeta,
    skills: old.competencias.map((c) => skills[c]._id),
    members: memberNames.map((n) => ({ user: users[n]._id, role: n === old.autor ? "propietario" : "miembro" })),
    createdAt: new Date(old.fecha),
  });
}

// Solicitudes de ejemplo
await Request.create([
  { initiative: byOldId[2]._id, applicant: users["Tatiana Solis"]._id, message: "Me interesa aportar con el diseño del modelo de datos del proyecto.", mainSkill: "Bases de datos", desiredRole: "Diseñadora de base de datos", availability: "alta" },
  { initiative: byOldId[5]._id, applicant: users["Andreina Leal"]._id, message: "Quiero construir la interfaz de visualización de datos con React.", mainSkill: "React", desiredRole: "Desarrolladora frontend", availability: "media" },
  { initiative: byOldId[8]._id, applicant: users["Tatiana Solis"]._id, message: "Tengo experiencia con SQL y puedo ayudar con el inventario.", mainSkill: "SQL", desiredRole: "Analista de datos", availability: "baja", status: "rechazada", resolvedAt: new Date() },
]);

// Un proyecto (iniciativa 1 tiene equipo de 3)
await Project.create({
  initiative: byOldId[1]._id,
  owner: users[avance1[0].autor]._id,
  name: "Voluntariado Conectado",
  description: "Plataforma para publicar turnos de voluntariado, asignar participantes y registrar las horas cumplidas.",
  objective: "Reducir los turnos duplicados y automatizar el registro de horas para certificados.",
  startDate: new Date("2026-10-01T00:00:00Z"),
  status: "activo",
  repositoryUrl: "https://github.com/vitejs/vite",
});

console.log(`Datos de prueba cargados. Usuarios de ejemplo (contraseña ${PASSWORD}):`);
console.log(" - tatiana.solis@example.com  (con solicitudes enviadas)");
console.log(" - andreina.leal@example.com");
console.log(` - ${slug(avance1[1].autor)}@example.com  (propietario de una iniciativa con solicitud recibida)`);
await mongoose.disconnect();
