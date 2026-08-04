using LinkDev.MOS.SuperApp.Domain.Entities.ServiceIntroPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LinkDev.MOS.SuperApp.DataAccess.Configurations.ServiceIntroPages
{
    public class AvailableLinkedServiceConfiguration : IEntityTypeConfiguration<AvailableLinkedService>
    {
        public void Configure(EntityTypeBuilder<AvailableLinkedService> builder)
        {
            builder.ToView("vw_AvailableLinkedServices");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.NameAr).HasMaxLength(200);
            builder.Property(x => x.NameEn).HasMaxLength(200);
            builder.Property(x => x.DeepLink).HasMaxLength(500);
            builder.Property(x => x.SystemNameAr).HasMaxLength(200);
            builder.Property(x => x.SystemNameEn).HasMaxLength(200);
        }
    }
}
