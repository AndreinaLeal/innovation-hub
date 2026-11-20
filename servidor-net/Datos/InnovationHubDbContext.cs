using Microsoft.EntityFrameworkCore;
using ServidorNet.Modelos;

namespace ServidorNet.Datos;

public class InnovationHubDbContext(DbContextOptions<InnovationHubDbContext> opciones) : DbContext(opciones)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<Initiative> Initiatives => Set<Initiative>();
    public DbSet<InitiativeMember> InitiativeMembers => Set<InitiativeMember>();
    public DbSet<InitiativeTag> InitiativeTags => Set<InitiativeTag>();
    public DbSet<Request> Requests => Set<Request>();
    public DbSet<Project> Projects => Set<Project>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ---------- users ----------
        modelBuilder.Entity<User>(u =>
        {
            u.Property(x => x.Name).HasMaxLength(80).IsRequired();
            u.Property(x => x.Email).HasMaxLength(120).IsRequired();
            u.Property(x => x.PasswordHash).HasMaxLength(100);
            u.Property(x => x.Career).HasMaxLength(80).IsRequired();
            u.Property(x => x.Bio).HasMaxLength(400).IsRequired();
            u.Property(x => x.Availability).HasMaxLength(5).IsRequired();
            u.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            u.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

            u.HasIndex(x => x.Email).IsUnique();
            u.HasIndex(x => x.Name);

            u.ToTable(t => t.HasCheckConstraint("CK_Users_Availability",
                "[Availability] IN ('alta', 'media', 'baja')"));

            // N:M usuario-competencia: tabla intermedia sin clase (no tiene datos propios)
            u.HasMany(x => x.Skills).WithMany(s => s.Users).UsingEntity<Dictionary<string, object>>(
                "UserSkills",
                j => j.HasOne<Skill>().WithMany().HasForeignKey("SkillId").OnDelete(DeleteBehavior.Restrict),
                j => j.HasOne<User>().WithMany().HasForeignKey("UserId").OnDelete(DeleteBehavior.Cascade));
        });

        // ---------- skills ----------
        modelBuilder.Entity<Skill>(s =>
        {
            s.Property(x => x.Name).HasMaxLength(60).IsRequired();
            s.Property(x => x.Key).HasMaxLength(60).IsRequired();
            s.HasIndex(x => x.Key).IsUnique();
        });

        // ---------- initiatives ----------
        modelBuilder.Entity<Initiative>(i =>
        {
            i.Property(x => x.Title).HasMaxLength(120).IsRequired();
            i.Property(x => x.Type).HasMaxLength(10).IsRequired();
            i.Property(x => x.Category).HasMaxLength(30).IsRequired();
            i.Property(x => x.Summary).HasMaxLength(160).IsRequired();
            i.Property(x => x.Description).HasMaxLength(4000).IsRequired();
            i.Property(x => x.Problem).HasMaxLength(1500).IsRequired();
            i.Property(x => x.Beneficiaries).HasMaxLength(300).IsRequired();
            i.Property(x => x.Visibility).HasMaxLength(15).IsRequired();
            i.Property(x => x.Status).HasMaxLength(20).IsRequired();
            i.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            i.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

            i.HasIndex(x => x.OwnerId);
            i.HasIndex(x => x.Archived);
            i.HasIndex(x => new { x.Type, x.Category, x.CreatedAt });

            i.ToTable(t =>
            {
                t.HasCheckConstraint("CK_Initiatives_Type", "[Type] IN ('idea', 'necesidad', 'reto')");
                t.HasCheckConstraint("CK_Initiatives_Category",
                    "[Category] IN ('tecnologia', 'educacion', 'sostenibilidad', 'impacto-social', " +
                    "'negocios-emprendimiento', 'salud-bienestar', 'cultura-creatividad', 'otro')");
                t.HasCheckConstraint("CK_Initiatives_Visibility",
                    "[Visibility] IN ('publica', 'institucional', 'restringida', 'privada')");
                t.HasCheckConstraint("CK_Initiatives_Status",
                    "[Status] IN ('buscando-equipo', 'en-progreso', 'pausada', 'completada')");
                t.HasCheckConstraint("CK_Initiatives_TargetMembers", "[TargetMembers] BETWEEN 1 AND 20");
            });

            // RN-01: el propietario es obligatorio y no se puede borrar un usuario que es propietario
            i.HasOne(x => x.Owner).WithMany(u => u.OwnedInitiatives)
                .HasForeignKey(x => x.OwnerId).OnDelete(DeleteBehavior.Restrict);

            // N:M iniciativa-competencia: tabla intermedia sin clase
            i.HasMany(x => x.Skills).WithMany(s => s.Initiatives).UsingEntity<Dictionary<string, object>>(
                "InitiativeSkills",
                j => j.HasOne<Skill>().WithMany().HasForeignKey("SkillId").OnDelete(DeleteBehavior.Restrict),
                j => j.HasOne<Initiative>().WithMany().HasForeignKey("InitiativeId").OnDelete(DeleteBehavior.Cascade));
        });

        // ---------- initiative_tags ----------
        modelBuilder.Entity<InitiativeTag>(t =>
        {
            t.HasKey(x => new { x.InitiativeId, x.Value });
            t.Property(x => x.Value).HasMaxLength(40).IsRequired();
            t.HasOne(x => x.Initiative).WithMany(i => i.Tags)
                .HasForeignKey(x => x.InitiativeId).OnDelete(DeleteBehavior.Cascade);
        });

        // ---------- initiative_members (entidad intermedia con rol y fecha) ----------
        modelBuilder.Entity<InitiativeMember>(m =>
        {
            m.HasKey(x => new { x.InitiativeId, x.UserId });
            m.Property(x => x.Role).HasMaxLength(11).IsRequired();
            m.Property(x => x.JoinedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            m.HasIndex(x => x.UserId);

            m.ToTable(t => t.HasCheckConstraint("CK_InitiativeMembers_Role",
                "[Role] IN ('propietario', 'miembro')"));

            m.HasOne(x => x.Initiative).WithMany(i => i.Members)
                .HasForeignKey(x => x.InitiativeId).OnDelete(DeleteBehavior.Cascade);
            m.HasOne(x => x.User).WithMany(u => u.Memberships)
                .HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
        });

        // ---------- requests ----------
        modelBuilder.Entity<Request>(r =>
        {
            r.Property(x => x.Message).HasMaxLength(600).IsRequired();
            r.Property(x => x.MainSkill).HasMaxLength(60).IsRequired();
            r.Property(x => x.DesiredRole).HasMaxLength(80).IsRequired();
            r.Property(x => x.Availability).HasMaxLength(5).IsRequired();
            r.Property(x => x.Status).HasMaxLength(10).IsRequired();
            r.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            r.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

            r.HasIndex(x => x.InitiativeId);
            r.HasIndex(x => x.ApplicantId);

            // RN-05: una sola solicitud pendiente por persona e iniciativa (indice unico filtrado)
            r.HasIndex(x => new { x.InitiativeId, x.ApplicantId })
                .IsUnique()
                .HasFilter("[Status] = 'pendiente'");

            r.ToTable(t =>
            {
                t.HasCheckConstraint("CK_Requests_Status",
                    "[Status] IN ('pendiente', 'aceptada', 'rechazada', 'cancelada')");
                t.HasCheckConstraint("CK_Requests_Availability",
                    "[Availability] IN ('alta', 'media', 'baja')");
            });

            // Las solicitudes son historial: no se borran en cascada (RN-10 archiva en lugar de eliminar)
            r.HasOne(x => x.Initiative).WithMany(i => i.Requests)
                .HasForeignKey(x => x.InitiativeId).OnDelete(DeleteBehavior.Restrict);
            r.HasOne(x => x.Applicant).WithMany(u => u.Requests)
                .HasForeignKey(x => x.ApplicantId).OnDelete(DeleteBehavior.Restrict);
        });

        // ---------- projects ----------
        modelBuilder.Entity<Project>(p =>
        {
            p.Property(x => x.Name).HasMaxLength(120).IsRequired();
            p.Property(x => x.Description).HasMaxLength(2000).IsRequired();
            p.Property(x => x.Objective).HasMaxLength(500).IsRequired();
            p.Property(x => x.Status).HasMaxLength(13).IsRequired();
            p.Property(x => x.RepositoryUrl).HasMaxLength(200).IsRequired();
            p.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

            p.HasIndex(x => x.OwnerId);
            // RN-09: una iniciativa se convierte como maximo una vez
            p.HasIndex(x => x.InitiativeId).IsUnique();

            p.ToTable(t => t.HasCheckConstraint("CK_Projects_Status",
                "[Status] IN ('planificacion', 'activo', 'finalizado')"));

            p.HasOne(x => x.Initiative).WithOne(i => i.Project)
                .HasForeignKey<Project>(x => x.InitiativeId).OnDelete(DeleteBehavior.Restrict);
            p.HasOne(x => x.Owner).WithMany(u => u.OwnedProjects)
                .HasForeignKey(x => x.OwnerId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
