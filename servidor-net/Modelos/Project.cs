namespace ServidorNet.Modelos;

public class Project
{
    public int Id { get; set; }
    public int InitiativeId { get; set; }
    public int OwnerId { get; set; }
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string Objective { get; set; } = "";
    public DateOnly StartDate { get; set; }
    public string Status { get; set; } = "planificacion";
    public string RepositoryUrl { get; set; } = "";
    public DateTime CreatedAt { get; set; }

    public Initiative Initiative { get; set; } = null!;
    public User Owner { get; set; } = null!;
}
