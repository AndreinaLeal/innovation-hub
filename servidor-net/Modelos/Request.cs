namespace ServidorNet.Modelos;

public class Request
{
    public int Id { get; set; }
    public int InitiativeId { get; set; }
    public int ApplicantId { get; set; }
    public string Message { get; set; } = "";
    public string MainSkill { get; set; } = "";
    public string DesiredRole { get; set; } = "";
    public string Availability { get; set; } = "media";
    public string Status { get; set; } = "pendiente";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }

    public Initiative Initiative { get; set; } = null!;
    public User Applicant { get; set; } = null!;
}
