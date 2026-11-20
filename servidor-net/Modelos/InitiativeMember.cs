namespace ServidorNet.Modelos;

// Entidad intermedia usuario-iniciativa: la relacion tiene datos propios (rol y fecha de ingreso)
public class InitiativeMember
{
    public int InitiativeId { get; set; }
    public int UserId { get; set; }
    public string Role { get; set; } = "miembro";
    public DateTime JoinedAt { get; set; }

    public Initiative Initiative { get; set; } = null!;
    public User User { get; set; } = null!;
}
