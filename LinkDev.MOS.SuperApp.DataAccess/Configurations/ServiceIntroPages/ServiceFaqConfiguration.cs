using LinkDev.MOS.SuperApp.DataAccess.Entites.ServiceIntroPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LinkDev.MOS.SuperApp.DataAccess.Configurations.ServiceIntroPages
{
    public class ServiceFaqConfiguration : IEntityTypeConfiguration<ServiceFaq>
    {
        public void Configure(EntityTypeBuilder<ServiceFaq> builder)
        {
            builder.ToTable("ServiceFaqs");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.ServiceIntroPageId).IsRequired();
            builder.Property(x => x.Question).IsRequired().HasMaxLength(150);
            builder.Property(x => x.Answer).IsRequired().HasMaxLength(150);

            builder.HasIndex(x => x.ServiceIntroPageId);
        }
    }
}
