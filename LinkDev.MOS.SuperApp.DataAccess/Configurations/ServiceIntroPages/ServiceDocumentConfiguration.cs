using LinkDev.MOS.SuperApp.Domain.Entities.ServiceIntroPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LinkDev.MOS.SuperApp.DataAccess.Configurations.ServiceIntroPages
{
    public class ServiceDocumentConfiguration : IEntityTypeConfiguration<ServiceDocument>
    {
        public void Configure(EntityTypeBuilder<ServiceDocument> builder)
        {
            builder.ToTable("ServiceDocuments");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.ServiceIntroPageId).IsRequired();
            builder.Property(x => x.Name).IsRequired().HasMaxLength(30);
            builder.Property(x => x.FileUrl).HasMaxLength(1000);
            builder.Property(x => x.FileName).HasMaxLength(255);
            builder.Property(x => x.FileType).HasMaxLength(100);

            builder.HasIndex(x => x.ServiceIntroPageId);
        }
    }
}
