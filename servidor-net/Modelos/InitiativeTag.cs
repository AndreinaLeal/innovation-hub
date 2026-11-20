namespace ServidorNet.Modelos;

public class InitiativeTag
{
    public int InitiativeId { get; set; }
    public string Value { get; set; } = "";

    public Initiative Initiative { get; set; } = null!;
}
