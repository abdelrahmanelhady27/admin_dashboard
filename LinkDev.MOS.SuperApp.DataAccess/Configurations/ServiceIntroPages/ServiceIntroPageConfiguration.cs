using LinkDev.MOS.SuperApp.Domain.Entities.ServiceIntroPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LinkDev.MOS.SuperApp.DataAccess.Configurations.ServiceIntroPages
{
    public class ServiceIntroPageConfiguration : IEntityTypeConfiguration<ServiceIntroPage>
    {
        public void Configure(EntityTypeBuilder<ServiceIntroPage> builder)
        {
            builder.ToTable("ServiceIntroPages");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.ServiceId).IsRequired();
            builder.Property(x => x.Status).IsRequired();
            builder.Property(x => x.Description).IsRequired().HasMaxLength(190);
            builder.Property(x => x.ProcessingDuration).IsRequired().HasMaxLength(20);
            builder.Property(x => x.VideoUrl).HasMaxLength(1000);
            builder.Property(x => x.VideoFileName).HasMaxLength(255);
            builder.Property(x => x.PublishedSnapshotJson);

            builder.HasOne(x => x.Service)
                   .WithOne(x => x.ServiceIntroPage)
                   .HasForeignKey<ServiceIntroPage>(x => x.ServiceId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => x.ServiceId)
                   .IsUnique()
                   .HasFilter("[IsDeleted] = 0");

            builder.HasMany(x => x.Documents)
                   .WithOne(x => x.ServiceIntroPage)
                   .HasForeignKey(x => x.ServiceIntroPageId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
