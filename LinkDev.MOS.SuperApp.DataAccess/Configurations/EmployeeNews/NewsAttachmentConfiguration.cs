using LinkDev.MOS.SuperApp.Domain.Entities.EmployeeNews;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LinkDev.MOS.SuperApp.DataAccess.Configurations.EmployeeNews
{
    public class NewsAttachmentConfiguration : IEntityTypeConfiguration<NewsAttachment>
    {
        public void Configure(EntityTypeBuilder<NewsAttachment> builder)
        {
            builder.ToTable("NewsAttachments");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.EmployeeNewsItemId).IsRequired();
            builder.Property(x => x.Name).IsRequired().HasMaxLength(30);
            builder.Property(x => x.FileUrl).HasMaxLength(1000);
            builder.Property(x => x.FileName).HasMaxLength(255);
            builder.Property(x => x.FileType).HasMaxLength(100);

            builder.HasIndex(x => x.EmployeeNewsItemId);
        }
    }
}
