namespace ServidorNet.Modelos;

public class Initiative
{
    public int Id { get; set; }
    public int OwnerId { get; set; }
    public string Title { get; set; } = "";
    public string Type { get; set; } = "";
    public string Category { get; set; } = "";
    public string Summary { get; set; } = "";
    public string Description { get; set; } = "";
    public string Problem { get; set; } = "";
    public string Beneficiaries { get; set; } = "";
    public string Visibility { get; set; } = "";
    public string Status { get; set; } = "buscando-equipo";
    public int TargetMembers { get; set; }
    public bool Archived { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User Owner { get; set; } = null!;
    // N:M iniciativa-competencia (tabla intermedia sin clase: InitiativeSkills)
    public List<Skill> Skills { get; set; } = [];
    // Arreglo tags[] del documento: una fila por etiqueta
    public List<InitiativeTag> Tags { get; set; } = [];
    // Equipo: antes members[] embebido, ahora entidad intermedia con rol y fecha
    public List<InitiativeMember> Members { get; set; } = [];
}
