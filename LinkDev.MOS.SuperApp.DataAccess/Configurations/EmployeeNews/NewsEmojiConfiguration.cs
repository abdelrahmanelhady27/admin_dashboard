using LinkDev.MOS.SuperApp.Domain.Entities.EmployeeNews;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LinkDev.MOS.SuperApp.DataAccess.Configurations.EmployeeNews
{
    public class NewsEmojiConfiguration : IEntityTypeConfiguration<NewsEmoji>
    {
        private static readonly DateTime SeedCreatedAt = new(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        public void Configure(EntityTypeBuilder<NewsEmoji> builder)
        {
            builder.ToTable("NewsEmojis");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name).IsRequired().HasMaxLength(100);
            builder.Property(x => x.Code).IsRequired().HasMaxLength(32);
            builder.Property(x => x.DisplayOrder).IsRequired();
            builder.Property(x => x.IsActive).IsRequired();

            builder.HasIndex(x => x.DisplayOrder);

            builder.HasData(
                new NewsEmoji
                {
                    Id = 1,
                    Name = "Like",
                    Code = "👍",
                    DisplayOrder = 1,
                    IsActive = true,
                    CreatedAt = SeedCreatedAt,
                    CreatedBy = "System"
                },
                new NewsEmoji
                {
                    Id = 2,
                    Name = "Celebrate",
                    Code = "🎉",
                    DisplayOrder = 2,
                    IsActive = true,
                    CreatedAt = SeedCreatedAt,
                    CreatedBy = "System"
                },
                new NewsEmoji
                {
                    Id = 3,
                    Name = "Support",
                    Code = "💪",
                    DisplayOrder = 3,
                    IsActive = true,
                    CreatedAt = SeedCreatedAt,
                    CreatedBy = "System"
                },
                new NewsEmoji
                {
                    Id = 4,
                    Name = "Sad",
                    Code = "😢",
                    DisplayOrder = 4,
                    IsActive = true,
                    CreatedAt = SeedCreatedAt,
                    CreatedBy = "System"
                },
                new NewsEmoji
                {
                    Id = 5,
                    Name = "Thanks",
                    Code = "🙏",
                    DisplayOrder = 5,
                    IsActive = true,
                    CreatedAt = SeedCreatedAt,
                    CreatedBy = "System"
                });
        }
    }
}
