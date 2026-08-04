using LinkDev.MOS.SuperApp.Domain.Entities.ServiceIntroPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;

namespace LinkDev.MOS.SuperApp.DataAccess.Configurations.ServiceIntroPages
{
    public class LinkedSystemConfiguration : IEntityTypeConfiguration<LinkedSystem>
    {
        public void Configure(EntityTypeBuilder<LinkedSystem> builder)
        {
            builder.ToTable("LinkedSystems");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.NameAr).IsRequired().HasMaxLength(200);
            builder.Property(x => x.NameEn).IsRequired().HasMaxLength(200);

            builder.HasMany(x => x.Services)
                   .WithOne(x => x.System)
                   .HasForeignKey(x => x.SystemId)
                   .OnDelete(DeleteBehavior.Restrict);

            var seedDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

            builder.HasData(
                new LinkedSystem { Id = 1, NameAr = "النظام أ", NameEn = "System A", CreatedAt = seedDate, CreatedBy = "System", IsDeleted = false },
                new LinkedSystem { Id = 2, NameAr = "النظام ب", NameEn = "System B", CreatedAt = seedDate, CreatedBy = "System", IsDeleted = false },
                new LinkedSystem { Id = 3, NameAr = "النظام ج", NameEn = "System C", CreatedAt = seedDate, CreatedBy = "System", IsDeleted = false }
            );
        }
    }
}
