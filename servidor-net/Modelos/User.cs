namespace ServidorNet.Modelos;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    // Nulo hasta la entrega final: la autenticacion todavia no existe
    public string? PasswordHash { get; set; }
    public string Career { get; set; } = "";
    public string Bio { get; set; } = "";
    public string Availability { get; set; } = "media";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // N:M usuario-competencia (tabla intermedia sin clase: UserSkills)
    public List<Skill> Skills { get; set; } = [];
    // 1:N propietario-iniciativas
    public List<Initiative> OwnedInitiatives { get; set; } = [];
    // N:M usuario-iniciativa con datos propios (entidad intermedia)
    public List<InitiativeMember> Memberships { get; set; } = [];

    // 1:N solicitante-solicitudes
    public List<Request> Requests { get; set; } = [];
    // 1:N propietario-proyectos
    public List<Project> OwnedProjects { get; set; } = [];
}
