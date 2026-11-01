// Convierte documentos de Mongo en el formato del contrato (ver docs/api-contract.md).
// Nunca se exponen _id, __v, passwordHash ni campos internos.

const idOf = (v) => String(v?._id ?? v);
const iso = (d) => (d ? new Date(d).toISOString() : null);
const skillNames = (skills = []) => skills.map((s) => s.name).filter(Boolean);

export function userPublic(u) {
  return {
    id: idOf(u),
    name: u.name,
    career: u.career || "",
    bio: u.bio || "",
    availability: u.availability,
    skills: skillNames(u.skills),
  };
}

export function userPrivate(u) {
  return { ...userPublic(u), email: u.email, createdAt: iso(u.createdAt) };
}

const ownerRef = (o) => ({ id: idOf(o), name: o?.name ?? "" });

export function initiativeSummary(ini, { restricted = false } = {}) {
  return {
    id: idOf(ini),
    title: ini.title,
    type: ini.type,
    category: ini.category,
    summary: ini.summary,
    visibility: ini.visibility,
    status: ini.status,
    archived: ini.archived,
    targetMembers: ini.targetMembers,
    memberCount: ini.members.length,
    skills: restricted ? [] : skillNames(ini.skills),
    owner: ownerRef(ini.owner),
    createdAt: iso(ini.createdAt),
    updatedAt: iso(ini.updatedAt),
  };
}

export function initiativeDetail(ini, { level, viewerId }) {
  const restricted = level === "summary";
  const base = initiativeSummary(ini, { restricted });
  const isOwner = Boolean(viewerId) && idOf(ini.owner) === String(viewerId);
  const isMember = Boolean(viewerId) && ini.members.some((m) => idOf(m.user) === String(viewerId));
  if (restricted) return { ...base, restricted: true, isOwner, isMember };
  return {
    ...base,
    restricted: false,
    description: ini.description,
    problem: ini.problem || "",
    beneficiaries: ini.beneficiaries || "",
    tags: ini.tags || [],
    members: ini.members.map(memberDto),
    isOwner,
    isMember,
  };
}

export const memberDto = (m) => ({
  userId: idOf(m.user),
  name: m.user?.name ?? "",
  role: m.role,
  joinedAt: iso(m.joinedAt),
});

export function requestDto(r) {
  return {
    id: idOf(r),
    initiative: { id: idOf(r.initiative), title: r.initiative?.title ?? "" },
    applicant: {
      id: idOf(r.applicant),
      name: r.applicant?.name ?? "",
      career: r.applicant?.career ?? "",
    },
    message: r.message,
    mainSkill: r.mainSkill,
    desiredRole: r.desiredRole,
    availability: r.availability,
    status: r.status,
    createdAt: iso(r.createdAt),
    updatedAt: iso(r.updatedAt),
    resolvedAt: iso(r.resolvedAt),
  };
}

export function projectDto(p, { withMembers = false } = {}) {
  const ini = p.initiative;
  const dto = {
    id: idOf(p),
    initiative: { id: idOf(ini), title: ini?.title ?? "" },
    owner: ownerRef(p.owner),
    name: p.name,
    description: p.description,
    objective: p.objective,
    startDate: iso(p.startDate)?.slice(0, 10),
    status: p.status,
    repositoryUrl: p.repositoryUrl || "",
    memberCount: ini?.members?.length ?? 0,
    createdAt: iso(p.createdAt),
  };
  if (withMembers) dto.members = (ini?.members ?? []).map(memberDto);
  return dto;
}
