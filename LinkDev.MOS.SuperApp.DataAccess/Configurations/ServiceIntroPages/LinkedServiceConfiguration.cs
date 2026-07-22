using LinkDev.MOS.SuperApp.DataAccess.Entites.ServiceIntroPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;

namespace LinkDev.MOS.SuperApp.DataAccess.Configurations.ServiceIntroPages
{
    public class LinkedServiceConfiguration : IEntityTypeConfiguration<LinkedService>
    {
        public void Configure(EntityTypeBuilder<LinkedService> builder)
        {
            builder.ToTable("LinkedServices");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.NameAr).IsRequired().HasMaxLength(200);
            builder.Property(x => x.NameEn).IsRequired().HasMaxLength(200);
            builder.Property(x => x.DeepLink).HasMaxLength(500);
            builder.Property(x => x.IsActive).IsRequired();
            builder.Property(x => x.SystemId).IsRequired();

            builder.HasIndex(x => x.SystemId);

            var seedDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

            builder.HasData(
                new LinkedService { Id = 1, SystemId = 1, NameAr = "خدمة أ1", NameEn = "Service A1", DeepLink = "app://system-a/service-a1", IsActive = true, CreatedAt = seedDate, CreatedBy = "System", IsDeleted = false },
                new LinkedService { Id = 2, SystemId = 1, NameAr = "خدمة أ2", NameEn = "Service A2", DeepLink = "app://system-a/service-a2", IsActive = true, CreatedAt = seedDate, CreatedBy = "System", IsDeleted = false },
                new LinkedService { Id = 3, SystemId = 1, NameAr = "خدمة أ3", NameEn = "Service A3", DeepLink = "", IsActive = false, CreatedAt = seedDate, CreatedBy = "System", IsDeleted = false },
                new LinkedService { Id = 4, SystemId = 2, NameAr = "خدمة ب1", NameEn = "Service B1", DeepLink = "app://system-b/service-b1", IsActive = true, CreatedAt = seedDate, CreatedBy = "System", IsDeleted = false },
                new LinkedService { Id = 5, SystemId = 2, NameAr = "خدمة ب2", NameEn = "Service B2", DeepLink = "app://system-b/service-b2", IsActive = false, CreatedAt = seedDate, CreatedBy = "System", IsDeleted = false },
                new LinkedService { Id = 6, SystemId = 2, NameAr = "خدمة ب3", NameEn = "Service B3", DeepLink = "app://system-b/service-b3", IsActive = true, CreatedAt = seedDate, CreatedBy = "System", IsDeleted = false },
                new LinkedService { Id = 7, SystemId = 3, NameAr = "خدمة ج1", NameEn = "Service C1", DeepLink = "app://system-c/service-c1", IsActive = true, CreatedAt = seedDate, CreatedBy = "System", IsDeleted = false },
                new LinkedService { Id = 8, SystemId = 3, NameAr = "خدمة ج2", NameEn = "Service C2", DeepLink = "app://system-c/service-c2", IsActive = true, CreatedAt = seedDate, CreatedBy = "System", IsDeleted = false }
            );
        }
    }
}
