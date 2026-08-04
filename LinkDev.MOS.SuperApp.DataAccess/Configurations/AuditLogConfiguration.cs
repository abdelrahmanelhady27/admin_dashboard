using LinkDev.MOS.SuperApp.Domain.Entities.AuditLog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LinkDev.MOS.SuperApp.DataAccess.Configurations
{
    public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
    {
        public void Configure(EntityTypeBuilder<AuditLog> builder)
        {
            builder.ToTable("AuditLogs");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.ActionType).IsRequired();
            builder.Property(x => x.EntityType).IsRequired();
            builder.Property(x => x.EntityName).IsRequired().HasMaxLength(200);
            builder.Property(x => x.PerformedBy).IsRequired().HasMaxLength(256);
            builder.Property(x => x.PerformedAt).IsRequired();

            builder.HasIndex(x => x.PerformedAt);
            builder.HasIndex(x => new { x.EntityType, x.EntityId });
        }
    }
}
