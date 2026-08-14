using LinkDev.MOS.SuperApp.Domain.Entities.ServiceIntroPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LinkDev.MOS.SuperApp.DataAccess.Configurations.ServiceIntroPages
{
    public class ServiceIntroPageFaqConfiguration : IEntityTypeConfiguration<ServiceIntroPageFaq>
    {
        public void Configure(EntityTypeBuilder<ServiceIntroPageFaq> builder)
        {
            builder.ToTable("ServiceIntroPageFaqs");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.ServiceIntroPageId).IsRequired();
            builder.Property(x => x.FaqId).IsRequired();

            builder.HasOne(x => x.ServiceIntroPage)
                   .WithMany(x => x.PageFaqs)
                   .HasForeignKey(x => x.ServiceIntroPageId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Faq)
                   .WithMany(x => x.PageFaqs)
                   .HasForeignKey(x => x.FaqId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => new { x.ServiceIntroPageId, x.FaqId })
                   .IsUnique()
                   .HasFilter("[IsDeleted] = 0");
        }
    }
}
