namespace ServidorNet.Modelos;

public class Skill
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    // Nombre normalizado (minusculas, sin tildes): evita "SQL" y "sql" como competencias distintas
    public string Key { get; set; } = "";

    public List<User> Users { get; set; } = [];
    public List<Initiative> Initiatives { get; set; } = [];
}
