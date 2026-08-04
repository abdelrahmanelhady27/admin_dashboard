using LinkDev.MOS.SuperApp.DataAccess.Entites.QuickLinks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LinkDev.MOS.SuperApp.DataAccess.Configurations.QuickLinks
{
    public class QuickLinkConfiguration : IEntityTypeConfiguration<QuickLink>
    {
        public void Configure(EntityTypeBuilder<QuickLink> builder)
        {
            builder.ToTable("QuickLinks");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.ServiceId).IsRequired();
            builder.Property(x => x.DisplayOrder).IsRequired();

            builder.HasOne(x => x.Service)
                   .WithMany()
                   .HasForeignKey(x => x.ServiceId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => x.ServiceId)
                   .IsUnique()
                   .HasFilter("[IsDeleted] = 0");

            builder.HasIndex(x => x.DisplayOrder);
        }
    }
}
