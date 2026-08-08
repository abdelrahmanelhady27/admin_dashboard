using LinkDev.MOS.SuperApp.Domain.Entities.EmployeeNews;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LinkDev.MOS.SuperApp.DataAccess.Configurations.EmployeeNews
{
    public class EmployeeNewsItemConfiguration : IEntityTypeConfiguration<EmployeeNewsItem>
    {
        public void Configure(EntityTypeBuilder<EmployeeNewsItem> builder)
        {
            builder.ToTable("EmployeeNewsItems");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Title).IsRequired().HasMaxLength(200);
            builder.Property(x => x.Content).IsRequired().HasMaxLength(4000);
            builder.Property(x => x.Status).IsRequired();
            builder.Property(x => x.ImageUrl).HasMaxLength(1000);
            builder.Property(x => x.ImageFileName).HasMaxLength(255);

            builder.HasOne(x => x.Category)
                   .WithMany(x => x.NewsItems)
                   .HasForeignKey(x => x.CategoryId)
                   .OnDelete(DeleteBehavior.SetNull)
                   .IsRequired(false);

            builder.HasMany(x => x.Attachments)
                   .WithOne(x => x.EmployeeNewsItem)
                   .HasForeignKey(x => x.EmployeeNewsItemId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => x.CategoryId);
            builder.HasIndex(x => x.Status);
            builder.HasIndex(x => x.PublishedAt);
        }
    }
}
